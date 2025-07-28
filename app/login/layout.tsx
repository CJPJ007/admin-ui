import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login - Ananta Realty",
  description: "Admin login page for Ananta Realty",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}
    >
      {children}
    </div>
  )
}
