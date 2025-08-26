"use client";

import type React from "react";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import MediaSelector from "@/components/MediaSelector";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Home,
  Briefcase,
  Settings,
  FileText,
  CheckCircle,
  ArrowRight,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import RichTextEditor from "@/components/RichTextEditor";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { TeamMember } from "@/utils/interfaces";
import { SortableTeamCard } from "@/components/SortableTeamCard";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded-md animate-pulse" />,
});

interface AboutUsContent {
  id: number;
  section: string;
  title: string;
  content: string;
  imageUrl: string;
  display_order: number;
  is_active: boolean;
}

interface CompanyValue {
  id: number;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  displayOrder: number;
  isActive: boolean;
}

interface CompanyInfo {
  id: number;
  companyName: string;
  tagline: string;
  aboutDescription: string;
  primaryEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  businessHoursWeekday: string;
  businessHoursWeekend: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  meta_title: string;
  meta_description: string;
  establishedYear: number;
  licenseNumber: string;
  websiteUrl: string;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
  referralAmount: number;
}

interface Service {
  id: number
  title: string
  description: string
  shortDescription: string
  imageUrl: string
  iconName: string
  keyFeatures: string[]
}

interface LegalContent {
  id: number
  type: "terms" | "privacy"
  title: string
  content: string
  lastUpdated: string
  version: string
  isActive: boolean
}
export default function AboutUsManagement() {
  const [activeTab, setActiveTab] = useState("team");
  const [isClient, setIsClient] = useState(false);

  // State for different sections
  const [aboutContent, setAboutContent] = useState<AboutUsContent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  // Modal states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null
  );
  const [editingValue, setEditingValue] = useState<CompanyValue | null>(null);

  // Form states
  const [storyContent, setStoryContent] = useState("");
  const [mdStoryContent, setMDStoryContent] = useState("");
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({});
  const [valueForm, setValueForm] = useState<Partial<CompanyValue>>({});

  // Icon options for company values
  const iconOptions = [
    {
      value: "shield-check",
      label: "Shield Check",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    { value: "award", label: "Award", icon: <Award className="h-4 w-4" /> },
    { value: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { value: "heart", label: "Heart", icon: <Heart className="h-4 w-4" /> },
    { value: "shield", label: "Shield", icon: <Shield className="h-4 w-4" /> },
    { value: "star", label: "Star", icon: <Star className="h-4 w-4" /> },
    { value: "target", label: "Target", icon: <Target className="h-4 w-4" /> },
    { value: "zap", label: "Zap", icon: <Zap className="h-4 w-4" /> },
    {
      value: "lightbulb",
      label: "Lightbulb",
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      value: "handshake",
      label: "Handshake",
      icon: <Handshake className="h-4 w-4" />,
    },
    { value: "eye", label: "Eye", icon: <Eye className="h-4 w-4" /> },
    {
      value: "trending-up",
      label: "Trending Up",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
    { value: "briefcase", label: "Briefcase", icon: <Briefcase className="h-4 w-4" /> },
    { value: "star", label: "Star", icon: <Star className="h-4 w-4" /> },
    { value: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { value: "shield", label: "Shield", icon: <Shield className="h-4 w-4" /> },
    { value: "file-text", label: "File Text", icon: <FileText className="h-4 w-4" /> },
  ];

  // State for different sections
  const [services, setServices] = useState<Service[]>([])
  const [legalContent, setLegalContent] = useState<LegalContent[]>([])

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingLegal, setEditingLegal] = useState<LegalContent | null>(null)
  const [legalType, setLegalType] = useState<"terms" | "privacy">("terms")

  // Form states
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    keyFeatures: [],
    iconName: "home",
  })
  const [legalForm, setLegalForm] = useState<Partial<LegalContent>>({
    isActive: true,
    version: "1.0",
  })

  useEffect(() => {
    setIsClient(true)
    fetchAllData()
  }, [])

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const serviceData = {
        ...serviceForm,
        keyFeatures: serviceForm.keyFeatures?.join("#FEATURES#") || "",
      }

      if (editingService) {
        await api(`/api/admin/services/${editingService.id}`, {
          method: "PUT",
          body: JSON.stringify(serviceData),
        })
      } else {
        await api("/api/admin/services", {
          method: "POST",
          body: JSON.stringify(serviceData),
        })
      }

      setShowServiceModal(false)
      setEditingService(null)
      setServiceForm({ keyFeatures: [], iconName: "home"})
      fetchAllData()
    } catch (error) {
      console.error("Error saving service:", error)
    }
  }

  const saveLegalContent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const legalData = {
        ...legalForm,
        type: legalType,
        lastUpdated: new Date().toISOString(),
      }

      if (editingLegal) {
        await api(`/api/admin/legal-content/${editingLegal.id}`, {
          method: "PUT",
          body: JSON.stringify(legalData),
        })
      } else {
        await api("/api/admin/legal-content", {
          method: "POST",
          body: JSON.stringify(legalData),
        })
      }

      setShowLegalModal(false)
      setEditingLegal(null)
      setLegalForm({ isActive: true, version: "1.0" })
      fetchAllData()
    } catch (error) {
      console.error("Error saving legal content:", error)
    }
  }

  const deleteService = async (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await api(`/api/admin/services/${id}`, { method: "DELETE" })
        fetchAllData()
      } catch (error) {
        console.error("Error deleting service:", error)
      }
    }
  }

  const deleteLegalContent = async (id: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        await api(`/api/admin/legal-content/${id}`, { method: "DELETE" })
        fetchAllData()
      } catch (error) {
        console.error("Error deleting legal content:", error)
      }
    }
  }

  const addKeyFeature = () => {
    setServiceForm({
      ...serviceForm,
      keyFeatures: [...(serviceForm.keyFeatures || []), ""],
    })
  }

  const updateKeyFeature = (index: number, value: string) => {
    const updatedFeatures = [...(serviceForm.keyFeatures || [])]
    updatedFeatures[index] = value
    setServiceForm({ ...serviceForm, keyFeatures: updatedFeatures })
  }

  const removeKeyFeature = (index: number) => {
    const updatedFeatures = (serviceForm.keyFeatures || []).filter((_, i) => i !== index)
    setServiceForm({ ...serviceForm, keyFeatures: updatedFeatures })
  }

  const fetchAllData = async () => {
    try {
      const [contentRes, teamRes, valuesRes, infoRes, servicesRes, legalRes] = await Promise.all([
        api("/api/admin/about-us-content"),
        api("/api/admin/team-members"),
        api("/api/admin/company-values"),
        api("/api/admin/company-info"),
        api("/api/admin/services"), 
        api("/api/admin/legal-content")
      ]);
      const contentResJson = await contentRes.json();
      setAboutContent(contentResJson);
      setTeamMembers(await teamRes.json());
      setCompanyValues(await valuesRes.json());
      const servicesResJson = await servicesRes.json();
      const servicesWithFeatures = servicesResJson.map((service:any) => ({
        ...service,
        keyFeatures: service.keyFeatures ? service.keyFeatures.split("#FEATURES#") : [],
      }));
      setServices(servicesWithFeatures);
      setLegalContent(await legalRes.json())
      const info = await infoRes.json();
      setCompanyInfo(info[0] || null);

      // Set story content if exists
      const storySection = contentResJson.find((c) => c.section === "our_story");
      const mdStorySection = contentResJson.find((c) => c.section === "md_story");
      if (storySection) {
        setStoryContent(storySection.content);
      }
      if(mdStorySection) {
        setMDStoryContent(mdStorySection.content);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const saveStoryContent = async () => {
    try {
      const storySection = aboutContent.find((c) => c.section === "our_story");
      if (storySection) {
        await api(`/api/admin/about-us-content/${storySection.id}`, {
          method: "PUT",
          body: JSON.stringify({ content: storyContent }),
        });
      } else {
        await api("/api/admin/about-us-content", {
          method: "POST",
          body: JSON.stringify({
            section: "our_story",
            title: "Our Story",
            content: storyContent,
          }),
        });
      }
      fetchAllData();
      alert("Story content saved successfully!");
    } catch (error) {
      console.error("Error saving story:", error);
      alert("Failed to save story content");
    }
  };

  const saveMDStoryContent = async () => {
    try {
      const mdStorySection = aboutContent.find((c) => c.section === "md_story");
      if (mdStorySection) {
        await api(`/api/admin/about-us-content/${mdStorySection.id}`, {
          method: "PUT",
          body: JSON.stringify({ content: mdStoryContent }),
        });
      } else {
        await api("/api/admin/about-us-content", {
          method: "POST",
          body: JSON.stringify({
            section: "md_story",
            title: "MD Story",
            content: mdStorySection,
          }),
        });
      }
      fetchAllData();
      alert("Story content saved successfully!");
    } catch (error) {
      console.error("Error saving story:", error);
      alert("Failed to save story content");
    }
  };

  const saveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeamMember) {
        await api(`/api/admin/team-members/${editingTeamMember.id}`, {
          method: "PUT",
          body: JSON.stringify(teamForm),
        });
      } else {
        await api("/api/admin/team-members", {
          method: "POST",
          body: JSON.stringify(teamForm),
        });
      }
      setShowTeamModal(false);
      setEditingTeamMember(null);
      setTeamForm({});
      fetchAllData();
    } catch (error) {
      console.error("Error saving team member:", error);
    }
  };

  const saveCompanyValue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingValue) {
        await api(`/api/admin/company-values/${editingValue.id}`, {
          method: "PUT",
          body: JSON.stringify(valueForm),
        });
      } else {
        await api("/api/admin/company-values", {
          method: "POST",
          body: JSON.stringify(valueForm),
        });
      }
      setShowValueModal(false);
      setEditingValue(null);
      setValueForm({});
      fetchAllData();
    } catch (error) {
      console.error("Error saving company value:", error);
    }
  };

  const saveCompanyInfo = async () => {
    try {
      if (companyInfo?.id) {
        await api(`/api/admin/company-info/${companyInfo.id}`, {
          method: "PUT",
          body: JSON.stringify(companyInfo),
        });
      } else {
        await api("/api/admin/company-info", {
          method: "POST",
          body: JSON.stringify(companyInfo),
        });
      }
      setShowContactModal(false);
      fetchAllData();
      alert("Company information saved successfully!");
    } catch (error) {
      console.error("Error saving company info:", error);
      alert("Failed to save company information");
    }
  };

  const deleteTeamMember = async (id: number) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      try {
        await api(`/api/admin/team-members/${id}`, { method: "DELETE" });
        fetchAllData();
      } catch (error) {
        console.error("Error deleting team member:", error);
      }
    }
  };

  const deleteCompanyValue = async (id: number) => {
    if (confirm("Are you sure you want to delete this value?")) {
      try {
        await api(`/api/admin/company-values/${id}`, { method: "DELETE" });
        fetchAllData();
      } catch (error) {
        console.error("Error deleting company value:", error);
      }
    }
  };

  const generateGoogleMapsUrl = () => {
    if (companyInfo?.streetAddress && companyInfo?.city && companyInfo?.state) {
      const address = `${companyInfo.streetAddress}, ${companyInfo.city}, ${companyInfo.state}, ${companyInfo.postalCode}`;
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      setCompanyInfo({ ...companyInfo, googleMapsUrl: mapsUrl });
    }
  };

  const handleContentChange = (value: string) => {
    setStoryContent(value);
  };

  const handleMDStoryContentChange = (value: string) => {
    setMDStoryContent(value);
  };

  const handleDragEnd = (event:DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  setTeamMembers((prev) => {
    const oldIndex = prev.findIndex((m) => m.id === active.id);
    const newIndex = prev.findIndex((m) => m.id === over.id);

    const newOrder = arrayMove(prev, oldIndex, newIndex).map(
      (member, index) => ({
        ...member,
        displayOrder: index + 1, // update displayOrder
      })
    );

    // ✅ Optional: sync with backend API
    saveNewOrder(newOrder);

    return newOrder;
  });
};

  const saveNewOrder = async (newOrder: TeamMember[]) => {
    try {
      // Update each team member's order using saveTeamMember API
      await Promise.all(
        newOrder.map((member) =>
          api(`/api/admin/team-members/${member.id}`, {
        method: "PUT",
        body: JSON.stringify(member),
          })
        )
      );
    } catch (error) {
      console.error("Error saving new order:", error);
    }
  };

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
    home: <Home className="h-6 w-6" />,
    briefcase: <Briefcase className="h-6 w-6" />,
    settings: <Settings className="h-6 w-6" />,
    "file-text": <FileText className="h-6 w-6" />,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <Button
              variant="link"
              className="p-0 h-auto text-gray-500 hover:text-gray-700"
            >
              DASHBOARD
            </Button>
            <span className="mx-2">/</span>
            <span>ABOUT US MANAGEMENT</span>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Our Story
            </TabsTrigger>
            <TabsTrigger value="mdStory" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              MD Story
            </TabsTrigger>
            <TabsTrigger value="values" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Company Values
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Info
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
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
                    <RichTextEditor
                      onChange={handleContentChange}
                      value={storyContent}
                    />
                  )}
                </div>
                <Button
                  onClick={saveStoryContent}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Save className="h-4 w-4" />
                  Save Story Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Our Story Tab */}
          <TabsContent value="mdStory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Edit MD Story Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>MD Story Content</Label>
                  {isClient && (
                    <RichTextEditor
                      onChange={handleMDStoryContentChange}
                      value={mdStoryContent}
                    />
                  )}
                </div>
                <Button
                  onClick={saveMDStoryContent}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Save className="h-4 w-4" />
                  Save MD Story Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        
        <TabsContent value="team">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team Members</h2>
              <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
                <DialogTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => {
                      setEditingTeamMember(null);
                      setTeamForm({});
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* DnD wrapper */}
            <DndContext
              sensors={useSensors(useSensor(PointerSensor))}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={teamMembers.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member) => (
                    <SortableTeamCard key={member.id} member={member}>
                      <Card >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="w-full bg-gray-200 rounded-md flex items-center justify-center">
                              {member.imageUrl ? (
                                <img
                                  src={`/images/${member.imageUrl}`}
                                  alt={member.name}
                                  className="w-full h-64 object-cover rounded-md"
                                />
                              ) : (
                                <Users className="h-12 w-12 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <Badge variant="secondary">{member.position}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {member.description}
                            </p>
                            
                          </div>
                        </CardContent>
                        <div className="flex gap-2 ml-4 mb-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingTeamMember(member);
                                  setTeamForm(member);
                                  setShowTeamModal(true);
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
                      </Card>
                    </SortableTeamCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
                        setEditingValue(null);
                        setValueForm({ iconColor: "#6366f1" });
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
                            style={{
                              backgroundColor: `${value.iconColor}20`,
                              color: value.iconColor,
                            }}
                          >
                            {iconMap[value.iconName] || (
                              <Heart className="h-6 w-6" />
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{value.title}</h3>
                        <p className="text-sm text-gray-600">
                          {value.description}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingValue(value);
                              setValueForm(value);
                              setShowValueModal(true);
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
                <h2 className="text-2xl font-bold">
                  Company Contact Information
                </h2>
                <Dialog
                  open={showContactModal}
                  onOpenChange={setShowContactModal}
                >
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
                          <Label className="text-sm font-medium text-gray-500">
                            Company Name
                          </Label>
                          <p className="text-lg font-semibold">
                            {companyInfo.companyName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Tagline
                          </Label>
                          <p className="text-gray-700">{companyInfo.tagline}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Established
                          </Label>
                          <p className="text-gray-700">
                            {companyInfo.establishedYear}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          About Description
                        </Label>
                        <p className="text-gray-700 mt-1">
                          {companyInfo.aboutDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

 {/* Referral Details Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Referral Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Referral Amount
                          </Label>
                          <p className="text-gray-700">
                            {companyInfo.referralAmount}
                          </p>
                        </div>
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
                          <Label className="text-sm font-medium text-gray-500">
                            Primary Email
                          </Label>
                          <p className="text-gray-700">
                            {companyInfo.primaryEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Primary Phone
                          </Label>
                          <p className="text-gray-700">
                            {companyInfo.primaryPhone}
                          </p>
                        </div>
                      </div>
                      {companyInfo.secondaryPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Secondary Phone
                            </Label>
                            <p className="text-gray-700">
                              {companyInfo.secondaryPhone}
                            </p>
                          </div>
                        </div>
                      )}
                      {companyInfo.whatsappNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-green-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              WhatsApp
                            </Label>
                            <p className="text-gray-700">
                              {companyInfo.whatsappNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {companyInfo.businessHoursWeekday && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-sm font-medium text-gray-500">
                              Business Hours
                            </Label>
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
                        <Label className="text-sm font-medium text-gray-500">
                          Street Address
                        </Label>
                        <p className="text-gray-700 mt-1">
                          {companyInfo.streetAddress}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            City
                          </Label>
                          <p className="text-gray-700">{companyInfo.city}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            State
                          </Label>
                          <p className="text-gray-700">{companyInfo.state}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Postal Code
                          </Label>
                          <p className="text-gray-700">
                            {companyInfo.postalCode}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">
                            Country
                          </Label>
                          <p className="text-gray-700">{companyInfo.country}</p>
                        </div>
                      </div>
                      {companyInfo.googleMapsUrl && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(companyInfo.googleMapsUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.websiteUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.facebookUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.instagramUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.linkedinUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.twitterUrl, "_blank")
                            }
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
                            onClick={() =>
                              window.open(companyInfo.youtubeUrl, "_blank")
                            }
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

          <TabsContent value="services">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Services Management</h2>
                <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setEditingService(null)
                        setServiceForm({ keyFeatures: [], iconName: "home" })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Service Icon */}
                        <div className="flex justify-center">
                          <div className="p-3 bg-blue-100 rounded-full">
                            {iconMap[service.iconName] || <Home className="h-6 w-6 text-blue-600" />}
                          </div>
                        </div>

                        {/* Service Image */}
                        {service.imageUrl && (
                          <div className="w-full h-32 bg-gray-200 rounded-md overflow-hidden">
                            <img
                              src={`/images/${service.imageUrl}`}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Service Content */}
                        <div className="text-center space-y-2">
                          <h3 className="font-bold text-lg">{service.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3">{service.shortDescription}</p>
                        </div>

                        {/* Key Features */}
                        {service.keyFeatures && service.keyFeatures.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Key Features:</h4>
                            <ul className="space-y-1">
                              {service.keyFeatures?.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        

                        {/* Status Badge */}
                        <div className="flex justify-between items-center">
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingService(service)
                                setServiceForm(service)
                                setShowServiceModal(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteService(service.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Terms & Conditions Tab */}
          <TabsContent value="terms">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Terms & Conditions</h2>
                <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setLegalType("terms")
                        setEditingLegal(null)
                        setLegalForm({ isActive: true, version: "1.0" })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Terms
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {legalContent
                  .filter((content) => content.type === "terms")
                  .map((content) => (
                    <Card key={content.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{content.title}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Version {content.version}</Badge>
                              <Badge variant={content.isActive ? "default" : "secondary"}>
                                {content.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setLegalType("terms")
                                setEditingLegal(content)
                                setLegalForm(content)
                                setShowLegalModal(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteLegalContent(content.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Last updated: {new Date(content.lastUpdated).toLocaleDateString()}
                          </p>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="flex items-center gap-2"
                      onClick={() => {
                        setLegalType("privacy")
                        setEditingLegal(null)
                        setLegalForm({ isActive: true, version: "1.0" })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Privacy Policy
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {legalContent
                  .filter((content) => content.type === "privacy")
                  .map((content) => (
                    <Card key={content.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{content.title}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">Version {content.version}</Badge>
                              <Badge variant={content.isActive ? "default" : "secondary"}>
                                {content.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setLegalType("privacy")
                                setEditingLegal(content)
                                setLegalForm(content)
                                setShowLegalModal(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteLegalContent(content.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Last updated: {new Date(content.lastUpdated).toLocaleDateString()}
                          </p>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Team Member Modal */}
        <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
  <DialogContent className="bg-white dark:bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-slate-100">
        {editingTeamMember ? "Edit Team Member" : "Add Team Member"}
      </DialogTitle>
    </DialogHeader>
    <form onSubmit={saveTeamMember} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Name *</Label>
          <Input
            value={teamForm.name || ""}
            onChange={(e) =>
              setTeamForm({ ...teamForm, name: e.target.value })
            }
            required
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Position *</Label>
          <Select
            value={teamForm.position}
            onValueChange={(value) =>
              setTeamForm({ ...teamForm, position: value })
            }
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <SelectItem value="MD">MD</SelectItem>
              <SelectItem value="CEO">CEO</SelectItem>
              <SelectItem value="Manager (Admin)">Manager (Admin)</SelectItem>
              <SelectItem value="Manager (Marketing)">Manager (Marketing)</SelectItem>
              <SelectItem value="Senior Manager">Senior Manager</SelectItem>
              <SelectItem value="Sales Manager">Sales Manager</SelectItem>
              <SelectItem value="Founder">Founder</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Technical Manager">Technical Manager</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300">Description</Label>
        <Textarea
          value={teamForm.description || ""}
          onChange={(e) =>
            setTeamForm({ ...teamForm, description: e.target.value })
          }
          rows={3}
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Email</Label>
          <Input
            type="email"
            value={teamForm.email || ""}
            onChange={(e) =>
              setTeamForm({ ...teamForm, email: e.target.value })
            }
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Phone</Label>
          <Input
            value={teamForm.phone || ""}
            onChange={(e) =>
              setTeamForm({ ...teamForm, phone: e.target.value })
            }
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">LinkedIn URL</Label>
          <Input
            value={teamForm.socialLinkedin || ""}
            onChange={(e) =>
              setTeamForm({ ...teamForm, socialLinkedin: e.target.value })
            }
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Twitter URL</Label>
          <Input
            value={teamForm.socialTwitter || ""}
            onChange={(e) =>
              setTeamForm({ ...teamForm, socialTwitter: e.target.value })
            }
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Display Order</Label>
          <Input
            value={teamForm.displayOrder || ""}
            type="number"
            onChange={(e) =>
              setTeamForm({ ...teamForm, displayOrder: parseInt(e.target.value) })
            }
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <MediaSelector
          label="Profile Image"
          value={teamForm.imageUrl || ""}
          onChange={(value) =>
            setTeamForm({
              ...teamForm,
              imageUrl: Array.isArray(value) ? value[0] : value,
            })
          }
          multipleUpload={false}
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowTeamModal(false)}
          className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="btn-primary bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
        >
          Save Team Member
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>


        {/* Company Value Modal */}
        <Dialog open={showValueModal} onOpenChange={setShowValueModal}>
  <DialogContent className="bg-white dark:bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-slate-100">
        {editingValue ? "Edit Company Value" : "Add Company Value"}
      </DialogTitle>
    </DialogHeader>
    <form onSubmit={saveCompanyValue} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300">Title *</Label>
        <Input
          value={valueForm.title || ""}
          onChange={(e) =>
            setValueForm({ ...valueForm, title: e.target.value })
          }
          required
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300">Description</Label>
        <Textarea
          value={valueForm.description || ""}
          onChange={(e) =>
            setValueForm({ ...valueForm, description: e.target.value })
          }
          rows={3}
          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Icon</Label>
          <Select
            value={valueForm.iconName || "heart"}
            onValueChange={(value) =>
              setValueForm({ ...valueForm, iconName: value })
            }
          >
            <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="dark:text-slate-100">
                  <div className="flex items-center gap-2">{option.icon} {option.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Icon Color</Label>
          <div className="flex gap-2">
            <Input
              value={valueForm.iconColor || "#6366f1"}
              onChange={(e) =>
                setValueForm({ ...valueForm, iconColor: e.target.value })
              }
              type="color"
              className="w-16 border-slate-300 dark:border-slate-700"
            />
            <Input
              value={valueForm.iconColor || "#6366f1"}
              onChange={(e) =>
                setValueForm({ ...valueForm, iconColor: e.target.value })
              }
              placeholder="#6366f1"
              className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowValueModal(false)}
          className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="btn-primary bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
        >
          Save Value
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>


        {/* Contact Info Edit Modal */}
        <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
  <DialogContent className="bg-white dark:bg-slate-900 max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-slate-100">
        Edit Company Contact Information
      </DialogTitle>
    </DialogHeader>

    {companyInfo && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Basic Information */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Company Name *</Label>
                <Input
                  value={companyInfo.companyName}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                  }
                  required
                  className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Tagline</Label>
                <Input
                  value={companyInfo.tagline}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, tagline: e.target.value })
                  }
                  className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">About Description</Label>
                <Textarea
                  value={companyInfo.aboutDescription}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, aboutDescription: e.target.value })
                  }
                  rows={4}
                  className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Established Year</Label>
                  <Input
                    type="number"
                    value={companyInfo.establishedYear}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, establishedYear: Number.parseInt(e.target.value) })
                    }
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">License Number</Label>
                  <Input
                    value={companyInfo.licenseNumber}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, licenseNumber: e.target.value })
                    }
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                Referral Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Referral Amount *</Label>
                <Input
                  type="number"
                  value={companyInfo.referralAmount}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, referralAmount: Number.parseFloat(e.target.value) })
                  }
                  required
                  className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Phone className="h-5 w-5" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["primaryEmail", "primaryPhone", "secondaryPhone", "whatsappNumber"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    {field === "primaryEmail" ? "Primary Email *" : field === "primaryPhone" ? "Primary Phone *" : field === "secondaryPhone" ? "Secondary Phone" : "WhatsApp Number"}
                  </Label>
                  <Input
                    value={companyInfo[field]}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, [field]: e.target.value })}
                    type={field === "primaryEmail" ? "email" : "text"}
                    required={field === "primaryEmail" || field === "primaryPhone"}
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Weekday Hours</Label>
                  <Input
                    value={companyInfo.businessHoursWeekday}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessHoursWeekday: e.target.value })}
                    placeholder="9:00 AM - 6:00 PM"
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Weekend Hours</Label>
                  <Input
                    value={companyInfo.businessHoursWeekend}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessHoursWeekend: e.target.value })}
                    placeholder="10:00 AM - 4:00 PM"
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["streetAddress", "city", "state", "postalCode", "country", "googleMapsUrl", "latitude", "longitude"].map((field, idx) => (
                <div key={idx} className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">{field}</Label>
                  <Input
                    value={companyInfo[field]}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, [field]: field === "latitude" || field === "longitude" ? Number.parseFloat(e.target.value) : e.target.value })
                    }
                    type={field === "latitude" || field === "longitude" ? "number" : "text"}
                    className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social Media & SEO */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Globe className="h-5 w-5" />
                Social Media & SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["websiteUrl", "facebookUrl", "instagramUrl", "linkedinUrl", "twitterUrl", "youtubeUrl", "meta_title", "meta_description"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">{field}</Label>
                  {field === "meta_description" ? (
                    <Textarea
                      value={companyInfo[field]}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, [field]: e.target.value })}
                      rows={3}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                    />
                  ) : (
                    <Input
                      value={companyInfo[field]}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, [field]: e.target.value })}
                      className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowContactModal(false)}
            className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={saveCompanyInfo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>


        <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
  <DialogContent className="bg-white dark:bg-slate-900 max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-slate-100">
        {editingService ? "Edit Service" : "Add Service"}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={saveService} className="space-y-6">

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Service Title *</Label>
            <Input
              value={serviceForm.title || ""}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              placeholder="e.g., Property Buying"
              required
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Icon</Label>
            <Select
              value={serviceForm.iconName || "home"}
              onValueChange={(value) => setServiceForm({ ...serviceForm, iconName: value })}
            >
              <SelectTrigger className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-700">
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">{option.icon}{option.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Short Description *</Label>
          <Textarea
            value={serviceForm.shortDescription || ""}
            onChange={(e) => setServiceForm({ ...serviceForm, shortDescription: e.target.value })}
            placeholder="Brief description for the service card"
            rows={2}
            required
            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Full Description</Label>
          <Textarea
            value={serviceForm.description || ""}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            placeholder="Detailed description of the service"
            rows={4}
            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
          />
        </div>
      </div>

      {/* Service Image */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Service Image</h3>
        </div>

        <MediaSelector
          label="Service Image"
          value={serviceForm.imageUrl || ""}
          onChange={(value) =>
            setServiceForm({
              ...serviceForm,
              imageUrl: Array.isArray(value) ? value[0] : value,
            })
          }
          multipleUpload={false}
        />
      </div>

      {/* Key Features */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Key Features</h3>
        </div>

        <div className="space-y-3">
          {(serviceForm.keyFeatures || []).map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateKeyFeature(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeKeyFeature(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addKeyFeature}
            className="flex items-center gap-2 bg-transparent text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowServiceModal(false)}
          className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
        >
          Cancel
        </Button>
        <Button type="submit" className="btn-primary">
          {editingService ? "Update Service" : "Create Service"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>


        {/* Legal Content Modal */}
        <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
  <DialogContent className="bg-white dark:bg-slate-900 max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-slate-900 dark:text-slate-100">
        {editingLegal
          ? `Edit ${legalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}`
          : `Add ${legalType === "terms" ? "Terms & Conditions" : "Privacy Policy"}`}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={saveLegalContent} className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Title *</Label>
          <Input
            value={legalForm.title || ""}
            onChange={(e) => setLegalForm({ ...legalForm, title: e.target.value })}
            placeholder={`${legalType === "terms" ? "Terms & Conditions" : "Privacy Policy"} Title`}
            required
            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Version</Label>
          <Input
            value={legalForm.version || ""}
            onChange={(e) => setLegalForm({ ...legalForm, version: e.target.value })}
            placeholder="1.0"
            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300">Content *</Label>
        {isClient && (
          <RichTextEditor
            value={legalForm.content || ""}
            onChange={(value) => setLegalForm((prev) => ({ ...prev, content: value }))}
            className="bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="legalActive"
          checked={legalForm.isActive || false}
          onChange={(e) => setLegalForm({ ...legalForm, isActive: e.target.checked })}
          className="rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
        />
        <Label htmlFor="legalActive" className="text-slate-700 dark:text-slate-300">Active Content</Label>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowLegalModal(false)}
          className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
        >
          Cancel
        </Button>
        <Button type="submit" className="btn-primary">
          {editingLegal ? "Update Content" : "Create Content"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

      </div>
    </AdminLayout>
  );
}
