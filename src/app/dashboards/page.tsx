"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon } from "lucide-react";
import { CommonTextarea } from "~/components/ui/common-textarea";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("study");
  const router = useRouter();

  const models = [
    { id: "study", label: "Study", description: "General study assistance" },
    {
      id: "debug",
      label: "Debug",
      description: "Code debugging and troubleshooting",
    },
    {
      id: "roadmap",
      label: "Roadmap",
      description: "Learning path and career guidance",
    },
  ];

  const handleSubmit = async () => {
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
          mode: selectedModel,
          // No chatId for new conversations
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Clear the input after successful submission
        setInput("");
        // Redirect to the conversation page with the new conversation ID
        router.push(`/dashboards/${data.conversationId}`);
      } else {
        router.push(`/dashboards/123`);
        // Handle error - maybe show a toast or error message
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      // Handle error - maybe show a toast or error message
    } finally {
      setIsLoading(false);
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
          <CommonTextarea
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Ask me about math, science, history, or anything you're studying..."
            disabled={isLoading}
            isLoading={isLoading}
            showSubmitButton={true}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            showModelSelector={true}
            showAudioButton={true}
            onAudioTranscription={(text) => setInput((prev) => prev + text)}
            showFileUpload={true}
            onFileUpload={(files) => {
              // Handle file upload - for now just log the files
              console.log("Files uploaded:", files);
              // You can add file processing logic here
            }}
            acceptedFileTypes="image/*,.pdf,.doc,.docx,.txt"
          />

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
