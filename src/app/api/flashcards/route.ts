type APIRequestType = {
    topic: string;
    count: number;
    session_id: string;
    levels: string;
}


import { NextResponse } from 'next/server';
import aiApiClient from '~/lib/axios';

export async function POST(request: Request) {
    const { topic, count, session_id, levels } = await request.json() as APIRequestType;

    if (!topic || !count || !session_id || !levels) {
        return NextResponse.json(
            { error: 'Topic, count, session_id, and levels are required' },
            { status: 400 }
        );
    }

    const response = await aiApiClient.post('/flashcards', {
        topic, count, session_id, levels,
    });

    // Get conversation by session_id
    const { db } = await import('~/server/db');
    const { conversations } = await import('~/server/db/schema');
    const { eq } = await import('drizzle-orm');
    const convo = await db.select().from(conversations).where(eq(conversations.sessionId, session_id));
    let msgs: any[] = [];
    if (convo.length > 0 && typeof convo[0]?.msgs === 'string') {
        try {
            msgs = JSON.parse(convo[0].msgs);
        } catch {
            msgs = [];
        }
    }
    msgs.push(response.data);
    if (convo.length > 0) {
        await db.update(conversations)
            .set({ msgs: JSON.stringify(msgs) })
            .where(eq(conversations.sessionId, session_id));
    }

    return NextResponse.json({ aiResponse: response.data });
}

