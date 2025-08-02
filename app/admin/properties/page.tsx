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
  DialogTrigger,
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
import { Filter, Plus, RotateCcw, Edit, Trash2, X } from "lucide-react";
import type { FilterType, Property } from "@/utils/interfaces";
import { convertToSearchCriteriaList } from "@/lib/utils";
import MediaSelector from "@/components/MediaSelector";

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", operator: "equals", value: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
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
    virtualTourLink: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchProperties();
  }, [currentPage]);

  const fetchProperties = async () => {
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
    setProperties(data.data);
    setTotalRecords(data.totalRecords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      virtualTourLink: formData.virtualTourLink.join("#VIDEO#"),
    };

    if (isEditing) {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
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

  const handleEdit = (property: Property) => {
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
      virtualTourLink: property.virtualTourLink?.split("#VIDEO#"),
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number | null) => {
    if (confirm("Are you sure you want to delete this property?")) {
      await api(`/api/admin/properties/${id}`, {
        method: "DELETE",
      });
      fetchProperties();
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
      virtualTourLink: [],
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
    setFilters([{ field: "", operator: "equals", value: "" }]);
  };

  function handleVirtualTourLinkChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const index = Number(event.target.dataset.index);
    const value = event.target.value;
    setFormData((prev) => {
      const updatedLinks = [...prev.virtualTourLink];
      updatedLinks[index] = value;
      return { ...prev, virtualTourLink: updatedLinks };
    });
  }

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-5">
            Properties
          </h1>

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
                    fetchProperties();
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

        {/* Properties Table */}
        <Card>
          <Table>
            <TableHeader>
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
              {currentProperties.map((property) => (
                <TableRow key={property.id}>
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
                      <div className="font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.bedrooms} bed, {property.bathrooms} bath
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {property.price.toLocaleString()} INR
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.sold ? "destructive" : "default"}>
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Edit Property" : "Create Property"}
            </DialogTitle>
          </DialogHeader>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Property Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter property title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-gray-700"
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
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description *
                </Label>
                <Input
                  id="description"
                  placeholder="Enter property description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Property Details Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Property Details
                </h3>
                <p className="text-sm text-gray-600">
                  Specify the property characteristics and location
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium text-gray-700"
                  >
                    Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium text-gray-700"
                  >
                    Property Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="TownHouse">TownHouse</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pinCode"
                    className="text-sm font-medium text-gray-700"
                  >
                    Pin Code *
                  </Label>
                  <Input
                    id="pinCode"
                    placeholder="Enter pin code"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="bedrooms"
                    className="text-sm font-medium text-gray-700"
                  >
                    Bedrooms *
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="Number of bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="bathrooms"
                    className="text-sm font-medium text-gray-700"
                  >
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="Number of bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="areaSqft"
                    className="text-sm font-medium text-gray-700"
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
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Property Images Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Property Images
                </h3>
                <p className="text-sm text-gray-600">
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
                  maxImages={10}
                />
              </div>
            </div>

            {/* Location & Coordinates Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Location & Coordinates
                </h3>
                <p className="text-sm text-gray-600">
                  Set the exact geographical location of the property
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="latitude"
                    className="text-sm font-medium text-gray-700"
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
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="longitude"
                    className="text-sm font-medium text-gray-700"
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
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* SEO Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  SEO Information
                </h3>
                <p className="text-sm text-gray-600">
                  Optimize the property for search engines
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="slug"
                    className="text-sm font-medium text-gray-700"
                  >
                    URL Slug *
                  </Label>
                  <Input
                    id="slug"
                    placeholder="property-url-slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seoTitle"
                    className="text-sm font-medium text-gray-700"
                  >
                    SEO Title *
                  </Label>
                  <Input
                    id="seoTitle"
                    placeholder="SEO optimized title"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seoDescription"
                    className="text-sm font-medium text-gray-700"
                  >
                    SEO Description *
                  </Label>
                  <Input
                    id="seoDescription"
                    placeholder="SEO meta description"
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Additional Information
                </h3>
                <p className="text-sm text-gray-600">
                  Optional additional details and features
                </p>
              </div>

              <div className="space-y-2 space-x-2">
                <Label
                  htmlFor="virtualTourLink"
                  className="text-sm font-medium text-gray-700"
                >
                  Virtual Tour Link
                </Label>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const updatedLinks = [...formData.virtualTourLink];
                    updatedLinks.pop();
                    setFormData({ ...formData, virtualTourLink: updatedLinks });
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const updatedLinks = [...formData.virtualTourLink];
                    updatedLinks.push("");
                    setFormData({ ...formData, virtualTourLink: updatedLinks });
                  }}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {formData.virtualTourLink?.map((link: string, index) => (
                  <Input
                    id="virtualTourLink"
                    placeholder="https://virtual-tour-link.com"
                    value={link}
                    onChange={handleVirtualTourLinkChange}
                    className="w-full"
                    data-index={index}
                    key={index}
                  />
                ))}
              </div>
            </div>

            {/* Property Status Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Property Status
                </h3>
                <p className="text-sm text-gray-600">
                  Set the current status and visibility of the property
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700"
                  >
                    Featured Property
                  </Label>
                  <Select
                    value={formData.featured}
                    onValueChange={(value) =>
                      handleSelectChange("featured", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Not Featured</SelectItem>
                      <SelectItem value="true">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="sold"
                    className="text-sm font-medium text-gray-700"
                  >
                    Property Status
                  </Label>
                  <Select
                    value={formData.sold}
                    onValueChange={(value) => handleSelectChange("sold", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Available</SelectItem>
                      <SelectItem value="true">Sold</SelectItem>
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
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {isEditing ? "Update Property" : "Create Property"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
