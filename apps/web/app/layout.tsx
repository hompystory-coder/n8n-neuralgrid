import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'n8n NeuralGrid',
  description: 'Workflow Automation Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
