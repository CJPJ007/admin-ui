"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Filter, Plus, RotateCcw, Trash2, X } from "lucide-react"
import type { Blog, FilterType } from "@/utils/interfaces"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { convertToSearchCriteriaList } from "@/lib/utils"
import RichTextEditor from "@/components/RichTextEditor"
import MediaSelector from "@/components/MediaSelector"

export default function Blogs() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    thumbnailImage: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterType[]>([{ field: "", operator: "equals", value: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    fetchBlogs()
  }, [currentPage])

  // Handle URL parameters for edit functionality
  useEffect(() => {
    const editParam = searchParams.get("edit")
    const idParam = searchParams.get("id")
    const createParam = searchParams.get("create")

    if (editParam === "true" && idParam) {
      const blogId = Number.parseInt(idParam)
      if (!isNaN(blogId)) {
        // Find blog and open edit modal
        const blog = blogs.find((b) => b.id === blogId)
        if (blog) {
          handleEditWithUrl(blog)
        } else {
          // If blog not found in current list, fetch it
          fetchBlogById(blogId)
        }
      }
    } else if (createParam === "true") {
      resetForm()
      setShowCreateModal(true)
    }
  }, [searchParams, blogs])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters)
      const data = await (
        await api(`/api/fieldSearch/advancedSearch/Blog?page=${currentPage}&size=${itemsPerPage}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        })
      ).json()
      setBlogs(data.data || [])
      setTotalRecords(data.totalRecords || 0)
    } catch (error) {
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogById = async (blogId: number) => {
    try {
      const response = await api(`/api/admin/blogs/${blogId}`)
      const blog = await response.json()
      if (blog) {
        handleEditWithUrl(blog)
      }
    } catch (error) {
      console.error("Error fetching blog:", error)
      // Clear URL params if blog not found
      router.replace("/admin/blogs")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/blogs/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
      } else {
        await api("/api/admin/blogs", {
          method: "POST",
          body: JSON.stringify(formData),
        })
      }
      fetchBlogs()
      resetForm()
      router.replace("/admin/blogs")
    } catch (error) {
      console.error("Error saving blog:", error)
      alert(`Failed to save blog: ${error}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      status: value,
    })
  }

  const handleRteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleEditWithUrl = (blog: Blog) => {
    // Update URL with edit parameters
    router.push(`/admin/blogs?edit=true&id=${blog.id}`)
    setFormData(blog)
    setIsEditing(true)
    setShowCreateModal(true)
  }

  const handleEdit = (blog: Blog) => {
    handleEditWithUrl(blog)
  }

  const handleThumbnailChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      thumbnailImage: Array.isArray(value) ? value[0] || "" : value,
    })
  }

  const deleteBlog = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await api(`/api/admin/blogs/${id}`, {
          method: "DELETE",
        })
        fetchBlogs()
      } catch (error) {
        console.error("Error deleting blog:", error)
        alert(`Failed to delete blog: ${error}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      thumbnailImage: "",
    })
    setIsEditing(false)
  }

  const handleCreateWithUrl = () => {
    router.push("/admin/blogs?create=true")
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    resetForm()
    // Clear URL params when closing modal
    router.replace("/admin/blogs")
  }

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }])
  }

  const updateFilter = (index: number, key: keyof FilterType, value: string) => {
    const newFilters = [...filters]
    newFilters[index][key] = value
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index))
    }
  }

  const applyFilters = () => {
    fetchBlogs()
    setShowFilters(false)
    setCurrentPage(1)
  }

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-16 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-5">Blogs</h1>

          {/* Action Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button onClick={handleCreateWithUrl} className="flex items-center gap-2 btn-primary">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    fetchBlogs()
                    setCurrentPage(1)
                    setFilters([{ field: "", operator: "equals", value: "" }])
                    setShowFilters(false)
                  }}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-3 mb-3 items-center">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(index, "field", value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="slug">Slug</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="metaTitle">Meta Title</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter.operator} onValueChange={(value) => updateFilter(index, "operator", value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="equals">Is equal to</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="beginsWith">Begins With</SelectItem>
                      <SelectItem value="endsWith">Ends With</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(index, "value", e.target.value)}
                    className="w-48"
                  />

                  {filters.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={addFilter}>
                  Add additional filter
                </Button>
                <Button onClick={applyFilters} className="btn-primary">
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog List */}
        <Card>
          <CardHeader>
            <CardTitle>Blogs List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published At</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell
                      className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleEdit(blog)}
                    >
                      {blog.title}
                    </TableCell>
                    <TableCell>
                      <img
                        src={
                          blog.thumbnailImage ? `/images/${blog.thumbnailImage}` : "/placeholder.svg?height=40&width=40"
                        }
                        alt={blog.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="text-gray-600">{blog.slug}</TableCell>
                    <TableCell>
                      <Badge className={`${blog.status === "published" ? "bg-green-500" : "bg-yellow-500"} text-white`}>
                        {blog.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteBlog(blog.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {blogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No blogs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              Show from {startIndex + 1} to {Math.min(endIndex, totalRecords)} in {totalRecords} records
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Create/Edit Blog Modal */}
        <Dialog
          open={showCreateModal}
          onOpenChange={(open) => {
            if (!open) handleCloseModal()
            else setShowCreateModal(true)
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Blog" : "Add New Blog"}</DialogTitle>
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
                    placeholder="e.g., top-5-tips"
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
                    <RichTextEditor onChange={handleRteChange} value={formData.content || ""} />
                  </div>
                )}
              </div>

              {/* Property Images Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">Blog Images</h3>
                  <p className="text-sm text-gray-600">Upload thumbnail image for the blog</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <MediaSelector
                    label="Thumbnail Image"
                    value={formData.thumbnailImage}
                    onChange={handleThumbnailChange}
                    multipleUpload={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || "draft"} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">SEO Tags</h3>
                <p className="text-sm text-gray-600">Add/Update below tags for the SEO</p>
              </div>
              <div>
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
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="btn-primary">
                  {isEditing ? "Update Blog" : "Add Blog"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
