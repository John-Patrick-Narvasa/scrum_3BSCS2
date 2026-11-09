import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hope, Inc. ERP',
  description: 'Enterprise Resource Planning system for Hope, Inc. with HR, Sales, Products, and Customer management.',
  openGraph: {
    title: 'Hope, Inc. ERP',
    description: 'Enterprise Resource Planning system for Hope, Inc. with HR, Sales, Products, and Customer management.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-cream-bg text-charcoal-text min-h-screen">
        {children}
      </body>
    </html>
  )
}