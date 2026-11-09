'use client'

import React, { useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { UserSession } from '@/types'
import { logoutAction } from '@/lib/actions/auth.actions'
import { StatusBadge, RoleBadge } from './Badges'
import { Building2, LogOut, Shield, User, Layers } from 'lucide-react'

interface NavbarProps {
  session: UserSession | null
}

export function Navbar({ session }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
      router.push('/auth/login')
      router.refresh()
    })
  }

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link
              href={session ? '/dashboard' : '/'}
              className="flex items-center space-x-3 text-primary-green hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-green text-white flex items-center justify-center font-bold shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-lg text-primary-green tracking-tight leading-none">
                  HOPE, INC.
                </div>
                <div className="text-[11px] font-semibold text-muted-text tracking-wider uppercase">
                  Enterprise Resource Planning
                </div>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-6">
            {session && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-primary-green font-bold border-b-2 border-banana-gold py-1'
                      : 'text-charcoal-text hover:text-leaf-green'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Modules</span>
                </Link>

                {(session.role === 'admin' || session.role === 'superadmin') && (
                  <Link
                    href="/dashboard/admin/rights"
                    className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                      pathname?.startsWith('/dashboard/admin')
                        ? 'text-primary-green font-bold border-b-2 border-banana-gold py-1'
                        : 'text-charcoal-text hover:text-leaf-green'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>User & Rights</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right section: User Profile / Auth buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-charcoal-text">
                      {session.fullName}
                    </span>
                    <RoleBadge role={session.role} />
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs text-muted-text font-mono">
                      @{session.username}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold text-maroon hover:bg-rose-50 border border-stone-200 transition-colors"
                  title="Sign out of system"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {isPending ? 'Logging out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-primary-green hover:bg-emerald-50 rounded border border-primary-green transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-banana-gold hover:brightness-105 text-charcoal-text rounded shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
