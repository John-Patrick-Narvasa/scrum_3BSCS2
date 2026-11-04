'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/lib/actions/auth.actions'
import { Building2, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ============================================================================
  // HIGHLIGHT: Submit using native FormData to prevent passwords from appearing
  // in Next.js Turbopack dev server terminal logs!
  // ============================================================================
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formPayload = new FormData()
    formPayload.append('emailOrUsername', identifier.trim())
    formPayload.append('password', password)

    startTransition(async () => {
      const result = await loginAction(formPayload)

      if (!result.ok) {
        setError(result.error || 'Authentication failed')
        return
      }

      router.push('/dashboard')
      router.refresh()
    })
  }

  // Demo accounts helper for effortless role testing per S1-DEV-03
  const fillDemo = (id: string, pw: string) => {
    setIdentifier(id)
    setPassword(pw)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-green text-white shadow-md mb-3">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-green tracking-tight">
          Hope, Inc. ERP
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-text">
          Enterprise Resource Planning System &bull; Secure Login Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-card border border-stone-200">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-maroon/20 flex items-start space-x-3 text-maroon text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-maroon" />
              <div>
                <span className="font-bold">Authentication failed: </span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
              >
                Username or Email Address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. superadmin or user@hope.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text"
                >
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs font-semibold text-leaf-green hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal-text uppercase tracking-wider">
                Sprint 1 Seeded Test Accounts
              </span>
              <span className="text-[10px] text-muted-text">Click to fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('superadmin', 'SuperAdmin123!')}
                className="p-2 border border-stone-200 rounded text-left hover:bg-emerald-50 hover:border-primary-green transition-colors"
              >
                <div className="font-bold text-primary-green flex items-center justify-between">
                  <span>Superadmin</span>
                  <span className="text-[10px] bg-primary-green text-white px-1 rounded">ALL</span>
                </div>
                <div className="text-[11px] text-muted-text">superadmin / SuperAdmin123!</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin', 'Admin123!')}
                className="p-2 border border-stone-200 rounded text-left hover:bg-emerald-50 hover:border-leaf-green transition-colors"
              >
                <div className="font-bold text-leaf-green flex items-center justify-between">
                  <span>Admin</span>
                  <span className="text-[10px] bg-leaf-green text-white px-1 rounded">MGT</span>
                </div>
                <div className="text-[11px] text-muted-text">admin / Admin123!</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('user', 'User123!')}
                className="p-2 border border-stone-200 rounded text-left hover:bg-emerald-50 transition-colors"
              >
                <div className="font-bold text-charcoal-text flex items-center justify-between">
                  <span>Standard User</span>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-1 rounded">ACTIVE</span>
                </div>
                <div className="text-[11px] text-muted-text">user / User123!</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('pending', 'Pending123!')}
                className="p-2 border border-stone-200 rounded text-left hover:bg-amber-50 hover:border-banana-gold transition-colors"
              >
                <div className="font-bold text-amber-800 flex items-center justify-between">
                  <span>Pending User</span>
                  <span className="text-[10px] bg-banana-gold text-charcoal-text px-1 rounded font-bold">NEW</span>
                </div>
                <div className="text-[11px] text-muted-text">pending / Pending123!</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-text">
            Don't have an account yet?{' '}
            <Link
              href="/auth/register"
              className="font-bold text-primary-green hover:text-leaf-green hover:underline ml-1"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
