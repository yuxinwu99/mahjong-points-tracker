import { Download, Languages, Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../lib/i18n";
import { Button } from "../ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      if (document.documentElement.classList.contains("dark")) return "dark";
      if (document.documentElement.classList.contains("light")) return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* Premium Background Effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${theme === "dark" ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"}`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-xl font-bold text-transparent">
            {t("common.app_name")}
          </h1>
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <Download className="h-3.5 w-3.5 animate-bounce" />
                <span>{t("pwa.install_app")}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full hover:bg-slate-800/50 dark:hover:bg-slate-100/10"
            >
              <Languages className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-slate-800/50 dark:hover:bg-slate-100/10"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
