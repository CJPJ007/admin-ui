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
  Search,
  ChevronDown,
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
  const [showDropdown, setShowDropdown] = useState(false);
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
    { href: "/admin/properties", icon: Building, label: "Properties" },
    { href: "/admin/sliders", icon: Images, label: "Sliders" },
    { href: "/admin/inquiries", icon: Mail, label: "Inquiries" },
    { href: "/admin/agents", icon: Users, label: "Agents" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/pages", icon: FileText, label: "Pages" },
    { href: "/admin/blogs", icon: BookOpen, label: "Blogs" },
    { href: "/admin/media", icon: Camera, label: "Media" },
    { href: "/admin/administration", icon: Shield, label: "Administration" },
  ]

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
                  <div className={`relative ${isActive ? 'mb-4' : ''}`}>
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
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-semibold text-gray-800">Admin Management</h2>
            </div>

            <div className="flex items-center space-x-4">
              

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <img 
                    src="/placeholder-user.jpg" 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <Link
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault()
                        await fetch("/api/logout", { method: "POST" })
                        window.location.href = "/login"
                      }}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[calc(100vh-200px)]">
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </div>
        </div>
      </main>
    </div>
  )
}
