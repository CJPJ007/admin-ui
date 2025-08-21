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
  Sun,
  Moon,
  Bell,
  ChevronDown,
  X,
  KeyRound,
  Headphones,
  Ticket,
  LogOut,
  User,
} from "lucide-react"
import { ThemeProvider } from "../theme-provider"
import { useTheme } from "next-themes"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [darkMode, setDarkMode] = useState(false)
  const { setTheme } = useTheme()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [setTheme])

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
    { href: "/admin/properties", icon: Building, label: "Properties" },
    { href: "/admin/sliders", icon: Images, label: "Sliders" },
    { href: "/admin/inquiries", icon: Mail, label: "Inquiries" },
    { href: "/admin/agents", icon: Users, label: "Agents" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/pages", icon: FileText, label: "Pages" },
    { href: "/admin/blogs", icon: BookOpen, label: "Blogs" },
    { href: "/admin/media", icon: Camera, label: "Media" },
    // { href: "/admin/about-us", icon: Building, label: "About Us" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/administration", icon: Shield, label: "Administration" },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
      // Fallback: redirect anyway
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-[#0056FF] rounded-r-3xl shadow-lg">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6">
            <h1 className="text-white text-2xl font-bold">Ananta Realty</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`relative ${isActive ? "mb-4" : ""}`}>
                    <Button
                      variant="ghost"
                      className={`w-full p-4 justify-start text-left rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-white text-[#0056FF] shadow-lg transform translate-x-2"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 fixed top-0 left-64 right-0 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-semibold text-gray-800">Admin Management</h2>
            </div>

            <Link href={process.env.NEXT_PUBLIC_USERS_WEBSITE_URL?process.env.NEXT_PUBLIC_USERS_WEBSITE_URL:""}
            target="_blank">
                <Button
                className="bg-gradient-to-b from-[#0056FF] to-[#0011ff] text-white shadow-lg shadow-blue-300/50 border-b-4 border-blue-800 rounded-xl px-6 py-2 font-bold transform hover:scale-105 transition-all duration-150"
                style={{ boxShadow: "0 6px 16px 0 rgba(0,86,255,0.25)" }}
                >
                View Website
                </Button>
            </Link>

            <div className="flex items-center space-x-4">
              {/* <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="text-gray-600 hover:bg-gray-100">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 relative">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white"
                >
                  8
                </Badge>
              </Button> */}

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User />
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Logged in as:</p>
                        <p className="text-lg font-semibold text-gray-900">{localStorage.getItem("name")}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDropdown(false)}
                        className="text-red-500 hover:bg-red-50 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/admin/change-password"
                        className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <KeyRound className="h-4 w-4 mr-3" />
                        Change Password
                      </Link>

                      {/* <Link
                        href="/admin/remote-support"
                        className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Headphones className="h-4 w-4 mr-3" />
                        Remote Support
                      </Link>

                      <Link
                        href="/admin/support-ticket"
                        className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Ticket className="h-4 w-4 mr-3" />
                        Support Ticket
                      </Link> */}

                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 mt-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[calc(100vh-200px)]">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </div>
      </main>
    </div>
  )
}
