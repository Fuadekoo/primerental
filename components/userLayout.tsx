"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOutIcon,
  UserIcon,
  Heart,
  Bookmark,
  MessageSquare,
  Settings,
  Search,
} from "lucide-react";
import { AlignLeft, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { logout, loginData } from "@/actions/common/authentication";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import CustomerNotificationHandler from "./CustomerNotificationHandler";
import AdminSocketConnected from "./AdminSocketConnected";
import ClientSocketConnected from "./ClientSocketConnected";
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
  const [loginUser, setLoginUser] = useState<{
    id: string;
    name?: string | null;
    phone?: string;
    role?: string;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const user = await loginData();
        if (typeof user === "string") {
          setLoginUser(null);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setLoginUser(user as any);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoginUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, []);
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
    <div
      className={cn(
        "h-dvh w-dvw overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100",
        isManager ? "grid lg:grid-cols-[auto_1fr]" : "flex flex-col"
      )}
    >
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
                variant="secondary"
                onClick={() => setShowOfflinePopup(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                variant="default"
                onClick={() => {
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
        isHiddenOnDesktop={!isManager}
      />
      <div className="grid grid-rows-[auto_1fr] h-full min-h-0 gap-2 overflow-hidden">
        <Header
          sidebar={sidebar}
          setSidebar={setSidebar}
          isManager={isManager}
          menu={menu}
          loginUser={loginUser}
        />
        <div className="m-0 rounded-xl overflow-y-auto min-h-0 h-full p-2 sm:p-4">
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
  isHiddenOnDesktop,
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
  isHiddenOnDesktop?: boolean;
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
        sidebar ? "max-lg:absolute max-lg:inset-0" : "max-lg:hidden",
        isHiddenOnDesktop && "lg:hidden"
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
          variant="ghost"
          size="sm"
          className="z-[100] absolute top-8 -right-5 w-11 h-11 rounded-full flex items-center justify-center bg-white/80 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow"
          onClick={() => setSidebar((prev) => !prev)}
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
                variant={active ? "default" : "ghost"}
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
                asChild
                onClick={handleMenuClick}
              >
                <Link href={`/${lang}/${item.url}`}>
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
                    <span className="px-5 capitalize truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
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
            <Button asChild variant="secondary" className="w-full">
              <Link href="/en/dashboard">Go to Admin</Link>
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
  menu,
  loginUser,
}: {
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isManager?: boolean;
  menu?: {
    label: string;
    url: string;
    icon: React.ReactNode;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginUser?: any;
}) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");

  return (
    <header className="sticky top-0 z-30 h-16 m-0 px-2 py-2 flex gap-4 items-center bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-slate-200 dark:border-neutral-800">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebar((prev) => !prev)}
      >
        <AlignLeft className="size-7" />
      </Button>

      <div className="flex justify-between items-center w-full max-w-7xl mx-auto relative">
        <div className="flex items-center gap-8">
          <Link href={`/${lang}/home`} className="flex items-center gap-2">
            <Image
              src="/logo_with_bg.png"
              alt="Prime"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200 hidden sm:block">
              PrimeRental
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isManager && menu && (
          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
            {menu
              .filter(
                (item) =>
                  !["favorite", "savedSearch", "settings"].includes(item.url)
              )
              .map((item) => {
                const active = pathname.endsWith(`/${item.url}`);
                return (
                  <Link
                    key={item.url}
                    href={`/${lang}/${item.url}`}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 relative py-1",
                      active
                        ? "text-primary-600 dark:text-primary-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-600 dark:after:bg-primary-400 after:rounded-full"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isManager ? <AdminSocketConnected /> : <ClientSocketConnected />}
          {isManager ? <NotificationBell /> : <CustomerNotificationHandler />}
          <ThemeSwitcher />
          {!isManager && <ProfileDropdown user={loginUser} />}
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isManager ? (
          <DropdownMenuItem
            key="switchToGuest"
            className="font-semibold cursor-pointer"
            onClick={() => onSwitchToGuest?.()}
          >
            Switch to Guest
          </DropdownMenuItem>
        ) : null}
        {!isManager && hasSession && isAdminSession ? (
          <DropdownMenuItem
            key="switchToAdmin"
            className="font-semibold cursor-pointer"
            onClick={() => onSwitchToAdmin?.()}
          >
            Switch to Admin
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          key={"signout"}
          className="!text-red-600 font-semibold rounded-md border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
          onClick={async () => {
            await logout();
            window.location.href = `/${lang}/login`;
          }}
        >
          <LogOutIcon className="size-4 text-red-600 mr-2" />
          <span className="text-red-600">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileDropdown({
  user,
}: {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}) {
  const pathname = usePathname() ?? "";
  const [, lang] = pathname.split("/");

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/favorite`}
              className="cursor-pointer flex w-full items-center"
            >
              <Heart className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/savedSearch`}
              className="cursor-pointer flex w-full items-center"
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Saved Search</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/${lang}/settings`}
              className="cursor-pointer flex w-full items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto justify-start gap-2 overflow-hidden px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback>
              {user.name?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-xs">
            <span className="font-semibold truncate max-w-[100px]">
              {user.name || "User"}
            </span>
            <span className="text-slate-500">{user.role || "User"}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="flex-col items-start">
          <p className="font-semibold text-sm">Signed in as</p>
          <p className="text-xs text-muted-foreground truncate w-full">
            {user.email}
          </p>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/profile`}
            className="cursor-pointer flex w-full items-center"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/profile?tab=favorites`}
            className="cursor-pointer flex w-full items-center"
          >
            <Heart className="mr-2 h-4 w-4" />
            Favorites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/profile?tab=saved`}
            className="cursor-pointer flex w-full items-center"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Saved
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/savedSearch`}
            className="cursor-pointer flex w-full items-center"
          >
            <Search className="mr-2 h-4 w-4" />
            Saved Search
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/profile?tab=messages`}
            className="cursor-pointer flex w-full items-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${lang}/settings`}
            className="cursor-pointer flex w-full items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={async () => {
            await logout();
            window.location.reload();
          }}
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
