import type { ReactNode } from 'react'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <div className="dashboard-layout min-h-screen">
      {children}
    </div>
  )
}