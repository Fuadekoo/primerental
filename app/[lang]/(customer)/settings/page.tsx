"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, useParams } from "next/navigation";
import { Accordion, AccordionItem } from "@heroui/react";
import { Sun, Moon, Laptop, Globe, FileText, Shield, Info } from "lucide-react";

// --- Theme Switcher Component ---
const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const themes = [
    { name: "Light", value: "light", icon: <Sun className="h-5 w-5" /> },
    { name: "Dark", value: "dark", icon: <Moon className="h-5 w-5" /> },
    { name: "System", value: "system", icon: <Laptop className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        Appearance
      </span>
      <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              theme === t.value
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Language Selector Component ---
const LanguageSelector = () => {
  const router = useRouter();
  const params = useParams();
  const currentLang = params.lang;

  useEffect(() => {
    // On component mount, check if the language cookie exists.
    // If not, set the default language to 'en'.
    if (
      !document.cookie.split("; ").find((row) => row.startsWith("NEXT_LOCALE="))
    ) {
      document.cookie =
        "NEXT_LOCALE=en; path=/; max-age=31536000; samesite=lax";
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    // Set a cookie that expires in 1 year
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${newLang}/settings`);
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Language
        </span>
      </div>
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="w-full rounded-lg border-gray-300 bg-gray-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-auto"
      >
        <option value="en">English</option>
        <option value="am">amharic</option>
      </select>
    </div>
  );
};

// --- Info Accordion Component ---
const InfoAccordion = () => {
  const aboutContent =
    "PrimeRental is your trusted partner in finding the perfect rental property. We are dedicated to providing a seamless and efficient experience for both tenants and property owners, leveraging technology to simplify the rental process.";
  const termsContent =
    "By using our services, you agree to our terms and conditions. This includes respecting property listings, providing accurate information, and adhering to the rental agreements established through our platform. All users must comply with local laws and regulations.";
  const privacyContent =
    "We are committed to protecting your privacy. Your personal information is collected to facilitate rental transactions and improve our services. We do not sell your data to third parties. Please review our full privacy policy for detailed information on data handling.";

  return (
    <Accordion
      selectionMode="multiple"
      className="p-2"
      defaultSelectedKeys={["about", "terms", "privacy"]}
    >
      <AccordionItem
        key="about"
        aria-label="About Us"
        title="About Us"
        indicator={<Info />}
      >
        {aboutContent}
      </AccordionItem>
      <AccordionItem
        key="terms"
        aria-label="Terms & Conditions"
        title="Terms & Conditions"
        indicator={<FileText />}
      >
        {termsContent}
      </AccordionItem>
      <AccordionItem
        key="privacy"
        aria-label="Privacy Policy"
        title="Privacy Policy"
        indicator={<Shield />}
      >
        {privacyContent}
      </AccordionItem>
    </Accordion>
  );
};

// --- Main Settings Page ---
function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your application preferences and settings.
          </p>
        </header>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <ThemeSwitcher />
          </div>

          {/* General Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <LanguageSelector />
            </div>
          </div>

          {/* About Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <InfoAccordion />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
