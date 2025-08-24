"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Globe, Trash2, Save, RotateCcw,
  Loader2
} from "lucide-react"
import { Loader } from "@/components/PageComponentSkeletonLoader"
import api from "@/utils/api"
import dynamic from "next/dynamic"

// --- Dynamically import Monaco Editor (no SSR) ---
const MonacoEditor = dynamic(() => import("react-monaco-editor"), { ssr: false })


export default function InternationalizationPage() {
  const [languages, setLanguages] = useState<string[]>([])
  const [translations, setTranslations] = useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [jsonEditorContent, setJsonEditorContent] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      setLoading(true)
      const res = await api(`/api/admin/i18n/locales`)
      const data = await res.json()
      setLanguages(data.locales || [])

      const allTranslations: Record<string, Record<string, any>> = {}
      for (const locale of data.locales) {
        const resp = await api(`/api/admin/i18n/${locale}`)
        allTranslations[locale] = await resp.json()
      }
      setTranslations(allTranslations)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to fetch languages", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleTranslationSubmit = async (locale: string) => {
    try {
      setSubmitting(true)
      const parsed = JSON.parse(jsonEditorContent)
      const res = await api(`/api/admin/i18n/${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) throw new Error("Failed to save translation")

      const saved = await res.json()
      setTranslations((prev) => ({ ...prev, [locale]: saved.messages }))
      toast({ title: "Success", description: "Translation saved successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Invalid JSON or failed to save", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTranslations = async (locale: string) => {
    if (!confirm(`Delete all translations for ${locale}?`)) return
    try {
      await api(`/api/admin/i18n/${locale}`, { method: "DELETE" })
      setTranslations((prev) => {
        const copy = { ...prev }
        delete copy[locale]
        return copy
      })
      setLanguages((prev) => prev.filter((l) => l !== locale))
      toast({ title: "Success", description: `Deleted locale ${locale}` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete locale", variant: "destructive" })
    }
  }

  // Update JSON editor when selected language changes
  useEffect(() => {
    if (selectedLanguage && translations[selectedLanguage]) {
      setJsonEditorContent(JSON.stringify(translations[selectedLanguage], null, 2))
    }
  }, [selectedLanguage, translations])

  if (loading) return <Loader />

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Globe className="h-6 w-6" /> Internationalization Management
          </h1>
          <Button variant="outline" onClick={fetchLanguages} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Reload
          </Button>
        </div>

        {/* Language Selector */}
        <div className="flex gap-2">
          {languages.map((locale) => (
            <Button
              key={locale}
              variant={selectedLanguage === locale ? "default" : "outline"}
              onClick={() => setSelectedLanguage(locale)}
            >
              {locale.toUpperCase()}
            </Button>
          ))}
        </div>

        {selectedLanguage && (
          <div className="border rounded p-4 space-y-4">
            {/* <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{selectedLanguage.toUpperCase()} Translations</h2>
              <Button size="sm" onClick={() => deleteTranslations(selectedLanguage)} variant="outline" className="text-red-600">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div> */}

            {/* Monaco JSON Editor */}
            <div className="border rounded overflow-hidden h-[500px]">
              <MonacoEditor
                language="json"
                theme="vs-dark"
                value={jsonEditorContent}
                options={{
                  automaticLayout: true,
                  formatOnType: true,
                  formatOnPaste: true,
                  minimap: { enabled: false },
                }}
                onChange={(value) => setJsonEditorContent(value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleTranslationSubmit(selectedLanguage)} className="btn-primary flex items-center" disabled={submitting}>
                {submitting?
                <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving
                  </>
                :
                <>
                <Save className="h-4 w-4 mr-2" /> 
                Save
                </>
                  }
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
