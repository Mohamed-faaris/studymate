import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { conversations } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        mode: conversations.mode,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.createdById, session.user.id))
      .orderBy(desc(conversations.updatedAt))
      .limit(20);

    return NextResponse.json(userConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, mode = "study" } = body;

    const [newConversation] = await db
      .insert(conversations)
      .values({
        title: title ?? "New Conversation",
        mode,
        createdById: session.user.id,
      })
      .returning();

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}