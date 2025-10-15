import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { conversations, messages } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = params.conversationId;

    // First verify the conversation exists and belongs to the user
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.createdById, session.user.id)
        )
      )
      .limit(1);

    if (!conversation || conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Get all messages for this conversation
    const conversationMessages = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return NextResponse.json({
      conversation: conversation[0],
      messages: conversationMessages,
    });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}