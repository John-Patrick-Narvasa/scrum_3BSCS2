import type { CustomerStatus } from './customer-data'

const STYLES: Record<CustomerStatus, string> = {
    active: 'bg-emerald-100 text-primary-green',
    inactive: 'bg-stone-200 text-stone-700',
}

export default function StatusBadge({ status }: { status: CustomerStatus }) {
    return (
        <span
            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold capitalize ${STYLES[status]}`}
        >
      {status}
    </span>
    )
}