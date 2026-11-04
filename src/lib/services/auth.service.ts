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

// Global in-memory fallback store so seeded accounts and local sessions persist across requests
interface ERPStore {
  users: (AppUser & { passwordHash: string })[]
  userRights: Record<string, string[]>
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
  empno: '00001',
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
  empno: '00003',
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
  empno: '00005',
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
  empno: '00007',
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
  // ============================================================================
  // HIGHLIGHT: Login with Supabase Auth & fallback to seeded accounts
  // ============================================================================
  async login(input: LoginInput): Promise<UserSession> {
    const store = getStore()
    const identifier = input.emailOrUsername.trim().toLowerCase()
    const password = input.password

    let targetEmail = identifier

    // 1. If identifier is a username, attempt lookup in app_user or store
    if (!identifier.includes('@')) {
      const matchedLocal = store.users.find(
        (u) => u.username.toLowerCase() === identifier && !u.is_deleted
      )
      if (matchedLocal) {
        targetEmail = matchedLocal.email
      }
    }

    // 2. Try Supabase Auth first
    try {
      const supabase = await createClient()

      // If user typed a username, query Supabase public.app_user to resolve email
      if (!identifier.includes('@')) {
        const { data: dbUser } = await supabase
          .from('app_user')
          .select('email, role, status, full_name, empno')
          .eq('username', identifier)
          .maybeSingle()

        if (dbUser?.email) {
          targetEmail = dbUser.email
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      })

      if (!authError && authData?.user) {
        // Query app_user record for status and role
        const { data: profile } = await supabase
          .from('app_user')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle()

        const role: Role = (profile?.role as Role) || (authData.user.user_metadata?.role as Role) || 'user'
        const status: AccountStatus =
          (profile?.status as AccountStatus) ||
          (authData.user.user_metadata?.status as AccountStatus) ||
          'pending'

        if (status === 'blocked') {
          await supabase.auth.signOut()
          throw new Error('This account has been blocked. Please contact a system administrator.')
        }

        const username =
          profile?.username || authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || 'user'
        const fullName =
          profile?.full_name || authData.user.user_metadata?.full_name || username

        // Query rights from user_permission table
        const { data: permissions } = await supabase
          .from('user_permission')
          .select('right_code')
          .eq('user_id', authData.user.id)

        const rights =
          role === 'superadmin'
            ? [...CANONICAL_RIGHTS]
            : (permissions?.map((p: any) => p.right_code) || [])

        const session: UserSession = {
          id: authData.user.id,
          username,
          email: authData.user.email || targetEmail,
          fullName,
          empno: profile?.empno || null,
          role,
          status,
          permissions: rights,
          modules: this.deriveModulesFromRights(role, rights),
        }

        await this.saveSessionCookie(session)
        this.addAuditLog('auth', 'LOGIN', session.username, session.username, `Supabase auth login (${role})`)
        return session
      }
    } catch (err: any) {
      if (err.message && err.message.includes('blocked')) {
        throw err
      }
      // If Supabase is unreachable or credentials don't match, fall through to in-memory store
    }

    // 3. Fallback: In-memory store (for seeded accounts superadmin, admin, user, pending)
    const localUser = store.users.find(
      (u) =>
        (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier) &&
        !u.is_deleted
    )

    if (!localUser || localUser.passwordHash !== password) {
      throw new Error('Invalid username/email or password')
    }

    if (localUser.status === 'blocked') {
      throw new Error('This account has been blocked. Please contact a system administrator.')
    }

    const rights =
      localUser.role === 'superadmin'
        ? [...CANONICAL_RIGHTS]
        : store.userRights[localUser.id] || []

    const modules = this.deriveModulesFromRights(localUser.role, rights)

    const session: UserSession = {
      id: localUser.id,
      username: localUser.username,
      email: localUser.email,
      fullName: localUser.full_name,
      empno: localUser.empno || null,
      role: localUser.role,
      status: localUser.status,
      permissions: rights,
      modules: modules,
    }

    await this.saveSessionCookie(session)
    this.addAuditLog('auth', 'LOGIN', localUser.username, localUser.username, `Successful login by ${localUser.role}`)

    return session
  }

