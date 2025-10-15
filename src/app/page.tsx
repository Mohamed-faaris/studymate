import Link from "next/link";

export default function RootPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to StudyMate!</h1>

      <div className="mt-8 flex gap-4">
        <Link
          href="/register"
          className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition duration-200 hover:bg-green-700"
        >
          Register
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition duration-200 hover:bg-blue-700"
        >
          Login
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Dashboards</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>
            <Link href="/dashboards" className="text-sky-300 hover:underline">
              View Dashboards
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Authentication</h2>
        <ul className="mt-2 list-disc pl-6">
          <li>
            <Link href="/sign-in" className="text-sky-300 hover:underline">
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/register" className="text-sky-300 hover:underline">
              Register
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
