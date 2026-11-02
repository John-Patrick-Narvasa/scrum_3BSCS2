import { cookies } from 'next/headers'
import {
  UserSession,
  Role,
  AccountStatus,
  AppUser,
  CANONICAL_RIGHTS,
  MODULE_NAMES,
} from '@/types'
import {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SetPasswordInput,
} from '@/lib/validations/auth.schema'
import { createClient } from '@/lib/supabase/server'

const SESSION_COOKIE_NAME = 'hope_erp_session'

// Global in-memory store so changes persist across server requests in this container
interface ERPStore {
  users: (AppUser & { passwordHash: string })[]
  userRights: Record<string, string[]> // userId -> rights array
  resetTokens: Record<string, { userId: string; expiresAt: number; used: boolean }>
  auditLogs: Array<{
    id: string
    tableName: string
    action: string
    recordKey: string
    actionBy: string
    actionAt: string
    details: string
  }>
}

const defaultSuperAdmin: AppUser & { passwordHash: string } = {
  id: 'usr-00000001',
  username: 'superadmin',
  email: 'superadmin@hope.com',
  full_name: 'John Patrick Narvasa',
  role: 'superadmin',
  status: 'active',
  approved_by: 'system',
  approved_at: '2026-10-01T00:00:00Z',
  created_at: '2026-10-01T00:00:00Z',
  stamp: 'ADD system 2026-10-01 08:00 AM',
  is_deleted: false,
  passwordHash: 'SuperAdmin123!',
}

const defaultAdmin: AppUser & { passwordHash: string } = {
  id: 'usr-00000002',
  username: 'admin',
  email: 'admin@hope.com',
  full_name: 'Keith Marlou Aldueza',
  role: 'admin',
  status: 'active',
  approved_by: 'superadmin',
  approved_at: '2026-10-02T00:00:00Z',
  created_at: '2026-10-02T00:00:00Z',
  stamp: 'ADD superadmin 2026-10-02 09:30 AM',
  is_deleted: false,
  passwordHash: 'Admin123!',
}

const defaultUser: AppUser & { passwordHash: string } = {
  id: 'usr-00000003',
  username: 'user',
  email: 'user@hope.com',
  full_name: 'Nathaniel Ashley Ellacer',
  role: 'user',
  status: 'active',
  approved_by: 'admin',
  approved_at: '2026-10-03T00:00:00Z',
  created_at: '2026-10-03T00:00:00Z',
  stamp: 'ADD admin 2026-10-03 10:15 AM',
  is_deleted: false,
  passwordHash: 'User123!',
}

const defaultPendingUser: AppUser & { passwordHash: string } = {
  id: 'usr-00000004',
  username: 'pending',
  email: 'pending@hope.com',
  full_name: 'Ivan Abduhadi',
  role: 'user',
  status: 'pending',
  approved_by: null,
  approved_at: null,
  created_at: '2026-10-15T00:00:00Z',
  stamp: 'ADD system 2026-10-15 02:00 PM',
  is_deleted: false,
  passwordHash: 'Pending123!',
}

declare global {
  // eslint-disable-next-line no-var
  var __hope_erp_store__: ERPStore | undefined
}

function getStore(): ERPStore {
  if (!globalThis.__hope_erp_store__) {
    globalThis.__hope_erp_store__ = {
      users: [defaultSuperAdmin, defaultAdmin, defaultUser, defaultPendingUser],
      userRights: {
        'usr-00000001': [...CANONICAL_RIGHTS],
        'usr-00000002': [
          'CUST_ADD',
          'CUST_EDIT',
          'PROD_ADD',
          'PROD_EDIT',
          'EMP_ADD',
          'EMP_EDIT',
          'SALE_ADD',
          'PAY_VIEW',
        ],
        'usr-00000003': [
          'CUST_ADD',
          'PROD_ADD',
          'SALE_ADD',
          'REP_TOPCUST',
        ],
        'usr-00000004': [],
      },
      resetTokens: {
        'demo-token-123': {
          userId: 'usr-00000003',
          expiresAt: Date.now() + 3600000 * 24,
          used: false,
        },
      },
      auditLogs: [
        {
          id: 'log-001',
          tableName: 'app_user',
          action: 'ADD',
          recordKey: 'superadmin',
          actionBy: 'system',
          actionAt: '2026-10-01 08:00 AM',
          details: 'Initialized superadmin account',
        },
        {
          id: 'log-002',
          tableName: 'app_user',
          action: 'ADD',
          recordKey: 'admin',
          actionBy: 'superadmin',
          actionAt: '2026-10-02 09:30 AM',
          details: 'Designated admin account',
        },
      ],
    }
  }
  return globalThis.__hope_erp_store__
}

