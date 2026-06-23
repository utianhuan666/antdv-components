import type { ProFieldFCMode } from '../../provider'

/**
 * Shared mode checks for Field* components (read vs edit branches).
 */
export function isProFieldReadMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'read'
}

/** `edit` or `update` -- most Field* interactive branches. */
export function isProFieldEditOrUpdateMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'edit' || mode === 'update'
}

/** Strict `edit` only -- used where `update` should fall through like upstream. */
export function isProFieldEditOnlyMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'edit'
}
