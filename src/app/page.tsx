import Link from "next/link";

export default function RootPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to StudyMate!</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Dashboards</h2>
        <ul className="mt-2 list-disc pl-6 text-slate-200">
          <li>
            <Link href="/dashboards" className="text-sky-300 hover:underline">
              View Dashboards
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
