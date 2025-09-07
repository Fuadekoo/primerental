"use client";
import React, { useEffect } from "react";
import { guestAuth } from "@/actions/common/authentication";
import UserLayout from "@/components/userLayout";
import useGuestSession from "@/hooks/useGuestSession";
import { redirect, useParams } from "next/navigation";
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
import ChatPopup from "@/components/guestChat";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
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

  const isManager = false;
  const guestId = useGuestSession();

  useEffect(() => {
    if (guestId === null) return; // Wait for the hook to determine the guestId

    // const checkAuth = async () => {
    //   if (!guestId) {
    //     redirect(`/${lang}/forbidden`);
    //     return;
    //   }
    //   const isAuth = await guestAuth(guestId);
    //   if (!isAuth) {
    //     redirect(`/${lang}/forbidden`);
    //   }
    // };

    // checkAuth();
  }, [guestId, lang]);

  if (!guestId) {
    return null; // Or a loading spinner while checking auth
  }

  return (
    <UserLayout menu={menu} isManager={isManager}>
      <SocketProvider guestId={guestId}>
        <GuestSocketRegistrar />
        {children}
      </SocketProvider>
      <ChatPopup />
    </UserLayout>
  );
}
