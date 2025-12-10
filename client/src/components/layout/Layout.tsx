import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { translations } = useTranslation();

  const navItems = [
    { href: "/compare", label: translations.nav.compare },
    { href: "/tips", label: translations.nav.tips },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="font-heading font-bold text-2xl tracking-tight text-primary hover:opacity-90 transition-opacity">
                KOREAUSIMGUIDE
              </a>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a 
                    className={cn(
                      "text-base font-medium p-2 rounded-md transition-colors hover:bg-accent",
                      location === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="font-heading font-bold text-xl mb-4 text-primary">KOREAUSIMGUIDE</h3>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                {translations.footer.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.menu}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/compare"><a className="hover:text-primary transition-colors">{translations.nav.compare}</a></Link></li>
                <li><Link href="/tips"><a className="hover:text-primary transition-colors">{translations.nav.tips}</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.legal}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{translations.footer.privacy}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{translations.footer.terms}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{translations.footer.contact}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KOREAUSIMGUIDE. {translations.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
