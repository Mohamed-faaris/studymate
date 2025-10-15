import { NextRequest, NextResponse } from 'next/server';
import { User } from '~/server/mongoDb/user.schema';
import { connectMongo } from '~/server/db/mongoose';

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

        // Connect to database
        console.log('🔄 Ensuring MongoDB connection...');
        await connectMongo();

        // Check if user already exists
        console.log('🔍 Checking for existing user...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        console.log('👤 Creating new user...');
        const user = new User({
            name,
            email,
            passwordHash,
        });

        await user.save();
        console.log('✅ User created successfully:', user._id);

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