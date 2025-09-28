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
import { AlignLeft, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { logout } from "@/actions/common/authentication";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import CustomerNotificationHandler from "./CustomerNotificationHandler";
import AdminSocketConnected from "./AdminSocketConnected";
import ClientSocketConnected from "./ClientSocketConnected";
import { useData } from "@/hooks/useData";
import { getLoginUserId } from "@/actions/common/chat";
import InstallPrompt from "./InstallPrompt";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

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
  // Determine if a logged-in session exists (server verified)
  const [loginUser] = useData(getLoginUserId, () => {});
  const hasSession = Boolean(loginUser && loginUser.id);
  const isAdminSession = (() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (loginUser as any)?.role;
    if (!role || typeof role !== "string") return false;
    return role.toUpperCase() === "ADMIN";
  })();
  // Cookie-based session presence for guest-side admin button
  const [cookieSession, setCookieSession] = useState(false);
  useEffect(() => {
    try {
      const ck = typeof document !== "undefined" ? document.cookie : "";
      setCookieSession(/(auth|token|session)=/i.test(ck));
    } catch {}
  }, []);

  // --- Add online status state ---
  const [, setIsOnline] = useState(true);
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

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    const lock = () => {
      if (typeof window === "undefined") return;
      if (sidebar && window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    lock();
    window.addEventListener("resize", lock);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", lock);
    };
  }, [sidebar]);

  return (
    <div className="h-dvh w-dvw grid lg:grid-cols-[auto_1fr] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <InstallPrompt />
      {/* --- Offline Popup --- */}
      {showOfflinePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 max-w-xs w-full flex flex-col items-center border border-slate-200 dark:border-neutral-800">
            <WifiOff className="text-red-500 mb-2" size={32} />
            <h2 className="text-lg font-semibold mb-2 text-center">
              You are offline
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
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
      <Sidebar
        {...{ sidebar, setSidebar, menu, isManager }}
        hasSession={hasSession}
        isAdminSession={isAdminSession}
        cookieSession={cookieSession}
      />
      <div className="grid grid-rows-[auto_1fr] h-full min-h-0 gap-2 overflow-hidden">
        <Header
          sidebar={sidebar}
          setSidebar={setSidebar}
          isManager={isManager}
        />
        <div className="m-0 rounded-xl overflow-y-auto min-h-0 h-full p-2 sm:p-4 grid">
          {children}
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  sidebar,
  setSidebar,
  menu,
  isManager,
  hasSession,
  isAdminSession,
  cookieSession,
}: {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  menu: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  isManager?: boolean;
  hasSession?: boolean;
  isAdminSession?: boolean;
  cookieSession?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");
  // Simple switch actions
  const switchToGuest = () => {
    window.location.href = "/en/home";
  };
  const switchToAdmin = () => {
    window.location.href = "/en/dashboard";
  };

  // Auto-close sidebar on mobile after menu click
  const handleMenuClick = () => {
    if (window.innerWidth < 1024) setSidebar(false);
  };

  return (
    <aside
      className={cn(
        "z-50 relative accent3 grid grid-cols-[auto_1fr] h-full overflow-hidden",
        sidebar ? "max-lg:absolute max-lg:inset-0" : "max-lg:hidden"
      )}
    >
      <div
        className={cn(
          "relative grid grid-rows-[auto_1fr_auto] h-full overflow-hidden bg-white/80 dark:bg-neutral-900 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-r border-slate-200 dark:border-neutral-800",
          sidebar ? "max-xl:lg:w-64 w-72" : "max-xl:lg:w-14 w-20"
        )}
      >
        {/* Sidebar toggle button with both icons in a larger circle */}
        <Button
          isIconOnly
          variant="ghost"
          color="primary"
          size="sm"
          radius="full"
          className="z-[100] absolute top-8 -right-5 w-11 h-11 flex items-center justify-center bg-white/80 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow"
          onPress={() => setSidebar((prev) => !prev)}
        >
          <span className="relative w-full h-full flex items-center justify-center">
            <AlignLeft
              className={`size-4 absolute transition-opacity duration-200 ${
                sidebar ? "opacity-0" : "opacity-100"
              }`}
            />
            <X
              className={`size-4 absolute transition-opacity duration-200 ${
                sidebar ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
        </Button>

        <div className=" bg-gray-200 dark:bg-gray-700 flex items-center gap-3 px-5 pt-3 pb-2 mb-4">
          <Image
            src="/logo_with_bg.png"
            alt="Prime"
            width={80}
            height={80}
            loading="lazy"
            className="rounded-full ring-1 ring-slate-200 dark:ring-neutral-800"
          />
          {sidebar && (
            <Link
              href={`/${lang}/login`}
              className="font-bold text-lg text-primary-700 dark:text-primary-300 whitespace-nowrap"
            >
              PRIME
              <br />
              RENTAL
            </Link>
          )}
        </div>

        <div className="max-xl:lg:px-2 px-3 sm:px-5 pt-3 grid gap-2 auto-rows-min overflow-auto">
          {menu.map((item, i) => {
            const active = pathname.endsWith(`/${item.url}`);
            return (
              <Button
                key={`menu-${i}`}
                isIconOnly={false}
                color={active ? "primary" : "default"}
                variant={active ? "solid" : "light"}
                className={`
                  w-full px-3 inline-flex gap-5 justify-start items-center
                  transition-all duration-200 rounded-lg
                  border-l-4
                  ${
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-semibold shadow-sm"
                      : "border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300"
                  }
                  hover:border-primary-400 hover:bg-primary-50/70 dark:hover:bg-neutral-800 hover:text-primary-700 dark:hover:text-primary-300
                  hover:scale-[1.01] active:scale-95
                `}
                as={Link}
                href={`/${lang}/${item.url}`}
                onClick={handleMenuClick}
              >
                <span
                  className={`${
                    active
                      ? "text-primary-600 dark:text-primary-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>
                {sidebar && (
                  <span className="px-5 capitalize truncate">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>

        <div className="p-5 max-xl:lg:p-2 grid gap-2 overflow-hidden">
          {isManager ? (
            <User
              sidebar={sidebar}
              isManager={!!isManager}
              hasSession={!!hasSession}
              isAdminSession={!!isAdminSession}
              onSwitchToGuest={switchToGuest}
              onSwitchToAdmin={switchToAdmin}
            />
          ) : cookieSession ? (
            <Button
              as={Link}
              href="/en/dashboard"
              color="primary"
              variant="solid"
              className="w-full"
            >
              Go to Admin
            </Button>
          ) : null}
        </div>
      </div>

      {/* Overlay for mobile to close sidebar when clicking outside */}
      <div
        onClick={() => setSidebar(false)}
        className="lg:hidden bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
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
    <header className="sticky top-0 z-30 h-12 m-0 px-2 py-2 flex gap-4 items-center bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-slate-200 dark:border-neutral-800">
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
        <h1 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
          PrimeRental
        </h1>
        <div className="flex items-center gap-2">
          {isManager ? <AdminSocketConnected /> : <ClientSocketConnected />}
          {isManager ? <NotificationBell /> : <CustomerNotificationHandler />}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

// --- Theme Switcher Component ---
function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="ml-2 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
      )}
    </button>
  );
}

function User({
  sidebar,
  isManager,
  hasSession,
  isAdminSession,
  onSwitchToGuest,
  onSwitchToAdmin,
}: {
  sidebar: boolean;
  isManager: boolean;
  hasSession: boolean;
  isAdminSession: boolean;
  onSwitchToGuest?: () => void;
  onSwitchToAdmin?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");

  return (
    <Dropdown className="overflow-hidden">
      <DropdownTrigger>
        <div
          className={cn(
            "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-colors",
            "bg-gradient-to-r from-primary-600 to-primary-500",
            "border border-primary-400/70 dark:border-primary-400/30",
            "hover:from-primary-700 hover:to-primary-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
          )}
          role="button"
          tabIndex={0}
        >
          <UserIcon className="size-5 text-white" />
          {sidebar && <span className="text-white font-medium">Account</span>}
        </div>
      </DropdownTrigger>
      <DropdownMenu color="primary" variant="flat">
        {isManager ? (
          <DropdownItem
            key="switchToGuest"
            className="font-semibold"
            onClick={() => onSwitchToGuest?.()}
          >
            Switch to Guest
          </DropdownItem>
        ) : null}
        {!isManager && hasSession && isAdminSession ? (
          <DropdownItem
            key="switchToAdmin"
            className="font-semibold"
            onClick={() => onSwitchToAdmin?.()}
          >
            Switch to Admin
          </DropdownItem>
        ) : null}
        <DropdownItem
          key={"signout"}
          startContent={<LogOutIcon className="size-4 text-red-600" />}
          className="!text-red-600 font-semibold rounded-md border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          onClick={async () => {
            await logout();
            window.location.href = `/${lang}/login`;
          }}
        >
          <span className="text-red-600">Sign Out</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
