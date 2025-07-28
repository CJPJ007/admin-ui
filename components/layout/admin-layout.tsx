"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Building,
  Images,
  Mail,
  Users,
  BarChart3,
  FileText,
  BookOpen,
  Camera,
  Settings,
  Shield,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
} from "lucide-react"
import { ThemeProvider } from "../theme-provider"
import { useTheme } from "next-themes"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [darkMode, setDarkMode] = useState(false)
  const { setTheme } = useTheme();
  const pathname = usePathname()

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const menuItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/properties", icon: Building, label: "Manage Properties" },
    { href: "/admin/sliders", icon: Images, label: "Manage Sliders" },
    { href: "/admin/inquiries", icon: Mail, label: "Manage Inquiries" },
    { href: "/admin/agents", icon: Users, label: "Manage Agents" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/pages", icon: FileText, label: "Manage Pages" },
    { href: "/admin/blogs", icon: BookOpen, label: "Manage Blogs" },
    { href: "/admin/media", icon: Camera, label: "Media" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/administration", icon: Shield, label: "Administration" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800 dark:bg-slate-900 text-white border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <img src="/placeholder.svg?height=30&width=120" alt="Ananta Realty Logo" className="h-8" />
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700">
              <Globe className="h-4 w-4 mr-2" />
              View website
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="text-white hover:bg-slate-700">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700 relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-cyan-400 text-slate-900"
              >
                8
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700 bg-slate-700">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-slate-800 dark:bg-slate-900 border-r border-slate-700 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full p-6 justify-start text-[1rem] text-left ${
                    isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-6 w-6 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-14 bg-white dark:bg-gray-900 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </main>
    </div>
  )
}
