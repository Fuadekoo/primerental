"use client";
import React from "react";
import { useParams } from "next/navigation";
import Card from "./card";
import Chart from "./chart";
import Top from "./top";
import ApplicationStats from "./ApplicationStats";
import Schedule from "./Schedule";
import RecentActivity from "./RecentActivity";

// --- TRANSLATIONS ---
const translations = {
  en: {
    welcomeBack: "Welcome Back",
    description: "Here's a summary of your property management activities.",
    totalProperties: "Total Properties",
    activeTenants: "Active Tenants",
    maintenanceRequests: "Maintenance",
    viewDetails: "View details",
    revenueOverview: "Revenue Overview",
    topTenants: "Top Tenants",
    upcomingAppointments: "Upcoming Appointments",
    today: "Today",
    addNew: "Add New",
    jobApplications: "Job Applications",
    interviews: "Interviews",
    hired: "Hired",
    recentActivity: "Recent Activity",
    viewAllActivity: "View All Activity",
  },
  am: {
    welcomeBack: "እንኳን ደህና መጡ",
    description: "የንብረት አስተዳደር እንቅስቃሴዎችዎ ማጠቃለያ ይኸውና።",
    totalProperties: "ጠቅላላ ንብረቶች",
    activeTenants: "በአገልግሎት ላይ ያሉ ተከራዮች",
    maintenanceRequests: "የጥገና ጥያቄዎች",
    viewDetails: "ዝርዝሮችን ይመልከቱ",
    revenueOverview: "የገቢ አጠቃላይ እይታ",
    topTenants: "ምርጥ ተከራዮች",
    upcomingAppointments: "መጪ ቀጠሮዎች",
    today: "ዛሬ",
    addNew: "አዲስ ጨምር",
    jobApplications: "የሥራ ማመልከቻዎች",
    interviews: "ቃለ መጠይቆች",
    hired: "ተቀጥረዋል",
    recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
    viewAllActivity: "ሁሉንም እንቅስቃሴ ይመልከቱ",
  },
};

// --- SUB-COMPONENTS ---

// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const params = useParams();
  const lang = ((params?.lang) || "en") as "en" | "am";
  const t = translations[lang];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 min-h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t.welcomeBack}, Admin 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t.description}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card />
          <Chart />
          <Top />
        </div>
        <div className="space-y-8">
          <Schedule />
          <ApplicationStats />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
