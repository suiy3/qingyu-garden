const PARENT_ACCESS_KEY = 'qingyu_parent_access_until';
const ACCESS_DURATION = 30 * 60 * 1000;

export function grantParentAccess(): void {
  sessionStorage.setItem(PARENT_ACCESS_KEY, String(Date.now() + ACCESS_DURATION));
}

export function hasParentAccess(): boolean {
  const expiresAt = Number(sessionStorage.getItem(PARENT_ACCESS_KEY));
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function clearParentAccess(): void {
  sessionStorage.removeItem(PARENT_ACCESS_KEY);
}
