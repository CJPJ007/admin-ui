"use client"

import Link from "next/link"
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Building, Users, Images, TrendingUp, Calendar, Activity } from "lucide-react"
import api from "@/utils/api"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ActivityLog, Blog } from "@/utils/interfaces"

interface StatItem {
  title: string
  value: string
  icon: any
  color: string
  link: string
  field: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    { title: "Inquiries", value: "0", icon: Mail, color: "bg-cyan-500", link: "/admin/inquiries", field: "Inquiry", trend: "+12%", trendDirection: "up" },
    { title: "Properties", value: "0", icon: Building, color: "bg-blue-500", link: "/admin/properties", field: "Property", trend: "+5%", trendDirection: "up" },
    { title: "Customers", value: "0", icon: Users, color: "bg-sky-500", link: "/admin/customers", field: "Customer", trend: "+2%", trendDirection: "up" },
    { title: "Sliders", value: "0", icon: Images, color: "bg-blue-600", link: "/admin/sliders", field: "Slider", trend: "0%", trendDirection: "neutral" },
    { title: "Agents", value: "0", icon: Users, color: "bg-green-600", link: "/admin/agents", field: "User", trend: "0%", trendDirection: "neutral" },
    { title: "Admins", value: "0", icon: Users, color: "bg-green-600", link: "/admin/users", field: "User", trend: "0%", trendDirection: "neutral" },

  ])

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [recentPosts, setRecentPosts] = useState<Blog[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentActivityLogPage, setCurrentActivityLogPage] = useState(1)
  const activityLogPageSize = 10

  async function fetchStats(title:string,field: string, condition: string) {
    try {
      const count = await (await api(`/api/fieldSearch/count/${field}?query=${condition}`)).json()
      setStats((prevStats) =>
        prevStats.map((stat) =>
          stat.title.toLowerCase() === title.toLowerCase()
            ? { ...stat, value: count.toString() }
            : stat
        )
      )
    } catch (error) {
      console.error(`Error fetching ${field} stats:`, error)
    }
  }

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true)
      await Promise.all([
        fetchStats("Properties","Property", ""),
        fetchStats("Sliders","Slider", ""),
        fetchStats("Customers","Customer", ""),
        fetchStats("Inquiries","Inquiry", ""),
        fetchStats("Agents","User", "role=='Agent'"),
        fetchStats("Admins","User", "role=='Admin'")
      ])
      setLoading(false)
    }

    const fetchActivites = async () => {
      try {
        const response = await api(`/api/fieldSearch/advancedSearch/ActivityLog?page=${currentActivityLogPage}&size=${activityLogPageSize}`, {
          method: "POST",
          body: JSON.stringify({ criteriaList: [], operations: [] })
        })
        const activities = await response.json()
        setActivityLogs(activities.data)
        setTotalRecords(activities.totalRecords)
        setTotalPages(activities.totalPages)
      } catch (error) {
        console.error("Error fetching recent activities:", error)
      }
    }

    const fetchBlogs = async () => {
      try {
        const response = await api(`/api/fieldSearch/advancedSearch/Blog?page=1&size=10&sortBy=createdAt&sortDirection=desc`, {
          method: "POST",
          body: JSON.stringify({ criteriaList: [], operations: [] })
        })
        const activities = await response.json()
        setRecentPosts(activities.data)
      } catch (error) {
        console.error("Error fetching recent posts:", error)
      }
    }

    fetchAllStats()
    fetchBlogs()
    fetchActivites()
  }, [])

  function getTimestmap(createdAt: string) {
    const createdAtDate = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - createdAtDate.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return `${diffSec} seconds ago`
    if (diffMin < 60) return `${diffMin} minutes ago`
    if (diffHour < 24) return `${diffHour} hours ago`
    if (diffDay < 7) return `${diffDay} days ago`

    return createdAtDate.toLocaleDateString()
  }

  const startIndex = (currentActivityLogPage - 1) * activityLogPageSize + 1
  const endIndex = startIndex + Math.min(activityLogPageSize, totalRecords) - 1

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-300">Overview</span>
          </div>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.link} className="no-underline">
                <Card className="relative overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {loading ? (
                            <span className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></span>
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Recent Posts & Activity Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Posts */}
          <Card className="bg-white dark:bg-gray-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                      <TableHead className="w-12 text-gray-600 dark:text-gray-300">#</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">NAME</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">CREATED AT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="font-medium text-gray-800 dark:text-gray-200">{post.id}</TableCell>
                        <TableCell>
                          <Link href={`/admin/blogs?edit=true&id=${post.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {post.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right text-gray-700 dark:text-gray-300">{post.createdAt.split("T")[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="bg-white dark:bg-gray-800 transition-colors">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Activity Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {activityLogs.map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="w-10 h-10 rounded-md bg-yellow-400 flex items-center justify-center text-white font-medium">
                      {log.name ? log.name[0].toLocaleUpperCase() : ""}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/admin/users?edit=true&id=${log.userId}`}>
                          <p className="font-medium text-blue-600 dark:text-blue-400">{log.name}</p>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{`${log.tableName} ${log.action}`} in the system</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <p>{getTimestmap(log.createdAt)}</p>
                        <span>•</span>
                        <p>({log.ipAddress})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{`Showing ${startIndex} to ${endIndex} of ${totalRecords} results`}</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent text-gray-600 dark:text-gray-200 border-gray-300 dark:border-gray-600" disabled={currentActivityLogPage === 1} onClick={() => setCurrentActivityLogPage((prev) => prev - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent text-gray-600 dark:text-gray-200 border-gray-300 dark:border-gray-600" disabled={currentActivityLogPage === totalPages} onClick={() => setCurrentActivityLogPage((prev) => prev + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
