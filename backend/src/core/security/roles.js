export const SUPER_ADMIN_EMAIL = 'admin@iremetech.com'

export function isSuperAdmin(user) {
  return String(user?.email || '').toLowerCase() === SUPER_ADMIN_EMAIL
}
