"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  Settings,
  Mail,
  FileText,
  Globe,
  Palette,
  Code,
  Zap,
  Database,
  Minimize,
  DollarSign,
  MapPin,
  Package,
  Search,
  Star,
  ShoppingCart,
  RotateCcw,
  FileIcon as FileInvoice,
  Calculator,
  UsersIcon,
  Truck,
  Cog,
  Bolt,
  Users,
  BookOpen,
  MessageSquare,
  Shield,
  BarChart3,
  HelpCircle,
  Sliders,
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
    }
  }, [])

  const commonSettings = [
    // { icon: Settings, title: "General", description: "View and update your general settings and active license" },
    // { icon: Mail, title: "Email", description: "View and update your email settings and email templates" },
    // { icon: Mail, title: "Email templates", description: "Email templates using HTML & system variables" },
    // { icon: Mail, title: "Email rules", description: "Configure email rules for validation" },
    // { icon: FileText, title: "Media", description: "View and update your media settings" },
    // { icon: Link, title: "Permalink", description: "View and update your permalink settings" },
    { icon: Globe, title: "Languages", description: "View and update your website languages", link:"/admin/faqs" },
    // { icon: Palette, title: "Admin appearance", description: "View and update logo, favicon, layout,..." },
    // { icon: Code, title: "API Settings", description: "View and update your API settings" },
    // { icon: Zap, title: "Cache", description: "Configure cache for system for optimize speed" },
    // { icon: Database, title: "Datatables", description: "Settings for datatables" },
    // { icon: Minimize, title: "Minify", description: "Minify HTML output, inline CSS, remove comments..." },
  ]

  // const ecommerceSettings = [
  //   { icon: Settings, title: "General", description: "View and update your general settings" },
  //   { icon: DollarSign, title: "Currencies", description: "View and update currency settings" },
  //   { icon: MapPin, title: "Store locator", description: "View and update the lists of your chains" },
  //   { icon: Package, title: "Products", description: "View and update your products settings" },
  //   { icon: Search, title: "Product Search", description: "View and update product search settings" },
  //   { icon: FileText, title: "Digital Products", description: "View and update digital products settings" },
  //   { icon: Star, title: "Product Reviews", description: "View and update your product reviews settings" },
  //   { icon: ShoppingCart, title: "Shopping", description: "View and update your shopping settings" },
  //   { icon: ShoppingCart, title: "Checkout", description: "View and update checkout settings" },
  //   { icon: RotateCcw, title: "Return", description: "View and update return settings" },
  //   { icon: FileInvoice, title: "Invoices", description: "View and update your invoices settings" },
  //   { icon: FileText, title: "Invoice Template", description: "Settings for invoice template" },
  //   { icon: Calculator, title: "Taxes", description: "View and update your taxes settings" },
  //   { icon: UsersIcon, title: "Customers", description: "View and update your customers settings" },
  //   { icon: Truck, title: "Shipping", description: "View and update shipping settings" },
  //   { icon: Package, title: "Marketplace", description: "View and update marketplace settings" },
  //   { icon: Cog, title: "Config webhook", description: "View and update webhook settings" },
  //   { icon: Truck, title: "Tracking", description: "View and update tracking settings" },
  //   { icon: FileText, title: "Standard & Format", description: "View and update standard & format settings" },
  //   { icon: Bolt, title: "Flash Sale", description: "View and update flash sale settings" },
  // ]

  const otherSettings = [
    { icon: Users, title: "Social Login", description: "View and update your social login settings", link:"/admin/faqs" },
    // { icon: BookOpen, title: "Blog", description: "View and update blog settings" },
    // { icon: MessageSquare, title: "Contact", description: "Settings for contact plugin" },
    // { icon: Shield, title: "Captcha", description: "View and update reCAPTCHA and math captcha" },
    { icon: BarChart3, title: "Google Analytics", description: "Config Credentials for Google Analytics", link:"/admin/faqs" },
    { icon: HelpCircle, title: "FAQs", description: "View and update FAQs settings", link:"/admin/faqs" },
    // { icon: Sliders, title: "Simple Sliders", description: "Settings for simple sliders" },
  ]

  const SettingsCard = ({ icon: Icon, title, description,link }: { icon: any; title: string; description: string,link:string }) => (
    <Link href={link}>
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-24">
      <CardContent className="flex items-center p-4 h-full">
        <Icon className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
    </Link>
  )

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h1>

        {/* Common Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Common</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonSettings.map((setting, index) => (
              <SettingsCard key={index} {...setting} />
            ))}
          </div>
        </div>

        {/* Ecommerce Settings */}
        {/* <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Ecommerce</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecommerceSettings.map((setting, index) => (
              <SettingsCard key={index} {...setting} />
            ))}
          </div>
        </div> */}

        {/* Others Settings */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Others</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherSettings.map((setting, index) => (
              <SettingsCard key={index} {...setting} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
