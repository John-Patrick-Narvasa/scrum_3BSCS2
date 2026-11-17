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
 * Log in action
 */
export async function loginAction(
  input: unknown
): Promise<ActionResult<UserSession>> {
  try {
    const parsed = loginSchema.safeParse(input)
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
 * Register user action (starts as pending per S1-DEV-02)
 */
export async function registerAction(
  input: unknown
): Promise<ActionResult<AppUser>> {
  try {
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid registration details'
      return { ok: false, error: firstError }
    }

    const newUser = await authService.register(parsed.data)
    return {
      ok: true,
      data: newUser,
      message:
        'Registration submitted successfully! Your account is pending administrator approval before access is granted.',
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
 * Request password reset token action (S1-DEV-05)
 */
export async function requestPasswordResetAction(
  input: unknown
): Promise<ActionResult<{ token: string; message: string }>> {
  try {
    const parsed = resetPasswordRequestSchema.safeParse(input)
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
 * Reset password action (S1-DEV-05)
 */
export async function resetPasswordAction(
  input: unknown
): Promise<ActionResult<null>> {
  try {
    const parsed = resetPasswordSchema.safeParse(input)
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
 * Set password on first login action (S1-DEV-04)
 */
export async function setPasswordAction(
  userId: string,
  input: unknown
): Promise<ActionResult<null>> {
  try {
    const parsed = setPasswordSchema.safeParse(input)
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
 * Approve pending user action (S1-DEV-06)
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
 * Update user status/role action (S1-DEV-06)
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
 * Assign user permissions/rights action (S1-DEV-07)
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
