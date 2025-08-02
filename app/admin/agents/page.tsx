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

interface PropertySale {
  id:number|null;
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
      if(data.data){
        const agents = data.data.map((agent: Agent) => {
          return {
            ...agent,
            propertiesSold: agent.propertiesSold?.map((sale: PropertySale) => ({
              ...sale,
              saleDate: sale.saleDate?.split('T')[0] || "",
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
      if(!propertySearchTerm.trim()) {
        setProperties([]);
        return;
      }
      const data = await (
        await api(
          "/api/fieldSearch/advancedSearch/Property?page=1&size=10",
          {
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
          }
        )
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
      id:null,
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

  function handleCommissionAmount(index: number, commissionPercentage: number): void {
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

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Manage Agents
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
                    fetchAgents();
                    setCurrentPage(1);
                    setFilters([
                      { field: "role", operator: "equals", value: "AGENT" },
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

        {/* Agent List */}
        <Card>
          <CardHeader>
            <CardTitle>Agents List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
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
                      {agent.propertiesSold &&
                      agent.propertiesSold.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {agent.propertiesSold.length}{" "}
                            {agent.propertiesSold.length === 1
                              ? "Property"
                              : "Properties"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          No properties sold
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.propertiesSold &&
                      agent.propertiesSold.length > 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          ₹
                          {calculateTotalSales(
                            agent.propertiesSold
                          ).toLocaleString()}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">₹0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(agent)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
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
                      className="text-center text-gray-500"
                    >
                      No agents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Agent Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Edit Agent" : "Add New Agent"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h3>
                <p className="text-sm text-gray-600">
                  Enter the basic details of the agent
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
                    Username *
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
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
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    Role *
                  </Label>
                  <Select
                    value={formData.role || "AGENT"}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGENT">Agent</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Properties Sold Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Properties Sold
                    </h3>
                    <p className="text-sm text-gray-600">
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
              </div>

              {/* Properties Sold List */}
              {formData.propertiesSold && formData.propertiesSold.length > 0 ? (
                <div className="space-y-4">
                  {formData.propertiesSold.map((sale, index) => (
                    <Card key={index} className="border border-gray-200">
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
                                <h4 className="font-medium text-gray-900">
                                  {sale.property.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {sale.property.location}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {sale.property.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
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
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
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
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Sale Date
                                </Label>
                                <Input
                                  type="date"
                                  value={sale.saleDate || ""}
                                  onChange={(e) =>
                                    handleSaleDateChange(index, e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
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
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                  Commission Amount
                                </Label>
                                <Input
                                  type="number"
                                  value={sale.commissionAmount || ""}
                                  disabled
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Total Sales Summary */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            Total Sales
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-900">
                            ₹
                            {calculateTotalSales(
                              formData.propertiesSold
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-green-700">
                            {formData.propertiesSold.length}{" "}
                            {formData.propertiesSold.length === 1
                              ? "Property"
                              : "Properties"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="p-8 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No properties sold yet</p>
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
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
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
        <DialogContent className="bg-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Property to Add</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties by title, location, or type..."
                  value={propertySearchTerm}
                  onChange={(e) => setPropertySearchTerm(e.target.value)}
                  className="pl-10"
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
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : "hover:shadow-md hover:border-blue-300"
                      }`}
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
                                <h3 className="font-medium text-gray-900">
                                  {property.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {property.location}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant="secondary">
                                    {property.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {property.bedrooms} bed •{" "}
                                    {property.bathrooms} bath
                                  </span>
                                  <span className="font-semibold text-blue-600">
                                    ₹{property.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                {isAlreadyAdded ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-600"
                                  >
                                    Already Added
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant={
                                      property.sold ? "destructive" : "default"
                                    }
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
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No properties found</p>
                  {propertySearchTerm && (
                    <p className="text-sm text-gray-400 mt-2">
                      Try adjusting your search terms or clear the search to see
                      all properties
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
