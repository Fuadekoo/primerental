"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDashboardGraphData } from "@/actions/admin/dashboard";

// const months = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

const RevenueChart = ({
  data,
  t,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  t: { revenueOverview: string };
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.revenueOverview}
    </h3>
    <div className="h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              borderColor: "#374151",
            }}
          />
          <Legend />
          <Bar
            dataKey="requestCount"
            fill="#8884d8"
            name="Requests"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="registerCount"
            fill="#82ca9d"
            name="Registered"
            activeBar={<Rectangle fill="gold" stroke="purple" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

function Chart() {
  const t = { revenueOverview: "Requests & Registered Overview" };
  const [year, setYear] = useState(new Date().getFullYear());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [graphData, setGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDashboardGraphData(year).then((data) => {
      setGraphData(data);
      setLoading(false);
    });
  }, [year]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold">Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>
      {loading ? (
        <div className="text-gray-500 py-10 text-center">Loading chart...</div>
      ) : (
        <RevenueChart data={graphData} t={t} />
      )}
    </div>
  );
}

export default Chart;
