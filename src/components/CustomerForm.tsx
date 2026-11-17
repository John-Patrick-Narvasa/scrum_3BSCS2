'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { PAY_TERMS, type Customer } from './customer-data'

export interface CustomerFormValues {
    custName: string
    address: string
    payTerms: string
}

const inputClass =
    'block w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-charcoal-text mb-1'

// Add / Edit popup. Pass `customer` to edit, or null to add.
export default function CustomerForm({
                                         customer,
                                         onSave,
                                         onClose,
                                     }: {
    customer: Customer | null
    onSave: (values: CustomerFormValues) => void
    onClose: () => void
}) {
    const [values, setValues] = useState<CustomerFormValues>({
        custName: customer?.custName ?? '',
        address: customer?.address ?? '',
        payTerms: customer?.payTerms ?? PAY_TERMS[1],
    })

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(values)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="customer-form-title"
                className="w-full max-w-md bg-white rounded-card shadow-card border border-stone-200 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 id="customer-form-title" className="text-lg font-extrabold text-primary-green">
                            {customer ? 'Edit customer' : 'Add customer'}
                        </h2>
                        <p className="text-xs text-muted-text">
                            Status and stamp are filled in by the system.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1 rounded text-stone-500 hover:bg-stone-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="custNo" className={labelClass}>Customer no.</label>
                        <input
                            id="custNo"
                            disabled
                            value={customer?.custNo ?? 'Assigned automatically'}
                            className={`${inputClass} bg-stone-100 text-stone-500`}
                        />
                    </div>

                    <div>
                        <label htmlFor="custName" className={labelClass}>Customer name</label>
                        <input id="custName" name="custName" required value={values.custName}
                               onChange={handleChange} placeholder="e.g. Acme Corporation" className={inputClass} />
                    </div>

                    <div>
                        <label htmlFor="address" className={labelClass}>Address</label>
                        <input id="address" name="address" value={values.address}
                               onChange={handleChange} placeholder="e.g. 123 Main St, Metro City" className={inputClass} />
                    </div>

                    <div>
                        <label htmlFor="payTerms" className={labelClass}>Pay terms</label>
                        <select id="payTerms" name="payTerms" value={values.payTerms}
                                onChange={handleChange} className={inputClass}>
                            {PAY_TERMS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2.5 rounded-md text-sm font-semibold text-charcoal-text border border-stone-300 hover:bg-stone-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                                className="px-5 py-2.5 rounded-md text-sm font-bold text-white bg-primary-green hover:bg-leaf-green shadow-sm transition-colors cursor-pointer">
                            {customer ? 'Save changes' : 'Save customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}