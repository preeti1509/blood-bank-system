import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  showMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/hospitals", label: "Hospitals", icon: "local_hospital" },
  { path: "/inventory", label: "Inventory", icon: "inventory" },
  { path: "/transactions", label: "Transactions", icon: "swap_horiz" },
  { path: "/donors", label: "Donors", icon: "people" },
  { path: "/recipients", label: "Recipients", icon: "person" },
  { path: "/alerts", label: "Alerts", icon: "notifications" },
  { path: "/settings", label: "Settings", icon: "settings" }
];

export default function Sidebar({ showMobile, onCloseMobile }: SidebarProps) {
  const [currentLocation] = useLocation();

  return (
    <div 
      className={cn(
        "md:flex flex-col w-64 bg-white shadow-md z-30",
        showMobile ? "fixed inset-y-0 left-0 flex" : "hidden"
      )}
    >
      {/* Mobile close button */}
      {showMobile && (
        <div className="md:hidden absolute right-4 top-4">
          <button 
            onClick={onCloseMobile}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-bold text-red-600 flex items-center">
          <span className="material-icons mr-2">water_drop</span>
          Blood Bank System
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = 
              item.path === "/" 
              ? currentLocation === "/" 
              : currentLocation.startsWith(item.path);

            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => showMobile && onCloseMobile()}
              >
                <div 
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md group cursor-pointer",
                    isActive 
                      ? "text-gray-900 bg-gray-200 font-medium" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className={cn(
                    "material-icons mr-3",
                    isActive ? "text-red-600" : ""
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
