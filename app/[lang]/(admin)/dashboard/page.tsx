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
import Image from "next/image";
import { Button } from "@heroui/react";
import { useParams } from "next/navigation";

// --- MOCK DATA & TYPES ---
type Stat = {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
};
type Performer = { name: string; email: string; avatar: string };
type Meeting = {
  title: string;
  time: string;
  attendees: string[];
  color: string;
};
type ActivityItem = {
  icon: React.ReactNode;
  text: string;
  time: string;
  iconColor: string;
};

const performers: Performer[] = [
  {
    name: "Rainer Brown",
    email: "rainer.b@example.com",
    avatar: "/avatars/01.png",
  },
  {
    name: "Alex Sullivan",
    email: "alex.s@example.com",
    avatar: "/avatars/02.png",
  },
  {
    name: "Conny Rany",
    email: "conny.r@example.com",
    avatar: "/avatars/03.png",
  },
  {
    name: "Lily Alexa",
    email: "lily.a@example.com",
    avatar: "/avatars/04.png",
  },
  {
    name: "Armin Falcon",
    email: "armin.f@example.com",
    avatar: "/avatars/05.png",
  },
  {
    name: "Agatha Smith",
    email: "agatha.s@example.com",
    avatar: "/avatars/01.png",
  },
];

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

const StatCard = ({ stat, t }: { stat: Stat; t: any }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {stat.value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
      </div>
    </div>
    <a
      href="#"
      className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {t.viewDetails} <ArrowRight className="ml-1 h-4 w-4" />
    </a>
  </div>
);

const RevenueChart = ({ t }: { t: any }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.revenueOverview}
    </h3>
    <div className="h-64 mt-4 flex items-center justify-center text-gray-400">
      <BarChart2 className="h-16 w-16 text-gray-300 dark:text-gray-600" />
      <p className="ml-4">Chart Data Goes Here</p>
    </div>
  </div>
);

const TopPerformers = ({ t }: { t: any }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.topTenants}
    </h3>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {performers.map((performer) => (
        <div key={performer.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={performer.avatar}
              alt={performer.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {performer.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {performer.email}
              </p>
            </div>
          </div>
          <Button isIconOnly variant="light" size="sm">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);

const Schedule = ({ t }: { t: any }) => {
  const meetings: Meeting[] = [
    {
      title: "Meeting with Herry",
      time: "12:00 - 01:00 PM",
      attendees: ["/avatars/01.png", "/avatars/02.png", "/avatars/03.png"],
      color: "border-green-500",
    },
    {
      title: "Meeting with Salah",
      time: "02:00 - 03:00 PM",
      attendees: ["/avatars/04.png", "/avatars/05.png", "/avatars/01.png"],
      color: "border-blue-500",
    },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
        {t.upcomingAppointments}
      </h3>
      <div className="mt-4 space-y-4">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {t.today}
        </p>
        {meetings.map((meeting) => (
          <div
            key={meeting.title}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${meeting.color} bg-gray-50 dark:bg-gray-700/50`}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {meeting.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meeting.time}
              </p>
            </div>
            <div className="flex -space-x-2">
              {meeting.attendees.map((att, i) => (
                <Image
                  key={i}
                  src={att}
                  alt="attendee"
                  width={24}
                  height={24}
                  className="rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ApplicationStats = ({ t }: { t: any }) => (
  <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/30 relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 uppercase">
        {t.jobApplications}
      </p>
      <h3 className="font-bold text-lg text-rose-800 dark:text-rose-200 mt-1">
        {t.jobApplications}
      </h3>
      <div className="mt-4 flex items-baseline gap-6">
        <div>
          <p className="text-3xl font-bold text-rose-900 dark:text-white">
            246
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-200">
            {t.interviews}
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold text-rose-900 dark:text-white">
            101
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-200">{t.hired}</p>
        </div>
      </div>
    </div>
    <Briefcase className="absolute -right-4 -bottom-4 h-24 w-24 text-rose-500/10 dark:text-rose-400/5" />
  </div>
);

const RecentActivity = ({ t }: { t: any }) => (
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

// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const params = useParams();
  const lang = (params.lang || "en") as "en" | "am";
  const t = translations[lang];

  const stats: Stat[] = [
    {
      title: t.totalProperties,
      value: "560",
      icon: <Home className="h-6 w-6 text-green-700" />,
      color: "bg-green-100 dark:bg-green-900/50",
    },
    {
      title: t.activeTenants,
      value: "1240",
      icon: <Users className="h-6 w-6 text-blue-700" />,
      color: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: t.maintenanceRequests,
      value: "40",
      icon: <Briefcase className="h-6 w-6 text-orange-700" />,
      color: "bg-orange-100 dark:bg-orange-900/50",
    },
  ];

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
        <Button color="primary" className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          {t.addNew}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.title} stat={stat} t={t} />
            ))}
          </div>
          <RevenueChart t={t} />
          <TopPerformers t={t} />
        </div>

        <div className="space-y-8">
          <Schedule t={t} />
          <ApplicationStats t={t} />
          <RecentActivity t={t} />
        </div>
      </div>
    </div>
  );
}
