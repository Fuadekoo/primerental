import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export const revalidate = false;

// 👇 This disables i18n prefixing for this route
export const dynamicParams = false;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime Rental",
    short_name: "Prime Rental",
    description:
      "A comprehensive property management platform to streamline your rental business.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    protocol_handlers: [{ protocol: "web+menu", url: "/s%" }],
    display_override: ["standalone", "window-controls-overlay"],

    icons: [
      {
        src: "/logo_with_bg.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo_with_bg.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