export class AuthService {
  /**
   * Log into Hope, Inc. ERP
   */
  async login(input: LoginInput): Promise<UserSession> {
    const store = getStore()
    const identifier = input.emailOrUsername.trim().toLowerCase()
    const password = input.password

    // 1. Check in-memory store (supports seeded test accounts & freshly registered accounts)
    const user = store.users.find(
      (u) =>
        (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) &&
        !u.is_deleted
    )

    if (!user) {
      // Also try supabase auth if configured
      try {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        })
        if (!error && data?.user) {
          const session = this.buildSessionFromSupabaseUser(data.user)
          await this.saveSessionCookie(session)
          return session
        }
      } catch {
        // Fall back to invalid credentials error
      }
      throw new Error('Invalid username/email or password')
    }

    // Verify password
    if (user.passwordHash !== password) {
      throw new Error('Invalid username/email or password')
    }

    // Check account status
    if (user.status === 'blocked') {
      throw new Error('This account has been blocked. Please contact a system administrator.')
    }

    const rights =
      user.role === 'superadmin'
        ? [...CANONICAL_RIGHTS]
        : store.userRights[user.id] || []

    const modules = this.deriveModulesFromRights(user.role, rights)

    const session: UserSession = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      permissions: rights,
      modules: modules,
    }

    await this.saveSessionCookie(session)

    // Log login to audit
    this.addAuditLog('auth', 'LOGIN', user.username, user.username, `Successful login by ${user.role}`)

    return session
  }

  /**
   * Register a new user in Hope, Inc. ERP (starts as pending per S1-DEV-02)
   */
  async register(input: RegisterInput): Promise<AppUser> {
    const store = getStore()
    const username = input.username.trim()
    const email = input.email.trim().toLowerCase()

    // Check uniqueness
    const existingUsername = store.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && !u.is_deleted
    )
    if (existingUsername) {
      throw new Error('Username is already taken')
    }

    const existingEmail = store.users.find(
      (u) => u.email.toLowerCase() === email && !u.is_deleted
    )
    if (existingEmail) {
      throw new Error('An account with this email already exists')
    }

    const newId = `usr-${String(store.users.length + 1).padStart(8, '0')}`
    const now = new Date()
    const stampDate = now.toISOString().split('T')[0]
    const stampTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const newUser: AppUser & { passwordHash: string } = {
      id: newId,
      username: username,
      email: email,
      full_name: input.fullName.trim(),
      role: 'user',
      status: 'pending', // Per S1-DEV-02: new users start as pending
      approved_by: null,
      approved_at: null,
      created_at: now.toISOString(),
      stamp: `ADD system ${stampDate} ${stampTime}`,
      is_deleted: false,
      passwordHash: input.password,
    }

    store.users.push(newUser)
    store.userRights[newId] = []

    this.addAuditLog(
      'app_user',
      'ADD',
      newUser.username,
      'system',
      `Registered new user account (${newUser.username}) with status PENDING`
    )

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      status: newUser.status,
      approved_by: newUser.approved_by,
      approved_at: newUser.approved_at,
      created_at: newUser.created_at,
      stamp: newUser.stamp,
      is_deleted: newUser.is_deleted,
    }
  }

  /**
   * Destroy user session
   */
  async logout(): Promise<void> {
    const session = await this.getSession()
    if (session) {
      this.addAuditLog('auth', 'LOGOUT', session.username, session.username, 'User logged out')
    }
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }
  }

  /**
   * Get active session from cookie
   */
  async getSession(): Promise<UserSession | null> {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
      if (!sessionCookie?.value) {
        return null
      }
      const parsed = JSON.parse(sessionCookie.value) as UserSession
      return parsed
    } catch {
      return null
    }
  }

  /**
   * Guard: ensure user is authenticated
   */
  async requireAuth(): Promise<UserSession> {
    const session = await this.getSession()
    if (!session) {
      throw new Error('Unauthorized: Authentication required')
    }
    return session
  }

  /**
   * Guard: require specific right code (e.g. CUST_ADD, SALE_ADD)
   */
  async requireRight(rightCode: string): Promise<UserSession> {
    const session = await this.requireAuth()

    if (session.status === 'blocked') {
      throw new Error('Forbidden: Account is blocked')
    }
    if (session.status === 'pending') {
      throw new Error('Forbidden: Account is pending administrator approval')
    }

    // Superadmin bypasses specific rights
    if (session.role === 'superadmin') {
      return session
    }

    if (!session.permissions.includes(rightCode)) {
      throw new Error(`Forbidden: You do not possess the required right (${rightCode})`)
    }

    return session
  }

  /**
   * Guard: require one of specified roles (e.g. ['admin', 'superadmin'])
   */
  async requireRole(allowedRoles: Role[]): Promise<UserSession> {
    const session = await this.requireAuth()

    if (session.status !== 'active') {
      throw new Error(`Forbidden: Account must be active (current: ${session.status})`)
    }

    if (!allowedRoles.includes(session.role)) {
      throw new Error(
        `Forbidden: Insufficient role privilege. Required: ${allowedRoles.join(' or ')}`
      )
    }

    return session
  }

  /**
   * Request password reset token (S1-DEV-05)
   */
  async requestPasswordReset(email: string): Promise<{ token: string; message: string }> {
    const store = getStore()
    const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user) {
      // Avoid revealing whether account exists in public messages, but return token for testing
      return {
        token: '',
        message: 'If that email address exists in our system, a password reset link has been dispatched.',
      }
    }

    const token = `rst-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`
    store.resetTokens[token] = {
      userId: user.id,
      expiresAt: Date.now() + 3600000 * 2, // 2 hours
      used: false,
    }

    this.addAuditLog(
      'auth',
      'PASSWORD_RESET_REQ',
      user.username,
      user.username,
      `Password reset requested for ${user.email}`
    )

    return {
      token,
      message: 'Password reset token generated. Use this token or the link below to set a new password.',
    }
  }

  /**
   * Reset password with token (S1-DEV-05)
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const store = getStore()
    const tokenRecord = store.resetTokens[input.token]

    if (!tokenRecord) {
      throw new Error('Invalid or non-existent password reset token')
    }
    if (tokenRecord.used) {
      throw new Error('This password reset token has already been used')
    }
    if (Date.now() > tokenRecord.expiresAt) {
      throw new Error('This password reset token has expired')
    }

    const user = store.users.find((u) => u.id === tokenRecord.userId)
    if (!user) {
      throw new Error('Associated user account was not found')
    }

    user.passwordHash = input.password
    tokenRecord.used = true

    this.addAuditLog(
      'app_user',
      'EDIT',
      user.username,
      user.username,
      'Password successfully reset via token'
    )
  }

  /**
   * Set password on first login (S1-DEV-04)
   */
  async setPassword(userId: string, input: SetPasswordInput): Promise<void> {
    const store = getStore()
    const user = store.users.find((u) => u.id === userId && !u.is_deleted)
    if (!user) {
      throw new Error('User account not found')
    }

    user.passwordHash = input.password
    this.addAuditLog(
      'app_user',
      'EDIT',
      user.username,
      user.username,
      'Updated account password'
    )
  }

  /**
   * List users for user-rights management (admin & superadmin only)
   */
  async listUsers(): Promise<AppUser[]> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()

    return store.users
      .filter((u) => {
        // Admin cannot see superadmin accounts per .github/copilot-instructions.md §4
        if (session.role === 'admin' && u.role === 'superadmin') {
          return false
        }
        return true
      })
      .map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        status: u.status,
        approved_by: u.approved_by,
        approved_at: u.approved_at,
        created_at: u.created_at,
        stamp: u.stamp,
        is_deleted: u.is_deleted,
      }))
  }

  /**
   * Approve a pending user (S1-DEV-06: Superadmin / Admin)
   */
  async approveUser(userId: string, designatedRole?: Role): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Only superadmin can designate an admin
    if (designatedRole === 'admin' && session.role !== 'superadmin') {
      throw new Error('Only superadmins can designate admins')
    }
    if (designatedRole === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Only superadmins can designate another superadmin')
    }

    user.status = 'active'
    user.approved_by = session.username
    user.approved_at = new Date().toISOString()
    if (designatedRole) {
      user.role = designatedRole
    }

    this.addAuditLog(
      'app_user',
      'EDIT',
      user.username,
      session.username,
      `Approved user ${user.username} (Role: ${user.role}, Status: ACTIVE)`
    )
  }

  /**
   * Change user status or role (S1-DEV-06)
   */
  async updateUserStatus(
    userId: string,
    status: AccountStatus,
    role?: Role
  ): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Rule: The last remaining active superadmin can never be removed, demoted or blocked
    if (user.role === 'superadmin' && (status !== 'active' || (role && role !== 'superadmin'))) {
      const activeSuperadmins = store.users.filter(
        (u) => u.role === 'superadmin' && u.status === 'active' && !u.is_deleted
      )
      if (activeSuperadmins.length <= 1) {
        throw new Error(
          'Cannot modify the last remaining active superadmin account (Protected Rule)'
        )
      }
    }

    // Admin cannot modify superadmins
    if (user.role === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Admins cannot modify superadmin accounts')
    }

    user.status = status
    if (role) {
      if ((role === 'admin' || role === 'superadmin') && session.role !== 'superadmin') {
        throw new Error('Only superadmins can grant admin or superadmin roles')
      }
      user.role = role
    }

    this.addAuditLog(
      'app_user',
      'EDIT',
      user.username,
      session.username,
      `Updated user ${user.username}: status=${status}${role ? `, role=${role}` : ''}`
    )
  }

  /**
   * Assign per-module rights (S1-DEV-07)
   */
  async assignUserRights(userId: string, rights: string[]): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (!user) {
      throw new Error('User not found')
    }

    if (user.role === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Admins cannot change superadmin rights')
    }

    const previousRights = store.userRights[userId] || []
    store.userRights[userId] = rights

    this.addAuditLog(
      'user_permission',
      'EDIT',
      user.username,
      session.username,
      `Rights updated for ${user.username}. Old count: ${previousRights.length}, New count: ${rights.length}`
    )
  }

  /**
   * Get user rights
   */
  async getUserRights(userId: string): Promise<string[]> {
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)
    if (!user) return []
    if (user.role === 'superadmin') {
      return [...CANONICAL_RIGHTS]
    }
    return store.userRights[userId] || []
  }

  /**
   * Get audit log list (superadmin / admin only)
   */
  async getAuditLogs() {
    await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    return [...store.auditLogs].reverse()
  }

  // --- Helper Methods ---

  private async saveSessionCookie(session: UserSession) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  private deriveModulesFromRights(role: Role, rights: string[]): string[] {
    if (role === 'superadmin') {
      return [...MODULE_NAMES]
    }
    if (role === 'admin') {
      return [...MODULE_NAMES]
    }
    const modules = new Set<string>()
    for (const r of rights) {
      if (r.startsWith('CUST_')) modules.add('customer')
      if (r.startsWith('PROD_') || r.startsWith('PRICE_')) modules.add('product')
      if (r.startsWith('JOB_') || r.startsWith('DEPT_') || r.startsWith('EMP_') || r.startsWith('JHIST_'))
        modules.add('hr')
      if (r.startsWith('SALE_') || r.startsWith('SDTL_')) modules.add('sales')
      if (r.startsWith('REP_')) modules.add('reports')
      if (r.startsWith('PAY_')) modules.add('payment')
    }
    return Array.from(modules)
  }

  private addAuditLog(
    tableName: string,
    action: string,
    recordKey: string,
    actionBy: string,
    details: string
  ) {
    const store = getStore()
    const now = new Date()
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`

    store.auditLogs.push({
      id: `log-${String(store.auditLogs.length + 1).padStart(4, '0')}`,
      tableName,
      action,
      recordKey,
      actionBy,
      actionAt: timeStr,
      details,
    })
  }

  private buildSessionFromSupabaseUser(user: any): UserSession {
    const role: Role = (user.user_metadata?.role as Role) || 'user'
    const status: AccountStatus = (user.user_metadata?.status as AccountStatus) || 'active'
    const rights = role === 'superadmin' ? [...CANONICAL_RIGHTS] : []

    return {
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      fullName: user.user_metadata?.full_name || 'Hope Employee',
      role,
      status,
      permissions: rights,
      modules: this.deriveModulesFromRights(role, rights),
    }
  }
}

export const authService = new AuthService()
