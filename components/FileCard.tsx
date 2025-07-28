"use client"

import { useState } from "react"
import type { MediaFile, SelectedItem } from "@/app/admin/media/page"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, FileText, ImageIcon, Video, Music, Archive } from "lucide-react"

interface FileCardProps {
  file: MediaFile
  selectedItems: SelectedItem[]
  showCheckboxes: boolean
  handleItemSelect: (item: SelectedItem) => void
  currentFolder: string
}

export default function FileCard({
  file,
  selectedItems,
  showCheckboxes,
  handleItemSelect,
  currentFolder,
}: FileCardProps) {
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFolder + file.name).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="h-8 w-8 text-green-600" />
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <Video className="h-8 w-8 text-purple-600" />
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="h-8 w-8 text-orange-600" />
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="h-8 w-8 text-yellow-600" />
      default:
        return <FileText className="h-8 w-8 text-gray-600" />
    }
  }

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "bg-green-100 text-green-800"
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return "bg-purple-100 text-purple-800"
      case "mp3":
      case "wav":
      case "flac":
        return "bg-orange-100 text-orange-800"
      case "zip":
      case "rar":
      case "7z":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isImage = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return !["mp4", "avi", "mov", "wmv"].includes(extension || "")
  }

  const isSelected = selectedItems.find((i) => i.id === file.id && i.type === "file")

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 relative ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() =>
        handleItemSelect({
          type: "file",
          name: file.name,
          id: file.id,
          folder: currentFolder,
        })
      }
    >
      <CardContent className="p-4 text-center">
        {/* Checkbox - Always visible when showCheckboxes is true or item is selected */}
        {(showCheckboxes || isSelected) && (
          <Checkbox
            className="absolute top-2 left-2 z-10"
            checked={!!isSelected}
            onCheckedChange={() =>
              handleItemSelect({
                type: "file",
                name: file.name,
                id: file.id,
                folder: currentFolder,
              })
            }
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleCopy()
          }}
          className="absolute top-2 right-2 h-6 w-6 p-0 z-10"
          title="Copy file path"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
        </Button>

        <div className="flex flex-col items-center space-y-2">
          {/* Image preview or file icon */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {isImage(file.name) && !imageError ? (
              <img
                src={`/images/${currentFolder}${file.name}`}
                alt={file.name}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              getFileIcon(file.name)
            )}
          </div>

          <div className="w-full">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>
              {file.name}
            </p>
            <Badge variant="secondary" className={`text-xs mt-1 ${getFileTypeColor(file.name)}`}>
              {file.name.split(".").pop()?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
