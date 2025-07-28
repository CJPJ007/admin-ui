import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ananta Realty Admin",
  description: "Admin dashboard for Ananta Realty",
    generator: 'v0.dev'
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  )
}
