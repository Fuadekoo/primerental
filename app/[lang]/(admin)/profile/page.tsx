"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@/actions/admin/profile";
import Image from "next/image";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  KeyRound,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@heroui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordChangeSchema, updateUserSchema } from "@/lib/zodSchema";
import useAction from "@/hooks/useActions";

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

// --- Password Change Schema (zod) ---
// const passwordChangeSchema = z
//   .object({
//     current: z.string().min(6, "Current password is required"),
//     next: z.string().min(8, "New password must be at least 8 characters"),
//     confirm: z.string().min(8, "Please confirm your new password"),
//   })
//   .refine((data) => data.next === data.confirm, {
//     path: ["confirm"],
//     message: "Passwords do not match",
//   });

export default function Page() {
  const params = useParams();
  const router = useRouter();
  // const user = {
  //   id: 1,
  //   name: "Admin User",
  //   email: "admin@example.com",
  //   image: null,
  // };
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // for Edit Profile

  // --- actions ---
  const [, updateProfileAction, isLoadingProfileUpdate] = useAction(
    updateProfile,
    [, () => {}]
  );
  const [res, changePasswordAction, isLoadingChange] = useAction(
    changePassword,
    [, () => {}]
  );
  const [profileData, refreshProfile, isLoading] = useAction(getProfile, [
    true,
    () => {},
  ]);

  // --- Password form (react-hook-form + zod) ---
  const {
    handleSubmit: handlePwdSubmit,
    register: registerPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: isPwdSubmitting },
  } = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    mode: "onChange",
    defaultValues: {},
  });

  // --- Edit form (react-hook-form + zod) ---
  const {
    handleSubmit: handleEditSubmit,
    register: registerEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isEditSubmitting },
  } = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    mode: "onChange",
    defaultValues: {},
  });

  // replace old onSubmitEdit(e) with RHF submit using data
  const onSubmitEdit = handleEditSubmit(async (data) => {
    await updateProfileAction({
      name: data.name,
      phone: data.phone,
      email: profileData?.email || "",
    });
    await refreshProfile();
    resetEdit();
    setShowEditModal(false);
  });

  const onSubmitPassword = handlePwdSubmit(async (values) => {
    try {
      await changePasswordAction({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      await refreshProfile();
      resetPwd();
      setShowPasswordModal(false);
    } catch {
      // optional: show a toast or error banner
    }
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

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
                  <div className="flex h-full w-full items-center justify-center rounded-full">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profileData?.name || "Admin User"}
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
                  value={profileData?.email}
                />
                <InfoRow
                  icon={<Phone size={18} />}
                  label={t.phoneLabel}
                  value={profileData?.phone || t.notProvided}
                />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label={t.memberSinceLabel}
                  value={
                    profileData?.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString(
                          lang === "am" ? "am-ET" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : t.notProvided
                  }
                />
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
                <Button
                  variant="solid"
                  onPress={() => {
                    resetEdit({ name: profileData?.name ?? "", phone: "" });
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t.editProfile}
                </Button>
                <Button
                  variant="solid"
                  onPress={() => setShowPasswordModal(true)}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t.changePassword}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Edit Profile Modal --- */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-slate-200/70 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-white p-6">
            <h2 className="text-xl font-semibold mb-4">{t.editProfile}</h2>
            <form onSubmit={onSubmitEdit}>
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Name
                  </label>
                  <input
                    id="edit-name"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="Admin User"
                    {...registerEdit("name")}
                    disabled={isEditSubmitting || isLoadingProfileUpdate}
                  />
                  {editErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {editErrors.name.message as string}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="edit-phone"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {t.phoneLabel}
                  </label>
                  <input
                    id="edit-phone"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="+251 9XXXXXXXX"
                    {...registerEdit("phone")}
                    disabled={isEditSubmitting || isLoadingProfileUpdate}
                  />
                  {editErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {editErrors.phone.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => setShowEditModal(false)}
                  disabled={isEditSubmitting || isLoadingProfileUpdate}
                  className="dark:text-white dark:hover:bg-primary-500/10"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoadingProfileUpdate}
                  disabled={isEditSubmitting || isLoadingProfileUpdate}
                >
                  {isLoadingProfileUpdate ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Change Password Modal --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-slate-200/70 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-white p-6">
            <h2 className="text-xl font-semibold mb-4">{t.changePassword}</h2>
            <form onSubmit={onSubmitPassword}>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="pwd-current"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Current Password
                  </label>
                  <input
                    id="pwd-current"
                    type="password"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="••••••••"
                    {...registerPwd("oldPassword")}
                    disabled={isPwdSubmitting || isLoadingChange}
                  />
                  {pwdErrors.oldPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {pwdErrors.oldPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="pwd-next"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    New Password
                  </label>
                  <input
                    id="pwd-next"
                    type="password"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="••••••••"
                    {...registerPwd("newPassword")}
                    disabled={isPwdSubmitting || isLoadingChange}
                  />
                  {pwdErrors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {pwdErrors.newPassword.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="pwd-confirm"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="pwd-confirm"
                    type="password"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="••••••••"
                    {...registerPwd("confirmNewPassword")}
                    disabled={isPwdSubmitting || isLoadingChange}
                  />
                  {pwdErrors.confirmNewPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {pwdErrors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    resetPwd();
                    setShowPasswordModal(false);
                  }}
                  disabled={isPwdSubmitting || isLoadingChange}
                  className="dark:text-white dark:hover:bg-primary-500/10"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoadingChange}
                  disabled={isPwdSubmitting || isLoadingChange}
                >
                  {isLoadingChange ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
