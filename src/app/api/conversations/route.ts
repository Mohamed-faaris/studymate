import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import { db } from '~/server/db';
import { conversations } from '~/server/db/schema';
import { eq } from 'drizzle-orm';


export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const convoRows = await db.select().from(conversations).where(eq(conversations.userId, session.user.id));
        const conversationsList = convoRows.map(conv => ({
            id: conv.id,
            title: conv.title,
            createdAt: conv.createdAt ?? null
        }));
        return NextResponse.json({ conversations: conversationsList });

    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
