'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/lib/actions/auth.actions'
import {
  Building2,
  User,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    empno: '', // HIGHLIGHT: Optional employee number linking to HopeDB
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ============================================================================
  // HIGHLIGHT: Submit using native FormData to prevent passwords from appearing
  // in Next.js Turbopack dev server terminal logs!
  // ============================================================================
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Construct FormData object to protect credentials in server action log
    const formPayload = new FormData()
    formPayload.append('username', formData.username)
    formPayload.append('fullName', formData.fullName)
    formPayload.append('email', formData.email)
    if (formData.empno.trim()) {
      formPayload.append('empno', formData.empno.trim())
    }
    formPayload.append('password', formData.password)
    formPayload.append('confirmPassword', formData.confirmPassword)

    startTransition(async () => {
      const result = await registerAction(formPayload)
      if (!result.ok) {
        setError(result.error || 'Registration failed')
        return
      }

      setSuccessMessage(
        result.message ||
          'Registration submitted successfully! Your account is created with status PENDING and requires administrator approval before accessing ERP modules.'
      )
    })
  }

  return (
    <div className="min-h-screen bg-cream-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-green text-white shadow-md mb-3">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-green tracking-tight">
          Register New Account
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-text">
          Hope, Inc. Enterprise Resource Planning &bull; Employee Onboarding
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-card border border-stone-200">
          {/* Policy Notice per S1-DEV-02 / Sprint 1 Acceptance Criteria */}
          <div className="mb-6 p-3.5 bg-amber-50 border border-banana-gold/40 rounded-lg flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-700 mt-0.5" />
            <div>
              <span className="font-bold">Approval Workflow Policy: </span>
              In accordance with Hope, Inc. security rules, new registrations are assigned
              the <span className="font-semibold">user</span> role with{' '}
              <span className="inline-block px-1.5 py-0.2 font-bold bg-banana-gold text-charcoal-text rounded text-[10px]">
                PENDING
              </span>{' '}
              status. An authorized administrator or superadmin must approve your account
              and assign module rights before permissions are active.
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-maroon/20 flex items-start space-x-3 text-maroon text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-maroon" />
              <div>
                <span className="font-bold">Registration issue: </span>
                {error}
              </div>
            </div>
          )}

          {successMessage ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-primary-green mb-2">
                Registration Successful!
              </h2>
              <p className="text-sm text-stone-600 mb-6 max-w-sm mx-auto">
                {successMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-bold text-white bg-primary-green hover:bg-leaf-green transition-colors text-sm"
                >
                  Proceed to Login
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Juan dela Cruz"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. jdelacruz"
                    className="block w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                  >
                    Email Address
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="employee@hope.com"
                      className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                    />
                  </div>
                </div>
              </div>

              {/* HIGHLIGHT: Employee ID (empno) linkage to HopeDB */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="empno"
                    className="block text-xs font-bold uppercase tracking-wider text-charcoal-text"
                  >
                    Employee ID (HopeDB Linkage &bull; Optional)
                  </label>
                  <span className="text-[10px] text-muted-text">e.g. 00001, 00003, 00005</span>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="empno"
                    name="empno"
                    type="text"
                    maxLength={5}
                    value={formData.empno}
                    onChange={handleChange}
                    placeholder="e.g. 00001 (from HopeDB employee table)"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-text">
                  If you are one of the 60+ pre-existing Hope, Inc. employees, enter your 5-digit ID to link your personnel record.
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1"
                >
                  Password (min 8 chars, 1 uppercase, 1 number)
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isPending ? 'Registering...' : 'Submit Registration for Approval'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted-text">
            Already have an approved account?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-primary-green hover:text-leaf-green hover:underline ml-1"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
