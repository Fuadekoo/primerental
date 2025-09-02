import React from "react";
import { guestAuth } from "@/actions/common/authentication";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import {
  Home,
  User,
  ShoppingBasket,
  Settings,
  Heart,
  Search,
  Phone,
  PlusSquare,
} from "lucide-react";
// import Footer from "@/components/footer";
// import CustomerSocketHandler from "@/components/CustomerSocketHandler";
import { SocketProvider } from "@/components/SocketProvider";
import GuestSocketRegistrar from "@/components/GuestSocketRegistrar";
import ChatPopup from "@/components/chat";

const translations = {
  en: {
    home: "Home",
    propertyRequest: "Property Request",
    propertyRegister: "Register Property",
    favorite: "Favorites",
    savedSearch: "Saved Searches",
    contact: "Contact Us",
    settings: "Settings",
  },
  am: {
    home: "መነሻ",
    propertyRequest: "የንብረት ጥያቄ",
    propertyRegister: "ንብረት ይመዝገቡ",
    favorite: "ተወዳጆች",
    savedSearch: "የተቀመጡ ፍለጋዎች",
    contact: "እኛን ያግኙን",
    settings: "ቅንብሮች",
  },
} as const;

type Lang = keyof typeof translations;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const t = translations[lang];
  // Define menu inside the function to access params
  const menu = [
    {
      label: t.home,
      url: "home",
      icon: <Home size={18} />,
    },
    {
      label: t.propertyRequest,
      url: "propertyRequest",
      icon: <ShoppingBasket size={18} />,
    },
    {
      label: t.propertyRegister,
      url: "propertyRegister",
      icon: <PlusSquare size={18} />,
    },
    {
      label: t.favorite,
      url: "favorite",
      icon: <Heart size={18} />,
    },
    {
      label: t.savedSearch,
      url: "savedSearch",
      icon: <Search size={18} />,
    },
    {
      label: t.contact,
      url: "contact",
      icon: <Phone size={18} />,
    },
    {
      label: t.settings,
      url: "settings",
      icon: <Settings size={18} />,
    },
  ];

  // const guestId = (await cookies()).get("guest-session-id")?.value;

  // // Check customer auth using passcode and tid from URL
  // if (!guestId) {
  //   redirect("/en/forbidden");
  // }
  // const isAuth = await guestAuth(guestId);
  // if (!isAuth) {
  //   redirect("/en/forbidden");
  // }

  const isManager = false;

  return (
    <UserLayout menu={menu} isManager={isManager}>
      <SocketProvider>
        <GuestSocketRegistrar />
        {children}
      </SocketProvider>
      <ChatPopup />
    </UserLayout>
  );
}
