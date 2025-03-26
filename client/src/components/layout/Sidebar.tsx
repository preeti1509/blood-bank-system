import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", icon: "dashboard", label: "Dashboard" },
    { path: "/hospitals", icon: "local_hospital", label: "Hospitals" },
    { path: "/inventory", icon: "inventory_2", label: "Inventory" },
    { path: "/transactions", icon: "swap_horiz", label: "Transactions" },
    { path: "/donors", icon: "person", label: "Donors" },
    { path: "/recipients", icon: "personal_injury", label: "Recipients" },
    { path: "/notifications", icon: "notifications", label: "Notifications", badge: 4 },
    { path: "/reports", icon: "report", label: "Reports" },
    { path: "/admin", icon: "admin_panel_settings", label: "Admin" },
  ];
  
  return (
    <aside 
      className={cn(
        "w-64 bg-white shadow-md z-30", 
        isOpen ? "fixed inset-y-0 left-0 lg:relative lg:translate-x-0" : "hidden md:block"
      )}
    >
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-icons text-white text-sm">water_drop</span>
            </div>
            <h1 className="ml-2 text-lg font-medium text-neutral-400">BloodBank Pro</h1>
          </div>
          <button 
            className="md:hidden text-neutral-400"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.path}
              className={cn(
                "px-6 py-3",
                location === item.path 
                  ? "bg-primary/10 border-r-4 border-primary" 
                  : "hover:bg-neutral-100"
              )}
            >
              <Link 
                href={item.path}
                className={cn(
                  "flex items-center",
                  location === item.path ? "text-primary" : "text-neutral-400"
                )}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-status-error text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-neutral-200">
        <div className="flex items-center">
          <img 
            className="w-10 h-10 rounded-full" 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&q=80" 
            alt="User avatar" 
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-400">Dr. Sarah Johnson</p>
            <p className="text-xs text-neutral-300">Admin</p>
          </div>
          <button className="ml-auto text-neutral-300">
            <span className="material-icons">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
