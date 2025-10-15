"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useAutosizeTextArea } from "~/hooks/use-autosize-textarea";
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
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from "~/components/ui/shadcn-io/ai/prompt-input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationsIds as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("study");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const models = [
    { id: "study", label: "Study", description: "General study assistance" },
    { id: "debug", label: "Debug", description: "Code debugging and troubleshooting" },
    { id: "roadmap", label: "Roadmap", description: "Learning path and career guidance" },
  ];

  useAutosizeTextArea({
    ref: textareaRef as React.RefObject<HTMLTextAreaElement>,
    maxHeight: 200,
    dependencies: [input],
  });

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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          chatId: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add the assistant's response to messages
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to conversation
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Conversation {conversationId}
        </h1>
      </div>

      {/* Chat Area */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto max-w-4xl">
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageAvatar
                src={message.role === "user" ? "" : "/bot-avatar.png"}
                name={message.role === "user" ? "You" : "StudyMate"}
              />
              <MessageContent>
                <div className="prose prose-sm max-w-none">
                  {message.content}
                </div>
              </MessageContent>
            </Message>
          ))}
          {isLoading && (
            <Message from="assistant">
              <MessageAvatar src="/bot-avatar.png" name="StudyMate" />
              <MessageContent>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  <span>Thinking...</span>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl p-4">
          <PromptInput onSubmit={handleSendMessage}>
            <PromptInputToolbar>
              <PromptInputModelSelect value={selectedModel} onValueChange={setSelectedModel}>
                <PromptInputModelSelectTrigger className="w-40 sm:w-48">
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputToolbar>
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask me anything about ${models.find(m => m.id === selectedModel)?.label.toLowerCase()}...`}
              disabled={isLoading}
            />
            <PromptInputSubmit
              disabled={!input.trim() || isLoading}
              status={isLoading ? "submitted" : undefined}
            />
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
