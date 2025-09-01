"use client";
import React from "react";
import {
  ArrowRight,
  BarChart2,
  Briefcase,
  DollarSign,
  Home,
  MoreVertical,
  Plus,
  User,
  Users,
} from "lucide-react";
import useAction from "@/hooks/useActions";
import { getDashboardRecentActivity } from "@/actions/admin/dashboard";
type ActivityItem = {
  icon: React.ReactNode;
  text: string;
  time: string;
  iconColor: string;
};

const iconMap: Record<string, React.ReactNode> = {
  property: <Home size={16} />,
  payment: <DollarSign size={16} />,
  maintenance: <Briefcase size={16} />,
  user: <User size={16} />,
};

const colorMap: Record<string, string> = {
  property: "text-green-500 bg-green-100 dark:bg-green-900/50",
  payment: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
  maintenance: "text-orange-500 bg-orange-100 dark:bg-orange-900/50",
  user: "text-purple-500 bg-purple-100 dark:bg-purple-900/50",
};

const RecentActivities = ({
  t,
  activities,
  isLoading,
}: {
  t: any;
  activities: any[];
  isLoading: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.recentActivity}
    </h3>
    <div className="mt-4 space-y-4">
      {isLoading ? (
        <div className="text-gray-400 text-center py-8">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No recent activity.
        </div>
      ) : (
        activities.map((item: any, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                colorMap[item.type || "property"]
              }`}
            >
              {iconMap[item.type || "property"]}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {/* Show full name if available, else fallback */}
                {item.firstName && item.lastName
                  ? `${item.firstName} ${item.lastName}`
                  : item.fullname
                  ? item.fullname
                  : item.text || item.title || item.propertyType || "Activity"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : item.time || ""}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
    <a
      href="#"
      className="mt-4 block text-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {t.viewAllActivity}
    </a>
  </div>
);

function RecentActivity() {
  const [activityData, refreshActivity, isLoadingActivity] = useAction(
    getDashboardRecentActivity,
    [true, () => {}]
  );

  // Example translation object, replace with your actual i18n implementation
  const t = {
    recentActivity: "Recent Activity",
    viewAllActivity: "View All Activity",
  };

  return (
    <div>
      <RecentActivities
        t={t}
        activities={activityData || []}
        isLoading={isLoadingActivity}
      />
    </div>
  );
}

export default RecentActivity;
