import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import aiApiClient from "~/lib/axios";

interface AIExplanationResponse {
  question: string;
  explanation: string;
  example: string;
  levels: string;
  session_id: string;
  pdf_chunks: null | any[];
}

type RequestType = {
  topic: string;
  level: string;
  uuid: string;
}

import { db } from "~/server/db";
import { conversations } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    console.log("📥 Explain API request received");

    const { topic = "education", level = "beginner", id = 1, session_id, userId } = await request.json();
    console.log("🔍 Received request:", { topic, level, id, session_id, userId });

    if (!topic || !level || !id) {
      console.log("❌ Validation failed: Missing required fields");
      return NextResponse.json(
        { error: "Topic, level, and ID are required" },
        { status: 400 }
      );
    }

    console.log("🔄 Checking if conversation exists for ID:", id);
    // Check if conversation exists
    const existing = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!existing.length) {
      console.log("➕ Creating new conversation with ID:", id);
      // Create new conversation
      await db.insert(conversations).values({
        id,
        userId: userId ?? 1, // fallback userId if not provided
        sessionId: session_id ?? '',
        title: topic,
        msgs: '[]',
      });
      console.log("✅ New conversation created");
    } else {
      console.log("✅ Conversation exists, proceeding");
    }

    console.log("🤖 Sending request to AI API with:", { question: topic, levels: level, session_id });
    const aiResponse = await aiApiClient.post<AIExplanationResponse>("/explain",
      {
        "question": topic,
        "levels": level,
        "session_id": session_id
      }
    );
    console.log("✅ AI response received:", aiResponse.status);
    console.log("📊 AI response data:", aiResponse.data);

    console.log("💾 Updating conversation messages");
    // Push AI response into msgs array
    const convo = await db.select().from(conversations).where(eq(conversations.id, id));
    let msgs: any[] = [];
    if (convo.length > 0 && typeof convo[0]?.msgs === 'string') {
      try {
        msgs = JSON.parse(convo[0].msgs);
        console.log("📝 Parsed existing messages:", msgs.length);
      } catch (error) {
        console.log("⚠️ Failed to parse existing messages, starting fresh:", error);
        msgs = [];
      }
    }
    msgs.push(aiResponse.data);
    await db.update(conversations)
      .set({ msgs: JSON.stringify(msgs) })
      .where(eq(conversations.id, id));
    console.log("✅ Messages updated successfully, total messages:", msgs.length);

    // Always return a 'response' field for frontend compatibility
    const responseData = {
      message: 'AI response added to conversation',
      id,
      response: aiResponse.data.explanation || aiResponse.data.question || JSON.stringify(aiResponse.data),
      ai: aiResponse.data
    };
    console.log("📤 Sending response to client:", responseData);
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("❌ Critical error in /api/explain:", error);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error stack:", error?.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}