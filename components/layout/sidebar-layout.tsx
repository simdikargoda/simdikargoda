"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { cn } from "@/lib/cn";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setMobileOpen: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarLayout");
  }
  return context;
}

export function SidebarLayout({ children, user }: { children: ReactNode; user?: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hydration hatasını önlemek için localStorage'i effect'te okuyoruz
  useEffect(() => {
    const saved = localStorage.getItem("kargo_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("kargo_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setMobileOpen }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Desktop Sidebar */}
        <Sidebar isCollapsed={isCollapsed} user={user} />
        
        {/* Mobile Sidebar */}
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} user={user} />

        {/* Content */}
        <div className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-[280px]"
        )}>
          {/* Gelecekte mobile sidebar toggle'ı header'dan tetiklemek için Context kullanılabilir. 
              Şu anki header bağımsız duruyor, eğer panel-header mobile toggle içeriyorsa, onu da buraya entegre edebiliriz. 
          */}
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
