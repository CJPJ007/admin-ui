"use client"

import Link from "next/link"
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Building, Users, Images, TrendingUp, DollarSign, Calendar, Activity } from "lucide-react"
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

interface RecentActivity {
  id: number
  type: string
  message: string
  timestamp: string
  user?: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      title: "Inquiries",
      value: "0",
      icon: Mail,
      color: "bg-cyan-500",
      link: "/admin/inquiries",
      field: "Inquiry",
      trend: "+12%",
      trendDirection: "up",
    },
    {
      title: "Properties",
      value: "0",
      icon: Building,
      color: "bg-blue-500",
      link: "/admin/properties",
      field: "Property",
      trend: "+5%",
      trendDirection: "up",
    },
    {
      title: "Agents",
      value: "0",
      icon: Users,
      color: "bg-sky-500",
      link: "/admin/agents",
      field: "User",
      trend: "+2%",
      trendDirection: "up",
    },
    {
      title: "Sliders",
      value: "0",
      icon: Images,
      color: "bg-blue-600",
      link: "/admin/sliders",
      field: "Slider",
      trend: "0%",
      trendDirection: "neutral",
    },
  ])

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: 1,
      type: "property",
      message: "New property 'Luxury Villa in Bandra' was added",
      timestamp: "2 hours ago",
      user: "Admin",
    },
    {
      id: 2,
      type: "inquiry",
      message: "New inquiry received for 'Sea View Apartment'",
      timestamp: "4 hours ago",
      user: "System",
    },
    {
      id: 3,
      type: "agent",
      message: "Agent 'John Doe' sold property for ₹2,50,00,000",
      timestamp: "1 day ago",
      user: "John Doe",
    },
    {
      id: 4,
      type: "slider",
      message: "Homepage slider updated with new images",
      timestamp: "2 days ago",
      user: "Admin",
    },
  ])

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);

  const [totalRecords, setTotalRecords] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true)

  const [currentActivityLogPage, setCurrentActivityLogPage] = useState(1);

  const activityLogPageSize = 10;
  
  async function fetchStats(field: string) {
    try {
      const count = await (await api(`/api/fieldSearch/count/${field}`)).json()
      setStats((prevStats) =>
        prevStats.map((stat) => {
          if (stat.field.toLowerCase() === field.toLowerCase()) {
            return { ...stat, value: count.toString() }
          }
          return stat
        }),
      )
    } catch (error) {
      console.error(`Error fetching ${field} stats:`, error)
    }
  }

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true)
      await Promise.all([fetchStats("Property"), fetchStats("Slider"), fetchStats("User"), fetchStats("Inquiry")])
      setLoading(false)
    }

    const fetchActivites = async () => {
      try {
        const response = await api(`/api/fieldSearch/advancedSearch/ActivityLog?page=${currentActivityLogPage}&size=${activityLogPageSize}`,{
          method:'POST',
          body:JSON.stringify({
            criteriaList:[],
            operations:[]
          })
        })
        const activities = await response.json()
        setActivityLogs(activities.data);
        setTotalRecords(activities.totalRecords);
        setTotalPages(activities.totalPages);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    }

    const fetchBlogs = async () => {
      try {
        const response = await api(`/api/fieldSearch/advancedSearch/Blog?page=1&size=10&sortBy=createdAt&sortDirection=desc`,{
          method:'POST',
          body:JSON.stringify({
            criteriaList:[],
            operations:[]
          })
        })
        const activities = await response.json()
        setRecentPosts(activities.data);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    }
    fetchAllStats()

    fetchBlogs()

    fetchActivites()

  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Building className="h-4 w-4 text-blue-600" />
      case "inquiry":
        return <Mail className="h-4 w-4 text-cyan-600" />
      case "agent":
        return <Users className="h-4 w-4 text-green-600" />
      case "slider":
        return <Images className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (direction?: "up" | "down" | "neutral") => {
    if (direction === "up") return <TrendingUp className="h-3 w-3 text-green-600" />
    if (direction === "down") return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
    return <TrendingUp className="h-3 w-3 text-gray-600" />
  }

  function getTimestmap(createdAt: string): import("react").ReactNode {
    const createdAtDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAtDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay < 7) return `${diffDay} days ago`;

    return createdAtDate.toLocaleDateString();
  }

  const startIndex = (currentActivityLogPage-1) * activityLogPageSize +1;
  const endIndex = startIndex + Math.min(activityLogPageSize, totalRecords)-1;
  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>Overview</span>
          </div>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
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
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {loading ? <span className="h-8 w-16 bg-gray-200 animate-pulse rounded"></span> : stat.value}
                        </p>
                        {/* {stat.trend && (
                          <div className="flex items-center gap-1 mt-2">
                            {getTrendIcon(stat.trendDirection)}
                            <span
                              className={`text-xs font-medium ${
                                stat.trendDirection === "up"
                                  ? "text-green-600"
                                  : stat.trendDirection === "down"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {stat.trend} from last month
                            </span>
                          </div>
                        )} */}
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>NAME</TableHead>
                      <TableHead className="text-right">CREATED AT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {
                    recentPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.id}</TableCell>
                        <TableCell>
                          <Link href={`/admin/blogs/edit/${post.id}`} className="text-blue-600 hover:underline">
                            {post.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{post.createdAt.split('T')[0]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Activities Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {activityLogs.map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border-b last:border-0">
                    <div
                      className={`w-10 h-10 rounded-md bg-yellow-400 flex items-center justify-center text-white font-medium`}
                    >
                      {log.name?log.name[0].toLocaleUpperCase():''}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/admin/users?edit=true&id=${log.userId}`}><p className="font-medium text-blue-600">{log.name}</p></Link>
                        <p className="text-sm text-gray-500">{`${log.tableName} ${log.action}`} in the system</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <p className="text-sm text-gray-500">{getTimestmap(log.createdAt)}</p>
                        <span className="text-sm text-gray-400">•</span>
                        <p className="text-sm text-gray-500">({log.ipAddress})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">{`Showing ${startIndex} to ${endIndex} of ${totalRecords} results`}</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" disabled={currentActivityLogPage===1} onClick={()=>setCurrentActivityLogPage((prev)=>prev-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" disabled={currentActivityLogPage===totalPages} onClick={()=>setCurrentActivityLogPage((prev)=>prev+1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Recent Activity */}
        {/* <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        {activity.user && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <Badge variant="secondary" className="text-xs">
                              {activity.user}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </AdminLayout>
  )
}
