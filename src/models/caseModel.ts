import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    file: string;
    textContent?: string;
    summary?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CaseSchema: Schema = new Schema({
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
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    textContent: {
        type: String
    },
    summary: {
        type: String
    }
}, {
    timestamps: true
});

export const Case = mongoose.model<ICase>('Case', CaseSchema);