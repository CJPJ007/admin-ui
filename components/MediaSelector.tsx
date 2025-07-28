"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FolderPlus, RotateCcw, Filter, Globe, SortAsc, Search, ImagePlus, X, Plus } from "lucide-react"
import api from "@/utils/api"
import FileCard from "@/components/FileCard"

export interface MediaFile {
  id: number
  name: string
  type: string
  folder: string
  filePath: string
}

export interface SelectedItem {
  type: "folder" | "file"
  name: string
  id?: number
  folder?: string
}

interface MediaSelectorProps {
  label: string
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  multipleUpload?: boolean
  maxImages?: number
}

export default function MediaSelector({
  label,
  value,
  onChange,
  multipleUpload = false,
  maxImages = 10,
}: MediaSelectorProps) {
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [folders, setFolders] = useState<MediaFile[]>([])
  const [files, setFiles] = useState<MediaFile[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>("/")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilter, setCurrentFilter] = useState("everything")
  const [currentView, setCurrentView] = useState("all")
  const [currentSort, setCurrentSort] = useState("asc")

  // Convert value to array for consistent handling
  const selectedImages = Array.isArray(value) ? value : value ? [value] : []

  useEffect(() => {
    if (showMediaModal) {
      fetchFiles(currentFolder)
    }
  }, [showMediaModal, currentFilter, currentView, currentSort, currentFolder])

  const fetchFiles = async (folder: string) => {
    try {
      const response = await api(`/api/media/files?filePath=${folder}&view=${currentView}`)
      const data = await response.json()
      if (data.success) {
        const fetchedFilesAndFolders = data.files
        const fetchedFiles: MediaFile[] = fetchedFilesAndFolders.filter(
          (file: MediaFile) => file.name != null && file.name.trim() !== "",
        )
        const fetchedFolders: MediaFile[] = fetchedFilesAndFolders
          .filter((file: MediaFile) => file.name == null || file.name.trim() === "")
          .map((folder: MediaFile) => ({
            folder: folder.folder,
            filePath: folder.filePath,
          }))

        if (currentSort === "asc") {
          fetchedFiles.sort((a: MediaFile, b: MediaFile) => a.name?.localeCompare(b.name))
        } else if (currentSort === "desc") {
          fetchedFiles.sort((a: MediaFile, b: MediaFile) => b.name?.localeCompare(a.name))
        }

        setFolders(fetchedFolders)
        setFiles(fetchedFiles)
      }
    } catch (error) {
      console.error(`Error fetching files for ${currentFolder}:`, error)
    }
  }

  const handleFileSelect = (file: MediaFile) => {
    const imagePath = `${currentFolder}${file.name}`

    if (multipleUpload) {
      const currentImages = Array.isArray(value) ? value : value ? [value] : []
      if (!currentImages.includes(imagePath) && currentImages.length < maxImages) {
        onChange([...currentImages, imagePath])
      }
    } else {
      onChange(imagePath)
      setShowMediaModal(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    if (multipleUpload && Array.isArray(value)) {
      const newImages = value.filter((_, i) => i !== index)
      onChange(newImages)
    } else {
      onChange("")
    }
  }

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter new folder name:")
    if (folderName) {
      try {
        const response = await api("/api/media/folders", {
          method: "POST",
          body: JSON.stringify({
            folderName: `${folderName}`,
            folderPath: currentFolder,
          }),
        })
        const data = await response.json()
        if (data.success) {
          fetchFiles(currentFolder)
        } else {
          alert(`Failed to create folder: ${data.message}`)
        }
      } catch (error) {
        console.error("Error creating folder:", error)
        alert(`Error creating folder: ${error}`)
      }
    }
  }

  const filteredFolders = folders.filter((folder) => folder.folder.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredFiles = files.filter((file) => file.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  const renderBreadcrumb = () => (
    <nav className="mb-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <Button
          variant="link"
          className={`p-0 h-auto ${currentFolder ? "text-blue-600 hover:text-blue-800" : "text-gray-500"}`}
          onClick={() => setCurrentFolder("/")}
        >
          Media
        </Button>
        {currentFolder && <span>{currentFolder}</span>}
      </div>
    </nav>
  )

  const renderFolders = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {filteredFolders.map((folder) => (
        <Card
          key={folder.folder}
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          onClick={() => setCurrentFolder(`${currentFolder} ${folder.folder} /`)}
        >
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full">{folder.folder}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderFiles = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredFiles.map((file) => (
        <div key={file.id} onClick={() => handleFileSelect(file)}>
          <FileCard
            file={file}
            selectedItems={[]}
            showCheckboxes={false}
            handleItemSelect={() => {}}
            currentFolder={currentFolder}
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

      {/* Single Image Display */}
      {!multipleUpload && (
        <div className="space-y-2">
          {selectedImages.length > 0 ? (
            <div className="relative inline-block">
              <img
                src={`/images/${selectedImages[0]}` || "/placeholder.svg"}
                alt="Selected image"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={() => handleRemoveImage(0)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Card
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
              onClick={() => setShowMediaModal(true)}
            >
              <CardContent className="flex flex-col items-center justify-center py-8 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-center">Click here to add more images.</p>
              </CardContent>
            </Card>
          )}
          <div>
          {selectedImages.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowMediaModal(true)}>
              Change Image
            </Button>
          )}
          </div>
        </div>
      )}

      {/* Multiple Images Display */}
      {multipleUpload && (
        <div className="space-y-4">
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={`/images/${image}` || "/placeholder.svg"}
                      alt={`Selected image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {selectedImages.length === 0 && (
            <Card
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
              onClick={() => setShowMediaModal(true)}
            >
              <CardContent className="flex flex-col items-center justify-center py-8 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-center">Click here to add more images.</p>
              </CardContent>
            </Card>
          )}

          {selectedImages.length > 0 && selectedImages.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Images ({selectedImages.length}/{maxImages})
            </Button>
          )}
        </div>
      )}

      {/* Media Library Modal */}
      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="bg-white max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select from Media Library</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {renderBreadcrumb()}

            {/* Media Controls */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCreateFolder}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => fetchFiles(currentFolder)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {currentFilter}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setCurrentFilter("everything")}>Everything</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentFilter("image")}>Images</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentFilter("video")}>Videos</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {currentView}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setCurrentView("all")}>All media</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView("recent")}>Recent</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                        >
                          <SortAsc className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setCurrentSort("asc")}>A-Z</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentSort("desc")}>Z-A</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div className="space-y-6">
              {filteredFolders.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Folders</h3>
                  {renderFolders()}
                </div>
              )}

              {filteredFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Files</h3>
                  {renderFiles()}
                </div>
              )}

              {filteredFiles.length === 0 && filteredFolders.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No files or folders found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMediaModal(false)}>
              Close
            </Button>
            {multipleUpload && (
              <Button onClick={() => setShowMediaModal(false)}>Done ({selectedImages.length} selected)</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
