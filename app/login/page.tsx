"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle, EyeOff, Eye } from "lucide-react";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/public/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const name = await response.text();
        localStorage.setItem("name", name);
        router.push("/admin/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = () => {
    alert("Password recovery functionality would be implemented here");
  };

  const features = [
    "Lead Automation & Management",
    "Workflows & Sales Automation",
    "Android Dialer & Call Tracking",
    "Integrations",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Section (Decorative) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white via-red-50 to-red-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <h1 className="text-4xl font-bold mb-4">Ananta Realty</h1>
          <p className="text-xl mb-8 opacity-90">
            Ananta Lo Petubadi Anantamina Rabadi
          </p>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Section (Login Form) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Ananta Realty
              </CardTitle>
              <CardDescription>
                Welcome back, Please sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Email here..."
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={formData.password}
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

                {/* <Button
                  type="button"
                  variant="link"
                  onClick={handleRecoverPassword}
                  className="w-full text-right p-0 h-auto text-sm text-gray-600 hover:text-gray-800"
                >
                  Recover Password
                </Button> */}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Logging in..." : "Login to Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
