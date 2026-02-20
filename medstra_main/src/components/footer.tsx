import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Heart,
  ExternalLink,
} from "lucide-react";

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
];

const certifications = ["HIPAA Compliant", "FDA Registered", "ISO Certified"];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Company Info & Certifications */}
          <div className="space-y-8 max-w-2xl">
            {/* Logo & Description */}
            <div className="space-y-4">
              <h3 className="font-bold text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Medstra
              </h3>
              <p className="text-muted-foreground text-lg">
                Revolutionizing medical examinations through AI-powered
                technology for seamless insurance underwriting.
              </p>
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap justify-center gap-6">
              {certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium"
                >
                  {cert}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          

          {/* Bottom Bar */}
          <div className="w-full pt-8 mt-8 border-t">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Crafted with{" "}
                <Heart className="h-4 w-4 text-red-500 animate-pulse" /> by the
                Medstra Team
              </p>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Virtual Medical Examiner Assistant.
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
