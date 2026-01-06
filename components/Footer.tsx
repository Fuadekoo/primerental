import React from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Send,
  Building2,
} from "lucide-react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/button";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white pt-12 pb-8 border-t border-slate-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          {/* Left Column: Brand Info */}
          <div className="flex flex-col max-w-lg">
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-600 text-white shadow-lg shadow-green-900/20">
                <span className="font-bold text-xl">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  PrimeRental
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-1">
                  Brokerage Services
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-8">
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Premier real estate and lifestyle platform connecting you to
                luxury properties and exceptional experiences.
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
                ከፕሪም ንብረቶች እና ልዩ ልምዶች ጋር እናገናኝዎታለን።
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Twitter, href: "#" },
              ].map((Social, index) => (
                <Link
                  key={index}
                  href={Social.href}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
                >
                  <Social.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Newsletter */}
          <div className="lg:w-1/2 max-w-xl">
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Stay Updated{" "}
                  <span className="text-slate-500 text-sm font-normal">
                    እንዲያውቁ ይቆዩ
                  </span>
                </h3>
              </div>

              <form className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    classNames={{
                      input:
                        "text-slate-900 dark:text-white placeholder:text-slate-500",
                      inputWrapper:
                        "bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/70 focus-within:bg-slate-50 dark:focus-within:bg-slate-700/70 border-slate-200 dark:border-slate-600 data-[hover=true]:bg-slate-50 dark:data-[hover=true]:bg-slate-700/70 group-data-[focus=true]:bg-slate-50 dark:group-data-[focus=true]:bg-slate-700/70 h-12 w-full",
                    }}
                  />
                </div>
                <Button className="bg-green-600 text-white font-semibold h-12 px-6 rounded-xl hover:bg-green-500 shadow-lg shadow-green-900/20">
                  Subscribe <Send size={16} className="ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrimeRental. All rights reserved.</p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
