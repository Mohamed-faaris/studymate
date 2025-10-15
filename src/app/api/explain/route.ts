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

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, level, session_id } = await request.json();

    if (!topic || !level) {
      return NextResponse.json(
        { error: "Topic and level are required" },
        { status: 400 }
      );
    }
    const res = await aiApiClient.post("/explain", {
      question: topic,
      levels: level,
      session_id: session_id || "default_session",
    });

    const aiResponse: AIExplanationResponse = res.data;

    return NextResponse.json({ uuid: aiResponse.session_id, response: aiResponse });

  } catch (error) {
    console.error("Error in explain API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}