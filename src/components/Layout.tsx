import { Link, useLocation } from "wouter";
import { Image, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/resize", label: "Resize" },
  { href: "/compress", label: "Compress" },
  { href: "/convert", label: "Convert" },
  { href: "/crop", label: "Crop" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#6366F1] flex items-center justify-center">
              <Image className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              ToolPix
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <nav className="container py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#6366F1] flex items-center justify-center">
                  <Image className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-lg">ToolPix</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Free online image tools. All processing happens in your browser — your files never leave your device.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/resize" className="hover:text-foreground transition-colors">Image Resize</Link></li>
                <li><Link href="/compress" className="hover:text-foreground transition-colors">Image Compress</Link></li>
                <li><Link href="/convert" className="hover:text-foreground transition-colors">Format Convert</Link></li>
                <li><Link href="/crop" className="hover:text-foreground transition-colors">Image Crop</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3">Privacy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ToolPix processes all images locally in your browser. No files are uploaded to any server. Your data stays private.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ToolPix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
