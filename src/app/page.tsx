import Link from "next/link";
import { SparklesIcon } from "lucide-react";

export default function RootPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-center border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">StudyMate</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to StudyMate
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Your AI-powered study assistant for learning, debugging, and career guidance.
          </p>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/sign-in"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition duration-200 hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition duration-200 hover:bg-gray-50"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/dashboards"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Continue to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
