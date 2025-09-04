"use client";
import { Button } from "@heroui/button";
import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { LogOutIcon, UserIcon } from "lucide-react";
import {
  AlignLeft,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { logout } from "@/actions/common/authentication";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import CustomerNotificationHandler from "./CustomerNotificationHandler";
import AdminSocketConnected from "./AdminSocketConnected";
import ClientSocketConnected from "./ClientSocketConnected";

export default function UserLayout({
  children,
  menu,
  isManager,
}: {
  children: React.ReactNode;
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  isManager?: boolean;
}) {
  const [sidebar, setSidebar] = useState(false);
  // --- Add online status state ---
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflinePopup(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflinePopup(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Initial check
    if (!navigator.onLine) {
      setIsOnline(false);
      setShowOfflinePopup(true);
    }
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className=" grid lg:grid-cols-[auto_1fr] overflow-hidden h-dvh w-dvw ">
      {/* --- Offline Popup --- */}
      {showOfflinePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full flex flex-col items-center">
            <WifiOff className="text-red-500 mb-2" size={32} />
            <h2 className="text-lg font-semibold mb-2 text-center">
              You are offline
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Please check your internet connection.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                className="flex-1"
                color="secondary"
                variant="flat"
                onPress={() => setShowOfflinePopup(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                color="primary"
                variant="solid"
                onPress={() => {
                  if (navigator.onLine) {
                    setIsOnline(true);
                    setShowOfflinePopup(false);
                  } else {
                    setIsOnline(false);
                    setShowOfflinePopup(true);
                  }
                }}
              >
                Reconnect
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Offline Popup --- */}
      <Sidebar {...{ sidebar, setSidebar, menu, isManager }} />
      <div className="grid grid-rows-[auto_1fr] gap-2 overflow-hidden">
        <Header
          sidebar={sidebar}
          setSidebar={setSidebar}
          isManager={isManager}
        />
        <div className="m-0 rounded-xl overflow-y-auto grid">{children}</div>
      </div>
    </div>
  );
}

function Sidebar({
  sidebar,
  setSidebar,
  menu,
  isManager,
}: {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  isManager?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");

  // Auto-close sidebar on mobile after menu click
  const handleMenuClick = () => {
    if (window.innerWidth < 1024) setSidebar(false);
  };

  return (
    <aside
      className={cn(
        "z-50 relative accent3 grid grid-cols-[auto_1fr] overflow-hidden",
        sidebar ? "max-lg:absolute max-lg:inset-0 " : "max-lg:hidden"
      )}
    >
      <div
        className={cn(
          "relative  bg-primary-100 grid grid-rows-[auto_1fr_auto] overflow-hidden",
          sidebar ? "max-xl:lg:w-60 w-80" : "max-xl:lg:w-14 w-20"
        )}
      >
        <Button
          isIconOnly
          variant="ghost"
          color="primary"
          size="sm"
          radius="full"
          className="max-lg:hidden z-[100] absolute top-8 -right-3.5 bg-default-50 border border-default-300 "
          onPress={() => setSidebar((prev) => !prev)}
        >
          {sidebar ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <div className="flex items-center gap-3 px-5 pt-2 pb-2">
          <Image
            src="/logo.png"
            alt="Qr Menu"
            width={80}
            height={80}
            className="rounded-full"
          />
          {sidebar && (
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              PRIME
              <br />
              RENTAL
            </span>
          )}
        </div>
        <div className="max-xl:lg:px-2 px-5 pt-3 grid gap-2 auto-rows-min overflow-auto">
          {menu.map(({ label, url, icon }, i) => {
            // Active if the current path ends with the menu url
            const isActive = pathname.endsWith(`/${url}`);
            return (
              <Button
                key={i + ""}
                isIconOnly={false}
                color={isActive ? "primary" : "secondary"}
                variant={isActive ? "solid" : "light"}
                className={`
                  w-full px-3 inline-flex gap-5 justify-start
                  transition-all duration-200
                  border-l-4
                  ${
                    isActive
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-bold shadow"
                      : "border-secondary-300 text-secondary-700"
                  }
                  hover:border-primary-400 hover:bg-primary-100 hover:text-primary-800 hover:scale-105
                  active:scale-95
                  rounded-lg
                `}
                as={Link}
                href={`/${lang}/${url}`}
                onClick={handleMenuClick}
              >
                <span
                  className={`mr-2 ${
                    isActive ? "text-primary-700" : "text-secondary-500"
                  }`}
                >
                  {icon}
                </span>
                {sidebar && <span className="px-5 capitalize">{label}</span>}
              </Button>
            );
          })}
        </div>
        <div className="p-5 max-xl:lg:p-2 grid gap-2 overflow-hidden">
          {isManager && <User sidebar={sidebar} />}
        </div>
      </div>
      {/* Overlay for mobile to close sidebar when clicking outside */}
      <div
        onClick={() => setSidebar(false)}
        className="lg:hidden bg-foreground-500/50 backdrop-blur-xs"
      />
    </aside>
  );
}

function Header({
  isManager,
  setSidebar,
}: {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isManager?: boolean;
}) {
  return (
    <header className="z-30 h-12 m-0 p-2 flex gap-4 items-center max-lg:shadow-sm bg-white/100">
      <Button
        isIconOnly
        variant="flat"
        color="primary"
        className="lg:hidden"
        onPress={() => setSidebar((prev) => !prev)}
      >
        <AlignLeft className="size-7" />
      </Button>

      <div className="flex justify-between items-center w-full">
        <h1>Menu</h1>
        <div className="flex items-center gap-2">
          {isManager ? <AdminSocketConnected /> : <ClientSocketConnected />}
          {isManager ? <NotificationBell /> : <CustomerNotificationHandler />}
        </div>
      </div>
    </header>
  );
}
function User({ sidebar }: { sidebar: boolean }) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");

  return (
    <Dropdown className="overflow-hidden">
      <DropdownTrigger>
        <div
          className={cn(
            "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-colors",
            "bg-gradient-to-r from-primary-600 to-secondary-700",
            "border border-primary-400 hover:border-primary-600",
            "hover:bg-gradient-to-r hover:from-primary-700 hover:to-secondary-800"
          )}
        >
          <UserIcon className="size-5 text-white" />
          {sidebar && <span className="text-white font-medium">Account</span>}
        </div>
      </DropdownTrigger>
      <DropdownMenu color="primary" variant="flat">
        <DropdownItem
          key={"signout"}
          startContent={<LogOutIcon className="size-4 text-red-600" />}
          className="!text-red-600 font-semibold rounded-md border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
          onClick={async () => {
            await logout();
            window.location.href = `/${lang}/signin`;
          }}
        >
          <span className="text-red-600">Sign Out</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
