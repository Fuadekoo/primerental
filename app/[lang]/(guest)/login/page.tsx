"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useActions";
import { authenticate } from "@/actions/common/authentication";
import { Input } from "@heroui/input";
import { Button, Select, SelectItem, Avatar } from "@heroui/react"; // Assuming Select components are from here
import Loading from "@/components/loading";
import { addToast } from "@heroui/toast";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// i18n translations
const translations = {
  en: {
    tagline: "Your trusted platform for student housing.",
    description:
      "Find, manage, and secure student rentals with ease. Primerental connects students and landlords for a seamless rental experience.",
    welcomeBack: "Welcome Back",
    signInToContinue: "Please sign in to continue.",
    emailOrPhoneLabel: "Email or Phone",
    emailOrPhonePlaceholder: "you@example.com or 09...",
    passwordLabel: "Password",
    forgotPassword: "Forgot?",
    signInButton: "Sign In",
    noAccount: "No account?",
    signUpLink: "Sign up",
    loginSuccessToastTitle: "Login",
    loginSuccessToastDescription: "Login successful!",
    loginErrorToastTitle: "Login",
    language: "Language",
    selectLanguage: "Select Language",
  },
  am: {
    tagline: "ለተማሪዎች መኖሪያ ቤት የእርስዎ ታማኝ መድረክ።",
    description:
      "የተማሪ ኪራዮችን በቀላሉ ያግኙ፣ ያስተዳድሩ እና ያስጠብቁ። ፕራይምሬንታል ተማሪዎችን እና አከራዮችን ያለምንም እንከን የለሽ የኪራይ ልምድ ያገናኛል።",
    welcomeBack: "እንኳን ደህና መጡ",
    signInToContinue: "ለመቀጠል እባክዎ ይግቡ።",
    emailOrPhoneLabel: "ኢሜይል ወይም ስልክ",
    emailOrPhonePlaceholder: "you@example.com ወይም 09...",
    passwordLabel: "የይለፍ ቃል",
    forgotPassword: "ረሱት?",
    signInButton: "ግባ",
    noAccount: "አካውንት የለዎትም?",
    signUpLink: "ይመዝገቡ",
    loginSuccessToastTitle: "መግቢያ",
    loginSuccessToastDescription: "በተሳካ ሁኔታ ገብተዋል!",
    loginErrorToastTitle: "መግቢያ",
    language: "ቋንቋ",
    selectLanguage: "ቋንቋ ይምረጡ",
  },
} as const;

// --- Language Selector ---
const LanguageSelector = () => {
  const router = useRouter();
  const params = useParams() || {};
  const currentLang = (params.lang || "en") as "en" | "am";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (keys: any) => {
    const key = Array.from(keys as Set<React.Key>)[0];
    const newLang = String(key || "en");
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; samesite=lax`;
    // Get current path and replace the language part
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPath);
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <Select
        aria-label="Select Language"
        className="w-40"
        selectedKeys={new Set([currentLang])}
        onSelectionChange={handleSelectChange}
        disallowEmptySelection
        variant="bordered"
        size="sm"
      >
        <SelectItem
          key="en"
          startContent={
            <Avatar
              alt="English"
              className="w-5 h-5"
              src="https://flagcdn.com/gb.svg"
            />
          }
        >
          English
        </SelectItem>
        <SelectItem
          key="am"
          startContent={
            <Avatar
              alt="Amharic"
              className="w-5 h-5"
              src="https://flagcdn.com/et.svg"
            />
          }
        >
          አማርኛ
        </SelectItem>
      </Select>
    </div>
  );
};

function Page() {
  const router = useRouter();
  const params = useParams() || {};
  const lang = (params.lang || "en") as "en" | "am";
  const t = translations[lang];

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const [, action, loading] = useAction(authenticate, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: t.loginErrorToastTitle,
          description: response.message,
        });
      }
      // Always redirect to dashboard on attempt
      router.push(`/${lang}/dashboard`);
    },
  ]);

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 transition-colors">
      <LanguageSelector />
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/30" />
      <div className="pointer-events-none absolute -right-48 -bottom-48 h-[32rem] w-[32rem] rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/30" />

      <div className="relative w-full max-w-4xl">
        <div className="grid overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-xl backdrop-blur-lg lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900/70">
          {/* Visual / Messaging Panel */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-300 to-sky-300 p-8 lg:flex dark:from-violet-900 dark:to-sky-900">
            <Image
              src="/logo.png"
              alt="Primerental Illustration"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover opacity-15"
              priority
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Primerental Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold text-white drop-shadow">
                  PRIMERENTAL
                </span>
              </div>
              <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white drop-shadow">
                {t.tagline}
              </h2>
              <p className="mt-3 text-white/80">{t.description}</p>
            </div>
            <div className="relative z-10 mt-8 text-xs text-white/60">
              © {new Date().getFullYear()} PRIMERENTAL
            </div>
          </div>

          {/* Form Panel */}
          <div className="flex flex-col justify-center p-8 sm:p-12 bg-white/80 dark:bg-slate-900/80 transition-colors">
            <div className="w-full">
              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {t.welcomeBack}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  {t.signInToContinue}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(action)}
                className="w-full space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-200"
                  >
                    {t.emailOrPhoneLabel}
                  </label>
                  <Input
                    id="email"
                    type="text"
                    variant="bordered"
                    placeholder={t.emailOrPhonePlaceholder}
                    {...register("email")}
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 dark:text-slate-200"
                    >
                      {t.passwordLabel}
                    </label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    variant="bordered"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  isDisabled={loading}
                  color="primary"
                  variant="solid"
                  type="submit"
                  className="w-full font-semibold"
                >
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      {t.signInButton} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
