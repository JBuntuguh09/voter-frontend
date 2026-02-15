/* -------------------------------------------
   TYPES
-------------------------------------------- */
export interface Permission {
  path: string
  method?: string
  name?: string
}

/* -------------------------------------------
   INTERNAL CACHE (PER TAB)
-------------------------------------------- */
let _permissionCache: Permission[] | null = null

/* -------------------------------------------
   NORMALIZERS
-------------------------------------------- */
const normalizePath = (path: string) =>
  path.trim().toLowerCase()

const normalizeMethod = (method?: string) =>
  method?.trim().toUpperCase()

/* -------------------------------------------
   READ PERMISSIONS (CLIENT SAFE)
-------------------------------------------- */
export function getPermissions(): Permission[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem("permissions")
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map((p) => ({
      path: normalizePath(p.path),
      method: normalizeMethod(p.method),
      name: p.name,
    }))
  } catch {
    return []
  }
}


/* -------------------------------------------
   PERMISSION CHECK
-------------------------------------------- */
export function hasPermission(
  path: string,
  method?: string
): boolean {
  if (!path) return false

  const targetPath = normalizePath(path)
  const targetMethod = normalizeMethod(method)
 
  return getPermissions().some((p) => {
    if (targetMethod) {
      return (
        p.path === targetPath &&
        p.method === targetMethod
      )
    }

    return p.path === targetPath
  })
}

/* -------------------------------------------
   UTILITIES
-------------------------------------------- */
export function clearPermissionCache() {
  _permissionCache = null
}
