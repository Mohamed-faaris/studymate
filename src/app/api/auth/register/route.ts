import { NextRequest, NextResponse } from 'next/server';
import { User } from '~/server/mongoDb/user.schema';

export async function POST(request: NextRequest) {
    try {
        const { name, email, passwordHash } = await request.json();

        // Validate input
        if (!name || !email || !passwordHash) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const user = new User({
            name,
            email,
            passwordHash,
        });

        await user.save();

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}