import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { Conversation } from "~/server/db/conversation.schema";
import aiApiClient from "~/lib/axios";

interface AIResponse {
  response?: string;
  explanation?: string;
  question?: string;
  example?: string;
  levels?: string;
  session_id?: string;
  pdf_chunks?: null | any[];
  flashcards?: any[];
  quiz?: any;
  flowchart?: any;
  thought_questions?: any[];
  code?: string;
  output?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatId, mode = "explain", level = "novice", session_id } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let conversationId = chatId;
    let conversation;

    // If no chatId provided, create a new conversation
    if (!conversationId) {
      const newConversation = new Conversation({
        title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        mode,
        createdBy: session.user.id,
        message: [],
      });

      conversation = await newConversation.save();
      conversationId = conversation._id.toString();
    } else {
      // Verify the conversation exists and belongs to the user
      conversation = await Conversation.findOne({
        _id: conversationId,
        createdBy: session.user.id,
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    // Save the user message
    conversation.message.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    await conversation.save();

    // Call the appropriate AI API based on mode
    let aiResponse;
    let responseType = mode;

    try {
      switch (mode) {
        case "explain":
          aiResponse = await aiApiClient.post("/api/explain", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        case "flashcards":
          aiResponse = await aiApiClient.post("/api/flashcards", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        case "quiz":
          aiResponse = await aiApiClient.post("/api/quiz", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        case "flowchart":
          aiResponse = await aiApiClient.post("/api/flowchart", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        case "thought-questions":
          aiResponse = await aiApiClient.post("/api/thought-questions", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        case "execute-code":
          aiResponse = await aiApiClient.post("/api/execute-code", {
            code: message,
            session_id: session_id || conversationId,
          });
          break;
        case "debug-code":
          aiResponse = await aiApiClient.post("/api/debug-code", {
            code: message,
            session_id: session_id || conversationId,
          });
          break;
        case "example-code":
          aiResponse = await aiApiClient.post("/api/example-code", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          break;
        default:
          // Default to explain
          aiResponse = await aiApiClient.post("/api/explain", {
            question: message,
            levels: level,
            session_id: session_id || conversationId,
          });
          responseType = "explain";
      }
    } catch (apiError) {
      console.error("AI API Error:", apiError);
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 });
    }

    const aiData: AIResponse = aiResponse.data;

    // Format response based on type
    let formattedResponse: any = {
      type: responseType,
      content: aiData,
      level: level,
      session_id: aiData.session_id || conversationId,
    };

    // Save the AI response
    conversation.message.push({
      role: "assistant",
      content: JSON.stringify(formattedResponse),
      timestamp: new Date(),
      type: responseType,
    });

    await conversation.save();

    return NextResponse.json({
      conversationId,
      response: formattedResponse,
      mode: responseType,
      level: level,
      status: "success",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in explain API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}