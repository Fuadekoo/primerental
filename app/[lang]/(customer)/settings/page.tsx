"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, useParams } from "next/navigation";
import { Accordion, AccordionItem } from "@heroui/react";
import { Select, SelectItem, Avatar } from "@heroui/react";
import { Sun, Moon, Laptop, Globe, FileText, Shield, Info } from "lucide-react";

// Simple i18n copy
const translations = {
  en: {
    settings: "Settings",
    description: "Manage your application preferences and settings.",
    appearance: "Appearance",
    language: "Language",
    selectLanguage: "Select language",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    aboutTitle: "About Us",
    termsTitle: "Terms & Conditions",
    privacyTitle: "Privacy Policy",
    aboutContent:
      "PrimeRental is your trusted partner in finding the perfect rental property. We are dedicated to providing a seamless and efficient experience for both tenants and property owners, leveraging technology to simplify the rental process.",
    termsContent:
      "By using our services, you agree to our terms and conditions. This includes respecting property listings, providing accurate information, and adhering to the rental agreements established through our platform. All users must comply with local laws and regulations.",
    privacyContent:
      "We are committed to protecting your privacy. Your personal information is collected to facilitate rental transactions and improve our services. We do not sell your data to third parties. Please review our full privacy policy for detailed information on data handling.",
  },
  am: {
    settings: "ማቀናበሪያ",
    description: "የመተግበሪያውን ምርጫዎች እና ማቀናበሪያዎች ያቀናብሩ።",
    appearance: "አቀራረብ",
    language: "ቋንቋ",
    selectLanguage: "ቋንቋ ይምረጡ",
    themeLight: "ብርሃን",
    themeDark: "ጨለማ",
    themeSystem: "ስርዓት",
    aboutTitle: "ስለ እኛ",
    termsTitle: "ውሎች እና መመሪያዎች",
    privacyTitle: "የግላዊነት ፖሊሲ",
    aboutContent:
      "PrimeRental ተስማሚ ኪራይ ንብረት ለማግኘት የሚያግዝዎ ታማኝ አጋርዎ ነው። ለተከራዮችና ለባለንብረቶች መልካም ልምድ እንዲኖር ቴክኖሎጂን በመጠቀም ሂደቱን እንቀላቀላለን።",
    termsContent:
      "አገልግሎታችንን በመጠቀም ውሎቻችንን እና መመሪያዎቻችንን ትፈቅዳለህ። ይህ የማስታወቂያ ዝርዝሮችን መከበር፣ ትክክለኛ መረጃ መስጠት እና በመድረካችን ላይ የተደረጉ የኪራይ ቃል ኪዳኖችን መከተል ይጠቀማል። ሁሉም ተጠቃሚዎች ከአካባቢ ሕጎች ጋር መጣጣም አለባቸው።",
    privacyContent:
      "ግላዊነትዎን ለመጠበቅ ታማኝ ነን። የእርስዎ መረጃ የኪራይ ግብዣዎችን ለማስቻል እና አገልግሎታችንን ለማሻሻል እንሰበስባለን። መረጃዎን ለሶስተኛ ወገን አንሸጥም። ስለ ውሂብ አያያዝ ዝርዝር መረጃ ለማግኘት ፖሊሲያችንን ይመልከቱ።",
  },
} as const;

// --- Theme Switcher Component ---
const ThemeSwitcher = ({ t }: { t: typeof translations[keyof typeof translations] }) => {
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
    { name: t.themeLight, value: "light", icon: <Sun className="h-5 w-5" /> },
    { name: t.themeDark, value: "dark", icon: <Moon className="h-5 w-5" /> },
    {
      name: t.themeSystem,
      value: "system",
      icon: <Laptop className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {t.appearance}
      </span>
      <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
        {themes.map((th) => (
          <button
            key={th.value}
            onClick={() => setTheme(th.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              theme === th.value
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {th.icon}
            <span className="hidden sm:inline">{th.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Language Selector ---
const LanguageSelector = ({ t }: { t: typeof translations[keyof typeof translations] }) => {
  const router = useRouter();
  const params = useParams();
  const currentLang = Array.isArray(params.lang)
    ? (params.lang[0] as string)
    : (params.lang as string) || "en";

  useEffect(() => {
    if (
      !document.cookie.split("; ").find((row) => row.startsWith("NEXT_LOCALE="))
    ) {
      document.cookie =
        "NEXT_LOCALE=en; path=/; max-age=31536000; samesite=lax";
    }
  }, []);

  const handleSelectChange = (keys: any) => {
    const key = Array.from(keys as Set<React.Key>)[0];
    const newLang = String(key || "en");
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${newLang}/settings`);
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {t.language}
        </span>
      </div>

      <Select
        label={t.selectLanguage}
        labelPlacement="outside-left"
        className="w-full sm:w-64"
        selectedKeys={new Set([currentLang])}
        onSelectionChange={handleSelectChange}
        disallowEmptySelection
        variant="flat"
      >
        <SelectItem
          key="en"
          startContent={
            <Avatar
              alt="English"
              className="w-6 h-6"
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
              className="w-6 h-6"
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

// --- Info Accordion Component ---
const InfoAccordion = ({ t }: { t: typeof translations[keyof typeof translations] }) => {
  return (
    <Accordion
      selectionMode="multiple"
      className="p-2"
      defaultSelectedKeys={["about", "terms", "privacy"]}
    >
      <AccordionItem
        key="about"
        aria-label={t.aboutTitle}
        title={t.aboutTitle}
        indicator={<Info />}
      >
        {t.aboutContent}
      </AccordionItem>
      <AccordionItem
        key="terms"
        aria-label={t.termsTitle}
        title={t.termsTitle}
        indicator={<FileText />}
      >
        {t.termsContent}
      </AccordionItem>
      <AccordionItem
        key="privacy"
        aria-label={t.privacyTitle}
        title={t.privacyTitle}
        indicator={<Shield />}
      >
        {t.privacyContent}
      </AccordionItem>
    </Accordion>
  );
};

// --- Main Settings Page ---
function SettingsPage() {
  const params = useParams();
  const currentLang = Array.isArray(params.lang)
    ? (params.lang[0] as string)
    : (params.lang as string) || "en";
  const t = translations[currentLang as "en" | "am"] || translations.en;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.settings}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t.description}
          </p>
        </header>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <ThemeSwitcher t={t} />
          </div>

          {/* General Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <LanguageSelector t={t} />
            </div>
          </div>

          {/* About Section */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <InfoAccordion t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
