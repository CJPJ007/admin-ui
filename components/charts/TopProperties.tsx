"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TopProperties({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="propertyName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
