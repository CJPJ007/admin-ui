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
import {
  Edit,
  Filter,
  Plus,
  RotateCcw,
  Trash2,
  X,
  Search,
  Building,
  DollarSign,
} from "lucide-react";
import type { FilterType, Property } from "@/utils/interfaces";
import { convertToSearchCriteriaList } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FAQ }  from "@/utils/interfaces";


export default function Agents() {
  const [faqs, setFAQS] = useState<FAQ[]>([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question:"",
    answer:""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters);
      const data = await (
        await api(
          `/api/fieldSearch/advancedSearch/FAQ?page=${currentPage}&size=${itemsPerPage}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchCriteriaList),
          }
        )
      ).json();
      if(data.data){
        setFAQS(data.data);
      }
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching faqs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      if (isEditing && formData.id) {
        await api(`/api/admin/faqs/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await api("/api/admin/faqs", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      fetchFAQs();
      resetForm();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error saving agent:", error);
      alert(`Failed to save agent: ${error}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData({
      ...formData,
      [id]: type === "number" ? Number(value) : value,
    });
  };

  const handleEdit = (agent: FAQ) => {
    setFormData(agent);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const deleteAgent = async (id: number) => {
    if (confirm("Are you sure you want to delete this faq?")) {
      try {
        await api(`/api/admin/faqs/${id}`, {
          method: "DELETE",
        });
        fetchFAQs();
      } catch (error) {
        console.error("Error deleting faq:", error);
        alert(`Failed to delete faq: ${error}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question:"",
      answer:""
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
    fetchFAQs();
    setShowFilters(false);
    setFilters([{ field: "role", operator: "equals", value: "AGENT" }]);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Manage FAQs
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
                    fetchFAQs();
                    setCurrentPage(1);
                    setFilters([
                      
                    ]);
                    setShowFilters(false);
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
                        value="username"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Username
                      </SelectItem>
                      <SelectItem
                        value="name"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Name
                      </SelectItem>
                      <SelectItem
                        value="email"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Email
                      </SelectItem>
                      <SelectItem
                        value="phone"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Phone
                      </SelectItem>
                      <SelectItem
                        value="role"
                        className="hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Role
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

        {/* FAQ List */}
        <Card>
          <CardHeader>
            <CardTitle>FAQS List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">
                      {faq.id}
                    </TableCell>
                    <TableCell>{faq.question}</TableCell>
                    <TableCell>{faq.answer}</TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAgent(faq.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {faqs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500"
                    >
                      No faqs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

     {/* Create/Edit FAQ Modal */}
<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
  <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 text-gray-100 overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-white">
        {isEditing ? "Edit FAQ" : "Add New FAQ"}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-gray-100">
            Basic Information
          </h3>
          <p className="text-sm text-gray-400">
            Enter the basic details of the agent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="question"
              className="text-sm font-medium text-gray-300"
            >
              Question *
            </Label>
            <Input
              id="question"
              placeholder="Enter question"
              value={formData.question || ""}
              onChange={handleInputChange}
              required
              type="text"
              className="w-full bg-gray-800 text-white border border-gray-700 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="answer"
              className="text-sm font-medium text-gray-300"
            >
              Answer *
            </Label>
            <Input
              id="answer"
              placeholder="Enter answer"
              value={formData.answer || ""}
              onChange={handleInputChange}
              required
              type="text"
              className="w-full bg-gray-800 text-white border border-gray-700 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
          onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {isEditing ? "Update FAQ" : "Add FAQ"}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

    </AdminLayout>
  );
}
