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
import type { Referral, FilterType } from "@/utils/interfaces"
import { convertToSearchCriteriaList } from "@/lib/utils"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Loader } from "@/components/PageComponentSkeletonLoader"

interface UserInterface {
  id: number
  referralname: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function Referrals() {

  const searchParams = useSearchParams()
  const router = useRouter()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterType[]>([{ field: "", operator: "equals", value: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedReferrals, setSelectedReferrals] = useState<number[]>([])
  const [formData, setFormData] = useState<{
    id:number;
  email:string;
  mobile:string;
  referredEmail:string;
  referredName:string;
  referredMobile:string;
  status:string;
  referralAmount:number
  }>({
    id: 0,
    email: "",
    mobile: "",
    referredEmail: "",
    referredName: "",
    referredMobile: "",
    status: "PENDING",
    referralAmount: 0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [currentPage])

  // Handle URL parameters
  useEffect(() => {
    const editParam = searchParams.get("edit")
    const idParam = searchParams.get("id")
    const createParam = searchParams.get("create")

    if (editParam === "true" && idParam) {
      const referralId = Number.parseInt(idParam)
      if (!isNaN(referralId)) {
        // Find referral and open edit modal
        const referral = referrals.find((u) => u.id === referralId)
        if (referral) {
          handleEditWithUrl(referral)
        } else {
          // If referral not found in current list, fetch it
          fetchUserById(referralId)
        }
      }
    } else if (createParam === "true") {
      resetForm()
      setShowCreateModal(true)
    }
  }, [searchParams, referrals])

  const fetchReferrals = async () => {
          setLoading(true)
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters)
      const data = await (
        await api(`/api/fieldSearch/advancedSearch/Referral?page=${currentPage}&size=${itemsPerPage}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        })
      ).json()
      setReferrals(data.data || [])
      setTotalRecords(data.totalRecords || 0)
    } catch (error) {
      console.error("Error fetching referrals:", error)
    }finally {
      setLoading(false)
    }
  }

  const fetchUserById = async (referralId: number) => {
    try {
      const response = await api(`/api/admin/referrals/${referralId}`)
      const referral = await response.json()
      if (referral) {
        handleEditWithUrl(referral)
      }
    } catch (error) {
      console.error("Error fetching referral:", error)
      // Clear URL params if referral not found
      router.replace("/admin/referrals")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const referralData = {
      id: formData.id,
      email: formData.email,
      referredEmail: formData.referredEmail,
      referredName: formData.referredName,
      status: formData.status,
      referralAmount: formData.referralAmount
    }

    try {
      if (isEditing && formData.id) {
        await api(`/api/admin/referrals/${formData.id}`, {
          method: "PUT",
          body: JSON.stringify(referralData),
        })
      } else {
        await api("/api/admin/referrals", {
          method: "POST",
          body: JSON.stringify(referralData),
        })
      }
      fetchReferrals()
      resetForm()
      setShowCreateModal(false)
      router.push("/admin/referrals")
    } catch (error) {
      console.error("Error saving referral:", error)
      alert(`Failed to save referral: ${error}`)
    }
  }

  const handleEditWithUrl = (referral: Referral) => {
    // Update URL with edit parameters
    router.push(`/admin/referrals?edit=true&id=${referral.id}`)
    setFormData({
      id: referral.id,
      email: referral.email,
      mobile: referral.mobile,
      referredEmail: referral.referredEmail,
      referredMobile: referral.referredMobile,
      referredName: referral.referredName,
      status: referral.status,
      referralAmount: referral.referralAmount
    })
    setIsEditing(true);
    setShowCreateModal(true);
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this referral?")) {
      try {
        await api(`/api/admin/referrals/${id}`, {
          method: "DELETE",
        })
        fetchReferrals()
      } catch (error) {
        console.error("Error deleting referral:", error)
        alert(`Failed to delete referral: ${error}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      id: 0,
      email: "",
      referredEmail: "",
      referredName: "",
      status: "PENDING",
      referralAmount: 0,
      mobile: "",
      referredMobile: ""
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
    fetchReferrals()
    setShowFilters(false)
  }

  const handleSelectAll = () => {
    if (selectedReferrals.length === referrals.length) {
      setSelectedReferrals([])
    } else {
      setSelectedReferrals(referrals.map((referral) => referral.id))
    }
  }

  const handleUserSelect = (referralId: number) => {
    if (selectedReferrals.includes(referralId)) {
      setSelectedReferrals(selectedReferrals.filter((id) => id !== referralId))
    } else {
      setSelectedReferrals([...selectedReferrals, referralId])
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    resetForm()
    // Clear URL params when closing modal
    router.replace("/admin/referrals")
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
        <span>Referrals</span>
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
                fetchReferrals()
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
                  <SelectItem value="referredName">Referred Name</SelectItem>
                  <SelectItem value="referredEmail">Referred Email</SelectItem>
                  <SelectItem value="referredMobile">Referred Mobile</SelectItem>
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

    {/* Referrals Table */}
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-700">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedReferrals.length === referrals.length && referrals.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600"
              />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Referred Email</TableHead>
            <TableHead>Referred Name</TableHead>
            <TableHead>Referred Mobile</TableHead>
            <TableHead>Referral Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Completed At</TableHead>
            <TableHead className="w-32">OPERATIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow
              key={referral.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedReferrals.includes(referral.id)}
                  onChange={() => handleUserSelect(referral.id)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </TableCell>
              <TableCell
                className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => handleEditWithUrl(referral)}
              >
                {referral.email}
              </TableCell>
              <TableCell>{referral.mobile}</TableCell>
              <TableCell>{referral.referredEmail}</TableCell>
              <TableCell>{referral.referredName}</TableCell>
              <TableCell>{referral.referredMobile}</TableCell>
              <TableCell>
                {referral.referralAmount}
              </TableCell>
              <TableCell>
                {referral.status}
              </TableCell>
              <TableCell>
                {referral.createdAt}
              </TableCell>
              <TableCell>
                {referral.completedAt || "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWithUrl(referral)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(referral.id)}
                    className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {referrals.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 dark:text-gray-400">
                No referrals found
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

  {/* Create Referral Modal */}
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
          {isEditing ? "Update Referral" : "Create New Referral"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referredEmail">Referred Email</Label>
            <Input
              id="referredEmail"
              type="email"
              value={formData.email}
              disabled
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="referredName">Referred Name</Label>
            <Input
              id="referredName"
              value={formData.referredName}
              disabled
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralAmount">Referral Amount</Label>
            <Input
              id="referralAmount"
              value={formData.referralAmount}
              disabled
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
             <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  <span>{formData.status || "Select field"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="new">new</SelectItem>
                </SelectContent>
              </Select>
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
            {isEditing ? "Update Referral" : "Create Referral"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</AdminLayout>

  )
}
