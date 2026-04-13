/**
 * Shared mode checks for Field* components (read vs edit branches).
 */
export type ProFieldFCMode = 'read' | 'edit' | 'update'

export function isProFieldReadMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'read'
}

/** `edit` or `update` -- most Field* interactive branches. */
export function isProFieldEditOrUpdateMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'edit' || mode === 'update'
}
