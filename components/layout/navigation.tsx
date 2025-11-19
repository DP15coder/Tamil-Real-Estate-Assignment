"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/common/button";
import { Upload, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardNavigation({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              Tamil Transaction Extractor
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/upload"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard/upload"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </Link>
              <Link
                href="/dashboard/transactions"
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard/transactions"
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>Transactions</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