  // ============================================================================
  // HIGHLIGHT: Register with Supabase Auth (signUp) and DB trigger sync
  // ============================================================================
  async register(input: RegisterInput): Promise<AppUser> {
    const store = getStore()
    const username = input.username.trim()
    const email = input.email.trim().toLowerCase()
    const fullName = input.fullName.trim()
    const empno = input.empno?.trim() || null

    // Check unique username & email in local cache
    if (store.users.some((u) => u.username.toLowerCase() === username.toLowerCase() && !u.is_deleted)) {
      throw new Error('Username is already taken')
    }
    if (store.users.some((u) => u.email.toLowerCase() === email && !u.is_deleted)) {
      throw new Error('An account with this email already exists')
    }

    const now = new Date()
    const stampDate = now.toISOString().split('T')[0]
    const stampTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const stamp = `ADD system ${stampDate} ${stampTime}`

    let createdId = `usr-${String(store.users.length + 1).padStart(8, '0')}`

    // HIGHLIGHT: Call Supabase Auth signUp to persist user in Supabase project
    try {
      const supabase = await createClient()

      // Validate empno if provided against public.employee
      if (empno) {
        const { data: empRecord } = await supabase
          .from('employee')
          .select('empno, firstname, lastname')
          .eq('empno', empno)
          .maybeSingle()

        if (!empRecord) {
          console.warn(`[Hope ERP] Employee ${empno} not found in employee table; proceeding as unlinked`)
        }
      }

      // Supabase Auth signUp with metadata for the DB trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: input.password,
        options: {
          data: {
            username: username,
            full_name: fullName,
            empno: empno,
            role: 'user',
            status: 'pending',
          },
        },
      })

