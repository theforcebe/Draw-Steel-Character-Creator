import { getSavedCharacters, saveCharacter } from './character-storage';
import type { SavedCharacter } from './character-storage';
import { usePlayStore } from '../stores/play-store';
import type { PlayCharacterState } from '../stores/play-store';

interface ExportData {
  version: 1;
  exportedAt: string;
  characters: SavedCharacter[];
  playStates: Record<string, PlayCharacterState>;
}

export function exportAllData(): void {
  const characters = getSavedCharacters();
  const playStates = usePlayStore.getState().states;

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    characters,
    playStates,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `draw-steel-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<{ imported: number; skipped: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ExportData;

        if (!data.characters || !Array.isArray(data.characters)) {
          throw new Error('Invalid backup file: missing characters array');
        }

        const existing = getSavedCharacters();
        const existingIds = new Set(existing.map((c) => c.id));

        let imported = 0;
        let skipped = 0;

        for (const char of data.characters) {
          if (existingIds.has(char.id)) {
            skipped++;
            continue;
          }
          // Preserve the original ID so play states stay linked
          saveCharacter(char.data, char.id);
          imported++;
        }

        // Merge play states into the Zustand store directly
        if (data.playStates) {
          const currentStates = usePlayStore.getState().states;
          const merged = { ...currentStates };

          for (const [id, state] of Object.entries(data.playStates)) {
            if (!merged[id]) {
              merged[id] = state;
            }
          }

          usePlayStore.setState({ states: merged });
        }

        resolve({ imported, skipped });
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
