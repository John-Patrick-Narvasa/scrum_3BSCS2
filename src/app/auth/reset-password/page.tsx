'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from '@/lib/actions/auth.actions'
import { Building2, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  const [tokenInput, setTokenInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRequestToken = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await requestPasswordResetAction({ email })
      if (!result.ok) {
        setError(result.error)
        return
      }

      setGeneratedToken(result.data.token)
      setTokenInput(result.data.token)
      setSuccess(result.message)
      if (result.data.token) {
        setStep('reset')
      }
    })
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await resetPasswordAction({
        token: tokenInput,
        password,
        confirmPassword,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess('Your password has been successfully reset. You can now log in.')
      setStep('reset')
    })
  }

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-green text-white shadow-md mb-3">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-green tracking-tight">
          Password Recovery
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-text">
          Hope, Inc. ERP &bull; Account Security
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

          {step === 'request' && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <p className="text-xs text-muted-text leading-relaxed">
                Enter your registered Hope, Inc. ERP email address. A secure recovery
                token will be generated for password reset.
              </p>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  Work Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@hope.com"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPending ? 'Generating Token...' : 'Send Recovery Token'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep('reset')}
                  className="text-xs text-leaf-green hover:underline font-semibold"
                >
                  Already have a recovery token? Enter it here &rarr;
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <div>
              {generatedToken && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900">
                  <span className="font-bold">Recovery Token Generated: </span>
                  <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold block mt-1 break-all">
                    {generatedToken}
                  </code>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-md flex items-center space-x-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="tokenInput"
                    className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                  >
                    Reset Token
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="tokenInput"
                      name="tokenInput"
                      type="text"
                      required
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="rst-..."
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                    />
                  </div>
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
                    Confirm New Password
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
                  {isPending ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
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
