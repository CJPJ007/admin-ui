"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import MediaSelector from "@/components/MediaSelector"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Save,
  Plus,
  Edit,
  Trash2,
  Users,
  Building,
  Heart,
  Phone,
  MapPin,
  Globe,
  Shield,
  Award,
  ShieldCheck,
  ExternalLink,
  Clock,
  Mail,
  Star,
  Target,
  Zap,
  Lightbulb,
  Handshake,
  Eye,
  TrendingUp,
} from "lucide-react"
import dynamic from "next/dynamic"
import RichTextEditor from "@/components/RichTextEditor"

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded-md animate-pulse" />,
})

interface AboutUsContent {
  id: number
  section: string
  title: string
  content: string
  imageUrl: string
  display_order: number
  is_active: boolean
}

interface TeamMember {
  id: number
  name: string
  position: string
  description: string
  imageUrl: string
  email: string
  phone: string
  socialLinkedin: string
  socialTwitter: string
  displayOrder: number
  isActive: boolean
}

interface CompanyValue {
  id: number
  title: string
  description: string
  icon_name: string
  icon_color: string
  display_order: number
  is_active: boolean
}

interface CompanyInfo {
  id: number
  companyName: string
  tagline: string
  aboutDescription: string
  primaryEmail: string
  primaryPhone: string
  secondaryPhone: string
  whatsappNumber: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
  country: string
  businessHoursWeekday: string
  businessHoursWeekend: string
  facebookUrl: string
  instagramUrl: string
  twitterUrl: string
  linkedinUrl: string
  youtubeUrl: string
  meta_title: string
  meta_description: string
  establishedYear: number
  licenseNumber: string
  websiteUrl: string
  googleMapsUrl: string
  latitude: number
  longitude: number
}

