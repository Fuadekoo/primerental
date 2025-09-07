"use client";
import React from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import contactBg from "@/public/cover.jpg";
import { useParams } from "next/navigation";

// Simple i18n copy
const translations = {
  en: {
    pageTitle: "Get In Touch",
    pageDescription:
      "Have questions or ready to start your property journey? We're here to help.",
    contactDetailsTitle: "Contact Details",
    contactDetailsDescription:
      "Reach out to us through any of the following methods.",
    addressTitle: "Our Address",
    addressLine1: "Bole, Addis Ababa",
    phoneTitle: "Call Us",
    phoneNumber: "+251 93 357 1691",
    emailTitle: "Email Us",
    emailAddress: "contact@primerental.com",
    hoursTitle: "Business Hours",
    hoursWeekdays: "Monday - Friday: 9am to 6pm",
    hoursSaturday: "Saturday: 10am to 4pm",
    hoursSunday: "Sunday: Closed",
    formTitle: "Send Us a Message",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    emailLabel: "Email",
    phoneLabel: "Phone Number",
    messageLabel: "Message",
    submitButton: "Send Message",
  },
  am: {
    pageTitle: "እኛን ያግኙን",
    pageDescription:
      "ጥያቄዎች አሉዎት ወይስ የንብረት ጉዞዎን ለመጀመር ዝግጁ ነዎት? እኛ ለመርዳት እዚህ ነን።",
    contactDetailsTitle: "የእውቂያ ዝርዝሮች",
    contactDetailsDescription: "በሚከተሉት መንገዶች ያግኙን።",
    addressTitle: "አድራሻችን",
    addressLine1: "ቦሌ, አዲስ አበባ",
    phoneTitle: "ይደውሉልን",
    phoneNumber: "+251 93 357 1691",
    emailTitle: "ኢሜይል ይላኩልን",
    emailAddress: "contact@primerental.com",
    hoursTitle: "የስራ ሰዓታት",
    hoursWeekdays: "ሰኞ - አርብ: ከጠዋቱ 3 ሰዓት እስከ ምሽቱ 12 ሰዓት",
    hoursSaturday: "ቅዳሜ: ከጠዋቱ 4 ሰዓት እስከ ምሽቱ 10 ሰዓት",
    hoursSunday: "እሁድ: ዝግ ነው",
    formTitle: "መልዕክት ይላኩልን",
    firstNameLabel: "የመጀመሪያ ስም",
    lastNameLabel: "የአባት ስም",
    emailLabel: "ኢሜይል",
    phoneLabel: "ስልክ ቁጥር",
    messageLabel: "መልዕክት",
    submitButton: "መልዕክት ላክ",
  },
} as const;

function Page() {
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as "en" | "am";
  const t = translations[lang];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* --- Header --- */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={contactBg}
          alt="Contact us background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-4xl font-bold">{t.pageTitle}</h1>
          <p className="mt-2 text-base sm:text-lg max-w-2xl opacity-90">
            {t.pageDescription}
          </p>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* --- Contact Information --- */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.contactDetailsTitle}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t.contactDetailsDescription}
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {t.addressTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t.addressLine1}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {t.phoneTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t.phoneNumber}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {t.emailTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {t.emailAddress}
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                {t.hoursTitle}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t.hoursWeekdays}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t.hoursSaturday}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {t.hoursSunday}
              </p>
            </div>
          </div>

          {/* --- Contact Form --- */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t.formTitle}
              </h2>
              <form
                action="#"
                method="POST"
                className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
              >
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.firstNameLabel}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.lastNameLabel}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autoComplete="family-name"
                      className="block w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.emailLabel}
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.phoneLabel}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      className="block w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t.messageLabel}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="block w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                      defaultValue={""}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 px-6 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {t.submitButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* --- End Contact Form --- */}
        </div>
      </div>
    </div>
  );
}

export default Page;
