import { view } from 'drizzle-orm/sqlite-core';
import mongoose from '.';

const ConversationSchema = new mongoose.Schema({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    viewer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    title: { type: String, required: true },
    message:[{type:mongoose.Schema.Types.Mixed}],
});

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
