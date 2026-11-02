import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { Navbar } from '@/components/Navbar'
import { StatusBadge, RoleBadge } from '@/components/Badges'
import {
  Users,
  Package,
  Briefcase,
  ShoppingCart,
  FileText,
  CreditCard,
  Shield,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await authService.getSession()

  // If unauthenticated, redirect to login
  if (!session) {
    redirect('/auth/login')
  }

  // Derive which modules are accessible based on session role & permissions
  const isSuperadmin = session.role === 'superadmin'
  const isAdmin = session.role === 'admin'
  const isPending = session.status === 'pending'
  const isBlocked = session.status === 'blocked'

  const hasCustomer = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('CUST_'))
  const hasProduct = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('PROD_') || p.startsWith('PRICE_'))
  const hasHR = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('EMP_') || p.startsWith('DEPT_') || p.startsWith('JOB_') || p.startsWith('JHIST_'))
  const hasSales = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('SALE_') || p.startsWith('SDTL_'))
  const hasReports = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('REP_'))
  const hasPayments = isSuperadmin || isAdmin || session.permissions.some((p) => p.startsWith('PAY_'))
  const hasAdmin = isSuperadmin || isAdmin

  const modules = [
    {
      id: 'customer',
      title: 'Customer Management',
      description: 'Manage client accounts, addresses, contact details, and account status.',
      icon: Users,
      href: '/dashboard/customer',
      accessible: !isPending && hasCustomer,
      rights: ['CUST_ADD', 'CUST_EDIT', 'CUST_DEL'],
      color: 'bg-emerald-600',
    },
    {
      id: 'product',
      title: 'Product Catalog & Pricing',
      description: 'Inventory items, stock levels, reorder thresholds, and price history records.',
      icon: Package,
      href: '/dashboard/product/catalog',
      accessible: !isPending && hasProduct,
      rights: ['PROD_ADD', 'PROD_EDIT', 'PROD_DEL', 'PRICE_ADD'],
      color: 'bg-teal-700',
    },
    {
      id: 'hr',
      title: 'Human Resources',
      description: 'Employee profiles, department structure, job roles, and career history.',
      icon: Briefcase,
      href: '/dashboard/hr/employees',
      accessible: !isPending && hasHR,
      rights: ['EMP_ADD', 'DEPT_ADD', 'JOB_ADD', 'JHIST_VIEW'],
      color: 'bg-primary-green',
    },
    {
      id: 'sales',
      title: 'Sales & Orders',
      description: 'Process transactions, sales line items, and invoice tracking.',
      icon: ShoppingCart,
      href: '/dashboard/sales/orders',
      accessible: !isPending && hasSales,
      rights: ['SALE_ADD', 'SALE_EDIT', 'SDTL_VIEW'],
      color: 'bg-leaf-green',
    },
    {
      id: 'payments',
      title: 'Payments & Receipts',
      description: 'Official receipts (OR), payment allocations, and outstanding balances.',
      icon: CreditCard,
      href: '/dashboard/sales/payments',
      accessible: !isPending && hasPayments,
      rights: ['PAY_VIEW', 'PAY_ADD'],
      color: 'bg-amber-600',
    },
    {
      id: 'reports',
      title: 'Enterprise Reports',
      description: 'Top customers, active personnel, product master summaries, and revenue logs.',
      icon: FileText,
      href: '/dashboard/reports',
      accessible: !isPending && hasReports,
      rights: ['REP_TOPCUST', 'REP_PRODMASTER', 'REP_TOPSALES'],
      color: 'bg-stone-700',
    },
    {
      id: 'admin',
      title: 'User & Access Rights',
      description: 'Approve pending accounts, assign role privileges, and inspect the audit trail.',
      icon: Shield,
      href: '/dashboard/admin/rights',
      accessible: !isPending && hasAdmin,
      rights: ['SUPERADMIN', 'ADMIN_MGT'],
      color: 'bg-primary-green',
    },
  ]

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Approval Banner */}
        {isPending && (
          <div className="mb-8 p-5 bg-amber-50 border-2 border-banana-gold rounded-lg shadow-sm">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Account Registration Pending Approval
                </h3>
                <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                  Your account has been registered with{' '}
                  <span className="font-bold">PENDING</span> status. In compliance with
                  Hope, Inc. ERP security policy, all module actions remain locked until a
                  System Administrator or Superadmin reviews and approves your account.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs font-semibold text-amber-800">
                  <span>Username: @{session.username}</span>
                  <span>&bull;</span>
                  <span>Registered Role: {session.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-white border border-stone-200 rounded-card p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-charcoal-text tracking-tight">
                  Welcome, {session.fullName}
                </h1>
                <RoleBadge role={session.role} />
                <StatusBadge status={session.status} />
              </div>
              <p className="mt-1 text-sm text-muted-text">
                Hope, Inc. Enterprise Resource Planning &bull; Manila Operations Hub
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs">
              <div>
                <span className="text-muted-text">Permissions: </span>
                <span className="font-bold text-primary-green">
                  {isSuperadmin
                    ? 'Full Superadmin Bypass (All 40 Rights)'
                    : `${session.permissions.length} rights granted`}
                </span>
              </div>
              {hasAdmin && (
                <Link
                  href="/dashboard/admin/rights"
                  className="px-3 py-1 bg-banana-gold text-charcoal-text font-bold rounded hover:brightness-105 transition-all"
                >
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Module Tiles Section (Task S1-DEV-08) */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-charcoal-text tracking-tight uppercase">
              System Modules
            </h2>
            <p className="text-xs text-muted-text">
              Server-gated module switches according to your assigned rights
            </p>
          </div>
          <div className="text-xs text-muted-text font-mono">
            Active Session: @{session.username}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.id}
                className={`flex flex-col justify-between p-6 rounded-card border transition-all ${
                  mod.accessible
                    ? 'bg-white border-stone-200 shadow-card hover:border-primary-green/40 hover:shadow-md'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${mod.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {mod.accessible ? (
                      <span className="inline-flex items-center text-xs font-bold text-leaf-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Accessible
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                        <Lock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        Restricted
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-charcoal-text mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-muted-text leading-relaxed mb-4">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  {mod.accessible ? (
                    <Link
                      href={mod.href}
                      className="inline-flex items-center text-xs font-bold text-primary-green hover:text-leaf-green transition-colors"
                    >
                      Open Module
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">
                      {isPending
                        ? 'Requires admin approval'
                        : 'Contact Admin for rights assignment'}
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-stone-400">
                    {mod.id.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}