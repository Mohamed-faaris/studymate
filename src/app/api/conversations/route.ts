import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import { Conversation } from "~/server/mongoDb/conversation.schema";


export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    const conversations = await Conversation.find({
      createdBy: session.user.id
    }).select('title _id createdAt').sort({ createdAt: -1 });

    const conversationsList = conversations.map(conv => ({
      id: conv._id.toString(),
      title: conv.title,
      createdAt: conv.createdAt
    }));

    return NextResponse.json({
      conversations: conversationsList
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
