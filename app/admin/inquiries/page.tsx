"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Reply, Trash2 } from "lucide-react"

interface Inquiry {
  id: number
  name: string
  email: string
  message: string
  property: { title: string } | null
  createdAt: string
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const data = await (await api("/api/admin/inquiries")).json()
      setInquiries(data)
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    }
  }

  const deleteInquiry = async (id: number) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await api(`/api/admin/inquiries/${id}`, {
          method: "DELETE",
        })
        fetchInquiries()
      } catch (error) {
        console.error("Error deleting inquiry:", error)
      }
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Manage Inquiries</h1>

        <Card>
          <CardHeader>
            <CardTitle>Customer Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                    <TableCell>
                      {inquiry.property ? (
                        <Badge variant="secondary">{inquiry.property.title}</Badge>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteInquiry(inquiry.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {inquiries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
