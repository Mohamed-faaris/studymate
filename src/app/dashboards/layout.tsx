"use client";
import SideBar from "~/components/side-bar";
import { SidebarProvider, useSidebar } from "~/components/sidebar-context";

function DashboardContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <main
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
