import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import { Conversation } from "~/server/db/conversation.schema";
import { connectMongo } from "~/server/db/mongoose";

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

    await connectMongo();

    // Find conversation and populate createdBy for user info
    const conversation = await Conversation.findById(conversationId)
      .populate('createdBy', 'name email')
      .populate('viewer', 'name email');

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if user has access to this conversation
    const userId = session.user.id;
    const isCreator = conversation.createdBy._id.toString() === userId;
    const isViewer = conversation.viewer.some((viewer: any) => viewer._id.toString() === userId);

    if (!isCreator && !isViewer) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Return conversation data
    const conversationData = {
      id: conversation._id.toString(),
      title: conversation.title,
      createdBy: {
        id: conversation.createdBy._id.toString(),
        name: conversation.createdBy.name,
        email: conversation.createdBy.email,
      },
      viewer: conversation.viewer.map((viewer: any) => ({
        id: viewer._id.toString(),
        name: viewer.name,
        email: viewer.email,
      })),
      messages: conversation.message || [],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
    console.log("Fetched conversation:", conversationData);
    return NextResponse.json({ conversation: conversationData });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
