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
          /* Theme 1: Times New Roman (system) */
          .font-theme-1, .font-theme-1 body {
            font-family: "Times New Roman", Times, serif !important;
          }
          /* Theme 2: Dancing Script */
          .font-theme-2, .font-theme-2 body {
            font-family: var(--font-dancing), cursive !important;
          }
          /* Theme 3: Arial (system) */
          .font-theme-3, .font-theme-3 body {
            font-family: Arial, Helvetica, sans-serif !important;
          }
        `}</style>
        {/* --- Open Graph Meta Tags --- */}
        <meta
          property="og:title"
          content="Prime Rental - House Sell & Rent in Ethiopia"
        />
        <meta
          property="og:description"
          content="Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://primerental.et" />
        <meta property="og:image" content="https://primerental.com/logo.jpg" />
        {/* --- Twitter Card Meta Tags --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Prime Rental - House Sell & Rent in Ethiopia"
        />
        <meta
          name="twitter:description"
          content="Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business."
        />
        <meta name="twitter:image" content="https://primerental.com/logo.jpg" />
        {/* --- Telegram Card Meta Tags (unofficial, for link previews) --- */}
        <meta
          name="telegram:title"
          content="Prime Rental - House Sell & Rent in Ethiopia"
        />
        <meta
          name="telegram:description"
          content="Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business."
        />
        <meta
          name="telegram:image"
          content="https://primerental.com/logo.jpg"
        />
        {/* --- WhatsApp Card Meta Tags (unofficial, uses og tags but can add for clarity) --- */}
        <meta
          name="whatsapp:title"
          content="Prime Rental - House Sell & Rent in Ethiopia"
        />
        <meta
          name="whatsapp:description"
          content="Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business."
        />
        <meta
          name="whatsapp:image"
          content="https://primerental.com/logo.jpg"
        />
        {/* --- Instagram Card Meta Tags (unofficial, for link previews) --- */}
        <meta
          name="instagram:title"
          content="Prime Rental - House Sell & Rent in Ethiopia"
        />
        <meta
          name="instagram:description"
          content="Buy, sell, and rent houses in Ethiopia. Prime Rental is your comprehensive property management platform to streamline your real estate business."
        />
        <meta
          name="instagram:image"
          content="https://primerental.com/logo.jpg"
        />
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
