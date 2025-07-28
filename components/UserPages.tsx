"use client"

import type React from "react"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, RotateCcw, Filter, Search, Eye, Edit, Trash2, ChevronDown } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the editor to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-md animate-pulse" />,
})

interface Page {
  id: number
  title: string
  slug: string
  content: string
  metaTitle: string
  metaDescription: string
  template: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function UserPages() {
  const [pages, setPages] = useState<Page[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState<Partial<Page>>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    template: "default",
    status: "published",
  })

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    setIsClient(true)
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const data = await (await api("/api/admin/pages")).json()
      setPages(data)
    } catch (error) {
      console.error("Error fetching pages:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPage) {
        await api(`/api/admin/pages/${editingPage.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
      } else {
        await api("/api/admin/pages", {
          method: "POST",
          body: JSON.stringify(formData),
        })
      }
      fetchPages()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving page:", error)
      alert(`Failed to save page: ${error}`)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPage(null)
    setFormData({
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      template: "default",
      status: "published",
    })
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      template: page.template,
      status: page.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await api(`/api/admin/pages/${id}`, {
          method: "DELETE",
        })
        fetchPages()
      } catch (error) {
        console.error("Error deleting page:", error)
        alert(`Failed to delete page: ${error}`)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleQuillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleSelectAll = () => {
    if (selectedPages.length === filteredPages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(filteredPages.map((page) => page.id))
    }
  }

  const handlePageSelect = (id: number) => {
    if (selectedPages.includes(id)) {
      setSelectedPages(selectedPages.filter((pageId) => pageId !== id))
    } else {
      setSelectedPages([...selectedPages, id])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPages.length > 0 && confirm(`Are you sure you want to delete ${selectedPages.length} pages?`)) {
      try {
        await Promise.all(selectedPages.map((id) => api(`/api/admin/pages/${id}`, { method: "DELETE" })))
        fetchPages()
        setSelectedPages([])
      } catch (error) {
        console.error("Error bulk deleting pages:", error)
        alert(`Failed to bulk delete pages: ${error}`)
      }
    }
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  }

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
  ]

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
            <span>PAGES</span>
          </div>
          <div className="flex gap-3">
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button variant="outline" onClick={fetchPages} className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Bulk Actions
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page List */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>TEMPLATE</TableHead>
                <TableHead>CREATED AT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="w-32">OPERATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => handlePageSelect(page.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{page.id}</TableCell>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.template}</TableCell>
                  <TableCell>{new Date(page.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/page/${page.slug}`, "_blank")}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(page)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No pages found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              Show from 1 to {filteredPages.length} in {filteredPages.length} records
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  5 <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>5</DropdownMenuItem>
                <DropdownMenuItem>10</DropdownMenuItem>
                <DropdownMenuItem>20</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        {/* Modal for Creating/Editing Page */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Page" : "Create Page"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title || ""} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., about-us"
                    value={formData.slug || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                {isClient && (
                  <div className="bg-white rounded-md border">
                    <ReactQuill
                      theme="snow"
                      value={formData.content || ""}
                      onChange={handleQuillChange}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: "200px" }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" value={formData.metaTitle || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Input id="metaDescription" value={formData.metaDescription || ""} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={formData.template || "default"}
                    onValueChange={(value) => handleSelectChange("template", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || "published"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button type="submit">Save Page</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
