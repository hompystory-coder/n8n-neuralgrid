import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EasyVideo Web - AI Video Enhancement',
  description: 'Web-based AI video editing and enhancement tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
