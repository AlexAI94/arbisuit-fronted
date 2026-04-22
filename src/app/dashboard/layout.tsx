import { Sidebar } from "@/components/layout/Sidebar";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0B0E17]">
      <Sidebar />
      <main className="w-full lg:ml-60 flex-1 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
      <OnboardingModal />
    </div>
  );
}
