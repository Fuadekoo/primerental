import React from "react";
import { guestAuth } from "@/actions/common/authentication";
import UserLayout from "@/components/userLayout";
import { redirect } from "next/navigation";
import { Home, User, ShoppingBasket } from "lucide-react";
// import Footer from "@/components/footer";
// import CustomerSocketHandler from "@/components/CustomerSocketHandler";
import { SocketProvider } from "@/components/SocketProvider";
import GuestSocketRegistrar from "@/components/GuestSocketRegistrar";
import ChatPopup from "@/components/chat";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Define menu inside the function to access params
  const menu = [
    {
      label: "Home",
      url: "home",
      icon: <Home size={18} />,
    },
    {
      label: "Property Request",
      url: "propertyRequest",
      icon: <ShoppingBasket size={18} />,
    },
    {
      label: "Property Register",
      url: "propertyRegister",
      icon: <ShoppingBasket size={18} />,
    },
    {
      label: "Favorite",
      url: "favorite",
      icon: <User size={18} />,
    },
    {
      label: "Saved Search",
      url: "savedSearch",
      icon: <User size={18} />,
    },
    {
      label: "Contact",
      url: "contact",
      icon: <User size={18} />,
    },
    {
      label: "Settings",
      url: "settings",
      icon: <User size={18} />,
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
