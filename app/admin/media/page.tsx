"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import FileCard from "@/components/FileCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Upload,
  FolderPlus,
  RotateCcw,
  Filter,
  Globe,
  SortAsc,
  Hand,
  Search,
  Trash2,
  AlertTriangle,
} from "lucide-react"

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

export default function Media() {
  const [folders, setFolders] = useState<MediaFile[]>([])
  const [files, setFiles] = useState<MediaFile[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>("/")
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [showCheckboxes, setShowCheckboxes] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilter, setCurrentFilter] = useState("everything")
  const [currentView, setCurrentView] = useState("all")
  const [currentSort, setCurrentSort] = useState("asc")
  const [viewMode, setViewMode] = useState("grid")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null)

  useEffect(() => {
    fetchFiles(currentFolder)
  }, [currentFilter, currentView, currentSort, currentFolder])

  const fetchFiles = async (folder: string) => {
    try {
      const response = await api(`/api/media/files?filePath=${folder}&view=${currentView}&sortDir=${currentSort}`)
      const data = await response.json()
      if (data.success) {
        const fetchedFilesAndFolders = data.files
        const fetchedFiles: MediaFile[] = fetchedFilesAndFolders.filter(
          (file: MediaFile) => file.name != null && file.name.trim() !== "",
        )
        const fetchedFolders: MediaFile[] = fetchedFilesAndFolders
          .filter((file: MediaFile) => file.name == null || file.name.trim() === "")
          .map((folder: MediaFile) => {
            return { folder: folder.folder, filePath: folder.filePath }
          })
        if (currentSort === "asc") {
          fetchedFiles.sort((a: MediaFile, b: MediaFile) => a.name?.localeCompare(b.name))
        } else if (currentSort === "desc") {
          fetchedFiles.sort((a: MediaFile, b: MediaFile) => b.name?.localeCompare(a.name))
        }
        setFolders(fetchedFolders)
        setFiles(fetchedFiles)
      } else {
        console.error(`Failed to fetch files for ${currentFolder}:`, data.message)
      }
    } catch (error) {
      console.error(`Error fetching files for ${currentFolder}:`, error)
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

  const handleSelectAll = () => {
    let allItems: SelectedItem[] = []

    // Add all folders to selection
    allItems = allItems.concat(
      folders.map((folder) => ({
        type: "folder" as const,
        name: folder.folder,
      })),
    )

    // Add all files to selection
    allItems = allItems.concat(
      files.map((file) => ({
        type: "file" as const,
        name: file.name,
        id: file.id,
        folder: currentFolder,
      })),
    )

    if (selectedItems.length === allItems.length) {
      setSelectedItems([])
      setShowCheckboxes(false)
    } else {
      setSelectedItems(allItems)
      setShowCheckboxes(true)
    }
  }

  const handleItemSelect = (item: SelectedItem) => {
    const isAlreadySelected = selectedItems.find((i) => {
      if (item.type === "folder") {
        return i.name === item.name && i.type === item.type
      } else {
        return i.id === item.id && i.type === item.type
      }
    })

    if (isAlreadySelected) {
      const newSelection = selectedItems.filter((i) => {
        if (item.type === "folder") {
          return !(i.name === item.name && i.type === item.type)
        } else {
          return !(i.id === item.id && i.type === item.type)
        }
      })
      setSelectedItems(newSelection)
      if (newSelection.length === 0) {
        setShowCheckboxes(false)
      }
    } else {
      setSelectedItems([...selectedItems, item])
      setShowCheckboxes(true)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return

    const foldersToDelete = selectedItems.filter((item) => item.type === "folder").map((item) => item.name)
    const filesToDelete = selectedItems
      .filter((item) => item.type === "file")
      .map((item) => ({ folder: item.folder, name: item.name }))

    try {
      const response = await api("/api/media/delete", {
        method: "POST",
        body: JSON.stringify({
          folders: foldersToDelete,
          files: filesToDelete,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSelectedItems([])
        setShowCheckboxes(false)
        setShowDeleteDialog(false)
        fetchFiles(currentFolder)
      } else {
        alert(`Failed to delete items: ${data.message}`)
      }
    } catch (error) {
      console.error("Error deleting items:", error)
      alert(`Error deleting items: ${error}`)
    }
  }

  const handleUpload = async () => {
    if (!filesToUpload || filesToUpload.length === 0) {
      alert("Please select files to upload.")
      return
    }
    setUploading(true)

    const formData = new FormData()
    let type = "image/png"
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append("files", filesToUpload[i])
      if (filesToUpload[i].type) {
        type = filesToUpload[i].type
      }
    }
    formData.append("folder", currentFolder.split(" /")[currentFolder.split(" /").length - 1])
    formData.append("filePath", currentFolder)
    formData.append("type", type)
    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        alert("Files uploaded successfully!")
        setShowUploadModal(false)
        setFilesToUpload(null)
        fetchFiles(currentFolder)
      } else {
        alert(`Upload failed: ${result.message}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert(`An error occurred during upload: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  const filteredFolders = folders.filter((folder) => folder.folder.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredFiles = files.filter((file) => file.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  const renderBreadcrumb = () => (
    <nav className="mb-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
          Dashboard
        </Button>
        <span className="mx-2">/</span>
        <Button
          variant="link"
          className={`p-0 h-auto ${currentFolder ? "text-blue-600 hover:text-blue-800" : "text-gray-500"}`}
          onClick={() => setCurrentFolder("/")}
        >
          Media 
        </Button>
        {currentFolder && currentFolder.split(" /").length > 1 && (
          currentFolder
            .split(" /").map((folder, index, arr) => {
              console.log(folder, index, arr);
              if (folder === "") return null
              const isLast = index === arr.length - 2
              const pathUpToFolder =arr.slice(0, index +1).join(" /") + " /"
              return (
                <span key={index} className="inline-flex items-center">
                  <Button
                    variant="link"
                    className={`p-0 h-auto ${isLast ? "text-gray-500" : "text-blue-600 hover:text-blue-800"}`}
                    onClick={() => {
                      if (!isLast) {
                        setCurrentFolder(pathUpToFolder)
                      }
                    }}
                  >
                    {folder}
                  </Button>
                  {!isLast && <span className="mx-2">/</span>}
                </span>
              )
            })
          // <span className="mx-2">/</span>
        )}
        {/* {currentFolder && <span>{currentFolder}</span>} */}
      </div>
    </nav>
  )

  const renderFolders = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredFolders.map((folder) => {
        const isSelected = selectedItems.find((i) => i.name === folder.folder && i.type === "folder")

        return (
          <Card
            key={folder.folder}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 relative ${
              isSelected ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardContent className="p-4 text-center">
              {/* Checkbox - Always visible when showCheckboxes is true or item is selected */}
              {(showCheckboxes || isSelected) && (
                <Checkbox
                  className="absolute top-2 left-2 z-10"
                  checked={!!isSelected}
                  onCheckedChange={() => handleItemSelect({ type: "folder", name: folder.folder })}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <div
                className="flex flex-col items-center space-y-2"
                onClick={() => {
                  if (showCheckboxes) {
                    handleItemSelect({ type: "folder", name: folder.folder })
                  } else {
                    setCurrentFolder(`${currentFolder} ${folder.folder} /`)
                  }
                }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full">{folder.folder}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderFiles = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredFiles.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          selectedItems={selectedItems}
          showCheckboxes={showCheckboxes}
          handleItemSelect={handleItemSelect}
          currentFolder={currentFolder}
        />
      ))}
    </div>
  )

  return (
    <AdminLayout>
      <div className="p-6">
        {renderBreadcrumb()}

        {/* Media Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </DialogTrigger>
                </Dialog>

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
                    <DropdownMenuItem onClick={() => setCurrentView("trash")}>Trash</DropdownMenuItem>
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Hand className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleSelectAll}>
                      {selectedItems.length === filteredFiles.length + filteredFolders.length &&
                      filteredFiles.length + filteredFolders.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedItems([])
                        setShowCheckboxes(false)
                      }}
                    >
                      Clear Selection
                    </DropdownMenuItem>
                    {selectedItems.length > 0 && (
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedItems.length})
                      </DropdownMenuItem>
                    )}
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

        {/* Selection Info */}
        {selectedItems.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItems([])
                      setShowCheckboxes(false)
                    }}
                  >
                    Clear Selection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <div className="space-y-6">
          {filteredFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Files</h3>
              {renderFiles()}
            </div>
          )}

          {filteredFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Folders</h3>
              {renderFolders()}
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

        {/* Upload Modal */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="files">Select Files</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={(e) => setFilesToUpload(e.target.files)}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                  Close
                </Button>
                <Button onClick={handleUpload} disabled={uploading} className="btn-primary">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to delete {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 font-medium text-sm">
                    ⚠️ This action cannot be undone. The selected files and folders will be permanently deleted.
                  </p>
                </div>
                {selectedItems.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Items to be deleted:</p>
                    <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-2">
                      {selectedItems.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600 py-1">
                          {item.type === "folder" ? "📁" : "📄"} {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Footer */}
        <div className="flex justify-between items-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t mt-8">
          <span>Copyright © 2025 Ananta Realty. Version 1.0.0</span>
          <span>Page loaded in 0.99 seconds</span>
        </div>
      </div>
    </AdminLayout>
  )
}
