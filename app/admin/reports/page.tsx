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
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
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
          <div className="col-span-1 lg:col-span-2 flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  // Prevent selecting endDate before startDate
                  if (new Date(e.target.value) <= new Date(endDate)) {
                    // @ts-ignore
                    setStartDate(e.target.value);
                  }
                }}
                className="border rounded px-2 py-1"
                max={endDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => {
                  // Prevent selecting startDate after endDate
                  if (new Date(e.target.value) >= new Date(startDate)) {
                    // @ts-ignore
                    setEndDate(e.target.value);
                  }
                }}
                className="border rounded px-2 py-1"
                min={startDate}
              />
            </div>
          </div>
          <ViewsTrend data={trendData} />
          <UserAgentStats data={userAgentData} />
          <TopProperties data={topPropertiesData} />
        </div>
      </div>
    </AdminLayout>
  );
}
