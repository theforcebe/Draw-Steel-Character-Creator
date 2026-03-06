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
  const allCharacters = getSavedCharacters();
  const playStates = usePlayStore.getState().states;

  // Deduplicate: if multiple entries share name + ancestry + class, keep the newest
  const seen = new Map<string, SavedCharacter>();
  for (const char of allCharacters) {
    const d = char.data;
    const key = `${d.name || ''}|${d.ancestryId || ''}|${d.classChoice?.classId || ''}`;
    const prev = seen.get(key);
    if (!prev || char.savedAt > prev.savedAt) {
      seen.set(key, char);
    }
  }
  const characters = [...seen.values()];

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

        // Deduplicate the import file itself: if multiple entries share the
        // same name + ancestry + class, keep only the most recently saved one.
        // This handles backup files created before the duplicate-save bug was fixed.
        const deduped = new Map<string, SavedCharacter>();
        for (const char of data.characters) {
          const d = char.data;
          const key = `${d.name || ''}|${d.ancestryId || ''}|${d.classChoice?.classId || ''}`;
          const prev = deduped.get(key);
          if (!prev || char.savedAt > prev.savedAt) {
            deduped.set(key, char);
          }
        }

        let imported = 0;
        let skipped = 0;

        // Also track names already in localStorage so we don't import a dup
        // that happens to have a different ID
        const existingKeys = new Set(
          existing.map((c) => `${c.data.name || ''}|${c.data.ancestryId || ''}|${c.data.classChoice?.classId || ''}`),
        );

        for (const char of deduped.values()) {
          const key = `${char.data.name || ''}|${char.data.ancestryId || ''}|${char.data.classChoice?.classId || ''}`;
          if (existingIds.has(char.id) || existingKeys.has(key)) {
            skipped++;
            continue;
          }
          // Preserve the original ID so play states stay linked
          saveCharacter(char.data, char.id);
          existingKeys.add(key);
          imported++;
        }

        // Merge play states into the Zustand store — imported states overwrite existing
        if (data.playStates) {
          const currentStates = usePlayStore.getState().states;
          const merged = { ...currentStates, ...data.playStates };
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
