import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'شركة الاتحاد المتكاملة للتوظيف',
  description: 'نموذج طلب توظيف من شركة الاتحاد المتكاملة للتوظيف ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>{children}</body>
    </html>
  )
}
