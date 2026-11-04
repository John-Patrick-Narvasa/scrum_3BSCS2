'use server'

import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  setPasswordSchema,
} from '@/lib/validations/auth.schema'
import { authService } from '@/lib/services/auth.service'
import { ActionResult, UserSession, AppUser, Role, AccountStatus } from '@/types'

/**
 * Helper to convert FormData or plain object into a plain record
 * HIGHLIGHT: Using FormData prevents Next.js Turbopack from logging
 * sensitive passwords to the dev server console!
 */
function toPlainObject(input: unknown): Record<string, any> {
  if (input instanceof FormData) {
    const obj: Record<string, any> = {}
    input.forEach((value, key) => {
      obj[key] = typeof value === 'string' ? value.trim() : value
    })
    return obj
  }
  if (typeof input === 'object' && input !== null) {
    return input as Record<string, any>
  }
  return {}
}

/**
 * HIGHLIGHT: Log in action supporting FormData to avoid terminal logging of password
 */
export async function loginAction(
  input: FormData | unknown
): Promise<ActionResult<UserSession>> {
  try {
    const rawData = toPlainObject(input)
    const parsed = loginSchema.safeParse(rawData)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid login details'
      return { ok: false, error: firstError }
    }

    const session = await authService.login(parsed.data)
    return { ok: true, data: session, message: 'Welcome back to Hope, Inc. ERP' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Authentication failed' }
  }
}

/**
 * HIGHLIGHT: Register user action supporting FormData and empno linkage
 */
export async function registerAction(
  input: FormData | unknown
): Promise<ActionResult<AppUser>> {
  try {
    const rawData = toPlainObject(input)
    const parsed = registerSchema.safeParse(rawData)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid registration details'
      return { ok: false, error: firstError }
    }

    const newUser = await authService.register(parsed.data)
    return {
      ok: true,
      data: newUser,
      message:
        'Registration submitted successfully! Your account is created with status PENDING and requires administrator approval before accessing ERP modules.',
    }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Registration failed' }
  }
}

/**
 * Logout action
 */
export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    await authService.logout()
    return { ok: true, data: null, message: 'You have been logged out safely.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Logout failed' }
  }
}

/**
 * Get current session action
 */
export async function getSessionAction(): Promise<ActionResult<UserSession | null>> {
  try {
    const session = await authService.getSession()
    return { ok: true, data: session }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to retrieve session' }
  }
}

/**
 * Request password reset token action
 */
export async function requestPasswordResetAction(
  input: FormData | unknown
): Promise<ActionResult<{ token: string; message: string }>> {
  try {
    const rawData = toPlainObject(input)
    const parsed = resetPasswordRequestSchema.safeParse(rawData)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || 'Invalid email address' }
    }

    const result = await authService.requestPasswordReset(parsed.data.email)
    return { ok: true, data: result, message: result.message }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Password reset request failed' }
  }
}

/**
 * Reset password action
 */
export async function resetPasswordAction(
  input: FormData | unknown
): Promise<ActionResult<null>> {
  try {
    const rawData = toPlainObject(input)
    const parsed = resetPasswordSchema.safeParse(rawData)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || 'Validation error' }
    }

    await authService.resetPassword(parsed.data)
    return { ok: true, data: null, message: 'Password has been reset successfully. You may now log in.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Password reset failed' }
  }
}

/**
 * Set password on first login action
 */
export async function setPasswordAction(
  userId: string,
  input: FormData | unknown
): Promise<ActionResult<null>> {
  try {
    const rawData = toPlainObject(input)
    const parsed = setPasswordSchema.safeParse(rawData)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || 'Validation error' }
    }

    await authService.setPassword(userId, parsed.data)
    return { ok: true, data: null, message: 'Password has been set successfully.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to set password' }
  }
}

/**
 * List users action (admin / superadmin)
 */
export async function listUsersAction(): Promise<ActionResult<AppUser[]>> {
  try {
    const users = await authService.listUsers()
    return { ok: true, data: users }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to list users' }
  }
}

/**
 * Approve pending user action
 */
export async function approveUserAction(
  userId: string,
  designatedRole?: Role
): Promise<ActionResult<null>> {
  try {
    await authService.approveUser(userId, designatedRole)
    return { ok: true, data: null, message: 'User approved successfully.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Approval failed' }
  }
}

/**
 * Update user status/role action
 */
export async function updateUserStatusAction(
  userId: string,
  status: AccountStatus,
  role?: Role
): Promise<ActionResult<null>> {
  try {
    await authService.updateUserStatus(userId, status, role)
    return { ok: true, data: null, message: 'User status/role updated successfully.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Update failed' }
  }
}

/**
 * Assign user permissions/rights action
 */
export async function assignUserRightsAction(
  userId: string,
  rights: string[]
): Promise<ActionResult<null>> {
  try {
    await authService.assignUserRights(userId, rights)
    return { ok: true, data: null, message: 'Permissions assigned successfully.' }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to assign rights' }
  }
}

/**
 * Get user rights action
 */
export async function getUserRightsAction(userId: string): Promise<ActionResult<string[]>> {
  try {
    const rights = await authService.getUserRights(userId)
    return { ok: true, data: rights }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to fetch user rights' }
  }
}

/**
 * Get audit logs action (admin / superadmin)
 */
export async function getAuditLogsAction(): Promise<ActionResult<any[]>> {
  try {
    const logs = await authService.getAuditLogs()
    return { ok: true, data: logs }
  } catch (error: any) {
    return { ok: false, error: error.message || 'Failed to fetch audit logs' }
  }
}
