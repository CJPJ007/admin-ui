"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Send, Clock, MessageSquare, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/utils/api"
import AdminLayout from "@/components/layout/admin-layout"

interface Notification {
  title: string
  message: string
  timestamp?: string
  id?: string
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)
  const { toast } = useToast()

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      setIsLoadingRecent(true)
      const response = await fetch("/api/public/recentNotifications")

      if (!response.ok) {
        throw new Error("Failed to fetch recent notifications")
      }

      const data = await response.json()
      setRecentNotifications(data)
    } catch (error) {
      console.error("Error fetching recent notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load recent notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRecent(false)
    }
  }

  // Send notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await api("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send notification")
      }

      const result = await response.text()

      toast({
        title: "Success",
        description: result || "Notification sent successfully",
      })

      // Clear form
      setTitle("")
      setMessage("")

      // Refresh recent notifications
      fetchRecentNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load recent notifications on component mount
  useEffect(() => {
    fetchRecentNotifications()
  }, [])

  return (
    <AdminLayout>
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Notifications</h1>
          <p className="text-muted-foreground">Send notifications to all users and manage recent announcements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Send Global Notification</span>
            </CardTitle>
            <CardDescription>Send a notification to all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">{title.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">{message.length}/500 characters</p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This notification will be sent to all registered users. Please review your message carefully before
                  sending.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full btn-primary" disabled={isLoading || !title.trim() || !message.trim()}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Notifications</span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRecentNotifications} disabled={isLoadingRecent}>
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>View recently sent global notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications sent yet</p>
                <p className="text-sm text-muted-foreground">Send your first global notification using the form</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentNotifications.map((notification, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm line-clamp-2">{notification.title}</h4>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        Global
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{notification.message}</p>
                    {notification.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{recentNotifications.length}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">All</p>
                <p className="text-sm text-muted-foreground">Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">Global</p>
                <p className="text-sm text-muted-foreground">Broadcast</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  )
}
