const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export function loadProgress(storageKey, legacyKeys = []) {
  if (!isBrowser()) return [];

  const keys = [storageKey, ...legacyKeys].filter(Boolean);

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      if (key !== storageKey) {
        window.localStorage.setItem(storageKey, JSON.stringify(parsed));
      }

      return parsed;
    } catch {
      // Si falla el parseo, continuamos con la siguiente clave.
    }
  }

  return [];
}

export function saveProgress(storageKey, ids) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Ignorar errores de almacenamiento (por ejemplo, cuota llena o modo incógnito).
  }
}

export function ensureEpisodeMarked(storageKey, episodeId, legacyKeys = []) {
  const current = loadProgress(storageKey, legacyKeys);
  if (current.includes(episodeId)) {
    return current;
  }
  const updated = [...current, episodeId];
  saveProgress(storageKey, updated);
  return updated;
}

export function toggleEpisode(storageKey, episodeId, legacyKeys = []) {
  const current = loadProgress(storageKey, legacyKeys);
  const hasEpisode = current.includes(episodeId);
  const updated = hasEpisode
    ? current.filter((ep) => ep !== episodeId)
    : [...current, episodeId];
  saveProgress(storageKey, updated);
  return updated;
}
