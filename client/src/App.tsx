import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Hospitals from "@/pages/hospitals";
import Inventory from "@/pages/inventory";
import Transactions from "@/pages/transactions";
import Donors from "@/pages/donors";
import Recipients from "@/pages/recipients";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import { useState } from "react";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function App() {
  const [location] = useLocation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Determine the current page title based on location
  const getPageTitle = () => {
    const path = location.split("/")[1];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          showMobile={showMobileSidebar} 
          onCloseMobile={() => setShowMobileSidebar(false)} 
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header 
            title={getPageTitle()} 
            onMenuClick={toggleMobileSidebar} 
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/hospitals" component={Hospitals} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/donors" component={Donors} />
              <Route path="/recipients" component={Recipients} />
              <Route path="/alerts" component={Alerts} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>

        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
