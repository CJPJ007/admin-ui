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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Plus,
  RotateCcw,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import type { FilterType, Property } from "@/utils/interfaces";
import { convertToSearchCriteriaList } from "@/lib/utils";
import MediaSelector from "@/components/MediaSelector";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";

export default function Properties() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", operator: "equals", value: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | null;
    title: string;
    description: string;
    price: string;
    location: string;
    type: string;
    bedrooms: string;
    bathrooms: string;
    areaSqft: string;
    featured: string;
    sold: string;
    slug: string;
    latitude: string;
    longitude: string;
    seoTitle: string;
    seoDescription: string;
    images: string[];
    pinCode: string;
    thumbnailImage: string;
    virtualTourLink: string[];
    cents: string[];
    propertyOfTheMonth: string;
  }>({
    id: null,
    title: "",
    description: "",
    price: "",
    location: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    areaSqft: "",
    featured: "false",
    sold: "false",
    slug: "",
    latitude: "",
    longitude: "",
    seoTitle: "",
    seoDescription: "",
    images: [],
    pinCode: "",
    thumbnailImage: "",
    virtualTourLink: [""],
    cents: [],
    propertyOfTheMonth: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchProperties();
  }, [currentPage]);

  // Handle URL parameters
  useEffect(() => {
    const editParam = searchParams.get("edit");
    const idParam = searchParams.get("id");
    const createParam = searchParams.get("create");

    if (editParam === "true" && idParam) {
      const propertyId = Number.parseInt(idParam);
      if (!isNaN(propertyId)) {
        // Find property and open edit modal
        const property = properties.find((p) => p.id === propertyId);
        if (property) {
          handleEditWithUrl(property);
        } else {
          // If property not found in current list, fetch it
          fetchPropertyById(propertyId);
        }
      }
    } else if (createParam === "true") {
      resetForm();
      setShowCreateModal(true);
    }
  }, [searchParams, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters);
      const data = await (
        await api(
          `/api/fieldSearch/advancedSearch/Property?page=${currentPage}&size=${itemsPerPage}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchCriteriaList),
          }
        )
      ).json();
      setProperties(data.data || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyById = async (propertyId: number) => {
    try {
      const response = await api(`/api/admin/properties/${propertyId}`);
      const property = await response.json();
      if (property) {
        handleEditWithUrl(property);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      // Clear URL params if property not found
      router.replace("/admin/properties");
    }
  };

  const handleReload = async () => {
    setReloading(true);
    try {
      await fetchProperties();
      setCurrentPage(1);
      setFilters([{ field: "", operator: "equals", value: "" }]);
      setShowFilters(false);
    } finally {
      setReloading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        type: formData.type,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        areaSqft: Number(formData.areaSqft),
        featured: formData.featured === "true",
        sold: formData.sold === "true",
        slug: formData.slug,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        images: formData.images.map((img) => ({ imageUrl: img })),
        pinCode: Number(formData.pinCode),
        thumbnailImage: formData.thumbnailImage,
        virtualTourLink: formData.virtualTourLink
          .filter((link) => link.trim())
          .join("#VIDEO#"),
        cents: formData.cents.filter((link) => link.trim())
          .join("#CENTS#"),
        propertyOfTheMonth: formData.propertyOfTheMonth === "true",
      };

      if (isEditing && formData.id) {
        await api(`/api/admin/properties/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(propertyData),
        });
      } else {
        await api("/api/admin/properties", {
          method: "POST",
          body: JSON.stringify(propertyData),
        });
      }

      fetchProperties();
      resetForm();
      setShowCreateModal(false);
      router.replace("/admin/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      alert(`Failed to save property: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleThumbnailChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      thumbnailImage: Array.isArray(value) ? value[0] || "" : value,
    });
  };

  const handleImagesChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      images: Array.isArray(value) ? value : [value],
    });
  };

  const handleEditWithUrl = (property: Property) => {
    // Update URL with edit parameters
    router.push(`/admin/properties?edit=true&id=${property.id}`);
    setFormData({
      id: property.id,
      title: property.title,
      description: property.description,
      price: String(property.price),
      location: property.location,
      type: property.type,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      areaSqft: String(property.areaSqft),
      featured: String(property.featured),
      sold: String(property.sold),
      slug: property.slug,
      latitude: String(property.latitude),
      longitude: String(property.longitude),
      seoTitle: property.seoTitle,
      seoDescription: property.seoDescription,
      images: property.images.map((img) => img.imageUrl),
      pinCode: String(property.pinCode),
      thumbnailImage: property.thumbnailImage,
      virtualTourLink: property.virtualTourLink?.split("#VIDEO#") || [""],
      cents: property.cents.split("#CENTS#") || [""],
      propertyOfTheMonth: String(property.propertyOfTheMonth),
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleEdit = (property: Property) => {
    handleEditWithUrl(property);
  };

  const handleDelete = async (id: number | null) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await api(`/api/admin/properties/${id}`, {
          method: "DELETE",
        });
        fetchProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
        alert(`Failed to delete property: ${error}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      price: "",
      location: "",
      type: "",
      bedrooms: "",
      bathrooms: "",
      areaSqft: "",
      featured: "false",
      sold: "false",
      slug: "",
      latitude: "",
      longitude: "",
      seoTitle: "",
      seoDescription: "",
      images: [],
      pinCode: "",
      thumbnailImage: "",
      virtualTourLink: [""],
      cents: [""],
      propertyOfTheMonth: "",
    });
    setIsEditing(false);
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
    fetchProperties();
    setShowFilters(false);
  };

  const handleVirtualTourLinkChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const index = Number(event.target.dataset.index);
    const value = event.target.value;
    setFormData((prev) => {
      const updatedLinks = [...prev.virtualTourLink];
      updatedLinks[index] = value;
      return { ...prev, virtualTourLink: updatedLinks };
    });
  };

  const addVirtualTourLink = () => {
    setFormData({
      ...formData,
      virtualTourLink: [...formData.virtualTourLink, ""],
    });
  };
  

  const removeVirtualTourLink = (index: number) => {
    if (formData.virtualTourLink.length > 1) {
      const updatedLinks = formData.virtualTourLink.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, virtualTourLink: updatedLinks });
    }
  };

  const handleCentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const index = Number(event.target.dataset.index);
    const value = event.target.value;
    setFormData((prev) => {
      const updatedCents = [...prev.cents];
      updatedCents[index] = value;
      return { ...prev, cents: updatedCents };
    });
  };

  const addCent = () => {
    setFormData({
      ...formData,
      cents: [...formData.cents, ""],
    });
  };



  const removeCent = (index: number) => {
    if (formData.cents.length > 1) {
      const updatedCents = formData.cents.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, cents: updatedCents });
    }
  };

  const handleCreateWithUrl = () => {
    router.push("/admin/properties?create=true");
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
    // Clear URL params when closing modal
    router.replace("/admin/properties");
  };

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm tracking-wide text-gray-700 dark:text-gray-300">
            <Link
              href="/admin/dashboard"
              className="p-0 h-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>Properties</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
            Properties
          </h1>

          {/* Action Bar */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button
                  onClick={handleCreateWithUrl}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReload}
                  disabled={reloading}
                  className="flex items-center gap-2 btn-primary dark:border-gray-600 dark:text-gray-200"
                >
                  {reloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {reloading ? "Loading..." : "Reload"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    <SelectTrigger className="w-40 dark:bg-gray-900 dark:border-gray-600">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) =>
                      updateFilter(index, "operator", value)
                    }
                  >
                    <SelectTrigger className="w-32 dark:bg-gray-900 dark:border-gray-600">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="equals">Is equal to</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="beginsWith">Begins With</SelectItem>
                      <SelectItem value="endsWith">Ends With</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(index, "value", e.target.value)
                    }
                    className="w-48 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                  />

                  {filters.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={addFilter}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  Add additional filter
                </Button>
                <Button onClick={applyFilters} className="btn-primary">
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Table */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-20">IMAGE</TableHead>
                <TableHead>PROPERTIES</TableHead>
                <TableHead>PRICE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>LOCATION</TableHead>
                <TableHead className="w-32">OPERATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow
                  key={property.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <TableCell className="font-medium">{property.id}</TableCell>
                  <TableCell>
                    <img
                      src={
                        `/images/${property.thumbnailImage}` ||
                        "/placeholder.svg?height=40&width=40"
                      }
                      alt={property.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div
                        className="font-medium text-blue-600 cursor-pointer hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleEdit(property)}
                      >
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {property.bedrooms} bed, {property.bathrooms} bath
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {property.price.toLocaleString()} INR
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={property.sold ? "destructive" : "default"}
                      className="dark:bg-gray-600"
                    >
                      {property.sold ? "Sold" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                        className="dark:border-gray-600 dark:text-gray-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 dark:text-gray-400"
                  >
                    No properties found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Show from {startIndex + 1} to {Math.min(endIndex, totalRecords)}{" "}
              in {totalRecords} records
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn-primary dark:border-gray-600 dark:text-gray-200"
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="dark:border-gray-600 dark:text-gray-200"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-primary dark:border-gray-600 dark:text-gray-200"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Dialog modal also updated with dark mode */}
        <Dialog
          open={showCreateModal}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
            else setShowCreateModal(true);
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 overflow-y-auto border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isEditing ? "Edit Property" : "Create Property"}
              </DialogTitle>
            </DialogHeader>

            {/* ...rest of the form remains same, just add dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 to inputs, labels, selects */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter the basic details of the property
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Property Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter property title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Price (INR) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price in INR"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                  >
                    Description *
                  </Label>
                  {/* <Input
                  id="description"
                  placeholder="Enter property description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                /> */}
                  <RichTextEditor
                    onChange={(content) =>
                      handleInputChange({
                        target: { id: "description", value: content },
                      })
                    }
                    value={formData.description}
                  />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        Cent
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCent}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.cents.map((cent, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          placeholder="1Cent = 1000INR"
                          value={cent}
                          onChange={handleCentChange}
                          data-index={index}
                          className="flex-1 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCent(index)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
              </div>

              {/* Property Details Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Property Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Specify the property characteristics and location
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Location *
                    </Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Property Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleSelectChange("type", value)
                      }
                    >
                      <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="TownHouse">TownHouse</SelectItem>
                        <SelectItem value="Luxury">Luxury</SelectItem>{" "}
                        <SelectItem value="Luxury">Luxury</SelectItem>
                        <SelectItem value="Plot">Plot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pinCode"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Pin Code *
                    </Label>
                    <Input
                      id="pinCode"
                      placeholder="Enter pin code"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bedrooms"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Bedrooms
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="Number of bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bathrooms"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Bathrooms
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="Number of bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="areaSqft"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Area (sqft) *
                    </Label>
                    <Input
                      id="areaSqft"
                      type="number"
                      placeholder="Area in square feet"
                      value={formData.areaSqft}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Property Images Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Property Images
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Upload thumbnail and gallery images for the property
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MediaSelector
                    label="Thumbnail Image"
                    value={formData.thumbnailImage}
                    onChange={handleThumbnailChange}
                    multipleUpload={false}
                  />

                  <MediaSelector
                    label="Property Gallery"
                    value={formData.images}
                    onChange={handleImagesChange}
                    multipleUpload={true}
                    maxImages={20}
                  />
                </div>
              </div>

              {/* Location & Coordinates Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Location & Coordinates
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Set the exact geographical location of the property
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="latitude"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Latitude *
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="Enter latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="longitude"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Longitude *
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="Enter longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    SEO Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Optimize the property for search engines
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="slug"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      URL Slug *
                    </Label>
                    <Input
                      id="slug"
                      placeholder="property-url-slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="seoTitle"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      SEO Title *
                    </Label>
                    <Input
                      id="seoTitle"
                      placeholder="SEO optimized title"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="seoDescription"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      SEO Description *
                    </Label>
                    <Textarea
                      id="seoDescription"
                      placeholder="SEO meta description"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      required
                      className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Additional Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Optional additional details and features
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                      Virtual Tour Links
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVirtualTourLink}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.virtualTourLink.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="https://virtual-tour-link.com"
                        value={link}
                        onChange={handleVirtualTourLinkChange}
                        data-index={index}
                        className="flex-1 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                      />
                      {formData.virtualTourLink.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVirtualTourLink(index)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Status Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Property Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                    Set the current status and visibility of the property
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="featured"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Featured Property
                    </Label>
                    <Select
                      value={formData.featured}
                      onValueChange={(value) =>
                        handleSelectChange("featured", value)
                      }
                    >
                      <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectItem value="false">Not Featured</SelectItem>
                        <SelectItem value="true">Featured</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="sold"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Property Status
                    </Label>
                    <Select
                      value={formData.sold}
                      onValueChange={(value) =>
                        handleSelectChange("sold", value)
                      }
                    >
                      <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectItem value="false">Available</SelectItem>
                        <SelectItem value="true">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="propertyOfTheMonth"
                      className="text-sm font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
                    >
                      Property of the Month
                    </Label>
                    <Select
                      value={formData.propertyOfTheMonth}
                      onValueChange={(value) =>
                        handleSelectChange("propertyOfTheMonth", value)
                      }
                    >
                      <SelectTrigger className="w-full dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200">
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    "Update Property"
                  ) : (
                    "Create Property"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
