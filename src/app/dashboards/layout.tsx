import SideBar from "~/components/side-bar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SideBar />
      <body>{children}</body>
    </>
  );
}
