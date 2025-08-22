"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  ChevronDown,
  X,
  KeyRound,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [userName, setUserName] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const name = localStorage.getItem("name")
    if (name) setUserName(name)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
      router.push("/login")
    } catch {
      router.push("/login")
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
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/administration", icon: Shield, label: "Administration" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-[#0056FF] dark:bg-[#002a80] rounded-r-3xl shadow-lg transition-colors duration-300">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6">
            <h1 className="text-white text-2xl font-bold">Ananta Realty</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`relative ${isActive ? "mb-4" : ""}`}>
                    <Button
                      variant="ghost"
                      className={`w-full p-4 justify-start text-left rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-white dark:bg-gray-800 text-[#0056FF] shadow-lg transform translate-x-2"
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
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 fixed top-0 left-64 right-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
              Admin Management
            </h2>

            <Link
              href={process.env.NEXT_PUBLIC_USERS_WEBSITE_URL ?? ""}
              target="_blank"
            >
              <Button
                className="bg-gradient-to-b from-[#0056FF] to-[#0011ff] text-white shadow-lg shadow-blue-300/50 border-b-4 border-blue-800 rounded-xl px-6 py-2 font-bold transform hover:scale-105 transition-all duration-150"
                style={{ boxShadow: "0 6px 16px 0 rgba(0,86,255,0.25)" }}
              >
                View Website
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                {theme === "dark" ? <Sun/> : <Moon/>}
              </Button>

              {/* User Dropdown */}
              <div ref={dropdownRef} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User />
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-colors duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          Logged in as:
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {userName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDropdown(false)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 p-1 transition-colors duration-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/admin/change-password"
                        className="flex items-center px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <KeyRound className="h-4 w-4 mr-3" />
                        Change Password
                      </Link>

                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-200px)] transition-colors duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
