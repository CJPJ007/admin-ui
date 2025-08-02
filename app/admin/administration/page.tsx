"use client"

import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Users, Shield, ClipboardList, Database, Calendar, Trash2, RotateCcw, Info, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Administration() {
  const adminCards = [
    { icon: Users, title: "Users", description: "View and update your system users", link: "/admin/users" },
    { icon: ClipboardList, title: "Activity Logs", description: "View and delete your system activity logs", link: "/admin/activity" },
    { icon: Trash2, title: "Cache Management", description: "Clear cache to make your site up to date", link: "/admin/cache-management" },
    { icon: Shield, title: "Customer Management", description: "Manage your customers", link: "/admin/customers" },
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Administration</h1>

        <div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link href={card.link} key={index}>
                
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-105 h-24"
                >
                  <CardContent className="flex items-center p-4 h-full">
                    <Icon className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {card.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
