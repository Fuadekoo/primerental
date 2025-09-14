import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import { ThemeProvider } from "./ThemeProvider";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Dancing Script to expose a CSS variable
const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prime Rental - House Sell & Rent in Ethiopia",
  description:
    "Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business.",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning to avoid mismatches when JS sets the class
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Global font theme classes */}
        <style>{`
          /* Theme 1: Dancing Script */
          .font-theme-1, .font-theme-1 body {
            font-family: var(--font-dancing), cursive !important;
          }
          /* Theme 2: Times New Roman (system) */
          .font-theme-2, .font-theme-2 body {
            font-family: "Times New Roman", Times, serif !important;
          }
          /* Theme 3: Arial (system) */
          .font-theme-3, .font-theme-3 body {
            font-family: Arial, Helvetica, sans-serif !important;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
      >
        {/* Apply saved font theme early (default to theme 1) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var key = 'fontTheme';
    var chosen = localStorage.getItem(key) || 'font-theme-1';
    var html = document.documentElement;
    html.classList.remove('font-theme-1','font-theme-2','font-theme-3');
    html.classList.add(chosen);
  } catch (e) {}
})();
          `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
