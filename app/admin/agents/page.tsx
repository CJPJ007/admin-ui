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
  Download,
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

interface PropertySale {
  id: number | null;
  property: Property;
  soldAmount: number;
  saleDate?: string;
  commissionAmount?: number;
  commissionPercentage?: number;
}

interface Agent {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
  propertiesSold?: PropertySale[];
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Agent>>({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "agent",
    propertiesSold: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType[]>([
    { field: "role", operator: "equals", value: "AGENT" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchAgents();
  }, []);

  // Debounce property search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProperties();
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [propertySearchTerm]);

  const fetchAgents = async () => {
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters);
      const data = await (
        await api(
          `/api/fieldSearch/advancedSearch/User?page=${currentPage}&size=${itemsPerPage}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchCriteriaList),
          }
        )
      ).json();
      if (data.data) {
        const agents = data.data.map((agent: Agent) => {
          return {
            ...agent,
            propertiesSold:
              agent.propertiesSold?.map((sale: PropertySale) => ({
                ...sale,
                saleDate: sale.saleDate?.split("T")[0] || "",
              })) || [],
          };
        });
        setAgents(agents);
      }
      setTotalRecords(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      if (!propertySearchTerm.trim()) {
        setProperties([]);
        return;
      }
      const data = await (
        await api("/api/fieldSearch/advancedSearch/Property?page=1&size=10", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            criteriaList: [
              {
                key: "title",
                operation: "contains",
                value: propertySearchTerm,
              },
              {
                key: "location",
                operation: "contains",
                value: propertySearchTerm,
              },
              {
                key: "type",
                operation: "contains",
                value: propertySearchTerm,
              },
            ],
            operations: ["OR", "OR"],
          }),
        })
      ).json();
      setProperties(data.data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const agentData = {
        ...formData,
        propertiesSold:
          formData.propertiesSold?.map((sale) => ({
            ...sale,
            saleDate: `${sale.saleDate}T00:00:00` || new Date().toISOString(),
          })) || [],
      };

      if (isEditing && formData.id) {
        await api(`/api/admin/users/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(agentData),
        });
      } else {
        await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(agentData),
        });
      }
      fetchAgents();
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

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handlePropertySelect = (property: Property) => {
    const existingProperties = formData.propertiesSold || [];

    // Check if property is already added
    const isAlreadyAdded = existingProperties.some(
      (sale) => sale.property.id === property.id
    );

    if (isAlreadyAdded) {
      alert("This property is already added to the sales list.");
      return;
    }

    const newPropertySale: PropertySale = {
      id: null,
      property: property,
      soldAmount: 0,
      saleDate: new Date().toISOString().split("T")[0],
    };

    setFormData({
      ...formData,
      propertiesSold: [...existingProperties, newPropertySale],
    });
    setShowPropertyModal(false);
    setPropertySearchTerm("");
  };

  const handleRemovePropertySale = (index: number) => {
    const updatedSales =
      formData.propertiesSold?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      propertiesSold: updatedSales,
    });
  };

  const handleSoldAmountChange = (index: number, amount: number) => {
    const updatedSales = [...(formData.propertiesSold || [])];
    updatedSales[index] = {
      ...updatedSales[index],
      soldAmount: amount,
    };
    setFormData({
      ...formData,
      propertiesSold: updatedSales,
    });
  };

  const handleSaleDateChange = (index: number, date: string) => {
    if (!date) return;
    const updatedSales = [...(formData.propertiesSold || [])];
    updatedSales[index] = {
      ...updatedSales[index],
      saleDate: date, // Ensure date is in ISO format
    };
    setFormData({
      ...formData,
      propertiesSold: updatedSales,
    });
  };

  const handleEdit = (agent: Agent) => {
    setFormData(agent);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const deleteAgent = async (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      try {
        await api(`/api/admin/users/${id}`, {
          method: "DELETE",
        });
        fetchAgents();
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert(`Failed to delete agent: ${error}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "agent",
      propertiesSold: [],
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
    fetchAgents();
    setShowFilters(false);
    setFilters([{ field: "role", operator: "equals", value: "AGENT" }]);
  };

  // Filter properties based on search term
  // const filteredProperties = properties.filter(
  //   (property) =>
  //     property.title.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
  //     property.location.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
  //     property.type.toLowerCase().includes(propertySearchTerm.toLowerCase()),
  // )

  // Calculate total sales for an agent
  const calculateTotalSales = (propertiesSold?: PropertySale[]) => {
    if (!propertiesSold || propertiesSold.length === 0) return 0;
    return propertiesSold.reduce((total, sale) => total + sale.soldAmount, 0);
  };

  function handleCommissionAmount(
    index: number,
    commissionPercentage: number
  ): void {
    const updatedSales = [...(formData.propertiesSold || [])];
    const sale = updatedSales[index];
    if (!sale) return;

    // Update commission percentage
    sale.commissionPercentage = commissionPercentage;

    // Calculate commission amount based on soldAmount and commissionPercentage
    if (sale.soldAmount && commissionPercentage >= 0) {
      sale.commissionAmount = (sale.soldAmount * commissionPercentage) / 100;
    } else {
      sale.commissionAmount = 0;
    }

    updatedSales[index] = sale;
    setFormData({
      ...formData,
      propertiesSold: updatedSales,
    });
  }

  const exportToHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agents Export</title>
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
        <h1>Agents Export Report</h1>
        <div class="export-info">
            <p>Export Date: ${new Date().toLocaleDateString()}</p>
            <p>Agents: ${agents.length}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Username/th>
                    <th>Name/th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Properties Sold</th>
                    <th>Total Sales</th>
                </tr>
            </thead>
            <tbody>
                ${agents
                  .map(
                    (agent) => `
                    <tr>
                        <td>
                            <strong>${agent.username}</strong>
                        </td>
                        <td>${agent.name || "N/A"}</td>
                        <td>
                            ${agent.email || "N/A"}
                        </td>
                        <td>${agent.phone}</td>
                        <td>${agent.propertiesSold}</td>
                        <td>${calculateTotalSales(
                          agent.propertiesSold
                        ).toLocaleString()} INR</td>
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
    link.download = `agents-export-${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Manage Agents
          </h1>

          {/* Action Bar */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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
                    fetchAgents();
                    setCurrentPage(1);
                    setFilters([
                      { field: "role", operator: "equals", value: "AGENT" },
                    ]);
                    setShowFilters(false);
                  }}
                  className="flex items-center gap-2 bg-transparent text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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
            </CardContent>
          </Card>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-700 dark:text-gray-200"
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
                    <SelectTrigger className="w-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) =>
                      updateFilter(index, "operator", value)
                    }
                  >
                    <SelectTrigger className="w-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
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
                    className="w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
                  />

                  {filters.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-800"
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
                  className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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

        {/* Agents Table */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Agents List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-gray-900 dark:text-gray-100">
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Properties Sold</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      {agent.username}
                    </TableCell>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>{agent.role}</TableCell>
                    <TableCell>
                      {agent.propertiesSold?.length ? (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                            {agent.propertiesSold.length}{" "}
                            {agent.propertiesSold.length === 1
                              ? "Property"
                              : "Properties"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No properties sold
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.propertiesSold?.length ? (
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                          ₹
                          {calculateTotalSales(
                            agent.propertiesSold
                          ).toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          ₹0
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                          className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 dark:text-gray-400"
                    >
                      No agents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modals: Create/Edit Agent & Property Selection */}
        {/* Both modals should use dark:bg-gray-800 and dark:text-gray-100 */}
        {/* I can provide full rewritten modal code with dark mode as next step if needed */}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? "Edit Agent" : "Add New Agent"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Enter the basic details of the agent
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username *
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username || ""}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password {isEditing && "(Leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    required={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Role *
                  </Label>
                  <Select
                    value={formData.role || "AGENT"}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white">
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Properties Sold Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Properties Sold
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Manage the properties sold by this agent
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPropertyModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              </div>

              {/* Properties Sold List */}
              {formData.propertiesSold && formData.propertiesSold.length > 0 ? (
                <div className="space-y-4">
                  {formData.propertiesSold.map((sale, index) => (
                    <Card
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              `/images/${sale.property.thumbnailImage}` ||
                              "/placeholder.svg?height=60&width=60"
                            }
                            alt={sale.property.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {sale.property.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {sale.property.location}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {sale.property.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {sale.property.bedrooms} bed •{" "}
                                    {sale.property.bathrooms} bath
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePropertySale(index)}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Sales Info Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Sold Amount (₹) *
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="Enter sold amount"
                                  value={sale.soldAmount || ""}
                                  onChange={(e) =>
                                    handleSoldAmountChange(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  required
                                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Sale Date
                                </Label>
                                <Input
                                  type="date"
                                  value={sale.saleDate || ""}
                                  onChange={(e) =>
                                    handleSaleDateChange(index, e.target.value)
                                  }
                                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Commission Percent (%) *
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  placeholder="Enter commission percent"
                                  value={sale.commissionPercentage || ""}
                                  onChange={(e) =>
                                    handleCommissionAmount(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  required
                                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Commission Amount
                                </Label>
                                <Input
                                  type="number"
                                  value={sale.commissionAmount || ""}
                                  disabled
                                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                  <CardContent className="p-8 text-center">
                    <Building className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      No properties sold yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPropertyModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Property
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {isEditing ? "Update Agent" : "Add Agent"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Property Selection Modal */}
      <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
        <DialogContent className="bg-white dark:bg-gray-800 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Select Property to Add
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-400" />
                <Input
                  placeholder="Search properties by title, location, or type..."
                  value={propertySearchTerm}
                  onChange={(e) => setPropertySearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Properties List */}
            <div className="space-y-3">
              {properties.length > 0 ? (
                properties.map((property) => {
                  const isAlreadyAdded = formData.propertiesSold?.some(
                    (sale) => sale.property.id === property.id
                  );

                  return (
                    <Card
                      key={property.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isAlreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700"
                          : "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500"
                      } border border-gray-200 dark:border-gray-600`}
                      onClick={() =>
                        !isAlreadyAdded && handlePropertySelect(property)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              `/images/${property.thumbnailImage}` ||
                              "/placeholder.svg?height=60&width=60"
                            }
                            alt={property.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {property.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {property.location}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant="secondary">
                                    {property.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {property.bedrooms} bed •{" "}
                                    {property.bathrooms} bath
                                  </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    ₹{property.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                {isAlreadyAdded ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                  >
                                    Already Added
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant={
                                      property.sold ? "destructive" : "default"
                                    }
                                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                  >
                                    {property.sold ? "Sold" : "Available"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-300">
                    No properties found
                  </p>
                  {propertySearchTerm && (
                    <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
                      Try adjusting your search terms or clear the search to see
                      all properties
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowPropertyModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
