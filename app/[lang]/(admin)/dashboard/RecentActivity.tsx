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

type ActivityItem = {
  icon: React.ReactNode;
  text: string;
  time: string;
  iconColor: string;
};

const activityItems: ActivityItem[] = [
  {
    icon: <Home size={16} />,
    text: "New property 'Sunrise Apartments' was listed.",
    time: "15m ago",
    iconColor: "text-green-500 bg-green-100 dark:bg-green-900/50",
  },
  {
    icon: <DollarSign size={16} />,
    text: "Rent payment of $1,200 received from John D.",
    time: "1h ago",
    iconColor: "text-blue-500 bg-blue-100 dark:bg-blue-900/50",
  },
  {
    icon: <Briefcase size={16} />,
    text: "Maintenance request for 'Leaky Faucet' was closed.",
    time: "3h ago",
    iconColor: "text-orange-500 bg-orange-100 dark:bg-orange-900/50",
  },
  {
    icon: <User size={16} />,
    text: "New tenant application received from Jane Smith.",
    time: "1d ago",
    iconColor: "text-purple-500 bg-purple-100 dark:bg-purple-900/50",
  },
];

const RecentActivities = ({ t }: { t: any }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.recentActivity}
    </h3>
    <div className="mt-4 space-y-4">
      {activityItems.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${item.iconColor}`}
          >
            {item.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {item.text}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {item.time}
            </p>
          </div>
        </div>
      ))}
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
  // Example translation object, replace with your actual i18n implementation
  const t = {
    recentActivity: "Recent Activity",
    viewAllActivity: "View All Activity",
  };

  return (
    <div>
      <RecentActivities t={t} />
    </div>
  );
}

export default RecentActivity;
