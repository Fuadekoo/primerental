import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
          {/* Copyright Notice */}
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            © {new Date().getFullYear()} Primerental, Inc. All rights reserved.
          </p>

          {/* Links and Socials */}
          <div className="flex items-center gap-6 order-1 sm:order-2">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
