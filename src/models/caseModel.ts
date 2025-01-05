import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    fileUrl: string;
    textContent?: string;
    summary?: string;
    summaryFileUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const caseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    textContent: {
        type: String
    },
    summary: {
        type: String
    },
    summaryFileUrl: {
        type: String
    }
}, {
    timestamps: true
});

export const Case = mongoose.model<ICase>('Case', caseSchema);