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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Filter,
  Plus,
  RotateCcw,
  Edit,
  Trash2,
  X,
  Search,
  Download,
  Shield,
  Key,
  View,
} from "lucide-react";
import type { Customer, FilterType, Inquiry } from "@/utils/interfaces";
import { convertToSearchCriteriaList } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/PageComponentSkeletonLoader";

export default function Inquiries() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inquiries, setCustomers] = useState<Inquiry[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "", operator: "equals", value: "" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [formData, setFormData] = useState<{
    id: number | null;
    name: string;
    email: string;
    mobile: string;
    property: string;
    appointmentDate: string;
    message: string;
  }>({
    id: null,
    name: "",
    email: "",
    mobile: "",
    property: "",
    appointmentDate: "",
    message: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, [currentPage]);

  // Handle URL parameters
  useEffect(() => {
    const editParam = searchParams.get("edit");
    const idParam = searchParams.get("id");
    const createParam = searchParams.get("create");

    if (editParam === "true" && idParam) {
      const customerId = Number.parseInt(idParam);
      if (!isNaN(customerId)) {
        // Find inquiry and open edit modal
        const inquiry = inquiries.find((u) => u.id === customerId);
        if (inquiry) {
          handleEditWithUrl(inquiry);
        } else {
          // If inquiry not found in current list, fetch it
          fetchUserById(customerId);
        }
      }
    } else if (createParam === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams, inquiries]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters);
      const data = await (
        await api(
          `/api/fieldSearch/advancedSearch/Inquiry?page=${currentPage}&size=${itemsPerPage}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchCriteriaList),
          }
        )
      ).json();
      setCustomers(data.data || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserById = async (customerId: number) => {
    try {
      const response = await api(`/api/admin/inquiries/${customerId}`);
      const inquiry = await response.json();
      if (inquiry) {
        handleEditWithUrl(inquiry);
      }
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      // Clear URL params if inquiry not found
      router.replace("/admin/inquiries");
    }
  };

  const handleEditWithUrl = (inquiry: Inquiry) => {
    // Update URL with edit parameters
    router.push(`/admin/inquiries?edit=true&id=${inquiry.id}`);
    setFormData({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      mobile: inquiry.mobile,
      property: inquiry.property,
      appointmentDate: inquiry.appointmentDate,
      message: inquiry.message,
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await api(`/api/admin/inquiries/${id}`, {
          method: "DELETE",
        });
        fetchInquiries();
      } catch (error) {
        console.error("Error deleting inquiry:", error);
        alert(`Failed to delete inquiry: ${error}`);
      }
    }
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
    fetchInquiries();
    setShowFilters(false);
  };

  const handleBulkAction = (action: string) => {
    if (selectedCustomers.length === 0) {
      alert("Please select inquiries first");
      return;
    }

    switch (action) {
      case "delete":
        if (
          confirm(
            `Are you sure you want to delete ${selectedCustomers.length} inquiries?`
          )
        ) {
          // Implement bulk delete
          console.log("Bulk delete:", selectedCustomers);
        }
        break;
      case "activate":
        // Implement bulk activate
        console.log("Bulk activate:", selectedCustomers);
        break;
      case "deactivate":
        // Implement bulk deactivate
        console.log("Bulk deactivate:", selectedCustomers);
        break;
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === inquiries.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(inquiries.map((inquiry) => inquiry.id));
    }
  };

  const handleUserSelect = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const handleCreateWithUrl = () => {
    router.push("/admin/inquiries?create=true");
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    // Clear URL params when closing modal
    router.replace("/admin/inquiries");
  };

  const exportToHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiries Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .status-available {
            background-color: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .status-sold {
            background-color: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        .price {
            font-weight: bold;
            color: #28a745;
        }
        .export-info {
            text-align: center;
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
        }
        .property-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Properties Export Report</h1>
        <div class="export-info">
            <p>Export Date: ${new Date().toLocaleDateString()}</p>
            <p>Inquiries: ${inquiries.length}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Property</th>
                    <th>Appointment Date</th>
                </tr>
            </thead>
            <tbody>
                ${inquiries
                  .map(
                    (inquiry) => `
                    <tr>
                        <td>
                            <strong>${inquiry.name}</strong>
                        </td>
                        <td class="price">${inquiry.email || "N/A"}</td>
                        <td>
                            ${inquiry.mobile || "N/A"}
                        </td>
                        <td>${inquiry.property}</td>
                        <td>${inquiry.appointmentDate}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inquiries-export-${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  if (loading) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm tracking-wide">
            <Link
              href="/admin/dashboard"
              className="p-0 h-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dashboard
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
            <span className="text-gray-900 dark:text-gray-200">Inquiries</span>
          </div>
        </nav>

        {/* Action Bar */}
        <Card className="mb-6 bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    fetchInquiries();
                    setCurrentPage(1);
                    setFilters([{ field: "", operator: "equals", value: "" }]);
                    setShowFilters(false);
                  }}
                  className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reload
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToHTML}
                  className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200 bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Export HTML
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 bg-white dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Filters
              </CardTitle>
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
                    <SelectTrigger className="w-40 dark:border-gray-600 dark:text-gray-200">
                      <span>{filter.field || "Select field"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 dark:text-gray-200">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) =>
                      updateFilter(index, "operator", value)
                    }
                  >
                    <SelectTrigger className="w-32 dark:border-gray-600 dark:text-gray-200">
                      <span>{filter.operator || "Operator"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 dark:text-gray-200">
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
                    className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />

                  {filters.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-400 dark:hover:bg-red-900"
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

        {/* Inquiries Table */}
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-700">
              <TableRow>
                <TableHead className="w-12 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomers.length === inquiries.length &&
                      inquiries.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  CUSTOMER NAME
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  EMAIL
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  MOBILE
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  PROPERTY
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-300">
                  APPOINTMENT DATE
                </TableHead>
                <TableHead className="w-32 text-gray-700 dark:text-gray-300">
                  OPERATIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(inquiry.id)}
                      onChange={() => handleUserSelect(inquiry.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium text-blue-600 cursor-pointer dark:text-blue-400"
                    onClick={() => handleEditWithUrl(inquiry)}
                  >
                    {inquiry.name}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {inquiry.email}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {inquiry.mobile || "N/A"}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {inquiry.property || "N/A"}
                  </TableCell>
                  <TableCell className="dark:text-gray-200">
                    {inquiry.appointmentDate || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWithUrl(inquiry)}
                      >
                        <View className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(inquiry.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-400 dark:hover:bg-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {inquiries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 dark:text-gray-400"
                  >
                    No inquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
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
                className="dark:border-gray-600 dark:text-gray-200"
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
                className="dark:border-gray-600 dark:text-gray-200"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* View Inquiry Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
          else setShowCreateModal(true);
        }}
      >
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 dark:text-gray-200">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              View Inquiry
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  disabled
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile</Label>
                <Input
                  id="phone"
                  value={formData.mobile || "N/A"}
                  disabled
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Input
                  id="property"
                  value={formData.property || "N/A"}
                  disabled
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Appointment Date *</Label>
                <Input
                  id="appointmentDate"
                  value={formData.appointmentDate || "N/A"}
                  disabled
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message || "N/A"}
                disabled
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="dark:border-gray-600 dark:text-gray-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
