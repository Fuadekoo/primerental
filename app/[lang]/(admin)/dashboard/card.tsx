"use client";
import React from "react";
import { Briefcase, DollarSign, Home, Plus, User, Users } from "lucide-react";
import { useData } from "@/hooks/useData";
import { getDashboardCardsData } from "@/actions/admin/dashboard";

// --- MOCK DATA & TYPES ---
// type Stat = {
//   title: string;
//   value: string;
//   icon: React.ReactNode;
//   color: string;
// };

// --- TRANSLATIONS ---
// const translations = {
//   en: {
//     welcomeBack: "Welcome Back",
//     description: "Here's a summary of your property management activities.",
//     totalProperties: "Total Properties",
//     activeTenants: "Active Tenants",
//     maintenanceRequests: "Maintenance",
//     viewDetails: "View details",
//     revenueOverview: "Revenue Overview",
//     topTenants: "Top Tenants",
//     upcomingAppointments: "Upcoming Appointments",
//     today: "Today",
//     addNew: "Add New",
//     jobApplications: "Job Applications",
//     interviews: "Interviews",
//     hired: "Hired",
//     recentActivity: "Recent Activity",
//     viewAllActivity: "View All Activity",
//   },
//   am: {
//     welcomeBack: "እንኳን ደህና መጡ",
//     description: "የንብረት አስተዳደር እንቅስቃሴዎችዎ ማጠቃለያ ይኸውና።",
//     totalProperties: "ጠቅላላ ንብረቶች",
//     activeTenants: "በአገልግሎት ላይ ያሉ ተከራዮች",
//     maintenanceRequests: "የጥገና ጥያቄዎች",
//     viewDetails: "ዝርዝሮችን ይመልከቱ",
//     revenueOverview: "የገቢ አጠቃላይ እይታ",
//     topTenants: "ምርጥ ተከራዮች",
//     upcomingAppointments: "መጪ ቀጠሮዎች",
//     today: "ዛሬ",
//     addNew: "አዲስ ጨምር",
//     jobApplications: "የሥራ ማመልከቻዎች",
//     interviews: "ቃለ መጠይቆች",
//     hired: "ተቀጥረዋል",
//     recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
//     viewAllActivity: "ሁሉንም እንቅስቃሴ ይመልከቱ",
//   },
// };
// --- SUB-COMPONENTS ---

// const StatCard = ({ stat, t }: { stat: Stat; t: Record<string, string> }) => (
//   <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
//     <div className="flex items-center gap-4">
//       <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
//       <div>
//         <p className="text-2xl font-bold text-gray-900 dark:text-white">
//           {stat.value}
//         </p>
//         <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
//       </div>
//     </div>
//     <a
//       href="#"
//       className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
//     >
//       {t.viewDetails} <ArrowRight className="ml-1 h-4 w-4" />
//     </a>
//   </div>
// );

export default function Card() {
  const [cardData, isLoadingCardData] = useData(
    getDashboardCardsData,
    () => {}
  );
  // const t = translations.en;

  // Prepare stats from backend data
  const stats = [
    {
      title: "Total Requests",
      value: isLoadingCardData ? "..." : cardData?.totalRequests ?? 0,
      icon: <Home className="h-6 w-6 text-green-700" />,
      color: "bg-green-100 dark:bg-green-900/50",
    },
    {
      title: "Total Registered",
      value: isLoadingCardData ? "..." : cardData?.totalRegistered ?? 0,
      icon: <Users className="h-6 w-6 text-blue-700" />,
      color: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: "Visited Requests",
      value: isLoadingCardData ? "..." : cardData?.visitedRequests ?? 0,
      icon: <Briefcase className="h-6 w-6 text-orange-700" />,
      color: "bg-orange-100 dark:bg-orange-900/50",
    },
    {
      title: "Not Visited Requests",
      value: isLoadingCardData ? "..." : cardData?.notVisitedRequests ?? 0,
      icon: <User className="h-6 w-6 text-yellow-700" />,
      color: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      title: "Visited Registered",
      value: isLoadingCardData ? "..." : cardData?.visitedRegistered ?? 0,
      icon: <DollarSign className="h-6 w-6 text-purple-700" />,
      color: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      title: "Not Visited Registered",
      value: isLoadingCardData ? "..." : cardData?.notVisitedRegistered ?? 0,
      icon: <Plus className="h-6 w-6 text-red-700" />,
      color: "bg-red-100 dark:bg-red-900/50",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// export default Card;
