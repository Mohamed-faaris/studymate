"use client";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Plus,
  MessageSquare,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bug,
  Map,
} from "lucide-react";
import { useSidebar } from "~/components/sidebar-context";
import Link from "next/link";

interface Conversation {
  id: string;
  title: string | null;
  mode: string | null;
  createdAt: number;
  updatedAt: number | null;
}

export default function SideBar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [selectedMode, setSelectedMode] = useState("study");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data: Conversation[] = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Conversation",
          mode: selectedMode,
        }),
      });

      if (response.ok) {
        const newConv = await response.json();
        // Redirect to the new conversation
        window.location.href = `/dashboards/${newConv.id}`;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp * 1000; // Convert to milliseconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const modes = [
    { id: "study", label: "Study", icon: BookOpen },
    { id: "debug", label: "Debug", icon: Bug },
    { id: "roadmap", label: "Roadmap", icon: Map },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full border-r border-gray-700 bg-gray-900 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold text-white">StudyMate</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={createNewConversation}
          className={`w-full bg-gray-700 text-white hover:bg-gray-600 ${
            isCollapsed ? "px-2" : ""
          }`}
          size={isCollapsed ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Mode Selector */}
      {!isCollapsed && (
        <div className="mb-4 px-4">
          <div className="space-y-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={selectedMode === mode.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    selectedMode === mode.id
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {mode.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations List */}
      {!isCollapsed && (
        <div className="flex-1 px-4">
          <div className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
            Recent Chats
          </div>
          <div className="space-y-1">
            {loading ? (
              <div className="p-3 text-sm text-gray-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <Link key={conv.id} href={`/dashboards/${conv.id}`}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start p-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <MessageSquare className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {conv.title ?? "Untitled Conversation"}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {formatTimeAgo(conv.createdAt)}
                      </div>
                    </div>
                  </Button>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="border-t border-gray-700 p-4">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
              <User className="h-4 w-4 text-gray-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                User Name
              </div>
              <div className="truncate text-xs text-gray-400">
                user@example.com
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => (window.location.href = "/api/auth/signout")}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <User className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
