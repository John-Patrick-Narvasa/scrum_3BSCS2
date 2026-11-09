'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  listUsersAction,
  approveUserAction,
  updateUserStatusAction,
  assignUserRightsAction,
  getUserRightsAction,
  getAuditLogsAction,
  getSessionAction,
} from '@/lib/actions/auth.actions'
import { Navbar } from '@/components/Navbar'
import { StatusBadge, RoleBadge } from '@/components/Badges'
import {
  AppUser,
  UserSession,
  Role,
  AccountStatus,
  CANONICAL_RIGHTS,
} from '@/types'
import {
  Shield,
  UserCheck,
  UserX,
  Sliders,
  History,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react'

// Grouped canonical rights
const RIGHT_GROUPS = [
  {
    module: 'Customer Management',
    prefix: 'CUST_',
    rights: [
      { code: 'CUST_ADD', label: 'Add New Customer' },
      { code: 'CUST_EDIT', label: 'Edit Customer Records' },
      { code: 'CUST_DEL', label: 'Soft-Delete / Restore Customer' },
    ],
  },
  {
    module: 'Product & Pricing',
    prefix: 'PROD_',
    rights: [
      { code: 'PROD_ADD', label: 'Add New Product' },
      { code: 'PROD_EDIT', label: 'Edit Product Details' },
      { code: 'PROD_DEL', label: 'Soft-Delete Product' },
      { code: 'PRICE_ADD', label: 'Insert New Price Row' },
      { code: 'PRICE_EDIT', label: 'Modify Active Price' },
      { code: 'PRICE_DEL', label: 'Soft-Delete Price Row' },
    ],
  },
  {
    module: 'Human Resources (HR)',
    prefix: 'HR_',
    rights: [
      { code: 'EMP_ADD', label: 'Add Employee' },
      { code: 'EMP_EDIT', label: 'Edit Employee' },
      { code: 'EMP_DEL', label: 'Soft-Delete Employee' },
      { code: 'DEPT_ADD', label: 'Add Department' },
      { code: 'DEPT_EDIT', label: 'Edit Department' },
      { code: 'DEPT_DEL', label: 'Soft-Delete Department' },
      { code: 'JOB_ADD', label: 'Add Job Role' },
      { code: 'JOB_EDIT', label: 'Edit Job Role' },
      { code: 'JOB_DEL', label: 'Soft-Delete Job Role' },
      { code: 'JHIST_VIEW', label: 'View Career History (RA 10173 Protected)' },
      { code: 'JHIST_ADD', label: 'Add History Entry' },
      { code: 'JHIST_EDIT', label: 'Edit History Entry' },
      { code: 'JHIST_DEL', label: 'Soft-Delete History' },
    ],
  },
  {
    module: 'Sales & Invoicing',
    prefix: 'SALE_',
    rights: [
      { code: 'SALE_ADD', label: 'Create New Order' },
      { code: 'SALE_EDIT', label: 'Edit Order Header' },
      { code: 'SALE_DEL', label: 'Soft-Delete Order' },
      { code: 'SDTL_VIEW', label: 'View Line Item Pricing' },
      { code: 'SDTL_ADD', label: 'Add Line Items' },
      { code: 'SDTL_EDIT', label: 'Edit Line Items' },
      { code: 'SDTL_DEL', label: 'Remove Line Item' },
    ],
  },
  {
    module: 'Reports',
    prefix: 'REP_',
    rights: [
      { code: 'REP_TOPCUST', label: 'Top Customers Summary' },
      { code: 'REP_PRODMASTER', label: 'Product Master Catalog' },
      { code: 'REP_TOPPROD', label: 'Top Products by Sales' },
      { code: 'REP_ACTEMP', label: 'Active Employees' },
      { code: 'REP_ALLEMP', label: 'All Employees Directory' },
      { code: 'REP_JOBHIST', label: 'Job History Report' },
      { code: 'REP_TOPSALES', label: 'Top Sales Summary' },
    ],
  },
  {
    module: 'Official Payments',
    prefix: 'PAY_',
    rights: [
      { code: 'PAY_VIEW', label: 'View Receipts & Balances' },
      { code: 'PAY_ADD', label: 'Record Payment (OR)' },
      { code: 'PAY_EDIT', label: 'Edit Payment Record' },
      { code: 'PAY_DEL', label: 'Soft-Delete Payment' },
    ],
  },
]

export default function AdminRightsPage() {
  const router = useRouter()
  const [session, setSession] = useState<UserSession | null>(null)
  const [users, setUsers] = useState<AppUser[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users')
  const [filterRole, setFilterRole] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  // Rights Modal State
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [selectedUserRights, setSelectedUserRights] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )
  const [isPending, startTransition] = useTransition()

  const refreshData = async () => {
    const sRes = await getSessionAction()
    if (!sRes.ok || !sRes.data) {
      router.push('/auth/login')
      return
    }
    setSession(sRes.data)

    const uRes = await listUsersAction()
    if (uRes.ok) {
      setUsers(uRes.data)
    }

    const aRes = await getAuditLogsAction()
    if (aRes.ok) {
      setAuditLogs(aRes.data)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleApprove = (userId: string, designatedRole: Role = 'user') => {
    setMessage(null)
    startTransition(async () => {
      const res = await approveUserAction(userId, designatedRole)
      if (res.ok) {
        setMessage({ type: 'success', text: res.message || 'User approved successfully.' })
        await refreshData()
      } else {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleStatusChange = (userId: string, newStatus: AccountStatus, role?: Role) => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateUserStatusAction(userId, newStatus, role)
      if (res.ok) {
        setMessage({ type: 'success', text: res.message || 'Account status updated.' })
        await refreshData()
      } else {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  const handleOpenRightsModal = (user: AppUser) => {
    setSelectedUser(user)
    setMessage(null)
    startTransition(async () => {
      const res = await getUserRightsAction(user.id)
      if (res.ok) {
        setSelectedUserRights(res.data)
      } else {
        setSelectedUserRights([])
      }
      setIsModalOpen(true)
    })
  }

  const toggleRight = (code: string) => {
    setSelectedUserRights((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const toggleGroup = (groupRights: { code: string }[]) => {
    const codes = groupRights.map((r) => r.code)
    const allPresent = codes.every((c) => selectedUserRights.includes(c))
    if (allPresent) {
      setSelectedUserRights((prev) => prev.filter((c) => !codes.includes(c)))
    } else {
      setSelectedUserRights((prev) => Array.from(new Set([...prev, ...codes])))
    }
  }

  const handleSaveRights = () => {
    if (!selectedUser) return
    setMessage(null)
    startTransition(async () => {
      const res = await assignUserRightsAction(selectedUser.id, selectedUserRights)
      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Permissions updated for ${selectedUser.username}. Change recorded in audit log.`,
        })
        setIsModalOpen(false)
        await refreshData()
      } else {
        setMessage({ type: 'error', text: res.error })
      }
    })
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        u.username.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-muted-text mb-1">
              <Link href="/dashboard" className="hover:text-primary-green flex items-center">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Dashboard
              </Link>
              <span>/</span>
              <span>Administration</span>
            </div>
            <h1 className="text-2xl font-black text-charcoal-text tracking-tight flex items-center space-x-2">
              <Shield className="w-7 h-7 text-primary-green" />
              <span>User & Access Rights Management</span>
            </h1>
            <p className="text-xs text-muted-text mt-0.5">
              Approve onboarding requests, designate administrative roles, configure granular rights, and audit logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'bg-white text-charcoal-text border border-stone-200 hover:bg-stone-50'
              }`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'bg-white text-charcoal-text border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between text-xs font-medium border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-maroon border-maroon/30'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 text-maroon" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-stone-400 hover:text-stone-600 font-bold ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white border border-stone-200 rounded-card shadow-card overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name, username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-green"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="flex items-center space-x-1.5 text-xs text-muted-text">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Role:</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="text-xs border border-stone-300 rounded px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-muted-text">
                  <span>Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs border border-stone-300 rounded px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal-text">
                <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Audit Stamp</th>
                    <th className="py-3 px-4 text-right">Actions & Rights</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-text">
                        No user accounts match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-charcoal-text">
                            {user.full_name}
                          </div>
                          <div className="text-[11px] text-muted-text flex items-center space-x-2">
                            <span className="font-mono text-primary-green font-semibold">
                              @{user.username}
                            </span>
                            <span>&bull;</span>
                            <span>{user.email}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <RoleBadge role={user.role} />
                        </td>

                        <td className="py-3 px-4">
                          <StatusBadge status={user.status} />
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                          {user.stamp || `ADD system ${user.created_at.split('T')[0]}`}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Pending User Approval (Task S1-DEV-06) */}
                            {user.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(user.id, 'user')}
                                disabled={isPending}
                                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold text-charcoal-text bg-banana-gold hover:brightness-105 shadow-sm transition-all cursor-pointer"
                                title="Approve pending account"
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </button>
                            )}

                            {/* Granular Rights Button (Task S1-DEV-07) */}
                            {user.role !== 'superadmin' ? (
                              <button
                                onClick={() => handleOpenRightsModal(user)}
                                disabled={isPending}
                                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold text-primary-green bg-emerald-50 border border-primary-green/30 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="Configure module permissions"
                              >
                                <Sliders className="w-3.5 h-3.5 mr-1" />
                                Permissions
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-text italic px-2">
                                All Rights Granted
                              </span>
                            )}

                            {/* Status toggles */}
                            {user.status === 'active' && user.role !== 'superadmin' && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'blocked')}
                                disabled={isPending}
                                className="p-1 rounded text-maroon hover:bg-rose-50"
                                title="Block user access"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}

                            {user.status === 'blocked' && (
                              <button
                                onClick={() => handleStatusChange(user.id, 'active')}
                                disabled={isPending}
                                className="px-2 py-0.5 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              >
                                Unblock
                              </button>
                            )}

                            {/* Superadmin designating admin */}
                            {session?.role === 'superadmin' &&
                              user.role === 'user' &&
                              user.status === 'active' && (
                                <button
                                  onClick={() => handleStatusChange(user.id, 'active', 'admin')}
                                  disabled={isPending}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-leaf-green bg-stone-100 hover:bg-stone-200"
                                  title="Promote user to administrator"
                                >
                                  Make Admin
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-stone-200 rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-charcoal-text uppercase tracking-wider">
                  Append-Only Audit Trail (Hope, Inc. PostgreSQL)
                </h3>
                <p className="text-xs text-muted-text">
                  Immutable log entries generated by system triggers and administrative actions
                </p>
              </div>
              <span className="text-xs font-mono bg-stone-200 px-2 py-0.5 rounded">
                audit_log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal-text">
                <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Record Key</th>
                    <th className="py-3 px-4">Action By</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'ADD'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'EDIT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-primary-green">
                        {log.tableName}
                      </td>
                      <td className="py-2.5 px-4">{log.recordKey}</td>
                      <td className="py-2.5 px-4 text-stone-600">@{log.actionBy}</td>
                      <td className="py-2.5 px-4 text-stone-400">{log.actionAt}</td>
                      <td className="py-2.5 px-4 font-sans text-stone-600 text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rights Modal (Task S1-DEV-07) */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-card shadow-xl max-w-2xl w-full border border-stone-200 overflow-hidden">
              <div className="bg-primary-green text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">
                    Assign Permissions: {selectedUser.full_name}
                  </h3>
                  <p className="text-xs text-stone-200">
                    User: @{selectedUser.username} &bull; Role: {selectedUser.role.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-stone-200 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <p className="text-xs text-muted-text">
                  Select the granular rights granted to this user. Rights determine which
                  module tiles appear on their home page and allow server-side operations.
                </p>

                {RIGHT_GROUPS.map((group) => {
                  const allSelected = group.rights.every((r) =>
                    selectedUserRights.includes(r.code)
                  )
                  return (
                    <div
                      key={group.module}
                      className="border border-stone-200 rounded-lg p-3 bg-stone-50/50"
                    >
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-stone-200">
                        <span className="font-bold text-xs text-charcoal-text">
                          {group.module}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.rights)}
                          className="text-[11px] font-semibold text-leaf-green hover:underline"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.rights.map((r) => {
                          const checked = selectedUserRights.includes(r.code)
                          return (
                            <label
                              key={r.code}
                              className={`flex items-start space-x-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                                checked ? 'bg-emerald-50 text-emerald-950 font-medium' : 'text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleRight(r.code)}
                                className="mt-0.5 rounded text-primary-green focus:ring-primary-green"
                              />
                              <div>
                                <span className="font-mono text-[10px] text-primary-green font-bold block">
                                  {r.code}
                                </span>
                                <span className="text-[11px]">{r.label}</span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
                <span className="text-xs text-muted-text">
                  Selected rights:{' '}
                  <span className="font-bold text-primary-green">
                    {selectedUserRights.length} / 40
                  </span>
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-300 rounded text-xs font-semibold text-charcoal-text hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRights}
                    disabled={isPending}
                    className="px-4 py-2 bg-primary-green hover:bg-leaf-green text-white rounded text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    {isPending ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
