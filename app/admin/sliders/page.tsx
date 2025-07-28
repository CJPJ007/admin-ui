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
    linkUrl: "",
    buttonText: "",
    sortOrder: 0,
    isActive: true,
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

  const handleImageChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      imageUrl: Array.isArray(value) ? value[0] || "" : value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
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
                    fetchSliders();
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
                        value="subtitle"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Subtitle
                      </SelectItem>
                      <SelectItem
                        value="status"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Status
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

        {/* Slider List */}
        <Card>
          <CardHeader>
            <CardTitle>Sliders List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Image URL</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders.map((slider) => (
                  <TableRow key={slider.id}>
                    <TableCell className="font-medium">
                      {slider.title}
                    </TableCell>
                    <TableCell>{slider.subtitle}</TableCell>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSlider(slider.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
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
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No sliders found
                    </TableCell>
                  </TableRow>
                )}
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
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Slider" : "Create Slider"}
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
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal">
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
                  onChange={handleImageChange}
                  multipleUpload={false}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="btn-primary">
                {isEditing ? "Update Slider" : "Add Slider"}
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
    </AdminLayout>
  );
}
