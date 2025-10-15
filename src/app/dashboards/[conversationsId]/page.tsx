"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ui/shadcn-io/ai/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "~/components/ui/shadcn-io/ai/message";
import { CommonTextarea } from "~/components/ui/common-textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  status?: "sending" | "sent" | "error";
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationsIds as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("study");
  const [selectedLevel, setSelectedLevel] = useState("novice");

  const conversationRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Load conversation messages
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        console.error("Failed to load conversation");
        // Fallback to welcome message
        setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              "Hello! I'm StudyMate, your AI-powered study assistant. How can I help you today?",
            createdAt: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      // Fallback to welcome message
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! I'm StudyMate, your AI-powered study assistant. How can I help you today?",
          createdAt: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: messageToSend,
          id: conversationId,
          level: selectedLevel,
          session_id: conversationId,
        }),
      });
      console.log("API response:", response);
      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Update user message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg,
        ),
      );

      // Add the assistant's response to messages
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.ai?.explanation || data.response || "",
        createdAt: new Date(),
        status: "sent",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Update user message status to error
      setMessages((prev) =>
        prev.map((msg) => 
          msg.id === userMessage.id
            ? { ...msg, status: "error" as const }
            : msg,
        ),
      );

      // Add error message to conversation
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your message. Please try again.",
        createdAt: new Date(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation and accessibility
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl/Cmd + End to scroll to bottom
    if ((event.ctrlKey || event.metaKey) && event.key === "End") {
      event.preventDefault();
      const scrollButton = conversationRef.current?.querySelector(
        "[data-scroll-button]",
      );
      if (scrollButton instanceof HTMLElement) {
        scrollButton.click();
      }
    }

    // Page Up/Down for smooth scrolling
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const conversationElement = conversationRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (conversationElement) {
        const scrollAmount =
          event.key === "PageUp"
            ? -window.innerHeight * 0.8
            : window.innerHeight * 0.8;
        conversationElement.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  }, []);

  // Auto-scroll to bottom for new messages
  const scrollToLatestMessage = useCallback(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage) {
        setTimeout(() => {
          const messageElement = conversationRef.current?.querySelector(
            `[data-message-id="${latestMessage.id}"]`,
          );
          if (messageElement) {
            messageElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }
    }
  }, [messages]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string) => {
      const messageToRetry = messages.find((msg) => msg.id === messageId);
      if (messageToRetry?.role !== "user") return;

      // Reset message status to sending
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "sending" as const } : msg,
        ),
      );

      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: messageToRetry.content,
            chatId: conversationId,
            level: selectedLevel,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to retry message");
        }

        const data = await response.json();

        // Update message status to sent
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "sent" as const } : msg,
          ),
        );

        // Remove error messages and add success response
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) => !(msg.status === "error" && msg.role === "assistant"),
          );
          return [
            ...filtered,
            {
              id: Date.now().toString(),
              role: "assistant" as const,
              content: data.response,
              createdAt: new Date(),
              status: "sent" as const,
            },
          ];
        });
      } catch (error) {
        console.error("Error retrying message:", error);
        // Keep error status
      }
    },
    [messages, conversationId, selectedLevel],
  );

  return (
    <div className="flex h-full flex-col" ref={conversationRef}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">
          Conversation {conversationId}
        </h1>
      </div>

      {/* Chat Area */}
      <Conversation
        className="relative flex-1 bg-gradient-to-b from-gray-50 to-white"
        initial="smooth"
        resize="smooth"
        role="log"
        aria-label="Chat conversation"
      >
        <ConversationContent className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Welcome to StudyMate
              </h3>
              <p className="max-w-md text-gray-600">
                Start a conversation by typing a message below. I'm here to help
                you with your studies!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <Message
                key={message.id}
                from={message.role}
                className={`group animate-in slide-in-from-bottom-2 duration-300 ${
                  index === messages.length - 1
                    ? "animate-in fade-in-0 duration-500"
                    : ""
                }`}
                data-message-id={message.id}
              >
                <MessageAvatar
                  src={message.role === "user" ? "" : "/bot-avatar.png"}
                  name={message.role === "user" ? "You" : "StudyMate"}
                  className={`${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  } shadow-lg ring-2 ring-white`}
                />
                <MessageContent className="max-w-[80%]">
                  <div
                    className={`prose prose-sm max-w-none rounded-2xl p-4 shadow-sm ${
                      message.role === "user"
                        ? "prose-invert bg-blue-500 text-white"
                        : "border border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <div 
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: message.role === "assistant" 
                          ? message.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                          : message.content
                      }}
                    />
                    <div
                      className={`mt-2 flex items-center justify-between text-xs ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.status && (
                        <div className="flex items-center space-x-1">
                          {message.status === "sending" && (
                            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
                          )}
                          {message.status === "sent" &&
                            message.role === "user" && (
                              <svg
                                className="h-3 w-3 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          {message.status === "error" && (
                            <svg
                              className="h-3 w-3 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </MessageContent>
              </Message>
            ))
          )}

          {isLoading && (
            <Message
              from="assistant"
              className="animate-in slide-in-from-bottom-2 duration-300"
            >
              <MessageAvatar
                src="/bot-avatar.png"
                name="StudyMate"
                className="animate-pulse bg-purple-500 text-white shadow-lg ring-2 ring-white"
              />
              <MessageContent className="max-w-[80%]">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                      <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                      <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                    </div>
                    <span className="font-medium text-gray-600">
                      StudyMate is thinking...
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full w-3/5 animate-pulse rounded-full bg-purple-400"></div>
                  </div>
                </div>
              </MessageContent>
            </Message>
          )}

          {/* Error messages with retry functionality */}
          {messages
            .filter((msg) => msg.status === "error" && msg.role === "assistant")
            .map((errorMsg) => (
              <Message
                key={`error-${errorMsg.id}`}
                from="assistant"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <MessageAvatar
                  src="/bot-avatar.png"
                  name="StudyMate"
                  className="bg-red-500 text-white shadow-lg ring-2 ring-white"
                />
                <MessageContent className="max-w-[80%]">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-red-800">
                          Message failed to send
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                          {errorMsg.content}
                        </p>
                        <button
                          onClick={() => {
                            const userMsg = messages.find(
                              (msg) =>
                                msg.status === "error" && msg.role === "user",
                            );
                            if (userMsg) retryMessage(userMsg.id);
                          }}
                          className="mt-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-red-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </MessageContent>
              </Message>
            ))}
        </ConversationContent>

        <ConversationScrollButton
          className="border-2 border-gray-200 bg-white text-gray-700 shadow-lg transition-all duration-200 hover:border-purple-300 hover:bg-gray-50 hover:text-purple-600 hover:shadow-xl"
          size="lg"
          data-scroll-button
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </ConversationScrollButton>
      </Conversation>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl p-4">
          <CommonTextarea
            value={input}
            onChange={setInput}
            onSubmit={handleSendMessage}
            placeholder={`Ask me anything about ${models.find((m) => m.id === selectedModel)?.label.toLowerCase()}...`}
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
            showLevelSelector={true}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        </div>
      </div>
    </div>
  );
}
