"use client";

import type React from "react";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterType, Slider } from "@/utils/interfaces";
import { convertToSearchCriteriaList } from "@/lib/utils";
import MediaSelector from "@/components/MediaSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Sliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [formData, setFormData] = useState<Partial<Slider>>({
    title: "",
    subtitle: "",
    imageUrl: "",
    mobileImageUrl:"",
    linkUrl: "",
    buttonText: "",
    sortOrder: 0,
    isActive: true,
    page: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", operator: "equals", value: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters);
      const data = await (
        await api(
          `/api/fieldSearch/advancedSearch/Slider?page=${currentPage}&size=${itemsPerPage}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchCriteriaList),
          }
        )
      ).json();
      setSliders(data.data);
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching sliders:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/sliders/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await api("/api/admin/sliders", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      fetchSliders();
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error saving slider:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleEdit = (slider: Slider) => {
    setFormData(slider);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const deleteSlider = async (id: number) => {
    if (confirm("Are you sure you want to delete this slider?")) {
      try {
        await api(`/api/admin/sliders/${id}`, {
          method: "DELETE",
        });
        fetchSliders();
      } catch (error) {
        console.error("Error deleting slider:", error);
      }
    }
  };

  const handleImageChange = (value: string | string[], key:string) => {
    setFormData({
      ...formData,
      [key]: Array.isArray(value) ? value[0] || "" : value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      mobileImageUrl:"",
      linkUrl: "",
      buttonText: "",
      sortOrder: 0,
      isActive: true,
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
    fetchSliders();
    setShowFilters(false);
    setFilters([{ field: "", operator: "equals", value: "" }]);
  };

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return (
   <AdminLayout>
  <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Manage Sliders
      </h1>

      {/* Action Bar */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setShowCreateModal(true)
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
                fetchSliders()
                setCurrentPage(1)
                setFilters([{ field: "", operator: "equals", value: "" }])
                setShowFilters(false)
              }}
              className="flex items-center gap-2 bg-transparent dark:border-gray-600 dark:text-gray-200"
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
                onValueChange={(value) => updateFilter(index, "field", value)}
              >
                <SelectTrigger className="w-40 dark:bg-gray-900 dark:border-gray-600">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="subtitle">Subtitle</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
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
                onChange={(e) => updateFilter(index, "value", e.target.value)}
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

    {/* Slider List */}
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          Sliders List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-700">
            <TableRow>
              <TableHead className="text-gray-900 dark:text-gray-100">Title</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Subtitle</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Page</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Image URL</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Order</TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
              <TableHead className="w-32 text-gray-900 dark:text-gray-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliders.map((slider) => (
              <TableRow
                key={slider.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <TableCell className="font-medium">{slider.title}</TableCell>
                <TableCell>{slider.subtitle}</TableCell>
                <TableCell>{slider.page}</TableCell>
                <TableCell className="max-w-xs truncate">
                  <img
                    src={
                      `/images/${slider.imageUrl}` ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={slider.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                </TableCell>
                <TableCell>{slider.sortOrder}</TableCell>
                <TableCell>
                  <Badge
                    variant={slider.isActive ? "default" : "secondary"}
                    className="dark:bg-gray-600"
                  >
                    {slider.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(slider)}
                      className="dark:border-gray-600 dark:text-gray-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSlider(slider.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sliders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 dark:text-gray-400"
                >
                  No sliders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Show from {startIndex + 1} to {Math.min(endIndex, totalRecords)} in{" "}
            {totalRecords} records
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="dark:border-gray-600 dark:text-gray-200"
              >
                {page}
              </Button>
            ))}

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
      </CardContent>
    </Card>
  </div>

  {/* Create/Edit Modal */}
  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
    <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 overflow-y-auto border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? "Edit Slider" : "Create Slider"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="dark:text-gray-200">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle" className="dark:text-gray-200">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={handleInputChange}
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page" className="dark:text-gray-200">Page</Label>
            <Select
              value={formData.page}
              onValueChange={(e) =>
                handleInputChange({ target: { id: "page", value: e } })
              }
              required
            >
              <SelectTrigger className="w-40 dark:bg-gray-900 dark:border-gray-600">
                <SelectValue placeholder="Select Page" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Properties">Properties</SelectItem>
                <SelectItem value="Blog">Blog</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="About">About</SelectItem>
                <SelectItem value="Gallery">Gallery</SelectItem>
                <SelectItem value="Contact">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkUrl" className="dark:text-gray-200">Link URL</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl || ""}
              onChange={handleInputChange}
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder" className="dark:text-gray-200">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder || 0}
              onChange={handleInputChange}
              required
              className="dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-200">Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive || false}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal dark:text-gray-300"
              >
                Is Active
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <MediaSelector
              label="Image"
              value={formData.imageUrl || ""}
              onChange={(value) => handleImageChange(value, "imageUrl")}
              multipleUpload={false}
            />
          </div>
          <div className="space-y-2">
            <MediaSelector
              label="Mobile Image"
              value={formData.mobileImageUrl || ""}
              onChange={(value) => handleImageChange(value, "mobileImageUrl")}
              multipleUpload={false}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="btn-primary">
            {isEditing ? "Update Slider" : "Add Slider"}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="dark:border-gray-600 dark:text-gray-200"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  </Dialog>
</AdminLayout>

  );
}
