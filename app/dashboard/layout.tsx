import { redirect } from "next/navigation";
import { get_current_user } from "@/lib/auth";
import DashboardNavigation from "@/components/layout/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await get_current_user();
  
  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation username={user.username} />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}

