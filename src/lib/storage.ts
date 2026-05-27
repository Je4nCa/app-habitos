/** Requests persistent storage from the browser.
 *  On iOS 16.4+ with the app added to Home Screen, this is usually granted.
 *  Returns true if granted, false if denied or unavailable. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    const already = await navigator.storage.persisted()
    if (already) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

/** Returns how many days since the given ISO timestamp, or null if no timestamp. */
export function daysSince(isoTimestamp: string | null): number | null {
  if (!isoTimestamp) return null
  const diff = Date.now() - new Date(isoTimestamp).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
