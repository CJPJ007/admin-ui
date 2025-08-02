"use client";

import AdminLayout from "@/components/layout/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ImageIcon,
  Users,
  FileText,
  BookOpen,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CacheItem, CacheManagementResponse } from "@/utils/interfaces";
import Link from "next/link";
import api from "@/utils/api";

interface LocalCacheItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  lastCleared?: string;
  size?: number;
  status: "active" | "clearing" | "cleared";
}

interface CacheManagementToast {
  title: string;
  description: string;
  variant?: string;
}

export default function CacheManagement() {
  const { toast } = useToast();
  const [cacheItems, setCacheItems] = useState<LocalCacheItem[]>([
    {
      id: "properties",
      name: "Properties",
      description: "Clear property listings, images, and related data cache",
      icon: Home,
      status: "active",
    },
    {
      id: "sliders",
      name: "Sliders",
      description: "Clear homepage sliders and banner images cache",
      icon: ImageIcon,
      status: "active",
    },
    {
      id: "companyInfoAll",
      name: "Company Info",
      description: "Clear company information (social media, email, etc.) cache",
      icon: FileText,
      status: "active",
    },
    {
      id: "companyValuesAll",
      name: "Company Values",
      description: "Clear company values new or edit cache",
      icon: FileText,
      status: "active",
    },
    {
      id: "teamMembersAll",
      name: "Team Members",
      description: "Clear team members information cache",
      icon: User,
      status: "active",
    },
    {
      id: "aboutUsContentAll",
      name: "About Us Story",
      description: "Clear about us story and terms/conditions cache",
      icon: FileText,
      status: "active",
    },
    {
      id: "blogs",
      name: "Blogs",
      description: "Clear blog posts, categories, and comments cache",
      icon: BookOpen,
      status: "active",
    },
  ]);

  const [isClearing, setIsClearing] = useState<boolean>(false);

  const getAllCache = async () => {
    try {
      const result = await api("/api/admin/cache/cacheInfo");

      const response = await result.json();

      if (!response || !Array.isArray(response)) {
        throw new Error("Invalid cache data received");
      }
      response.forEach((item: CacheManagementResponse) => {
        cacheItems.forEach((cacheItem) => {
          if (item.cacheName === cacheItem.id) {
            cacheItem.lastCleared = item.lastClearedTime;
            cacheItem.size = item.size;
          }
        });
        setCacheItems([...cacheItems]);
      });
    } catch (error) {
      console.error("Error : ", error);
    }
  };

  useEffect(() => {
    getAllCache();
  }, []);

  function getTimestmap(createdAt?: string): React.ReactNode {
    // Parse date string in format: 'Sun Jul 27 10:28:50 IST 2025'
    // Example: 'Sun Jul 27 10:28:50 IST 2025'
    if (!createdAt) return "Never Cleared";
    let createdAtDate: Date;
    if (
      /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{2}:\d{2}:\d{2} [A-Z]{3,} \d{4}$/.test(
        createdAt
      )
    ) {
      // Remove timezone abbreviation for Date parsing
      const parts = createdAt.split(" ");
      if (parts.length === 6) {
        // Remove the 5th part (timezone)
        const dateStr =
          [parts[0], parts[1], parts[2], parts[3], parts[5]].join(" ") +
          " " +
          parts[4];
        // This will be like: 'Sun Jul 27 2025 10:28:50'
        createdAtDate = new Date(
          `${parts[1]} ${parts[2]} ${parts[5]} ${parts[3]}`
        );
      } else {
        createdAtDate = new Date(createdAt);
      }
    } else {
      createdAtDate = new Date(createdAt);
    }
    const now = new Date();
    const diffMs = now.getTime() - createdAtDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay < 7) return `${diffDay} days ago`;

    return createdAtDate.toLocaleDateString();
  }

  const clearCache = async (cacheId: string): Promise<void> => {
    // Update status to clearing
    setCacheItems((prev) =>
      prev.map((item) =>
        item.id === cacheId ? { ...item, status: "clearing" as const } : item
      )
    );

    try {
      await api(`/api/admin/cache/evictCache/${cacheId}`, {
        method: "DELETE",
      });
      // Update status to cleared
      setCacheItems((prev) =>
        prev.map((item) =>
          item.id === cacheId
            ? {
                ...item,
                status: "cleared" as const,
                lastCleared: (new Date()).toLocaleString(),
                size: 0,
              }
            : item
        )
      );

      toast({
        title: "Cache Cleared",
        description: `${
          cacheItems.find((item) => item.id === cacheId)?.name
        } cache has been cleared successfully.`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setCacheItems((prev) =>
          prev.map((item) =>
            item.id === cacheId ? { ...item, status: "active" as const } : item
          )
        );
      }, 3000);
    } catch (error) {
      setCacheItems((prev) =>
        prev.map((item) =>
          item.id === cacheId ? { ...item, status: "active" as const } : item
        )
      );

      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearAllCache = async (): Promise<void> => {
    setIsClearing(true);

    // Update all items to clearing status
    setCacheItems((prev) =>
      prev.map((item) => ({ ...item, status: "clearing" as const }))
    );

    try {
      // Simulate API call
      await api("/api/admin/cache/clearAllCaches", {
        method: "POST",
      });

      // Update all items to cleared status
      setCacheItems((prev) =>
        prev.map((item) => ({
          ...item,
          status: "cleared" as const,
          lastCleared: new Date().toLocaleString(),
          size: 0,
        }))
      );

      toast({
        title: "All Cache Cleared",
        description: "All cache has been cleared successfully.",
      });

      // Reset all statuses after 3 seconds
      setTimeout(() => {
        setCacheItems((prev) =>
          prev.map((item) => ({ ...item, status: "active" as const }))
        );
        setIsClearing(false);
      }, 3000);
    } catch (error) {
      setCacheItems((prev) =>
        prev.map((item) => ({ ...item, status: "active" as const }))
      );
      setIsClearing(false);

      toast({
        title: "Error",
        description: "Failed to clear all cache. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: LocalCacheItem["status"]) => {
    switch (status) {
      case "clearing":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Clearing
          </Badge>
        );
      case "cleared":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Cleared
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
    }
  };

  const totalSize: number = cacheItems.reduce(
    (total: number, item: LocalCacheItem) => {
      return total + (item.size ? item.size : 0);
    },
    0
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="text-sm tracking-wide">
            <Link
              href="/admin/dashboard"
              className="p-0 h-auto text-blue-500 hover:text-blue-700"
            >
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/admin/administration"
              className="p-0 h-auto text-blue-500 hover:text-blue-700"
            >
              System
            </Link>
            <span className="mx-2">/</span>
            <span>Cache Management</span>
          </div>
        </nav>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Cache Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Clear cache to ensure your site displays the latest content
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Cache Size
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalSize.toFixed(1)} MB
              </p>
            </div>
            <Button
              onClick={clearAllCache}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Clearing All...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Cache
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Cache Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cacheItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">
                    {item.description}
                  </CardDescription>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Last cleared: {getTimestmap(item.lastCleared)}</span>
                    <span className="font-medium">
                      {item.size ? item.size : 0} MB
                    </span>
                  </div>

                  <Button
                    onClick={() => clearCache(item.id)}
                    disabled={item.status === "clearing" || isClearing}
                    variant="outline"
                    className="w-full"
                  >
                    {item.status === "clearing" ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cache
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Information Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  About Cache Management
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <p>
                    • <strong>Properties:</strong> Clears property listings,
                    search results, and property images from cache
                  </p>
                  <p>
                    • <strong>Sliders:</strong> Removes cached homepage banners
                    and promotional images
                  </p>
                  <p>
                    • <strong>Users:</strong> Clears user profile data and
                    authentication sessions
                  </p>
                  <p>
                    • <strong>Pages:</strong> Removes cached static pages and
                    navigation menus
                  </p>
                  <p>
                    • <strong>Blogs:</strong> Clears blog posts, categories, and
                    comment data from cache
                  </p>
                  <p className="pt-2 border-t border-blue-200 dark:border-blue-700">
                    <strong>Note:</strong> Clearing cache may temporarily slow
                    down your site as data is rebuilt. This is normal and
                    performance will return to normal shortly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
