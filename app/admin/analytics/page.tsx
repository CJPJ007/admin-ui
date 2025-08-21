"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart3,
  Eye,
  Search,
  ShoppingCart,
  Users,
  Code,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react"
import api from "@/utils/api"

interface AnalyticsConfig {
  // Google Analytics 4
  ga4MeasurementId: string
  ga4Enabled: boolean

  // Google Tag Manager
  gtmContainerId: string
  gtmEnabled: boolean

  // Enhanced Ecommerce
  enhancedEcommerceEnabled: boolean

  // Demographics and Interests
  demographicsEnabled: boolean

  // Site Search Tracking
  siteSearchEnabled: boolean
  searchParameter: string

  // Custom Dimensions
  customDimensions: string

  // Custom Metrics
  customMetrics: string

  // Privacy Settings
  anonymizeIp: boolean
  cookieConsent: boolean

  // Additional Settings
  debugMode: boolean
  sampleRate: number
}

export default function AnalyticsPage() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    ga4MeasurementId: "",
    ga4Enabled: false,
    gtmContainerId: "",
    gtmEnabled: false,
    enhancedEcommerceEnabled: false,
    demographicsEnabled: false,
    siteSearchEnabled: false,
    searchParameter: "q",
    customDimensions: "",
    customMetrics: "",
    anonymizeIp: true,
    cookieConsent: true,
    debugMode: false,
    sampleRate: 100,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsConfig()
  }, [])

  const fetchAnalyticsConfig = async () => {
    try {
      setIsLoading(true)
      const response = await api("/api/admin/settings/analytics")
      const data = await response.json()
      setConfig(data || config)
    } catch (error) {
      console.error("Error fetching analytics config:", error)
      toast({
        title: "Error",
        description: "Failed to fetch analytics configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)

      // Validate required fields
      if (config.ga4Enabled && !config.ga4MeasurementId.trim()) {
        toast({
          title: "Validation Error",
          description: "GA4 Measurement ID is required when GA4 is enabled",
          variant: "destructive",
        })
        return
      }

      if (config.gtmEnabled && !config.gtmContainerId.trim()) {
        toast({
          title: "Validation Error",
          description: "GTM Container ID is required when GTM is enabled",
          variant: "destructive",
        })
        return
      }

      await api("/api/admin/settings/analytics", {
        method: "POST",
        body: JSON.stringify(config),
      })

      toast({
        title: "Success",
        description: "Analytics configuration saved successfully",
      })
    } catch (error) {
      console.error("Error saving analytics config:", error)
      toast({
        title: "Error",
        description: "Failed to save analytics configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      setTestingConnection(true)

      if (!config.ga4MeasurementId.trim()) {
        toast({
          title: "Test Failed",
          description: "Please enter a GA4 Measurement ID to test",
          variant: "destructive",
        })
        return
      }

      const response = await api("/api/admin/settings/analytics/test", {
        method: "POST",
        body: JSON.stringify({ measurementId: config.ga4MeasurementId }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Google Analytics connection is working properly",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.message || "Unable to connect to Google Analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      toast({
        title: "Test Failed",
        description: "Failed to test Google Analytics connection",
        variant: "destructive",
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const updateConfig = (key: keyof AnalyticsConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            <span>DASHBOARD / SETTINGS / ANALYTICS</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Google Analytics Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure Google Analytics and tracking settings for your website
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">GA4 Status</p>
                  <div className="flex items-center mt-1">
                    <Badge variant={config.ga4Enabled ? "default" : "secondary"}>
                      {config.ga4Enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">GTM Status</p>
                  <div className="flex items-center mt-1">
                    <Badge variant={config.gtmEnabled ? "default" : "secondary"}>
                      {config.gtmEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enhanced Ecommerce</p>
                  <div className="flex items-center mt-1">
                    <Badge variant={config.enhancedEcommerceEnabled ? "default" : "secondary"}>
                      {config.enhancedEcommerceEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Setup</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Basic Setup Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Google Analytics 4 (GA4)
                </CardTitle>
                <CardDescription>Configure your Google Analytics 4 property for website tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Google Analytics 4</Label>
                    <p className="text-sm text-gray-500">Track website visitors and behavior</p>
                  </div>
                  <Switch
                    checked={config.ga4Enabled}
                    onCheckedChange={(checked) => updateConfig("ga4Enabled", checked)}
                  />
                </div>

                {config.ga4Enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga4MeasurementId">GA4 Measurement ID</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="ga4MeasurementId"
                          placeholder="G-XXXXXXXXXX"
                          value={config.ga4MeasurementId}
                          onChange={(e) => updateConfig("ga4MeasurementId", e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={testConnection}
                          disabled={testingConnection || !config.ga4MeasurementId.trim()}
                        >
                          {testingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Find this in your GA4 property settings under "Data Streams"
                      </p>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Make sure to create a GA4 property in your Google Analytics account and copy the Measurement ID
                        here.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Google Tag Manager (GTM)
                </CardTitle>
                <CardDescription>Manage all your tracking codes through Google Tag Manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Google Tag Manager</Label>
                    <p className="text-sm text-gray-500">Centralized tag management system</p>
                  </div>
                  <Switch
                    checked={config.gtmEnabled}
                    onCheckedChange={(checked) => updateConfig("gtmEnabled", checked)}
                  />
                </div>

                {config.gtmEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gtmContainerId">GTM Container ID</Label>
                      <Input
                        id="gtmContainerId"
                        placeholder="GTM-XXXXXXX"
                        value={config.gtmContainerId}
                        onChange={(e) => updateConfig("gtmContainerId", e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Find this in your Google Tag Manager account</p>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        When GTM is enabled, make sure to configure your GA4 tag within GTM to avoid duplicate tracking.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* E-commerce Tab */}
          <TabsContent value="ecommerce" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Enhanced E-commerce Tracking
                </CardTitle>
                <CardDescription>Track detailed e-commerce interactions and transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Enhanced E-commerce</Label>
                    <p className="text-sm text-gray-500">Track purchases, product views, and cart interactions</p>
                  </div>
                  <Switch
                    checked={config.enhancedEcommerceEnabled}
                    onCheckedChange={(checked) => updateConfig("enhancedEcommerceEnabled", checked)}
                  />
                </div>

                {config.enhancedEcommerceEnabled && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Enhanced E-commerce tracking will automatically capture purchase events, product impressions, and
                      shopping behavior.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Site Search Tracking
                </CardTitle>
                <CardDescription>Track internal site search queries and results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Site Search Tracking</Label>
                    <p className="text-sm text-gray-500">Monitor what users search for on your site</p>
                  </div>
                  <Switch
                    checked={config.siteSearchEnabled}
                    onCheckedChange={(checked) => updateConfig("siteSearchEnabled", checked)}
                  />
                </div>

                {config.siteSearchEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="searchParameter">Search Query Parameter</Label>
                    <Input
                      id="searchParameter"
                      placeholder="q, search, query"
                      value={config.searchParameter}
                      onChange={(e) => updateConfig("searchParameter", e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      The URL parameter that contains search terms (e.g., "q" for ?q=search+term)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Demographics and Interests
                </CardTitle>
                <CardDescription>Enable demographic and interest reporting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Demographics Reports</Label>
                    <p className="text-sm text-gray-500">Collect age and gender data from users</p>
                  </div>
                  <Switch
                    checked={config.demographicsEnabled}
                    onCheckedChange={(checked) => updateConfig("demographicsEnabled", checked)}
                  />
                </div>

                {config.demographicsEnabled && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Demographics data is based on users signed into their Google accounts and may not represent all
                      visitors.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Dimensions & Metrics</CardTitle>
                <CardDescription>Define custom dimensions and metrics for advanced tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customDimensions">Custom Dimensions</Label>
                  <Textarea
                    id="customDimensions"
                    placeholder="user_type:premium&#10;page_category:blog&#10;author:john_doe"
                    value={config.customDimensions}
                    onChange={(e) => updateConfig("customDimensions", e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">One per line in format: dimension_name:value</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMetrics">Custom Metrics</Label>
                  <Textarea
                    id="customMetrics"
                    placeholder="page_load_time:1.5&#10;scroll_depth:75&#10;engagement_score:8.5"
                    value={config.customMetrics}
                    onChange={(e) => updateConfig("customMetrics", e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">One per line in format: metric_name:value</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debug & Sampling</CardTitle>
                <CardDescription>Configure debugging and data sampling settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable debug mode for testing (development only)</p>
                  </div>
                  <Switch
                    checked={config.debugMode}
                    onCheckedChange={(checked) => updateConfig("debugMode", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleRate">Sample Rate (%)</Label>
                  <Input
                    id="sampleRate"
                    type="number"
                    min="1"
                    max="100"
                    value={config.sampleRate}
                    onChange={(e) => updateConfig("sampleRate", Number.parseInt(e.target.value) || 100)}
                  />
                  <p className="text-sm text-gray-500">Percentage of sessions to track (100% = all sessions)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Configure privacy and data protection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Anonymize IP Addresses</Label>
                    <p className="text-sm text-gray-500">Anonymize visitor IP addresses for privacy compliance</p>
                  </div>
                  <Switch
                    checked={config.anonymizeIp}
                    onCheckedChange={(checked) => updateConfig("anonymizeIp", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Cookie Consent Required</Label>
                    <p className="text-sm text-gray-500">Only track users who have given cookie consent</p>
                  </div>
                  <Switch
                    checked={config.cookieConsent}
                    onCheckedChange={(checked) => updateConfig("cookieConsent", checked)}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    These privacy settings help ensure compliance with GDPR, CCPA, and other privacy regulations.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSaveConfig} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Analytics Configuration
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
