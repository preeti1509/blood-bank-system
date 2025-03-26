import EmergencyAlerts from "@/components/dashboard/EmergencyAlerts";
import KeyMetrics from "@/components/dashboard/KeyMetrics";
import BloodInventory from "@/components/dashboard/BloodInventory";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import RegisteredHospitals from "@/components/dashboard/RegisteredHospitals";
import PendingRequests from "@/components/dashboard/PendingRequests";
import RecentDonors from "@/components/dashboard/RecentDonors";
import ExpiringUnits from "@/components/dashboard/ExpiringUnits";

export default function Dashboard() {
  return (
    <main className="p-6">
      <div>
        <h2 className="text-2xl font-medium text-neutral-400">Dashboard</h2>
        <p className="text-neutral-300 mt-1">Overview of blood bank status and recent activities</p>
      </div>

      {/* Emergency Alerts Section */}
      <EmergencyAlerts />

      {/* Key Metrics Section */}
      <KeyMetrics />

      {/* Blood Inventory and Recent Transactions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BloodInventory />
        <RecentTransactions />
      </div>

      {/* Hospitals and Requests */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RegisteredHospitals />
        <PendingRequests />
      </div>

      {/* Recent Donors and Expiring Units */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDonors />
        <ExpiringUnits />
      </div>
    </main>
  );
}
