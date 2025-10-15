import mongoose from 'mongoose';
import { env } from '~/env';

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

export async function connectMongo() {
    if (mongoose.connection.readyState >= 1) {
        console.log('✅ MongoDB already connected');
        return;
    }

    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log("connection", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');

        // Connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('📡 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📡 Mongoose disconnected from MongoDB');
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
}

export default mongoose;