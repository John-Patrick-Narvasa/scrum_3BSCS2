'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setPasswordAction } from '@/lib/actions/auth.actions'
import { Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SetPasswordPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      // Find userId by username or placeholder id
      const result = await setPasswordAction(username, {
        password,
        confirmPassword,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess('Your password has been initialized. You may now sign in.')
    })
  }

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-green text-white shadow-md mb-3">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-green tracking-tight">
          Initial Password Setup
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-text">
          Hope, Inc. ERP &bull; First Login Activation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-card border border-stone-200">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-maroon/20 flex items-start space-x-3 text-maroon text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-maroon" />
              <div>{error}</div>
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-emerald-100 text-primary-green rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-primary-green mb-2">Password Set!</h2>
              <p className="text-xs text-muted-text mb-6">{success}</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded font-bold text-white bg-primary-green hover:bg-leaf-green text-xs"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <p className="text-xs text-muted-text leading-relaxed">
                As per Hope, Inc. security policy, seed accounts do not have default
                passwords. Initialize your private password below.
              </p>

              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user"
                  className="block w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="min 8 chars, 1 uppercase, 1 number"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Saving...' : 'Set Password and Activate'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-stone-200 text-center text-xs">
            <Link
              href="/auth/login"
              className="font-bold text-primary-green hover:text-leaf-green hover:underline"
            >
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
