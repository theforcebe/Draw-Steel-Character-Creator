import type { CharacterData } from '../types/character';

const STORAGE_KEY = 'draw-steel-saved-characters';

export interface SavedCharacter {
  id: string;
  name: string;
  savedAt: string; // ISO date
  data: CharacterData;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSavedCharacters(): SavedCharacter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCharacter[];
  } catch {
    return [];
  }
}

export function saveCharacter(data: CharacterData, id?: string): SavedCharacter {
  const characters = getSavedCharacters();
  const entry: SavedCharacter = {
    id: id ?? generateId(),
    name: data.name || 'Unnamed Hero',
    savedAt: new Date().toISOString(),
    data,
  };
  characters.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  return entry;
}

export function updateSavedCharacter(id: string, data: CharacterData): void {
  const characters = getSavedCharacters();
  const index = characters.findIndex((c) => c.id === id);
  if (index >= 0) {
    characters[index] = {
      ...characters[index],
      name: data.name || 'Unnamed Hero',
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }
}

export function deleteCharacter(id: string): void {
  const characters = getSavedCharacters().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}
