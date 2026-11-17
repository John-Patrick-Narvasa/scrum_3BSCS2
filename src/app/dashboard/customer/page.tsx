'use client'

import React, { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import {
    MOCK_CUSTOMERS,
    makeStamp,
    nextCustNo,
    type Customer,
} from '@/components/customers/customer-data'
import StatusBadge from '@/components/customers/StatusBadge'
import CustomerForm, { type CustomerFormValues } from '@/components/customers/CustomerForm'

type Role = 'admin' | 'user'
type Tab = 'active' | 'inactive' | 'all'

const btn =
    'px-2 py-1 text-xs font-semibold border border-stone-300 rounded hover:bg-stone-50 transition-colors cursor-pointer'

export default function CustomerManagementPage() {
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)
    // Wireframe only: lets you preview both views. Replace with the real session role.
    const [role, setRole] = useState<Role>('admin')
    const [tab, setTab] = useState<Tab>('all')
    const [query, setQuery] = useState('')
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Customer | null>(null)

    const isAdmin = role === 'admin'
    const counts = {
        active: customers.filter((c) => c.status === 'active').length,
        inactive: customers.filter((c) => c.status === 'inactive').length,
        all: customers.length,
    }

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase()
        return customers.filter((c) => {
            if (!isAdmin && c.status !== 'active') return false
            if (isAdmin && tab !== 'all' && c.status !== tab) return false
            return (
                !q ||
                c.custNo.toLowerCase().includes(q) ||
                c.custName.toLowerCase().includes(q) ||
                c.address.toLowerCase().includes(q)
            )
        })
    }, [customers, isAdmin, tab, query])

    const openAdd = () => { setEditing(null); setFormOpen(true) }
    const openEdit = (c: Customer) => { setEditing(c); setFormOpen(true) }
    const closeForm = () => setFormOpen(false)

    const handleSave = (values: CustomerFormValues) => {
        if (editing) {
            setCustomers((prev) =>
                prev.map((c) =>
                    c.custNo === editing.custNo ? { ...c, ...values, stamp: makeStamp('EDITED') } : c
                )
            )
        } else {
            setCustomers((prev) => [
                ...prev,
                { custNo: nextCustNo(prev), ...values, status: 'active', stamp: makeStamp('CREATED') },
            ])
        }
        closeForm()
    }

    // Soft delete: the row stays, its status becomes inactive.
    const handleDelete = (custNo: string) =>
        setCustomers((prev) =>
            prev.map((c) => (c.custNo === custNo ? { ...c, status: 'inactive', stamp: makeStamp('DELETED') } : c))
        )

    const handleRestore = (custNo: string) =>
        setCustomers((prev) =>
            prev.map((c) => (c.custNo === custNo ? { ...c, status: 'active', stamp: makeStamp('EDITED') } : c))
        )

    const tabs: { key: Tab; label: string }[] = [
        { key: 'active', label: `Active (${counts.active})` },
        { key: 'inactive', label: `Inactive (${counts.inactive})` },
        { key: 'all', label: `All (${counts.all})` },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-extrabold text-primary-green tracking-tight">
                    Customer management
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {isAdmin && (
                        <div className="flex rounded-md bg-stone-100 p-0.5 text-xs font-semibold" role="tablist">
                            {tabs.map((t) => (
                                <button
                                    key={t.key}
                                    role="tab"
                                    aria-selected={tab === t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                        tab === t.key ? 'bg-white text-primary-green shadow-sm' : 'text-muted-text'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search customers..."
                            aria-label="Search customers"
                            className="block w-full sm:w-56 pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        />
                    </div>

                    <button
                        onClick={openAdd}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add customer
                    </button>
                </div>
            </div>

            {/* Wireframe only: preview as admin or user */}
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-text">
                <span>Preview as:</span>
                {(['admin', 'user'] as Role[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-2 py-1 rounded border capitalize cursor-pointer ${
                            role === r ? 'border-primary-green text-primary-green font-bold' : 'border-stone-300'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow-card rounded-card border border-stone-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="text-left text-xs text-muted-text border-b border-stone-200">
                        <th className="px-4 py-3 font-semibold">Cust no</th>
                        <th className="px-4 py-3 font-semibold">Customer name</th>
                        <th className="px-4 py-3 font-semibold">Address</th>
                        <th className="px-4 py-3 font-semibold">Pay terms</th>
                        {isAdmin && <th className="px-4 py-3 font-semibold">Status</th>}
                        {isAdmin && <th className="px-4 py-3 font-semibold">Stamp</th>}
                        <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((c) => (
                        <tr
                            key={c.custNo}
                            className={`border-b border-stone-100 ${c.status === 'inactive' ? 'bg-amber-50' : ''}`}
                        >
                            <td className="px-4 py-3 font-bold text-charcoal-text">{c.custNo}</td>
                            <td className="px-4 py-3 text-charcoal-text">{c.custName}</td>
                            <td className="px-4 py-3 text-charcoal-text">{c.address}</td>
                            <td className="px-4 py-3 text-charcoal-text">{c.payTerms}</td>
                            {isAdmin && <td className="px-4 py-3"><StatusBadge status={c.status} /></td>}
                            {isAdmin && <td className="px-4 py-3 text-xs text-muted-text">{c.stamp}</td>}
                            <td className="px-4 py-3">
                                {c.status === 'active' ? (
                                    <div className="flex gap-2">
                                        <button className={btn} onClick={() => openEdit(c)}>Edit</button>
                                        <button className={btn} onClick={() => handleDelete(c.custNo)}>Delete</button>
                                    </div>
                                ) : (
                                    <button className={btn} onClick={() => handleRestore(c.custNo)}>Restore</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {rows.length === 0 && (
                    <div className="py-12 text-center text-sm text-muted-text">
                        No customers match your search or filter.
                    </div>
                )}
            </div>

            {formOpen && (
                <CustomerForm customer={editing} onSave={handleSave} onClose={closeForm} />
            )}
        </div>
    )
}