"use client";

import type React from "react";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Filter, Plus, RotateCcw, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import RichTextEditor from "./RichTextEditor";
import { Blog, FilterType } from "@/utils/interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { convertToSearchCriteriaList } from "@/lib/utils";
import MediaSelector from "./MediaSelector";
import { set } from "date-fns";

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    thumbnailImage: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", operator: "equals", value: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    setIsClient(true);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const searchCriteriaList = convertToSearchCriteriaList(filters);
    const data = await (
      await api(
        `/api/fieldSearch/advancedSearch/Blog?page=${currentPage}&size=${itemsPerPage}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        }
      )
    ).json();
    setBlogs(data.data);
    setTotalRecords(data.totalRecords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/blogs/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await api("/api/admin/blogs", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      fetchBlogs();
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert(`Failed to save blog: ${error}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  const handleRteChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleEdit = (blog: Blog) => {
    setFormData(blog);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleThumbnailChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      thumbnailImage: Array.isArray(value) ? value[0] || "" : value,
    });
  };

  const deleteBlog = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await api(`/api/admin/blogs/${id}`, {
          method: "DELETE",
        });
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert(`Failed to delete blog: ${error}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      status: "published",
    });
    setIsEditing(false);
    setShowCreateModal(false);
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const updateFilter = (
    index: number,
    key: keyof FilterType,
    value: string
  ) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };

  const applyFilters = () => {
    fetchBlogs();
    setShowFilters(false);
    setFilters([{ field: "", operator: "equals", value: "" }]);
  };

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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

                <Dialog
                  open={showCreateModal}
                  onOpenChange={setShowCreateModal}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-2 btn-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Create
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => {
                    fetchBlogs();
                    setCurrentPage(1); // Reset to first page on reload
                    setFilters([{ field: "", operator: "equals", value: "" }]); // Reset filters on reload
                    setShowFilters(false); // Hide filters panel on reload
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-3 mb-3 items-center">
                  <Select
                    value={filter.field}
                    onValueChange={(value) =>
                      updateFilter(index, "field", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="title"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Title
                      </SelectItem>
                      <SelectItem
                        value="type"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Type
                      </SelectItem>
                      <SelectItem
                        value="location"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Location
                      </SelectItem>
                      <SelectItem
                        value="price"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Price
                      </SelectItem>
                      <SelectItem
                        value="featured"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Featured
                      </SelectItem>
                      <SelectItem
                        value="sold"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Sold
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) =>
                      updateFilter(index, "operator", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="equals"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Is equal to
                      </SelectItem>
                      <SelectItem
                        value="contains"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Contains
                      </SelectItem>
                      <SelectItem
                        value="beginsWith"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Begins With
                      </SelectItem>
                      <SelectItem
                        value="endsWith"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Ends With
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(index, "value", e.target.value)
                    }
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
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>
                      <img
                        src={
                          `/images/${blog.thumbnailImage}` ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={blog.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="text-gray-600">{blog.slug}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          blog.status === "published"
                            ? "bg-green-500"
                            : "bg-yellow-500"} text-white`}
                      >
                        {blog.status.toLocaleUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(blog)}
                        >
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
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
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
              Show from {startIndex + 1} to {Math.min(endIndex, totalRecords)}{" "}
              in {totalRecords} records
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-primary"
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-primary"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] bg-white overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Blog" : "Add New Blog"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                  />
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
                    {/* <ReactQuill
                      theme="snow"
                      value={formData.content || ""}
                      onChange={handleRteChange}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: "200px" }}
                    /> */}
                    <RichTextEditor
                      onChange={handleRteChange}
                      value={formData.content || ""}
                    />
                  </div>
                )}
              </div>

              {/* Property Images Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Property Images
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload thumbnail image for the blog
                  </p>
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
                <Select
                  value={formData.status || "published"}
                  onValueChange={handleSelectChange}
                >
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
                <p className="text-sm text-gray-600">
                  Add/Update below tags for the seo
                </p>
              </div>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Input
                      id="metaDescription"
                      value={formData.metaDescription || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="btn-primary">
                  {isEditing ? "Update Blog" : "Add Blog"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
