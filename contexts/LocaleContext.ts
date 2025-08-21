"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Language {
  code: string
  name: string
  flag: string
  direction: "ltr" | "rtl"
  isEnabled: boolean
  isDefault: boolean
}

interface Translation {
  [key: string]: string | Translation
}

interface LocaleContextType {
  currentLanguage: string
  languages: Language[]
  translations: Translation
  direction: "ltr" | "rtl"
  setLanguage: (languageCode: string) => void
  t: (key: string, params?: Record<string, any>) => string
  isLoading: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
  defaultLanguage?: string
}

export function LocaleProvider({ children, defaultLanguage = "en" }: LocaleProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage)
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load available languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        // Mock data - replace with actual API call
        const mockLanguages: Language[] = [
          {
            code: "en",
            name: "English",
            flag: "🇺🇸",
            direction: "ltr",
            isEnabled: true,
            isDefault: true,
          },
          {
            code: "es",
            name: "Spanish",
            flag: "🇪🇸",
            direction: "ltr",
            isEnabled: true,
            isDefault: false,
          },
          {
            code: "fr",
            name: "French",
            flag: "🇫🇷",
            direction: "ltr",
            isEnabled: true,
            isDefault: false,
          },
          {
            code: "ar",
            name: "Arabic",
            flag: "🇸🇦",
            direction: "rtl",
            isEnabled: true,
            isDefault: false,
          },
        ]

        setLanguages(mockLanguages.filter((lang) => lang.isEnabled))

        // Set default language from available languages
        const defaultLang = mockLanguages.find((lang) => lang.isDefault)
        if (defaultLang) {
          setCurrentLanguage(defaultLang.code)
        }
      } catch (error) {
        console.error("Error loading languages:", error)
      }
    }

    loadLanguages()
  }, [])

  // Load translations for current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true)

        // Mock translations - replace with actual API call
        const mockTranslations: Record<string, Translation> = {
          en: {
            common: {
              welcome: "Welcome to our platform",
              loading: "Loading...",
              error: "An error occurred",
              success: "Success",
              cancel: "Cancel",
              save: "Save",
              delete: "Delete",
              edit: "Edit",
              add: "Add",
              search: "Search",
              filter: "Filter",
              export: "Export",
              import: "Import",
            },
            navigation: {
              home: "Home",
              dashboard: "Dashboard",
              settings: "Settings",
              profile: "Profile",
              logout: "Logout",
              admin: "Admin",
            },
            forms: {
              submit: "Submit",
              reset: "Reset",
              required: "This field is required",
              email: "Email",
              password: "Password",
              name: "Name",
              phone: "Phone",
              address: "Address",
            },
            messages: {
              items_count: "{count} item|{count} items",
              no_data: "No data available",
              confirm_delete: "Are you sure you want to delete this item?",
              saved_successfully: "Saved successfully",
              deleted_successfully: "Deleted successfully",
            },
          },
          es: {
            common: {
              welcome: "Bienvenido a nuestra plataforma",
              loading: "Cargando...",
              error: "Ocurrió un error",
              success: "Éxito",
              cancel: "Cancelar",
              save: "Guardar",
              delete: "Eliminar",
              edit: "Editar",
              add: "Agregar",
              search: "Buscar",
              filter: "Filtrar",
              export: "Exportar",
              import: "Importar",
            },
            navigation: {
              home: "Inicio",
              dashboard: "Panel",
              settings: "Configuración",
              profile: "Perfil",
              logout: "Cerrar sesión",
              admin: "Administrador",
            },
            forms: {
              submit: "Enviar",
              reset: "Restablecer",
              required: "Este campo es obligatorio",
              email: "Correo electrónico",
              password: "Contraseña",
              name: "Nombre",
              phone: "Teléfono",
              address: "Dirección",
            },
            messages: {
              items_count: "{count} elemento|{count} elementos",
              no_data: "No hay datos disponibles",
              confirm_delete: "¿Estás seguro de que quieres eliminar este elemento?",
              saved_successfully: "Guardado exitosamente",
              deleted_successfully: "Eliminado exitosamente",
            },
          },
          fr: {
            common: {
              welcome: "Bienvenue sur notre plateforme",
              loading: "Chargement...",
              error: "Une erreur est survenue",
              success: "Succès",
              cancel: "Annuler",
              save: "Enregistrer",
              delete: "Supprimer",
              edit: "Modifier",
              add: "Ajouter",
              search: "Rechercher",
              filter: "Filtrer",
              export: "Exporter",
              import: "Importer",
            },
            navigation: {
              home: "Accueil",
              dashboard: "Tableau de bord",
              settings: "Paramètres",
              profile: "Profil",
              logout: "Déconnexion",
              admin: "Administrateur",
            },
            forms: {
              submit: "Soumettre",
              reset: "Réinitialiser",
              required: "Ce champ est obligatoire",
              email: "E-mail",
              password: "Mot de passe",
              name: "Nom",
              phone: "Téléphone",
              address: "Adresse",
            },
            messages: {
              items_count: "{count} élément|{count} éléments",
              no_data: "Aucune donnée disponible",
              confirm_delete: "Êtes-vous sûr de vouloir supprimer cet élément?",
              saved_successfully: "Enregistré avec succès",
              deleted_successfully: "Supprimé avec succès",
            },
          },
          ar: {
            common: {
              welcome: "مرحباً بك في منصتنا",
              loading: "جاري التحميل...",
              error: "حدث خطأ",
              success: "نجح",
              cancel: "إلغاء",
              save: "حفظ",
              delete: "حذف",
              edit: "تعديل",
              add: "إضافة",
              search: "بحث",
              filter: "تصفية",
              export: "تصدير",
              import: "استيراد",
            },
            navigation: {
              home: "الرئيسية",
              dashboard: "لوحة التحكم",
              settings: "الإعدادات",
              profile: "الملف الشخصي",
              logout: "تسجيل الخروج",
              admin: "المدير",
            },
            forms: {
              submit: "إرسال",
              reset: "إعادة تعيين",
              required: "هذا الحقل مطلوب",
              email: "البريد الإلكتروني",
              password: "كلمة المرور",
              name: "الاسم",
              phone: "الهاتف",
              address: "العنوان",
            },
            messages: {
              items_count: "{count} عنصر|{count} عناصر",
              no_data: "لا توجد بيانات متاحة",
              confirm_delete: "هل أنت متأكد من أنك تريد حذف هذا العنصر؟",
              saved_successfully: "تم الحفظ بنجاح",
              deleted_successfully: "تم الحذف بنجاح",
            },
          },
        }

        setTranslations(mockTranslations[currentLanguage] || mockTranslations.en)
      } catch (error) {
        console.error("Error loading translations:", error)
        // Fallback to English translations
        setTranslations({})
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [currentLanguage])

  // Get current language direction
  const direction = languages.find((lang) => lang.code === currentLanguage)?.direction || "ltr"

  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Return key if translation not found
        return key
      }
    }

    if (typeof value !== "string") {
      return key
    }

    // Handle pluralization
    if (params && "count" in params && value.includes("|")) {
      const [singular, plural] = value.split("|")
      value = params.count === 1 ? singular : plural
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((param) => {
        value = value.replace(new RegExp(`{${param}}`, "g"), params[param])
      })
    }

    return value
  }

  // Set language function
  const setLanguage = (languageCode: string) => {
    const language = languages.find((lang) => lang.code === languageCode)
    if (language && language.isEnabled) {
      setCurrentLanguage(languageCode)

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("preferred-language", languageCode)
      }

      // Update document direction
      if (typeof document !== "undefined") {
        document.documentElement.dir = language.direction
        document.documentElement.lang = languageCode
      }
    }
  }

  // Load preferred language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferred-language")
      if (savedLanguage && languages.some((lang) => lang.code === savedLanguage && lang.isEnabled)) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [languages])

  // Update document direction when language changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = direction
      document.documentElement.lang = currentLanguage
    }
  }, [currentLanguage, direction])

  const value: LocaleContextType = {
    currentLanguage,
    languages,
    translations,
    direction,
    setLanguage,
    t,
    isLoading,
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}

// Hook for easy translation access
export function useTranslation() {
  const { t } = useLocale()
  return { t }
}
