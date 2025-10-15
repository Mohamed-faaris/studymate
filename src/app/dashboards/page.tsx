import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Study<span className="text-[hsl(280,100%,70%)]">Mate</span>
        </h1>

        <p className="text-lg text-slate-200">Welcome to your dashboard.</p>

        <Link
          href="/"
          className="mt-6 rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
