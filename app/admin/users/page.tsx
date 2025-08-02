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
import type { FilterType } from "@/utils/interfaces"
import { convertToSearchCriteriaList } from "@/lib/utils"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface UserInterface {
  id: number
  username: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Users() {

  const searchParams = useSearchParams()
  const router = useRouter()
  const [users, setUsers] = useState<UserInterface[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterType[]>([{ field: "", operator: "equals", value: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [formData, setFormData] = useState<{
    id: number | null
    username: string
    password: string
    name: string
    email: string
    phone: string
    role: string
    isActive: boolean
  }>({
    id: null,
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  // Handle URL parameters
  useEffect(() => {
    const editParam = searchParams.get("edit")
    const idParam = searchParams.get("id")
    const createParam = searchParams.get("create")

    if (editParam === "true" && idParam) {
      const userId = Number.parseInt(idParam)
      if (!isNaN(userId)) {
        // Find user and open edit modal
        const user = users.find((u) => u.id === userId)
        if (user) {
          handleEditWithUrl(user)
        } else {
          // If user not found in current list, fetch it
          fetchUserById(userId)
        }
      }
    } else if (createParam === "true") {
      resetForm()
      setShowCreateModal(true)
    }
  }, [searchParams, users])

  const fetchUsers = async () => {
          setLoading(true)
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters)
      const data = await (
        await api(`/api/fieldSearch/advancedSearch/User?page=${currentPage}&size=${itemsPerPage}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        })
      ).json()
      setUsers(data.data || [])
      setTotalRecords(data.totalRecords || 0)
    } catch (error) {
      console.error("Error fetching users:", error)
    }finally {
      setLoading(false)
    }
  }

  const fetchUserById = async (userId: number) => {
    try {
      const response = await api(`/api/admin/users/${userId}`)
      const user = await response.json()
      if (user) {
        handleEditWithUrl(user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      // Clear URL params if user not found
      router.replace("/admin/users")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userData = {
      username: formData.username,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      isActive: formData.isActive,
    }

    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/users/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(userData),
        })
      } else {
        await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(userData),
        })
      }
      fetchUsers()
      resetForm()
      setShowCreateModal(false)
      router.replace("/admin/users")
    } catch (error) {
      console.error("Error saving user:", error)
      alert(`Failed to save user: ${error}`)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    try {
      await api(`/api/admin/users/${formData.id}/change-password`, {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      alert("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      alert(`Failed to change password: ${error}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    })
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordData({
      ...passwordData,
      [id]: value,
    })
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleEditWithUrl = (user: UserInterface) => {
    // Update URL with edit parameters
    router.push(`/admin/users?edit=true&id=${user.id}`)
    setFormData({
       id: null,
    username: user.username,
    password: "",
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    });
    setIsEditing(true);
    setShowCreateModal(true);
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await api(`/api/admin/users/${id}`, {
          method: "DELETE",
        })
        fetchUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
        alert(`Failed to delete user: ${error}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: null,
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "user",
      isActive: true,
    })
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
    fetchUsers()
    setShowFilters(false)
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert("Please select users first")
      return
    }

    switch (action) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          // Implement bulk delete
          console.log("Bulk delete:", selectedUsers)
        }
        break
      case "activate":
        // Implement bulk activate
        console.log("Bulk activate:", selectedUsers)
        break
      case "deactivate":
        // Implement bulk deactivate
        console.log("Bulk deactivate:", selectedUsers)
        break
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id))
    }
  }

  const handleUserSelect = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleCreateWithUrl = () => {
    router.push("/admin/users?create=true")
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    resetForm()
    // Clear URL params when closing modal
    router.replace("/admin/users")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

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
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm tracking-wide">
            <Link href="/admin/dashboard" className="p-0 h-auto text-blue-500 hover:text-blue-700">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link href="/admin/administration" className="p-0 h-auto text-blue-500 hover:text-blue-700">
              System
            </Link>
            <span className="mx-2">/</span>
            <span>Users</span>
          </div>
        </nav>

        {/* Action Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <Button onClick={handleCreateWithUrl} className="flex items-center gap-2 btn-primary">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    fetchUsers()
                    setCurrentPage(1)
                    setFilters([{ field: "", operator: "equals", value: "" }])
                    setShowFilters(false)
                  }}
                  className="flex items-center gap-2"
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
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-semibold">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {filters.map((filter, index) => (
                <div key={index} className="flex gap-3 mb-3 items-center">
                  <Select value={filter.field} onValueChange={(value) => updateFilter(index, "field", value)}>
                    <SelectTrigger className="w-40">
                      <span>{filter.field || "Select field"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="isActive">Status</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filter.operator} onValueChange={(value) => updateFilter(index, "operator", value)}>
                    <SelectTrigger className="w-32">
                      <span>{filter.operator || "Operator"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
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

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>USERNAME</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>ROLE</TableHead>
                <TableHead>CREATED AT</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>IS SUPER?</TableHead>
                <TableHead className="w-32">OPERATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-600 cursor-pointer"
                    onClick={() => handleEditWithUrl(user)}>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="bg-blue-100 text-blue-800">
                      {user.isActive ? "Activated" : "Deactivated"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className="bg-green-100 text-green-800"
                    >
                      {user.role === "ADMIN" ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditWithUrl(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              Show from {startIndex + 1} to {Math.min(endIndex, totalRecords)} in {totalRecords} records
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
      <Dialog open={showCreateModal} onOpenChange={(open) => {
          if (!open) handleCloseModal()
          else setShowCreateModal(true)
        }}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing?"Update User":"Create New User"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {isEditing?"(Optional)":"*"}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required = {isEditing ? false : true} // Password is required only when creating a new user
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger>
                    <span>{formData.role}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active User</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {isEditing?"Update User":"Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  )
}
