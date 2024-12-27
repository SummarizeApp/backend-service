import mongoose, { Document, Schema } from 'mongoose';

export interface ICase extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    files: string[];
    textContent?: string;
}

const caseSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    files: [{ type: String }],
    textContent: { type: String },
}, { timestamps: true });

export const Case = mongoose.model<ICase>('Case', caseSchema);