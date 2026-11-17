// Mock data for the customer screen wireframe (based on the Hope, Inc. student guide).
// Replace with real data from the database once the backend is connected.

export type CustomerStatus = 'active' | 'inactive'

export const PAY_TERMS = ['Net 15', 'Net 30', 'Net 45', 'COD', 'Prepaid'] as const

export interface Customer {
    custNo: string
    custName: string
    address: string
    payTerms: string
    status: CustomerStatus
    stamp: string
}

export const MOCK_CUSTOMERS: Customer[] = [
    { custNo: 'C-001', custName: 'Acme Corporation', address: '123 Main St, Metro City', payTerms: 'Net 30', status: 'active', stamp: 'CREATED system 2026-10-01 9:00 AM' },
    { custNo: 'C-002', custName: 'Globex Industries', address: '456 Oak Ave, Harbor Town', payTerms: 'Net 45', status: 'active', stamp: 'CREATED system 2026-10-02 10:15 AM' },
    { custNo: 'C-003', custName: 'Initech LLC', address: '789 Pine Rd, Silicon Valley', payTerms: 'COD', status: 'active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
    { custNo: 'C-004', custName: 'Umbrella Corp', address: '1 Raccoon City Blvd', payTerms: 'Prepaid', status: 'inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' },
    { custNo: 'C-005', custName: 'Stark Enterprises', address: '200 Park Avenue, New York', payTerms: 'Net 15', status: 'active', stamp: 'CREATED system 2026-10-05 3:00 PM' },
]

export function nextCustNo(customers: Customer[]): string {
    const max = customers.reduce((m, c) => Math.max(m, parseInt(c.custNo.slice(2), 10) || 0), 0)
    return `C-${String(max + 1).padStart(3, '0')}`
}

// Builds a stamp like "EDITED user1 2026-10-13 1:01 PM". "user1" is a placeholder
// until the logged-in user's name is available.
export function makeStamp(action: 'CREATED' | 'EDITED' | 'DELETED'): string {
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${action} user1 ${date} ${time}`
}