import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import aiApiClient from "~/lib/axios";
import { Conversation } from "~/server/db/conversation.schema";

interface AIExplanationResponse {
  question: string;
  explanation: string;
  example: string;
  levels: string;
  session_id: string;
  pdf_chunks: null | any[];
}

RequestType{
  topic: string;
  level: string;
  uuid: string;
}

export async function POST(request: Request) {

   const { topic, level, uuid } = await request.json();

   if (!topic || !level ) {
     return NextResponse.json(
       { error: "Topic, level, and UUID are required" },
       { status: 400 }
     );
   }

  
}