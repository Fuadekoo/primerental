"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// 1. Card summary stats
export async function getDashboardCardsData() {
  const totalRequests = await prisma.propertyRequest.count();
  const totalRegistered = await prisma.propertyRegistration.count();
  const visitedRequests = await prisma.propertyRequest.count({
    where: { isVisited: true },
  });
  const notVisitedRequests = await prisma.propertyRequest.count({
    where: { isVisited: false },
  });
  const visitedRegistered = await prisma.propertyRegistration.count({
    where: { isVisited: true },
  });
  const notVisitedRegistered = await prisma.propertyRegistration.count({
    where: { isVisited: false },
  });
  return {
    totalRequests,
    totalRegistered,
    visitedRequests,
    notVisitedRequests,
    visitedRegistered,
    notVisitedRegistered,
  };
}

// 2. Graph data for a year (monthly totals)
export async function getDashboardGraphData(year: number) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const data = await Promise.all(
    months.map(async (month) => {
      const requestCount = await prisma.propertyRequest.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
      });
      const registerCount = await prisma.propertyRegistration.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
      });
      return {
        monthName: new Date(year, month - 1, 1).toLocaleString("default", {
          month: "short",
        }),
        requestCount,
        registerCount,
      };
    })
  );
  return data;
}

// 3. Recent activity (last 10 actions)
export async function getDashboardRecentActivity() {
  const recentRequests = await prisma.propertyRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const recentRegistered = await prisma.propertyRegistration.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return [...recentRequests, ...recentRegistered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// 4. Today's requests
export async function getDashboardTodayRequests() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const requests = await prisma.propertyRequest.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  return requests;
}

// 5. Top requested property types
export async function getDashboardTopRequests() {
  const result = await prisma.propertyRequest.groupBy({
    by: ["propertyType"],
    _count: { propertyType: true },
    orderBy: { _count: { propertyType: "desc" } },
    take: 5,
  });
  return result;
}

// 6. Application status breakdown
export async function getDashboardApplicationStatus() {
  const total = await prisma.propertyRequest.count();
  const visited = await prisma.propertyRequest.count({
    where: { isVisited: true },
  });
  const notVisited = await prisma.propertyRequest.count({
    where: { isVisited: false },
  });
  return {
    total,
    visited,
    notVisited,
    visitedPercent: total ? Math.round((visited / total) * 100) : 0,
    notVisitedPercent: total ? Math.round((notVisited / total) * 100) : 0,
  };
}

// Types for dashboard sample data
export type TopTenant = {
  id: string;
  name: string;
  unit: string;
  paidUntil: string; // ISO date
  avatar?: string | null;
};

export type Appointment = {
  id: string;
  title: string;
  time: string; // ISO date
  with?: string;
  location?: string;
};

export type ApplicationStats = {
  jobApplications: number;
  interviews: number;
  hired: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO date
  type?: "payment" | "maintenance" | "lease" | "system";
};

// Sample data (replace with Prisma queries later)
const sampleTopTenants: TopTenant[] = [
  {
    id: "t1",
    name: "Abel T.",
    unit: "A-302",
    paidUntil: new Date().toISOString(),
    avatar: null,
  },
  {
    id: "t2",
    name: "Saron K.",
    unit: "B-114",
    paidUntil: new Date().toISOString(),
    avatar: null,
  },
  {
    id: "t3",
    name: "Yosef H.",
    unit: "C-210",
    paidUntil: new Date().toISOString(),
    avatar: null,
  },
];

const sampleAppointments: Appointment[] = [
  {
    id: "a1",
    title: "Lease Renewal",
    time: new Date(Date.now() + 86400000).toISOString(),
    with: "Daniel M.",
    location: "Office",
  },
  {
    id: "a2",
    title: "Maintenance Visit",
    time: new Date(Date.now() + 2 * 86400000).toISOString(),
    with: "Unit B-114",
    location: "On-site",
  },
];

const sampleApplicationStats: ApplicationStats = {
  jobApplications: 12,
  interviews: 4,
  hired: 2,
};

const sampleActivity: ActivityItem[] = [
  {
    id: "r1",
    title: "Rent payment received",
    description: "Unit A-302",
    createdAt: new Date().toISOString(),
    type: "payment",
  },
  {
    id: "r2",
    title: "Maintenance request closed",
    description: "Leaking sink fixed (B-114)",
    createdAt: new Date().toISOString(),
    type: "maintenance",
  },
  {
    id: "r3",
    title: "New lease signed",
    description: "C-210 - 12 months",
    createdAt: new Date().toISOString(),
    type: "lease",
  },
];

// Server actions
export async function getTopTenants(search?: string) {
  // TODO: replace with Prisma query using `search`
  const data = search
    ? sampleTopTenants.filter((t) =>
        [t.name, t.unit].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      )
    : sampleTopTenants;
  return { data };
}

export async function getUpcomingAppointments() {
  // TODO: replace with Prisma query ordering by time asc
  return { data: sampleAppointments };
}

export async function getApplicationStats() {
  // TODO: replace with Prisma aggregate query
  return { data: sampleApplicationStats };
}

export async function getRecentActivity() {
  // TODO: replace with Prisma query ordering by createdAt desc
  return { data: sampleActivity };
}
