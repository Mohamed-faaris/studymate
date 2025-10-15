"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { SendIcon, SparklesIcon } from "lucide-react";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Call the explain API without chatId for new conversations
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          // No chatId for new conversations
        }),
      });

      // if (response.ok) {
      //   const data = await response.json();
      //   // Clear the input after successful submission
      //   setInput("");
      //   // Redirect to the conversation page with the new conversation ID
      //   router.push(`/dashboards/${data.conversationId}`);
      // } else {
      //   console.error("Failed to create conversation");
      //   // Handle error - maybe show a toast or error message
      // }
      router.push(`/dashboards/123`);

    } catch (error) {
      console.error("Error creating conversation:", error);
      // Handle error - maybe show a toast or error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-center border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">StudyMate</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Welcome Message */}
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              How can I help you study today?
            </h2>
            <p className="text-gray-600">
              Ask me anything about your studies, homework, or learning goals.
            </p>
          </div>

          {/* Chat Input */}
          <div className="relative">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me about math, science, history, or anything you're studying..."
                className="min-h-[120px] resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-base shadow-lg focus:border-purple-500 focus:ring-0"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>

          {/* Example Prompts */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setInput("Explain the gradient descent algorithm")}
              className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium">🤖 ML Fundamentals</div>
              <div className="mt-1 text-xs text-gray-500">
                "Explain the gradient descent algorithm"
              </div>
            </button>
            <button
              onClick={() => setInput("Debug this PyTorch training loop")}
              className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium">🧠 Model Debugging</div>
              <div className="mt-1 text-xs text-gray-500">
                "Debug this PyTorch training loop"
              </div>
            </button>
            <button
              onClick={() =>
                setInput("Create a study plan for machine learning interviews")
              }
              className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium">📈 Career Prep</div>
              <div className="mt-1 text-xs text-gray-500">
                "Create a study plan for machine learning interviews"
              </div>
            </button>
            <button
              onClick={() =>
                setInput("Explain supervised vs unsupervised learning")
              }
              className="rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="font-medium">📊 Learning Types</div>
              <div className="mt-1 text-xs text-gray-500">
                "Explain supervised vs unsupervised learning"
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
