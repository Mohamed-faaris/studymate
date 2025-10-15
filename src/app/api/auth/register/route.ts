import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Registration request received');

        const { name, email, passwordHash } = await request.json();
        console.log('📝 Registration data:', { name, email, hasPassword: !!passwordHash });

        // Validate input
        if (!name || !email || !passwordHash) {
            console.log('❌ Validation failed: missing required fields');
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists in Drizzle
        console.log('🔍 Checking for existing user...');
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            console.log('❌ User already exists:', email);
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user in Drizzle
        console.log('👤 Creating new user...');
        await db.insert(users).values({ name, email, passwordHash });
        console.log('✅ User created successfully:', email);

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}