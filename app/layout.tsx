import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AuthWrapper from "@/components/AuthWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

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
    <html lang="en" className="light">
      <body className={`${inter.className} bg-background text-foreground`}>
        <ToastProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
