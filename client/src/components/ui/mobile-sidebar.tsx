import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface MobileSidebarProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  className,
  children,
  isOpen,
  onClose,
}: MobileSidebarProps) {
  const [location] = useLocation();
  
  // Close sidebar when location changes (on mobile)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location, isOpen, onClose]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.querySelector(".mobile-sidebar");
      if (
        sidebar &&
        isOpen &&
        !sidebar.contains(event.target as Node) &&
        window.innerWidth < 1024 // Only on mobile
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      className={cn(
        "sidebar mobile-sidebar bg-white shadow-lg w-64 fixed h-full z-10 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:hidden",
        className
      )}
    >
      {children}
    </aside>
  );
}