export default function AboutUsManagement() {
  const [activeTab, setActiveTab] = useState("story")
  const [isClient, setIsClient] = useState(false)

  // State for different sections
  const [aboutContent, setAboutContent] = useState<AboutUsContent[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showValueModal, setShowValueModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  const [editingValue, setEditingValue] = useState<CompanyValue | null>(null)

  // Form states
  const [storyContent, setStoryContent] = useState("")
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({})
  const [valueForm, setValueForm] = useState<Partial<CompanyValue>>({})

  // Icon options for company values
  const iconOptions = [
    { value: "shield-check", label: "Shield Check", icon: <ShieldCheck className="h-4 w-4" /> },
    { value: "award", label: "Award", icon: <Award className="h-4 w-4" /> },
    { value: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { value: "heart", label: "Heart", icon: <Heart className="h-4 w-4" /> },
    { value: "shield", label: "Shield", icon: <Shield className="h-4 w-4" /> },
    { value: "star", label: "Star", icon: <Star className="h-4 w-4" /> },
    { value: "target", label: "Target", icon: <Target className="h-4 w-4" /> },
    { value: "zap", label: "Zap", icon: <Zap className="h-4 w-4" /> },
    { value: "lightbulb", label: "Lightbulb", icon: <Lightbulb className="h-4 w-4" /> },
    { value: "handshake", label: "Handshake", icon: <Handshake className="h-4 w-4" /> },
    { value: "eye", label: "Eye", icon: <Eye className="h-4 w-4" /> },
    { value: "trending-up", label: "Trending Up", icon: <TrendingUp className="h-4 w-4" /> },
  ]

  useEffect(() => {
    setIsClient(true)
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [contentRes, teamRes, valuesRes, infoRes] = await Promise.all([
        api("/api/admin/about-us-content"),
        api("/api/admin/team-members"),
        api("/api/admin/company-values"),
        api("/api/admin/company-info"),
      ])
      const contentResJson = await contentRes.json();
      setAboutContent(contentResJson)
      setTeamMembers(await teamRes.json())
      setCompanyValues(await valuesRes.json())
      const info = await infoRes.json()
      setCompanyInfo(info[0] || null)

      // Set story content if exists
      const storySection = contentResJson[0].content;
      if (storySection) {
        setStoryContent(storySection.content)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const saveStoryContent = async () => {
    try {
      const storySection = aboutContent.find((c) => c.section === "our_story")
      if (storySection) {
        await api(`/api/admin/about-us-content/${storySection.id}`, {
          method: "PUT",
          body: JSON.stringify({ content: storyContent }),
        })
      } else {
        await api("/api/admin/about-us-content", {
          method: "POST",
          body: JSON.stringify({
            section: "our_story",
            title: "Our Story",
            content: storyContent,
          }),
        })
      }
      fetchAllData()
      alert("Story content saved successfully!")
    } catch (error) {
      console.error("Error saving story:", error)
      alert("Failed to save story content")
    }
  }

  const saveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTeamMember) {
        await api(`/api/admin/team-members/${editingTeamMember.id}`, {
          method: "PUT",
          body: JSON.stringify(teamForm),
        })
      } else {
        await api("/api/admin/team-members", {
          method: "POST",
          body: JSON.stringify(teamForm),
        })
      }
      setShowTeamModal(false)
      setEditingTeamMember(null)
      setTeamForm({})
      fetchAllData()
    } catch (error) {
      console.error("Error saving team member:", error)
    }
  }

  const saveCompanyValue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingValue) {
        await api(`/api/admin/company-values/${editingValue.id}`, {
          method: "PUT",
          body: JSON.stringify(valueForm),
        })
      } else {
        await api("/api/admin/company-values", {
          method: "POST",
          body: JSON.stringify(valueForm),
        })
      }
      setShowValueModal(false)
      setEditingValue(null)
      setValueForm({})
      fetchAllData()
    } catch (error) {
      console.error("Error saving company value:", error)
    }
  }

  const saveCompanyInfo = async () => {
    try {
      if (companyInfo?.id) {
        await api(`/api/admin/company-info/${companyInfo.id}`, {
          method: "PUT",
          body: JSON.stringify(companyInfo),
        })
      } else {
        await api("/api/admin/company-info", {
          method: "POST",
          body: JSON.stringify(companyInfo),
        })
      }
      setShowContactModal(false)
      fetchAllData()
      alert("Company information saved successfully!")
    } catch (error) {
      console.error("Error saving company info:", error)
      alert("Failed to save company information")
    }
  }

  const deleteTeamMember = async (id: number) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      try {
        await api(`/api/admin/team-members/${id}`, { method: "DELETE" })
        fetchAllData()
      } catch (error) {
        console.error("Error deleting team member:", error)
      }
    }
  }

  const deleteCompanyValue = async (id: number) => {
    if (confirm("Are you sure you want to delete this value?")) {
      try {
        await api(`/api/admin/company-values/${id}`, { method: "DELETE" })
        fetchAllData()
      } catch (error) {
        console.error("Error deleting company value:", error)
      }
    }
  }

  const generateGoogleMapsUrl = () => {
    if (companyInfo?.streetAddress && companyInfo?.city && companyInfo?.state) {
      const address = `${companyInfo.streetAddress}, ${companyInfo.city}, ${companyInfo.state}, ${companyInfo.postalCode}`
      const encodedAddress = encodeURIComponent(address)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      setCompanyInfo({ ...companyInfo, googleMapsUrl: mapsUrl })
    }
  }

  const handleContentChange = (value: string) => {
    setStoryContent(value);
  }

  const iconMap: { [key: string]: React.ReactNode } = {
    "shield-check": <ShieldCheck className="h-6 w-6" />,
    award: <Award className="h-6 w-6" />,
    users: <Users className="h-6 w-6" />,
    heart: <Heart className="h-6 w-6" />,
    shield: <Shield className="h-6 w-6" />,
    star: <Star className="h-6 w-6" />,
    target: <Target className="h-6 w-6" />,
    zap: <Zap className="h-6 w-6" />,
    lightbulb: <Lightbulb className="h-6 w-6" />,
    handshake: <Handshake className="h-6 w-6" />,
    eye: <Eye className="h-6 w-6" />,
    "trending-up": <TrendingUp className="h-6 w-6" />,
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <Button variant="link" className="p-0 h-auto text-gray-500 hover:text-gray-700">
              DASHBOARD
            </Button>
            <span className="mx-2">/</span>
            <span>ABOUT US MANAGEMENT</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="story" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Our Story
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="values" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Company Values
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Info
            </TabsTrigger>
          </TabsList>

          {/* Our Story Tab */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Edit Our Story Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Story Content</Label>
                  {isClient && (
                    <RichTextEditor onChange={handleContentChange} value={storyContent}/>
                  )}
                </div>
                <Button onClick={saveStoryContent} className="flex items-center gap-2 btn-primary">
                  <Save className="h-4 w-4" />
                  Save Story Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="team">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Team Members</h2>
                <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setEditingTeamMember(null)
                        setTeamForm({})
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Team Member
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                          {member.imageUrl ? (
                            <img
                              src={`/images/${member.imageUrl}` || "/placeholder.svg"}
                              alt={member.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <Users className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge variant="secondary">{member.position}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{member.description}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTeamMember(member)
                              setTeamForm(member)
                              setShowTeamModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTeamMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Company Values Tab */}
          <TabsContent value="values">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Company Values</h2>
                <Dialog open={showValueModal} onOpenChange={setShowValueModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setEditingValue(null)
                        setValueForm({ icon_color: "#6366f1" })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Value
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyValues.map((value) => (
                  <Card key={value.id}>
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div
                            className="p-3 rounded-full"
                            style={{ backgroundColor: `${value.icon_color}20`, color: value.icon_color }}
                          >
                            {iconMap[value.icon_name] || <Heart className="h-6 w-6" />}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{value.title}</h3>
                        <p className="text-sm text-gray-600">{value.description}</p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingValue(value)
                              setValueForm(value)
                              setShowValueModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCompanyValue(value.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Company Contact Information</h2>
                <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Contact Info
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              {companyInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Company Overview Card */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                          <p className="text-lg font-semibold">{companyInfo.companyName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Tagline</Label>
                          <p className="text-gray-700">{companyInfo.tagline}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Established</Label>
                          <p className="text-gray-700">{companyInfo.establishedYear}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">About Description</Label>
                        <p className="text-gray-700 mt-1">{companyInfo.aboutDescription}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Details Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Primary Email</Label>
                          <p className="text-gray-700">{companyInfo.primaryEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Primary Phone</Label>
                          <p className="text-gray-700">{companyInfo.primaryPhone}</p>
                        </div>
                      </div>
                      {companyInfo.secondaryPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Secondary Phone</Label>
                            <p className="text-gray-700">{companyInfo.secondaryPhone}</p>
                          </div>
                        </div>
                      )}
                      {companyInfo.whatsappNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-green-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">WhatsApp</Label>
                            <p className="text-gray-700">{companyInfo.whatsappNumber}</p>
                          </div>
                        </div>
                      )}
                      {companyInfo.businessHoursWeekday && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Business Hours</Label>
                            <p className="text-gray-700">
                              Weekdays: {companyInfo.businessHoursWeekday}
                              {companyInfo.businessHoursWeekend && (
                                <>
                                  <br />
                                  Weekends: {companyInfo.businessHoursWeekend}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Address Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Street Address</Label>
                        <p className="text-gray-700 mt-1">{companyInfo.streetAddress}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">City</Label>
                          <p className="text-gray-700">{companyInfo.city}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">State</Label>
                          <p className="text-gray-700">{companyInfo.state}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Postal Code</Label>
                          <p className="text-gray-700">{companyInfo.postalCode}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Country</Label>
                          <p className="text-gray-700">{companyInfo.country}</p>
                        </div>
                      </div>
                      {companyInfo.googleMapsUrl && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.googleMapsUrl, "_blank")}
                            className="flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            View on Google Maps
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Social Media Card */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Online Presence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companyInfo.websiteUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.websiteUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                        {companyInfo.facebookUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.facebookUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            Facebook
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                        {companyInfo.instagramUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.instagramUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            Instagram
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                        {companyInfo.linkedinUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.linkedinUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            LinkedIn
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                        {companyInfo.twitterUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.twitterUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            Twitter
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                        {companyInfo.youtubeUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(companyInfo.youtubeUrl, "_blank")}
                            className="flex items-center gap-2 justify-start"
                          >
                            <Globe className="h-4 w-4" />
                            YouTube
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Team Member Modal */}
        <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeamMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveTeamMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={teamForm.name || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={teamForm.position || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, position: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={teamForm.description || ""}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={teamForm.email || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={teamForm.phone || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={teamForm.socialLinkedin || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, socialLinkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter URL</Label>
                  <Input
                    value={teamForm.socialTwitter || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, socialTwitter: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <MediaSelector
                  label="Profile Image"
                  value={teamForm.imageUrl || ""}
                  onChange={(value) => setTeamForm({ ...teamForm, imageUrl: Array.isArray(value) ? value[0] : value })}
                  multipleUpload={false}
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowTeamModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">Save Team Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Company Value Modal */}
        <Dialog open={showValueModal} onOpenChange={setShowValueModal}>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingValue ? "Edit Company Value" : "Add Company Value"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveCompanyValue} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={valueForm.title || ""}
                  onChange={(e) => setValueForm({ ...valueForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={valueForm.description || ""}
                  onChange={(e) => setValueForm({ ...valueForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={valueForm.icon_name || "heart"}
                    onValueChange={(value) => setValueForm({ ...valueForm, icon_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icon Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={valueForm.icon_color || "#6366f1"}
                      onChange={(e) => setValueForm({ ...valueForm, icon_color: e.target.value })}
                      type="color"
                      className="w-16"
                    />
                    <Input
                      value={valueForm.icon_color || "#6366f1"}
                      onChange={(e) => setValueForm({ ...valueForm, icon_color: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowValueModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">Save Value</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Contact Info Edit Modal */}
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
          <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company Contact Information</DialogTitle>
            </DialogHeader>
            {companyInfo && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={companyInfo.companyName}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tagline</Label>
                        <Input
                          value={companyInfo.tagline}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>About Description</Label>
                        <Textarea
                          value={companyInfo.aboutDescription}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, aboutDescription: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Established Year</Label>
                          <Input
                            type="number"
                            value={companyInfo.establishedYear}
                            onChange={(e) =>
                              setCompanyInfo({ ...companyInfo, establishedYear: Number.parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>License Number</Label>
                          <Input
                            value={companyInfo.licenseNumber}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, licenseNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Primary Email *</Label>
                        <Input
                          type="email"
                          value={companyInfo.primaryEmail}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, primaryEmail: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Phone *</Label>
                        <Input
                          value={companyInfo.primaryPhone}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, primaryPhone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Phone</Label>
                        <Input
                          value={companyInfo.secondaryPhone}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, secondaryPhone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp Number</Label>
                        <Input
                          value={companyInfo.whatsappNumber}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, whatsappNumber: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Weekday Hours</Label>
                          <Input
                            value={companyInfo.businessHoursWeekday}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, businessHoursWeekday: e.target.value })}
                            placeholder="9:00 AM - 6:00 PM"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Weekend Hours</Label>
                          <Input
                            value={companyInfo.businessHoursWeekend}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, businessHoursWeekend: e.target.value })}
                            placeholder="10:00 AM - 4:00 PM"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Street Address *</Label>
                        <Textarea
                          value={companyInfo.streetAddress}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, streetAddress: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Input
                            value={companyInfo.city}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State *</Label>
                          <Input
                            value={companyInfo.state}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, state: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Postal Code</Label>
                          <Input
                            value={companyInfo.postalCode}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, postalCode: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input
                            value={companyInfo.country}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, country: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Google Maps URL</Label>
                        <div className="flex gap-2">
                          <Input
                            value={companyInfo.googleMapsUrl}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, googleMapsUrl: e.target.value })}
                            placeholder="https://maps.google.com/..."
                          />
                          <Button type="button" variant="outline" onClick={generateGoogleMapsUrl}>
                            Generate
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Latitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={companyInfo.latitude}
                            onChange={(e) =>
                              setCompanyInfo({ ...companyInfo, latitude: Number.parseFloat(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Longitude</Label>
                          <Input
                            type="number"
                            step="any"
                            value={companyInfo.longitude}
                            onChange={(e) =>
                              setCompanyInfo({ ...companyInfo, longitude: Number.parseFloat(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Media & SEO */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Social Media & SEO
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Website URL</Label>
                        <Input
                          value={companyInfo.websiteUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, websiteUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Facebook URL</Label>
                        <Input
                          value={companyInfo.facebookUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, facebookUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram URL</Label>
                        <Input
                          value={companyInfo.instagramUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, instagramUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn URL</Label>
                        <Input
                          value={companyInfo.linkedinUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, linkedinUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Twitter URL</Label>
                        <Input
                          value={companyInfo.twitterUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, twitterUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>YouTube URL</Label>
                        <Input
                          value={companyInfo.youtubeUrl}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, youtubeUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input
                          value={companyInfo.meta_title}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, meta_title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                          value={companyInfo.meta_description}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, meta_description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowContactModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveCompanyInfo} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
