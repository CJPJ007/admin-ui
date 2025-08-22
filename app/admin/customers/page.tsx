"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, RotateCcw, Edit, Trash2, X, Search, Download, Shield, Key } from "lucide-react"
import type { Customer, FilterType } from "@/utils/interfaces"
import { convertToSearchCriteriaList } from "@/lib/utils"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Loader } from "@/components/PageComponentSkeletonLoader"

interface UserInterface {
  id: number
  customername: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Customers() {

  const searchParams = useSearchParams()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterType[]>([{ field: "", operator: "equals", value: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [formData, setFormData] = useState<{
    id: number | null
    name: string
    email: string
    mobile: string
    avatar: string
    
  }>({
    id: null,
    name: "",
    email: "",
    mobile: "",
    avatar: "",
    
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage])

  // Handle URL parameters
  useEffect(() => {
    const editParam = searchParams.get("edit")
    const idParam = searchParams.get("id")
    const createParam = searchParams.get("create")

    if (editParam === "true" && idParam) {
      const customerId = Number.parseInt(idParam)
      if (!isNaN(customerId)) {
        // Find customer and open edit modal
        const customer = customers.find((u) => u.id === customerId)
        if (customer) {
          handleEditWithUrl(customer)
        } else {
          // If customer not found in current list, fetch it
          fetchUserById(customerId)
        }
      }
    } else if (createParam === "true") {
      resetForm()
      setShowCreateModal(true)
    }
  }, [searchParams, customers])

  const fetchCustomers = async () => {
          setLoading(true)
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters)
      const data = await (
        await api(`/api/fieldSearch/advancedSearch/Customer?page=${currentPage}&size=${itemsPerPage}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        })
      ).json()
      setCustomers(data.data || [])
      setTotalRecords(data.totalRecords || 0)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }finally {
      setLoading(false)
    }
  }

  const fetchUserById = async (customerId: number) => {
    try {
      const response = await api(`/api/admin/customers/${customerId}`)
      const customer = await response.json()
      if (customer) {
        handleEditWithUrl(customer)
      }
    } catch (error) {
      console.error("Error fetching customer:", error)
      // Clear URL params if customer not found
      router.replace("/admin/customers")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const customerData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      avatar: formData.avatar,
    }

    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/customers/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(customerData),
        })
      } else {
        await api("/api/admin/customers", {
          method: "POST",
          body: JSON.stringify(customerData),
        })
      }
      fetchCustomers()
      resetForm()
      setShowCreateModal(false)
      router.replace("/admin/customers")
    } catch (error) {
      console.error("Error saving customer:", error)
      alert(`Failed to save customer: ${error}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleEditWithUrl = (customer: Customer) => {
    // Update URL with edit parameters
    router.push(`/admin/customers?edit=true&id=${customer.id}`)
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      mobile: customer.mobile,
      avatar: customer.avatar,
    })
    setIsEditing(true);
    setShowCreateModal(true);
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await api(`/api/admin/customers/${id}`, {
          method: "DELETE",
        })
        fetchCustomers()
      } catch (error) {
        console.error("Error deleting customer:", error)
        alert(`Failed to delete customer: ${error}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      email: "",
      mobile: "",
      avatar: "customer"
    })
    setIsEditing(false)
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
    fetchCustomers()
    setShowFilters(false)
  }

  const handleBulkAction = (action: string) => {
    if (selectedCustomers.length === 0) {
      alert("Please select customers first")
      return
    }

    switch (action) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) {
          // Implement bulk delete
          console.log("Bulk delete:", selectedCustomers)
        }
        break
      case "activate":
        // Implement bulk activate
        console.log("Bulk activate:", selectedCustomers)
        break
      case "deactivate":
        // Implement bulk deactivate
        console.log("Bulk deactivate:", selectedCustomers)
        break
    }
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map((customer) => customer.id))
    }
  }

  const handleUserSelect = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
    } else {
      setSelectedCustomers([...selectedCustomers, customerId])
    }
  }

  const handleCreateWithUrl = () => {
    router.push("/admin/customers?create=true")
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    resetForm()
    // Clear URL params when closing modal
    router.replace("/admin/customers")
  }

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  if (loading) {
    return (
      <Loader />
    )
  }

  return (
    <AdminLayout>
  <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
    {/* Breadcrumb */}
    <nav className="mb-6">
      <div className="text-sm tracking-wide">
        <Link
          href="/admin/dashboard"
          className="p-0 h-auto text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/admin/administration"
          className="p-0 h-auto text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          System
        </Link>
        <span className="mx-2">/</span>
        <span>Customers</span>
      </div>
    </nav>

    {/* Action Bar */}
    <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                fetchCustomers()
                setCurrentPage(1)
                setFilters([{ field: "", operator: "equals", value: "" }])
                setShowFilters(false)
              }}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reload
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Filters Panel */}
    {showFilters && (
      <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
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
                <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  <span>{filter.field || "Select field"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(index, "operator", value)}
              >
                <SelectTrigger className="w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  <span>{filter.operator || "Operator"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
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
                className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
              />

              {filters.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(index)}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
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

    {/* Customers Table */}
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-700">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600"
              />
            </TableHead>
            <TableHead>CUSTOMERNAME</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>MOBILE</TableHead>
            <TableHead>AVATAR</TableHead>
            <TableHead className="w-32">OPERATIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => handleUserSelect(customer.id)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </TableCell>
              <TableCell
                className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => handleEditWithUrl(customer)}
              >
                {customer.name}
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.mobile}</TableCell>
              <TableCell>
                <Image
                  src={customer.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={customer.name}
                  className="w-10 h-10 rounded object-cover"
                  width={40}
                  height={40}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWithUrl(customer)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                No customers found
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
  </div>

  {/* Create User Modal */}
  <Dialog
    open={showCreateModal}
    onOpenChange={(open) => {
      if (!open) handleCloseModal()
      else setShowCreateModal(true)
    }}
  >
    <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Update User" : "Create New User"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={formData.mobile}
              onChange={handleInputChange}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar *</Label>
            <Input
              id="avatar"
              placeholder="Enter avatar url"
              value={formData.avatar}
              onChange={handleInputChange}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            className="border-gray-300 dark:border-gray-600"
          >
            Cancel
          </Button>
          <Button type="submit" className="btn-primary">
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</AdminLayout>

  )
}
