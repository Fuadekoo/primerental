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
