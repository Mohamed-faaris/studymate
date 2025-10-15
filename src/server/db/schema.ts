import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
});

export const conversations = sqliteTable('conversations', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').notNull(),
    sessionId: text('session_id').notNull(),
    title: text('title').notNull(),
    msgs: text('msgs').notNull(), 
});

export const messages = sqliteTable('messages', {
    id: integer('id').primaryKey(),
    conversationId: integer('conversation_id').notNull(),
    senderId: integer('sender_id').notNull(),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull(),
});
