import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import { db } from '~/server/db';
import { conversations } from '~/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Find conversation by ID and userId
    const convoIdNum = Number(conversationId);
    const userIdNum = Number(session.user.id);
    const convoRows = await db.select().from(conversations)
      .where(and(eq(conversations.id, convoIdNum), eq(conversations.userId, userIdNum)));
    if (!convoRows.length) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }
    const convo = convoRows[0];
    // Return conversation data
    const conversationData = {
      id: convo?.id,
      title: convo?.title,
      userId: convo?.userId,
      sessionId: convo?.sessionId,
      msgs: convo?.msgs ? JSON.parse(convo.msgs) : [],
      createdAt: convo?.createdAt ?? null,
    };
    console.log("Fetched conversation:", conversationData);
    return NextResponse.json({ conversation: conversationData });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
