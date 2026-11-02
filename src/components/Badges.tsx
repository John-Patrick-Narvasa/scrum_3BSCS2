'use client'

import React from 'react'
import { AccountStatus, Role } from '@/types'

export function StatusBadge({ status }: { status: AccountStatus | string }) {
  const norm = (status || '').toLowerCase()

  if (norm === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600"></span>
        ACTIVE
      </span>
    )
  }

  if (norm === 'pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
        PENDING
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-600"></span>
      {status?.toUpperCase() || 'BLOCKED'}
    </span>
  )
}

export function RoleBadge({ role }: { role: Role | string }) {
  const norm = (role || '').toLowerCase()

  if (norm === 'superadmin') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary-green text-white">
        Superadmin
      </span>
    )
  }

  if (norm === 'admin') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-leaf-green text-white">
        Admin
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-stone-200 text-charcoal-text">
      User
    </span>
  )
}
