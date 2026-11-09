import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authService } from '@/lib/services/auth.service'
import { Building2, Shield, Lock, Users, ArrowRight, CheckCircle2, FileCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const session = await authService.getSession()

  // If already logged in, navigate directly to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-between">
      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-primary-green">
            <div className="w-10 h-10 rounded-lg bg-primary-green text-white flex items-center justify-center font-bold shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-primary-green tracking-tight leading-none">
                HOPE, INC.
              </div>
              <div className="text-[10px] font-semibold text-muted-text tracking-wider uppercase">
                Enterprise Resource Planning
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-xs font-bold text-primary-green hover:bg-emerald-50 rounded border border-primary-green transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-xs font-bold bg-banana-gold hover:brightness-105 text-charcoal-text rounded shadow-sm transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        {/* <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-primary-green border border-emerald-300 text-xs font-bold mb-6">
          <Shield className="w-4 h-4 text-primary-green" />
          <span>Sprint 1 &bull; Auth & Security Layer Active</span>
        </div> */}

        <h1 className="text-4xl sm:text-5xl font-black text-charcoal-text tracking-tight max-w-3xl leading-tight">
          Unified Business Management for <span className="text-primary-green">Hope, Inc.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-muted-text max-w-2xl leading-relaxed">
          Centralized enterprise operations covering customer relations, inventory catalog,
          human resource records, sales orders, payment reconciliations, and immutable audit trails.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md font-bold text-white bg-primary-green hover:bg-leaf-green shadow-md transition-all text-sm cursor-pointer"
          >
            <span>Access ERP Portal</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md font-bold text-charcoal-text bg-banana-gold hover:brightness-105 shadow-sm transition-all text-sm cursor-pointer"
          >
            <span>Register for Access</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white p-6 rounded-card border border-stone-200 shadow-card">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary-green flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-charcoal-text uppercase tracking-wide mb-1">
              Role-Based Access (RBAC)
            </h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Superadmin, Admin, and User tiering with 40 canonical granular rights across 6 business modules.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-stone-200 shadow-card">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-charcoal-text uppercase tracking-wide mb-1">
              Two-Step Approval Workflow
            </h3>
            <p className="text-xs text-muted-text leading-relaxed">
              New accounts register with PENDING status; administrators review and grant authorization before access.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-stone-200 shadow-card">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-charcoal-text uppercase tracking-wide mb-1">
              Immutable Audit Trail
            </h3>
            <p className="text-xs text-muted-text leading-relaxed">
              Soft-delete discipline and tamper-evident audit logging for every rights modification and user action.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-muted-text">
        <p>&copy; 2026 Hope, Inc. Enterprise Resource Planning &bull; Developed by The bAI Group (3BSCS-2)</p>
      </footer>
    </div>
  )
}