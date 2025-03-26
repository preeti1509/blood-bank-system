import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const user = {
    name: "Dr. John Smith",
    role: "Administrator",
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64">
        <Sidebar user={user} />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <Sidebar user={user} />
      </MobileSidebar>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          title={title}
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
