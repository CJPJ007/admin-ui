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
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertyAnalyticsPage() {
  const propertyId = 1; // adjust as needed
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [trendData, setTrendData] = useState<any[]>([]);
  const [userAgentData, setUserAgentData] = useState<any[]>([]);
  const [topPropertiesData, setTopPropertiesData] = useState<any[]>([]);
  const reports = [
    { name: "Customers", href: "/admin/customers", description: "Detailed customer insights" },
    { name: "Agents", href: "/admin/agents", description: "Agent performance metrics" },
    { name: "Referrals", href: "/admin/referrals", description: "Referral tracking and analysis" },
    { name: "Inquiries", href: "/admin/inquiries", description: "Inquiry response rates" },
    { name: "Properties", href: "/admin/properties", description: "Property listing performance" },
  ];
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
                onChange={(e) => {
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
                onChange={(e) => {
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
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Other Reports
            </h2>
          </div>

          <Card>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Card
                    key={report.name}
                    className="mt-4 !p-3 hover:shadow-lg transition-shadow duration-150 cursor-pointer"
                  >
                    <Link href={report.href} className="block">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {report.name} Report
                          </h3>
                          {report.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {report.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            View
                          </span>
                        </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}
