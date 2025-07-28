"use client";
import ViewsTrend from "@/components/charts/ViewTrend";
import UserAgentStats from "@/components/charts/UserAgentStats";
import TopProperties from "@/components/charts/TopProperties";
import {
  fetchViewsTrend,
  fetchUserAgentStats,
  fetchTopProperties,
} from "@/utils/api";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";

export default function PropertyAnalyticsPage() {
  const propertyId = 1; // adjust as needed
  const startDate = "2025-07-01";
  const endDate = "2025-07-19";
  const [trendData, setTrendData] = useState<any[]>([]);
  const [userAgentData, setUserAgentData] = useState<any[]>([]);
  const [topPropertiesData, setTopPropertiesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trend, userAgents, topProperties] = await Promise.all([
          fetchViewsTrend(propertyId, startDate, endDate),
          fetchUserAgentStats(propertyId),
          fetchTopProperties(),
        ]);
        setTrendData(trend);
        setUserAgentData(userAgents);
        setTopPropertiesData(topProperties);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchData();
  }, [propertyId, startDate, endDate]);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Reports
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ViewsTrend data={trendData} />
          <UserAgentStats data={userAgentData} />
          <TopProperties data={topPropertiesData} />
        </div>
      </div>
    </AdminLayout>
  );
}
