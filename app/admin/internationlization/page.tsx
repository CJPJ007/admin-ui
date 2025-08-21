"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  RotateCcw,
  Languages,
  FileText,
  Check,
  Download,
} from "lucide-react"
import Link from "next/link"

interface Language {
  id: number
  name: string
  code: string
  flag: string
  isEnabled: boolean
  isDefault: boolean
  direction: "ltr" | "rtl"
  completionPercentage: number
  createdAt: string
  updatedAt: string
}

interface Translation {
  id: number
  key: string
  languageCode: string
  value: string
  category: string
  isPlural: boolean
  context?: string
}

interface TranslationKey {
  id: number
  key: string
  category: string
  description: string
  isPlural: boolean
  defaultValue: string
  createdAt: string
}

export default function InternationalizationPage() {
  const [activeTab, setActiveTab] = useState("languages")
  const [languages, setLanguages] = useState<Language[]>([])
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Modal states
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)
  const [editingKey, setEditingKey] = useState<TranslationKey | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)

  const { toast } = useToast()

  // Form states
  const [languageForm, setLanguageForm] = useState({
    name: "",
    code: "",
    flag: "",
    direction: "ltr" as "ltr" | "rtl",
    isEnabled: true,
    isDefault: false,
  })

  const [keyForm, setKeyForm] = useState({
    key: "",
    category: "",
    description: "",
    isPlural: false,
    defaultValue: "",
  })

  const [translationForm, setTranslationForm] = useState({
    key: "",
    languageCode: "",
    value: "",
    category: "",
    isPlural: false,
    context: "",
  })

  const categories = ["common", "navigation", "forms", "messages", "errors", "buttons", "labels"]

  const predefinedLanguages = [
    { name: "English", code: "en", flag: "🇺🇸", direction: "ltr" },
    { name: "Spanish", code: "es", flag: "🇪🇸", direction: "ltr" },
    { name: "French", code: "fr", flag: "🇫🇷", direction: "ltr" },
    { name: "German", code: "de", flag: "🇩🇪", direction: "ltr" },
    { name: "Italian", code: "it", flag: "🇮🇹", direction: "ltr" },
    { name: "Portuguese", code: "pt", flag: "🇵🇹", direction: "ltr" },
    { name: "Russian", code: "ru", flag: "🇷🇺", direction: "ltr" },
    { name: "Chinese (Simplified)", code: "zh-CN", flag: "🇨🇳", direction: "ltr" },
    { name: "Japanese", code: "ja", flag: "🇯🇵", direction: "ltr" },
    { name: "Korean", code: "ko", flag: "🇰🇷", direction: "ltr" },
    { name: "Arabic", code: "ar", flag: "🇸🇦", direction: "rtl" },
    { name: "Hindi", code: "hi", flag: "🇮🇳", direction: "ltr" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchLanguages(), fetchTranslationKeys(), fetchTranslations()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLanguages = async () => {
    try {
      // Mock data - replace with actual API call
      const mockLanguages: Language[] = [
        {
          id: 1,
          name: "English",
          code: "en",
          flag: "🇺🇸",
          isEnabled: true,
          isDefault: true,
          direction: "ltr",
          completionPercentage: 100,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          name: "Spanish",
          code: "es",
          flag: "🇪🇸",
          isEnabled: true,
          isDefault: false,
          direction: "ltr",
          completionPercentage: 85,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
        },
        {
          id: 3,
          name: "French",
          code: "fr",
          flag: "🇫🇷",
          isEnabled: false,
          isDefault: false,
          direction: "ltr",
          completionPercentage: 60,
          createdAt: "2024-01-03T00:00:00Z",
          updatedAt: "2024-01-03T00:00:00Z",
        },
        {
          id: 4,
          name: "Arabic",
          code: "ar",
          flag: "🇸🇦",
          isEnabled: true,
          isDefault: false,
          direction: "rtl",
          completionPercentage: 45,
          createdAt: "2024-01-04T00:00:00Z",
          updatedAt: "2024-01-04T00:00:00Z",
        },
      ]
      setLanguages(mockLanguages)
    } catch (error) {
      console.error("Error fetching languages:", error)
    }
  }

  const fetchTranslationKeys = async () => {
    try {
      // Mock data - replace with actual API call
      const mockKeys: TranslationKey[] = [
        {
          id: 1,
          key: "common.welcome",
          category: "common",
          description: "Welcome message displayed on homepage",
          isPlural: false,
          defaultValue: "Welcome to our platform",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          key: "navigation.home",
          category: "navigation",
          description: "Home navigation link",
          isPlural: false,
          defaultValue: "Home",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 3,
          key: "forms.submit",
          category: "forms",
          description: "Submit button text",
          isPlural: false,
          defaultValue: "Submit",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: 4,
          key: "messages.items_count",
          category: "messages",
          description: "Display count of items",
          isPlural: true,
          defaultValue: "{count} item|{count} items",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ]
      setTranslationKeys(mockKeys)
    } catch (error) {
      console.error("Error fetching translation keys:", error)
    }
  }

  const fetchTranslations = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTranslations: Translation[] = [
        {
          id: 1,
          key: "common.welcome",
          languageCode: "es",
          value: "Bienvenido a nuestra plataforma",
          category: "common",
          isPlural: false,
        },
        {
          id: 2,
          key: "navigation.home",
          languageCode: "es",
          value: "Inicio",
          category: "navigation",
          isPlural: false,
        },
        {
          id: 3,
          key: "common.welcome",
          languageCode: "fr",
          value: "Bienvenue sur notre plateforme",
          category: "common",
          isPlural: false,
        },
        {
          id: 4,
          key: "messages.items_count",
          languageCode: "es",
          value: "{count} elemento|{count} elementos",
          category: "messages",
          isPlural: true,
        },
      ]
      setTranslations(mockTranslations)
    } catch (error) {
      console.error("Error fetching translations:", error)
    }
  }

  const handleLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingLanguage) {
        // Update existing language
        const updatedLanguage = { ...editingLanguage, ...languageForm }
        setLanguages(languages.map((lang) => (lang.id === editingLanguage.id ? updatedLanguage : lang)))
        toast({ title: "Success", description: "Language updated successfully" })
      } else {
        // Add new language
        const newLanguage: Language = {
          id: Date.now(),
          ...languageForm,
          completionPercentage: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setLanguages([...languages, newLanguage])
        toast({ title: "Success", description: "Language added successfully" })
      }
      resetLanguageForm()
      setShowLanguageModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save language", variant: "destructive" })
    }
  }

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingKey) {
        // Update existing key
        const updatedKey = { ...editingKey, ...keyForm }
        setTranslationKeys(translationKeys.map((key) => (key.id === editingKey.id ? updatedKey : key)))
        toast({ title: "Success", description: "Translation key updated successfully" })
      } else {
        // Add new key
        const newKey: TranslationKey = {
          id: Date.now(),
          ...keyForm,
          createdAt: new Date().toISOString(),
        }
        setTranslationKeys([...translationKeys, newKey])
        toast({ title: "Success", description: "Translation key added successfully" })
      }
      resetKeyForm()
      setShowKeyModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save translation key", variant: "destructive" })
    }
  }

  const handleTranslationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTranslation) {
        // Update existing translation
        const updatedTranslation = { ...editingTranslation, ...translationForm }
        setTranslations(translations.map((trans) => (trans.id === editingTranslation.id ? updatedTranslation : trans)))
        toast({ title: "Success", description: "Translation updated successfully" })
      } else {
        // Add new translation
        const newTranslation: Translation = {
          id: Date.now(),
          ...translationForm,
        }
        setTranslations([...translations, newTranslation])
        toast({ title: "Success", description: "Translation added successfully" })
      }
      resetTranslationForm()
      setShowTranslationModal(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save translation", variant: "destructive" })
    }
  }

  const toggleLanguageStatus = async (id: number) => {
    try {
      setLanguages(languages.map((lang) => (lang.id === id ? { ...lang, isEnabled: !lang.isEnabled } : lang)))
      toast({ title: "Success", description: "Language status updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update language status", variant: "destructive" })
    }
  }

  const setDefaultLanguage = async (id: number) => {
    try {
      setLanguages(
        languages.map((lang) => ({
          ...lang,
          isDefault: lang.id === id,
          isEnabled: lang.id === id ? true : lang.isEnabled,
        })),
      )
      toast({ title: "Success", description: "Default language updated" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to set default language", variant: "destructive" })
    }
  }

  const deleteLanguage = async (id: number) => {
    const language = languages.find((lang) => lang.id === id)
    if (language?.isDefault) {
      toast({ title: "Error", description: "Cannot delete the default language", variant: "destructive" })
      return
    }

    if (confirm("Are you sure you want to delete this language?")) {
      try {
        setLanguages(languages.filter((lang) => lang.id !== id))
        toast({ title: "Success", description: "Language deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete language", variant: "destructive" })
      }
    }
  }

  const deleteTranslationKey = async (id: number) => {
    if (confirm("Are you sure you want to delete this translation key? All associated translations will be removed.")) {
      try {
        setTranslationKeys(translationKeys.filter((key) => key.id !== id))
        setTranslations(translations.filter((trans) => trans.key !== translationKeys.find((k) => k.id === id)?.key))
        toast({ title: "Success", description: "Translation key deleted successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete translation key", variant: "destructive" })
      }
    }
  }

  const resetLanguageForm = () => {
    setLanguageForm({
      name: "",
      code: "",
      flag: "",
      direction: "ltr",
      isEnabled: true,
      isDefault: false,
    })
    setEditingLanguage(null)
  }

  const resetKeyForm = () => {
    setKeyForm({
      key: "",
      category: "",
      description: "",
      isPlural: false,
      defaultValue: "",
    })
    setEditingKey(null)
  }

  const resetTranslationForm = () => {
    setTranslationForm({
      key: "",
      languageCode: "",
      value: "",
      category: "",
      isPlural: false,
      context: "",
    })
    setEditingTranslation(null)
  }

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language)
    setLanguageForm({
      name: language.name,
      code: language.code,
      flag: language.flag,
      direction: language.direction,
      isEnabled: language.isEnabled,
      isDefault: language.isDefault,
    })
    setShowLanguageModal(true)
  }

  const handleEditKey = (key: TranslationKey) => {
    setEditingKey(key)
    setKeyForm({
      key: key.key,
      category: key.category,
      description: key.description,
      isPlural: key.isPlural,
      defaultValue: key.defaultValue,
    })
    setShowKeyModal(true)
  }

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation)
    setTranslationForm({
      key: translation.key,
      languageCode: translation.languageCode,
      value: translation.value,
      category: translation.category,
      isPlural: translation.isPlural,
      context: translation.context || "",
    })
    setShowTranslationModal(true)
  }

  const exportTranslations = async () => {
    try {
      // Mock export functionality
      const data = {
        languages,
        translationKeys,
        translations,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "translations.json"
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "Success", description: "Translations exported successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to export translations", variant: "destructive" })
    }
  }

  // Filter functions
  const filteredLanguages = languages.filter((language) => {
    const matchesSearch =
      language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredKeys = translationKeys.filter((key) => {
    const matchesSearch =
      key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || key.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredTranslations = translations.filter((translation) => {
    const matchesSearch =
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = !selectedLanguage || translation.languageCode === selectedLanguage
    const matchesCategory = selectedCategory === "all" || translation.category === selectedCategory
    return matchesSearch && matchesLanguage && matchesCategory
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
            <Link href="/admin/settings" className="hover:text-gray-700">
              DASHBOARD / SETTINGS
            </Link>
            <span className="mx-2">/</span>
            <span>INTERNATIONALIZATION</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Internationalization Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage languages, translations, and localization settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportTranslations} className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link href="/admin/settings">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Languages</p>
                  <p className="text-2xl font-bold text-gray-900">{languages.length}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enabled Languages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {languages.filter((lang) => lang.isEnabled).length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Translation Keys</p>
                  <p className="text-2xl font-bold text-purple-600">{translationKeys.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Translations</p>
                  <p className="text-2xl font-bold text-orange-600">{translations.length}</p>
                </div>
                <Languages className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="keys">Translation Keys</TabsTrigger>
                <TabsTrigger value="translations">Translations</TabsTrigger>
              </TabsList>

              {/* Languages Tab */}
              <TabsContent value="languages" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search languages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={fetchLanguages}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reload
                    </Button>

                    <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
                      <DialogTrigger asChild>
                        <Button onClick={resetLanguageForm} className="flex items-center gap-2 btn-primary">
                          <Plus className="h-4 w-4" />
                          Add Language
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Language</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLanguages.map((language) => (
                      <TableRow key={language.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{language.flag}</span>
                            <div>
                              <div className="font-medium">{language.name}</div>
                              <div className="text-sm text-gray-500">
                                Added {new Date(language.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{language.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={language.direction === "rtl" ? "secondary" : "outline"}>
                            {language.direction.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${language.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{language.completionPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={language.isEnabled}
                              onCheckedChange={() => toggleLanguageStatus(language.id)}
                              disabled={language.isDefault}
                            />
                            <Badge variant={language.isEnabled ? "default" : "secondary"}>
                              {language.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {language.isDefault ? (
                            <Badge variant="default">Default</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultLanguage(language.id)}
                              disabled={!language.isEnabled}
                            >
                              Set Default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditLanguage(language)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteLanguage(language.id)}
                              disabled={language.isDefault}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Translation Keys Tab */}
              <TabsContent value="keys" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search translation keys..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
                    <DialogTrigger asChild>
                      <Button onClick={resetKeyForm} className="flex items-center gap-2 btn-primary">
                        <Plus className="h-4 w-4" />
                        Add Translation Key
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Default Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{key.key}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{key.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{key.description}</TableCell>
                        <TableCell>
                          <Badge variant={key.isPlural ? "secondary" : "outline"}>
                            {key.isPlural ? "Plural" : "Simple"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{key.defaultValue}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditKey(key)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteTranslationKey(key.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Translations Tab */}
              <TabsContent value="translations" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search translations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>

                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Languages" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="">All Languages</SelectItem>
                        {languages.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.flag} {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog open={showTranslationModal} onOpenChange={setShowTranslationModal}>
                    <DialogTrigger asChild>
                      <Button onClick={resetTranslationForm} className="flex items-center gap-2 btn-primary">
                        <Plus className="h-4 w-4" />
                        Add Translation
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Translation</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTranslations.map((translation) => (
                      <TableRow key={translation.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{translation.key}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{languages.find((l) => l.code === translation.languageCode)?.flag}</span>
                            <Badge variant="outline">{translation.languageCode}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{translation.value}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{translation.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditTranslation(translation)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTranslations(translations.filter((t) => t.id !== translation.id))}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Language Modal */}
        <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>{editingLanguage ? "Edit Language" : "Add New Language"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleLanguageSubmit} className="space-y-6">
              {!editingLanguage && (
                <div className="space-y-3">
                  <Label>Quick Select (Optional)</Label>
                  <Select
                    onValueChange={(value) => {
                      const predefined = predefinedLanguages.find((lang) => lang.code === value)
                      if (predefined) {
                        setLanguageForm({
                          ...languageForm,
                          name: predefined.name,
                          code: predefined.code,
                          flag: predefined.flag,
                          direction: predefined.direction,
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from common languages" />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60">
                      {predefinedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              {lang.code}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Language Name *</Label>
                  <Input
                    id="name"
                    value={languageForm.name}
                    onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                    placeholder="e.g., English"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Language Code *</Label>
                  <Input
                    id="code"
                    value={languageForm.code}
                    onChange={(e) => setLanguageForm({ ...languageForm, code: e.target.value })}
                    placeholder="e.g., en, es, fr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flag">Flag Emoji</Label>
                  <Input
                    id="flag"
                    value={languageForm.flag}
                    onChange={(e) => setLanguageForm({ ...languageForm, flag: e.target.value })}
                    placeholder="🇺🇸"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction">Text Direction</Label>
                  <Select
                    value={languageForm.direction}
                    onValueChange={(value: "ltr" | "rtl") => setLanguageForm({ ...languageForm, direction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                      <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={languageForm.isEnabled}
                    onCheckedChange={(checked) => setLanguageForm({ ...languageForm, isEnabled: checked })}
                  />
                  <Label htmlFor="enabled">Enable this language</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="default"
                    checked={languageForm.isDefault}
                    onCheckedChange={(checked) =>
                      setLanguageForm({
                        ...languageForm,
                        isDefault: checked,
                        isEnabled: checked ? true : languageForm.isEnabled,
                      })
                    }
                  />
                  <Label htmlFor="default">Set as default language</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowLanguageModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {editingLanguage ? "Update Language" : "Add Language"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Translation Key Modal */}
        <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit Translation Key" : "Add New Translation Key"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleKeySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Translation Key *</Label>
                  <Input
                    id="key"
                    value={keyForm.key}
                    onChange={(e) => setKeyForm({ ...keyForm, key: e.target.value })}
                    placeholder="e.g., common.welcome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={keyForm.category}
                    onValueChange={(value) => setKeyForm({ ...keyForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={keyForm.description}
                  onChange={(e) => setKeyForm({ ...keyForm, description: e.target.value })}
                  placeholder="Brief description of this translation key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultValue">Default Value *</Label>
                <Textarea
                  id="defaultValue"
                  value={keyForm.defaultValue}
                  onChange={(e) => setKeyForm({ ...keyForm, defaultValue: e.target.value })}
                  placeholder="Default text in English"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPlural"
                  checked={keyForm.isPlural}
                  onCheckedChange={(checked) => setKeyForm({ ...keyForm, isPlural: checked })}
                />
                <Label htmlFor="isPlural">Plural form (use | to separate singular and plural)</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowKeyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {editingKey ? "Update Key" : "Add Key"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Translation Modal */}
        <Dialog open={showTranslationModal} onOpenChange={setShowTranslationModal}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>{editingTranslation ? "Edit Translation" : "Add New Translation"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleTranslationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="translationKey">Translation Key *</Label>
                  <Select
                    value={translationForm.key}
                    onValueChange={(value) => {
                      const key = translationKeys.find((k) => k.key === value)
                      setTranslationForm({
                        ...translationForm,
                        key: value,
                        category: key?.category || "",
                        isPlural: key?.isPlural || false,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select translation key" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {translationKeys.map((key) => (
                        <SelectItem key={key.key} value={key.key}>
                          {key.key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languageCode">Language *</Label>
                  <Select
                    value={translationForm.languageCode}
                    onValueChange={(value) => setTranslationForm({ ...translationForm, languageCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {languages
                        .filter((lang) => lang.code !== "en")
                        .map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.flag} {language.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="translationValue">Translation *</Label>
                <Textarea
                  id="translationValue"
                  value={translationForm.value}
                  onChange={(e) => setTranslationForm({ ...translationForm, value: e.target.value })}
                  placeholder="Enter the translation"
                  rows={3}
                  required
                />
                {translationForm.isPlural && (
                  <p className="text-sm text-gray-500">
                    For plural forms, use | to separate singular and plural (e.g., "1 item|2 items")
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Context (Optional)</Label>
                <Input
                  id="context"
                  value={translationForm.context}
                  onChange={(e) => setTranslationForm({ ...translationForm, context: e.target.value })}
                  placeholder="Additional context for translators"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowTranslationModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTranslation ? "Update Translation" : "Add Translation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
