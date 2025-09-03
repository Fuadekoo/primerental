import React from "react";
import { auth } from "@/lib/auth";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import {
  Home,
  User,
  CreditCard,
  Package,
  ShoppingCart,
  Settings,
  LayoutGrid,
  List,
  Users,
  ClipboardList,
} from "lucide-react";
// import AdminSocketHandler from "@/components/AdminSocketHandler";
import { SocketProvider } from "@/components/SocketProvider";
import ChatPopup from "@/components/adminChat";

const translations = {
  en: {
    dashboard: "Dashboard",
    hometype: "Home Type",
    property: "Property",
    register: "Register Property",
    request: "Request Property",
    profile: "Profile",
    setting: "Setting",
  },
  am: {
    dashboard: "ዳሽቦርድ",
    hometype: "የቤት አይነት",
    property: "ንብረት",
    register: "የንብረት መዝግብ",
    request: "የንብረት ጥያቄ",
    profile: "መገለጫ",
    setting: "ቅንብሮች",
  },
} as const;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "en" | "am" };
}) {
  const lang = params.lang || "en";
  const t = translations[lang];

  const menu = [
    { label: t.dashboard, url: "dashboard", icon: <Home size={18} /> },
    { label: t.hometype, url: "homeType", icon: <LayoutGrid size={18} /> },
    {
      label: t.property,
      url: "property",
      icon: <List size={18} />,
    },
    {
      label: t.register,
      url: "registerProperty",
      icon: <CreditCard size={18} />,
    },
    { label: t.request, url: "requestProperty", icon: <Users size={18} /> },
    { label: t.profile, url: "profile", icon: <ClipboardList size={18} /> },
    { label: t.setting, url: "setting", icon: <Settings size={18} /> },
  ];

  const session = await auth();
  // if the login user is not admin then redirect to page is forbideen page or 404 page
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/en/forbidden");
  }

  const isManager = true;

  return (
    <div className="overflow-hidden h-svh w-svw">
      <UserLayout menu={menu} isManager={isManager}>
        <SocketProvider userId={session.user.id}>{children}</SocketProvider>
        <ChatPopup />
      </UserLayout>
    </div>
  );
}
