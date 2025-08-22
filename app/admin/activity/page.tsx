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
import type { ActivityLog, FilterType } from "@/utils/interfaces"
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

export default function Activities() {

  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterType[]>([{ field: "", operator: "equals", value: "" }])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [currentPage])

  const fetchActivities = async () => {
          setLoading(true)
    try {
      const searchCriteriaList = convertToSearchCriteriaList(filters)
      const data = await (
        await api(`/api/fieldSearch/advancedSearch/ActivityLog?page=${currentPage}&size=${itemsPerPage}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteriaList),
        })
      ).json()
      setActivities(data.data || [])
      setTotalRecords(data.totalRecords || 0)
    } catch (error) {
      console.error("Error fetching activities:", error)
    }finally {
      setLoading(false)
    }
  }

  
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this activityLog?")) {
      try {
        await api(`/api/admin/activities/${id}`, {
          method: "DELETE",
        })
        fetchActivities()
      } catch (error) {
        console.error("Error deleting activityLog:", error)
        alert(`Failed to delete activityLog: ${error}`)
      }
    }
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
    fetchActivities()
    setShowFilters(false)
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      alert("Please select activities first")
      return
    }

    switch (action) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} activities?`)) {
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
    if (selectedUsers.length === activities.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(activities.map((activityLog) => activityLog.id))
    }
  }

  const handleUserSelect = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }


  const filteredActivities = activities;
  // .filter(
  //   (acitvityLog) =>
  //     acitvityLog.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     activityLog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     activityLog.email.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

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
  <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
    {/* Breadcrumb */}
    <nav className="mb-6">
      <div className="text-sm tracking-wide text-gray-600 dark:text-gray-300">
        <Link
          href="/admin/dashboard"
          className="p-0 h-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/admin/administration"
          className="p-0 h-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          System
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200">Activity Log</span>
      </div>
    </nav>

    {/* Action Bar */}
    <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
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
                fetchActivities();
                setCurrentPage(1);
                setFilters([{ field: "", operator: "equals", value: "" }]);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
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
      <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </CardHeader>
        <CardContent>
          {filters.map((filter, index) => (
            <div key={index} className="flex gap-3 mb-3 items-center">
              <Select
                value={filter.field}
                onValueChange={(value) => updateFilter(index, "field", value)}
              >
                <SelectTrigger className="w-40 dark:bg-gray-700 dark:text-gray-100">
                  <span>{filter.field || "Select field"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
                  <SelectItem value="name">Username</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="tablename">TableName</SelectItem>
                  <SelectItem value="ipAddress">Ip Address</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(index, "operator", value)}
              >
                <SelectTrigger className="w-32 dark:bg-gray-700 dark:text-gray-100">
                  <span>{filter.operator || "Operator"}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700">
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
                className="w-48 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              />

              {filters.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(index)}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-600/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={addFilter} className="dark:border-gray-600 dark:text-gray-200">
              Add additional filter
            </Button>
            <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Users Table */}
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-700">
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedUsers.length === activities.length && activities.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 dark:border-gray-600"
              />
            </TableHead>
            <TableHead className="dark:text-gray-200">USERNAME</TableHead>
            <TableHead className="dark:text-gray-200">ACTION</TableHead>
            <TableHead className="dark:text-gray-200">TABLENAME</TableHead>
            <TableHead className="dark:text-gray-200">IP ADDRESS</TableHead>
            <TableHead className="dark:text-gray-200">CREATED AT</TableHead>
            <TableHead className="w-32 dark:text-gray-200">OPERATIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredActivities.map((activityLog) => (
            <TableRow
              key={activityLog.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(activityLog.id)}
                  onChange={() => handleUserSelect(activityLog.id)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </TableCell>
              <TableCell className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer">
                {activityLog.name}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    activityLog.action === "Created" ||
                    activityLog.action === "LoggedIn"
                      ? "bg-green-500"
                      : activityLog.action === "Updated"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  } text-white`}
                >
                  {activityLog.action}
                </Badge>
              </TableCell>
              <TableCell className="dark:text-gray-200">{activityLog.tableName}</TableCell>
              <TableCell className="dark:text-gray-200">{activityLog.ipAddress}</TableCell>
              <TableCell className="dark:text-gray-300">
                {new Date(activityLog.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(activityLog.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredActivities.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-gray-500 dark:text-gray-400"
              >
                No activities found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
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
            className="dark:border-gray-600 dark:text-gray-200"
          >
            Previous
          </Button>

          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            {currentPage}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="dark:border-gray-600 dark:text-gray-200"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  </div>
</AdminLayout>

  )
}
