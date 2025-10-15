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
  const { topic, level, id, session_id, userId } = await request.json();

  if (!topic || !level || !id) {
    return NextResponse.json(
      { error: "Topic, level, and ID are required" },
      { status: 400 }
    );
  }



  // Check if conversation exists
  const existing = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!existing.length) {
    // Create new conversation
    await db.insert(conversations).values({
      id,
      userId: userId ?? 1, // fallback userId if not provided
      sessionId: session_id ?? '',
      title: topic,
      msgs: '[]',
    });
  }

  const aiResponse = await aiApiClient.post<AIExplanationResponse>("/explain",
    {
      "question": topic,
      "levels": level,
      "session_id": session_id
    }
  );

  // Push AI response into msgs array
  const convo = await db.select().from(conversations).where(eq(conversations.id, id));
  let msgs: any[] = [];
  if (convo.length > 0 && typeof convo[0]?.msgs === 'string') {
    try {
      msgs = JSON.parse(convo[0].msgs);
    } catch {
      msgs = [];
    }
  }
  msgs.push(aiResponse.data);
  await db.update(conversations)
    .set({ msgs: JSON.stringify(msgs) })
    .where(eq(conversations.id, id));

  return NextResponse.json({ message: 'AI response added to conversation', id, ai: aiResponse.data });
}