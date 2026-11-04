export * from './database.types'

export type Role = 'superadmin' | 'admin' | 'user'
export type AccountStatus = 'pending' | 'active' | 'blocked'

export interface UserSession {
  id: string
  username: string
  email: string
  fullName: string
  empno?: string | null
  role: Role
  status: AccountStatus
  permissions: string[]
  modules: string[]
  needsPasswordReset?: boolean
}

export interface AppUser {
  id: string
  username: string
  email: string
  full_name: string
  empno?: string | null
  role: Role
  status: AccountStatus
  approved_by: string | null
  approved_at: string | null
  created_at: string
  stamp: string
  is_deleted: boolean
}

export interface ActionResult<T = any> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}

export const CANONICAL_RIGHTS = [
  // Customer
  'CUST_ADD', 'CUST_EDIT', 'CUST_DEL',
  // Product
  'PROD_ADD', 'PROD_EDIT', 'PROD_DEL', 'PRICE_ADD', 'PRICE_EDIT', 'PRICE_DEL',
  // HR
  'JOB_ADD', 'JOB_EDIT', 'JOB_DEL', 'DEPT_ADD', 'DEPT_EDIT', 'DEPT_DEL',
  'EMP_ADD', 'EMP_EDIT', 'EMP_DEL', 'JHIST_VIEW', 'JHIST_ADD', 'JHIST_EDIT', 'JHIST_DEL',
  // Sales
  'SALE_ADD', 'SALE_EDIT', 'SALE_DEL', 'SDTL_VIEW', 'SDTL_ADD', 'SDTL_EDIT', 'SDTL_DEL',
  // Reports
  'REP_TOPCUST', 'REP_PRODMASTER', 'REP_TOPPROD', 'REP_ACTEMP', 'REP_ALLEMP', 'REP_JOBHIST', 'REP_TOPSALES',
  // Payment
  'PAY_VIEW', 'PAY_ADD', 'PAY_EDIT', 'PAY_DEL',
] as const

export type RightCode = typeof CANONICAL_RIGHTS[number]

export const MODULE_NAMES = [
  'customer',
  'product',
  'hr',
  'sales',
  'reports',
  'payment',
  'admin',
] as const

export type ModuleName = typeof MODULE_NAMES[number]