      if (authError) {
        // If Supabase returns error (e.g. User already registered), propagate message
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email is already registered in Supabase')
        }
        console.warn('[Hope ERP] Supabase signUp returned warning:', authError.message)
      } else if (authData.user?.id) {
        createdId = authData.user.id

        // Ensure row exists in app_user in case trigger is not yet applied in hosted DB
        try {
          await supabase
            .from('app_user')
            .upsert({
              id: createdId,
              username: username,
              email: email,
              full_name: fullName,
              empno: empno,
              role: 'user',
              status: 'pending',
              stamp: stamp,
            })
        } catch {
          // Ignore if already created by trigger
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already')) {
        throw err
      }
      console.warn('[Hope ERP] Continuing with local store sync:', err.message)
    }

    // Persist in local store so it is immediately available across server reloads
    const newUser: AppUser & { passwordHash: string } = {
      id: createdId,
      username: username,
      email: email,
      full_name: fullName,
      empno: empno,
      role: 'user',
      status: 'pending', // Starts as pending per S1-DEV-02
      approved_by: null,
      approved_at: null,
      created_at: now.toISOString(),
      stamp: stamp,
      is_deleted: false,
      passwordHash: input.password,
    }

    store.users.push(newUser)
    store.userRights[createdId] = []

    this.addAuditLog(
      'app_user',
      'ADD',
      newUser.username,
      'system',
      `Registered user @${newUser.username} (status: PENDING, empno: ${empno || 'none'})`
    )

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      full_name: newUser.full_name,
      empno: newUser.empno,
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
   * Guard: require specific right code
   */
  async requireRight(rightCode: string): Promise<UserSession> {
    const session = await this.requireAuth()

    if (session.status === 'blocked') {
      throw new Error('Forbidden: Account is blocked')
    }
    if (session.status === 'pending') {
      throw new Error('Forbidden: Account is pending administrator approval')
    }

    if (session.role === 'superadmin') {
      return session
    }

    if (!session.permissions.includes(rightCode)) {
      throw new Error(`Forbidden: You do not possess the required right (${rightCode})`)
    }

    return session
  }

  /**
   * Guard: require one of specified roles
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
   * Request password reset token
   */
  async requestPasswordReset(email: string): Promise<{ token: string; message: string }> {
    const store = getStore()
    const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

    // Also trigger Supabase password reset email if client is connected
    try {
      const supabase = await createClient()
      await supabase.auth.resetPasswordForEmail(email)
    } catch {
      // Continue with token fallback
    }

    if (!user) {
      return {
        token: '',
        message: 'If that email address exists in our system, a password reset link has been dispatched.',
      }
    }

    const token = `rst-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`
    store.resetTokens[token] = {
      userId: user.id,
      expiresAt: Date.now() + 3600000 * 2,
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
   * Reset password with token
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
   * Set password on first login
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
   * List users for user-rights management
   */
  async listUsers(): Promise<AppUser[]> {
    const session = await this.requireRole(['admin', 'superadmin'])

    // Query Supabase app_user if available
    try {
      const supabase = await createClient()
      const { data: dbUsers, error } = await supabase
        .from('app_user')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && dbUsers && dbUsers.length > 0) {
        return dbUsers
          .filter((u: any) => {
            if (session.role === 'admin' && u.role === 'superadmin') return false
            return true
          })
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            full_name: u.full_name,
            empno: u.empno,
            role: u.role,
            status: u.status,
            approved_by: u.approved_by,
            approved_at: u.approved_at,
            created_at: u.created_at,
            stamp: u.stamp,
            is_deleted: u.is_deleted,
          }))
      }
    } catch {
      // Fall through to store
    }

    const store = getStore()
    return store.users
      .filter((u) => {
        if (session.role === 'admin' && u.role === 'superadmin') return false
        return true
      })
      .map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        full_name: u.full_name,
        empno: u.empno,
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
   * Approve a pending user
   */
  async approveUser(userId: string, designatedRole?: Role): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (designatedRole === 'admin' && session.role !== 'superadmin') {
      throw new Error('Only superadmins can designate admins')
    }
    if (designatedRole === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Only superadmins can designate another superadmin')
    }

    if (user) {
      user.status = 'active'
      user.approved_by = session.username
      user.approved_at = new Date().toISOString()
      if (designatedRole) {
        user.role = designatedRole
      }
    }

    // Also update Supabase database
    try {
      const supabase = await createClient()
      await supabase
        .from('app_user')
        .update({
          status: 'active',
          approved_by: session.username,
          approved_at: new Date().toISOString(),
          ...(designatedRole ? { role: designatedRole } : {}),
        })
        .eq('id', userId)
    } catch {
      // Continue
    }

    this.addAuditLog(
      'app_user',
      'EDIT',
      user ? user.username : userId,
      session.username,
      `Approved user account (Role: ${designatedRole || user?.role || 'user'}, Status: ACTIVE)`
    )
  }

  /**
   * Change user status or role
   */
  async updateUserStatus(
    userId: string,
    status: AccountStatus,
    role?: Role
  ): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (user?.role === 'superadmin' && (status !== 'active' || (role && role !== 'superadmin'))) {
      const activeSuperadmins = store.users.filter(
        (u) => u.role === 'superadmin' && u.status === 'active' && !u.is_deleted
      )
      if (activeSuperadmins.length <= 1) {
        throw new Error(
          'Cannot modify the last remaining active superadmin account (Protected Rule)'
        )
      }
    }

    if (user?.role === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Admins cannot modify superadmin accounts')
    }

    if (user) {
      user.status = status
      if (role) {
        if ((role === 'admin' || role === 'superadmin') && session.role !== 'superadmin') {
          throw new Error('Only superadmins can grant admin or superadmin roles')
        }
        user.role = role
      }
    }

    try {
      const supabase = await createClient()
      await supabase
        .from('app_user')
        .update({
          status: status,
          ...(role ? { role: role } : {}),
        })
        .eq('id', userId)
    } catch {
      // Continue
    }

    this.addAuditLog(
      'app_user',
      'EDIT',
      user ? user.username : userId,
      session.username,
      `Updated user status=${status}${role ? `, role=${role}` : ''}`
    )
  }

  /**
   * Assign per-module rights
   */
  async assignUserRights(userId: string, rights: string[]): Promise<void> {
    const session = await this.requireRole(['admin', 'superadmin'])
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)

    if (user?.role === 'superadmin' && session.role !== 'superadmin') {
      throw new Error('Admins cannot change superadmin rights')
    }

    store.userRights[userId] = rights

    // Update Supabase user_permission table
    try {
      const supabase = await createClient()
      await supabase.from('user_permission').delete().eq('user_id', userId)

      const rows = rights.map((r) => ({
        user_id: userId,
        module: this.getModuleForRight(r),
        right_code: r,
        granted_by: session.username,
        granted_at: new Date().toISOString(),
      }))

      if (rows.length > 0) {
        await supabase.from('user_permission').insert(rows)
      }
    } catch {
      // Continue
    }

    this.addAuditLog(
      'user_permission',
      'EDIT',
      user ? user.username : userId,
      session.username,
      `Updated permissions (Count: ${rights.length})`
    )
  }

  /**
   * Get user rights
   */
  async getUserRights(userId: string): Promise<string[]> {
    const store = getStore()
    const user = store.users.find((u) => u.id === userId)
    if (user?.role === 'superadmin') {
      return [...CANONICAL_RIGHTS]
    }

    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('user_permission')
        .select('right_code')
        .eq('user_id', userId)

      if (data && data.length > 0) {
        return data.map((d: any) => d.right_code)
      }
    } catch {
      // Continue
    }

    return store.userRights[userId] || []
  }

  /**
   * Get audit log list
   */
  async getAuditLogs() {
    await this.requireRole(['admin', 'superadmin'])

    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('action_at', { ascending: false })
        .limit(50)

      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: `log-${d.audit_id}`,
          tableName: d.table_name,
          action: d.action,
          recordKey: d.record_key,
          actionBy: d.action_by,
          actionAt: new Date(d.action_at).toLocaleString(),
          details: d.new_values ? JSON.stringify(d.new_values) : d.action,
        }))
      }
    } catch {
      // Continue
    }

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
    if (role === 'superadmin' || role === 'admin') {
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

  private getModuleForRight(r: string): string {
    if (r.startsWith('CUST_')) return 'customer'
    if (r.startsWith('PROD_') || r.startsWith('PRICE_')) return 'product'
    if (r.startsWith('JOB_') || r.startsWith('DEPT_') || r.startsWith('EMP_') || r.startsWith('JHIST_')) return 'hr'
    if (r.startsWith('SALE_') || r.startsWith('SDTL_')) return 'sales'
    if (r.startsWith('REP_')) return 'reports'
    if (r.startsWith('PAY_')) return 'payment'
    return 'admin'
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
}

export const authService = new AuthService()
