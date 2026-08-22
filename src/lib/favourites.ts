/**
 * Per-browser application favourites, shared by the header "Apps" dropdown and
 * sanapp-main's My Apps home page. Stored as a JSON array of application ids
 * (the registry clientId / database id) under a single origin-wide key.
 */
export const FAVOURITES_KEY = "iipe-app-favourites";

export function readFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeFavourites(ids: string[]) {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage unavailable (private mode) — preference not persisted */
  }
}

/** Add/remove an id. Returns the new list. */
export function toggleFavourite(id: string): string[] {
  const next = readFavourites();
  const i = next.indexOf(id);
  if (i >= 0) next.splice(i, 1);
  else next.push(id);
  writeFavourites(next);
  return next;
}
