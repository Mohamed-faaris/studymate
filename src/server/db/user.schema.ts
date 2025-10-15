import mongoose from './mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
