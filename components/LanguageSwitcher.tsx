"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Globe, Check } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  showLabel?: boolean
  className?: string
}

export default function LanguageSwitcher({
  variant = "outline",
  size = "default",
  showLabel = true,
  className = "",
}: LanguageSwitcherProps) {
  const { currentLanguage, languages, setLanguage, isLoading } = useLocale()

  const currentLang = languages.find((lang) => lang.code === currentLanguage)

  if (isLoading || languages.length <= 1) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`flex items-center gap-2 ${className}`} disabled={isLoading}>
          {currentLang ? (
            <>
              <span className="text-lg">{currentLang.flag}</span>
              {showLabel && <span className="hidden sm:inline">{currentLang.name}</span>}
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              {showLabel && <span className="hidden sm:inline">Language</span>}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 bg-white">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {language.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
              {currentLanguage === language.code && <Check className="h-4 w-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
