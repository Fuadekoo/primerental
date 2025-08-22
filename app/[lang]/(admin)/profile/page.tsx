"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  KeyRound,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@heroui/react";

const translations = {
  en: {
    pageTitle: "Admin Profile",
    pageDescription: "View and manage your personal profile information.",
    role: "Administrator",
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    profileDetails: "Profile Details",
    accountSecurity: "Account Security",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    memberSinceLabel: "Member Since",
    notProvided: "Not Provided",
  },
  am: {
    pageTitle: "የአስተዳዳሪ መገለጫ",
    pageDescription: "የግል መገለጫ መረጃዎን ይመልከቱ እና ያስተዳድሩ።",
    role: "አስተዳዳሪ",
    editProfile: "መገለጫ ያርትዑ",
    changePassword: "የይለፍ ቃል ይቀይሩ",
    profileDetails: "የመገለጫ ዝርዝሮች",
    accountSecurity: "የመለያ ደህንነት",
    emailLabel: "ኢሜይል አድራሻ",
    phoneLabel: "ስልክ ቁጥር",
    memberSinceLabel: "አባል የሆነበት ቀን",
    notProvided: "አልተሰጠም",
  },
} as const;

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) => (
  <li className="flex items-center gap-4 py-2">
    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </li>
);

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8 animate-pulse">
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded-md mt-2"></div>
      </header>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md mt-2"></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-3">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-6">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="mt-4 flex gap-3">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const user = { id: 1, name: "Admin User", email: "admin@example.com", image: null };
//   const { data: session, status } = useSession();

  const lang = (
    Array.isArray(params.lang) ? params.lang[0] : params.lang || "en"
  ) as "en" | "am";
  const t = translations[lang];

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push(`/${lang}/login`);
//     }
//   }, [status, router, lang]);

//   if (status === "loading") {
//     return <ProfileSkeleton />;
//   }

//   if (!session?.user) {
//     return null; // Or a redirect message, but the useEffect handles it.
//   }

//   const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.pageTitle}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t.pageDescription}
          </p>
        </header>

        <div className="space-y-6">
          {/* Profile Details Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="Profile Picture"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user.name || "Admin User"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium text-blue-500">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <ul className="space-y-3">
                <InfoRow
                  icon={<Mail size={18} />}
                  label={t.emailLabel}
                  value={user.email}
                />
                {/* <InfoRow
                  icon={<Phone size={18} />}
                  label={t.phoneLabel}
                  value={user.phone || t.notProvided}
                /> */}
                {/* <InfoRow
                  icon={<Calendar size={18} />}
                  label={t.memberSinceLabel}
                  value={
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          lang === "am" ? "am-ET" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : t.notProvided
                  }
                /> */}
              </ul>
            </div>
          </div>

          {/* Account Security Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {t.accountSecurity}
              </h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button variant="solid">
                  <Edit className="h-4 w-4 mr-2" />
                  {t.editProfile}
                </Button>
                <Button variant="solid">
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t.changePassword}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
