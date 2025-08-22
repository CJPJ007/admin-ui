"use client"
import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Save, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import api from "@/utils/api"
import { Loader } from "@/components/PageComponentSkeletonLoader"

interface GAConfig {
  id?: number
  trackingId: string
}

export default function AnalyticsPage() {
  const [config, setConfig] = useState<GAConfig>({
    trackingId: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasExistingConfig, setHasExistingConfig] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGAConfig()
  }, [])

  const fetchGAConfig = async () => {
    try {
      setLoading(true)
      const response = await api("/api/admin/ga-config")

      if (response.ok) {
        const data = await response.json()
        if (data && data.trackingId) {
          setConfig(data)
          setHasExistingConfig(true)
        }
      }
    } catch (error) {
      console.error("Error fetching GA config:", error)
      // Don't show error toast for initial load if config doesn't exist
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate tracking ID format
      if (!config.trackingId) {
        toast({
          title: "Validation Error",
          description: "Please enter a Google Analytics tracking ID",
          variant: "destructive",
        })
        return
      }

      if (!config.trackingId.match(/^(G-[A-Z0-9]+|UA-\d+-\d+)$/)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid tracking ID (G-XXXXXXXXXX or UA-XXXXXXXX-X)",
          variant: "destructive",
        })
        return
      }

      let response
      if (hasExistingConfig && config.id) {
        // Update existing config
        response = await api(`/api/admin/ga-config/${config.id}`, {
          method: "PUT",
          body: JSON.stringify({ trackingId: config.trackingId }),
        })
      } else {
        // Create new config
        response = await api("/api/admin/ga-config", {
          method: "POST",
          body: JSON.stringify({ trackingId: config.trackingId }),
        })
      }

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setHasExistingConfig(true)

        toast({
          title: "Success",
          description: "Google Analytics configuration saved successfully",
        })
      }
    } catch (error) {
      console.error("Error saving GA config:", error)
      toast({
        title: "Error",
        description: "Failed to save Google Analytics configuration",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTrackingIdChange = (value: string) => {
    setConfig((prev) => ({ ...prev, trackingId: value }))
  }

  if (loading) {
    return (
      <Loader />
    )
  }

  return (
    <AdminLayout>
  <div className="p-6">
    {/* Header */}
    <div className="mb-6">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        <Link href="/admin/dashboard" className="hover:text-gray-700 dark:hover:text-gray-200">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/settings" className="hover:text-gray-700 dark:hover:text-gray-200">
          Settins
        </Link>
        <span className="mx-2">/</span>
        <span>Analytics</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Google Analytics Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your Google Analytics tracking ID
          </p>
        </div>
        <Link href="/admin/settings">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent dark:text-white dark:border-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
      </div>
    </div>

    {/* Status Card */}
    <div className="mb-6">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analytics Status</p>
              <p className="text-lg font-bold">
                {config.trackingId ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Configured
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Not Configured
                  </span>
                )}
              </p>
            </div>
            {config.trackingId && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Tracking ID</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{config.trackingId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Configuration Form */}
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Tracking Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-id" className="dark:text-white">Google Analytics Tracking ID *</Label>
            <Input
              id="tracking-id"
              value={config.trackingId}
              onChange={(e) => handleTrackingIdChange(e.target.value)}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              className="font-mono dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your Google Analytics tracking ID. You can find this in your GA property settings.
            </p>
          </div>

          <Alert className="dark:bg-gray-700 dark:text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supported formats:</strong>
              <br />• GA4: G-XXXXXXXXXX (recommended)
              <br />• Universal Analytics: UA-XXXXXXXX-X (legacy)
            </AlertDescription>
          </Alert>

          {config.trackingId && (
            <Alert className="dark:bg-gray-700 dark:text-white">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your tracking ID will be automatically included in all pages to start collecting analytics data.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSave}
            disabled={saving || !config.trackingId}
            className="btn-primary"
          >
            {saving ? (
              <>
                <BarChart3 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {hasExistingConfig ? "Update Configuration" : "Save Configuration"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Help Section */}
    <Card className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">How to find your Tracking ID</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">For Google Analytics 4 (GA4):</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to your Google Analytics account</li>
              <li>Select your property</li>
              <li>Click on "Admin" (gear icon)</li>
              <li>Under "Property", click "Data Streams"</li>
              <li>Click on your web stream</li>
              <li>Copy the "Measurement ID" (starts with G-)</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">For Universal Analytics (Legacy):</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to your Google Analytics account</li>
              <li>Click on "Admin" (gear icon)</li>
              <li>Under "Property", click "Property Settings"</li>
              <li>Copy the "Tracking ID" (starts with UA-)</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</AdminLayout>

  )
}
