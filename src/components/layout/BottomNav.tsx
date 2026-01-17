import { Home, FileText, Shield, Gift, User, CreditCard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: FileText, label: t("nav.report"), path: "/report" },
    { icon: Shield, label: t("nav.safety"), path: "/safety" },
    { icon: Gift, label: t("nav.schemes"), path: "/schemes" },
    { icon: User, label: t("nav.profile"), path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                    isActive && "bg-primary/10",
                  )}
                >
                  <item.icon
                    className={cn("w-5 h-5", isActive && "stroke-[2.5]")}
                  />
                </div>
                <span className="text-xs font-medium mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
