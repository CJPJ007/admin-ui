"use client"

import type React from "react"
import { useState } from "react"
import AdminLayout from "@/components/layout/admin-layout"
import api from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, KeyRound } from "lucide-react"
import Link from "next/link"

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData({
      ...formData,
      [id]: value,
    })

    // Clear errors when user starts typing
    if (error) setError("")
    if (validationErrors.length > 0) setValidationErrors([])
    if (success) setSuccess(false)
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    })
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Password must contain at least one special character (@$!%*?&)")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setValidationErrors([])
    setSuccess(false)

    // Validation
    if (!formData.currentPassword) {
      setError("Current password is required")
      return
    }

    if (!formData.newPassword) {
      setError("New password is required")
      return
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your new password")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password")
      return
    }

    // Password strength validation
    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setValidationErrors(passwordErrors)
      return
    }

    setLoading(true)

    try {
      const response = await api("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setError("An error occurred while changing password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let score = 0
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
      /(?=.*[@$!%*?&])/.test(password),
    ]

    score = checks.filter(Boolean).length

    if (score <= 2) return { strength: score, label: "Weak", color: "bg-red-500" }
    if (score <= 3) return { strength: score, label: "Fair", color: "bg-yellow-500" }
    if (score <= 4) return { strength: score, label: "Good", color: "bg-blue-500" }
    return { strength: score, label: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm tracking-wide text-gray-600">
            <Link href="/admin/dashboard" className="text-blue-500 hover:text-blue-700">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Change Password</span>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600">Update your password to keep your account secure</p>
          </div>

          {/* Change Password Form */}
          <Card className="shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-5 w-5 text-blue-600" />
                Password Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Success Alert */}
              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password changed successfully! Your account is now more secure.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="font-medium mb-2">Password requirements not met:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    Current Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      required
                      className="pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                      className="pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password Strength</span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.strength <= 2
                              ? "text-red-600"
                              : passwordStrength.strength <= 3
                                ? "text-yellow-600"
                                : passwordStrength.strength <= 4
                                  ? "text-blue-600"
                                  : "text-green-600"
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center gap-2 mt-1">
                      {formData.newPassword === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${/(?=.*[a-z])/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${/(?=.*[A-Z])/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${/(?=.*\d)/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${/(?=.*[@$!%*?&])/.test(formData.newPassword) ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Link href="/admin/dashboard">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={
                      loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword
                    }
                    className="btn-primary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="mt-6 bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Use a unique password</div>
                    <div>Don't reuse passwords from other accounts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Enable two-factor authentication</div>
                    <div>Add an extra layer of security to your account</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Use a password manager</div>
                    <div>Generate and store strong passwords securely</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Regular updates</div>
                    <div>Change your password periodically for better security</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
