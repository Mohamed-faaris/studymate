import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { conversations, messages } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatId, mode = "study" } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let conversationId = chatId;
    let conversation;

    // If no chatId provided, create a new conversation
    if (!conversationId) {
      const newConversations = await db
        .insert(conversations)
        .values({
          title: message.length > 50 ? message.substring(0, 50) + "..." : message,
          mode,
          createdById: session.user.id,
        })
        .returning();

      if (!newConversations || newConversations.length === 0) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }

      conversationId = newConversations[0]!.id;
      conversation = newConversations[0]!;
    } else {
      // Verify the conversation exists and belongs to the user
      const existingConversations = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!existingConversations || existingConversations.length === 0 || existingConversations[0]!.createdById !== session.user.id) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
      conversation = existingConversations[0]!;
    }

    // At this point, conversation should always be defined
    if (!conversation) {
      return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
    }

    // Save the user message
    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: message,
    });

    // Generate AI response based on mode (placeholder for Python server testing)
    let aiResponse = "";
    switch (conversation.mode) {
      case "study":
        aiResponse = `📚 Study Mode: I understand you're asking about "${message}". This is a placeholder response from StudyMate. In a real implementation, I would provide detailed explanations, examples, and study guidance.`;
        break;
      case "debug":
        aiResponse = `🐛 Debug Mode: I see you're debugging: "${message}". This is a placeholder response. Normally, I would analyze your code, identify potential issues, and suggest fixes.`;
        break;
      case "roadmap":
        aiResponse = `🗺️ Roadmap Mode: You're planning: "${message}". This is a placeholder response. I would typically create structured learning paths and recommend resources.`;
        break;
      default:
        aiResponse = `Hello! You said: "${message}". This is a placeholder response from StudyMate. The AI integration is currently disabled for testing purposes.`;
    }

    // Add some mock metadata for Python server compatibility
    const mockMetadata = {
      model: "placeholder-gpt-4o-mini",
      tokens_used: message.length + aiResponse.length,
      processing_time: Math.random() * 2 + 0.5, // Random processing time between 0.5-2.5s
      mode: conversation.mode,
      conversation_id: conversationId,
    };

    // Save the AI response
    await db.insert(messages).values({
      conversationId,
      role: "assistant",
      content: aiResponse,
    });

    return NextResponse.json({
      conversationId,
      response: aiResponse,
      metadata: mockMetadata,
      mode: conversation.mode,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing explain request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}