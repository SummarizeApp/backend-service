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
    stats: {
        originalLength: number;
        summaryLength: number;
        compressionRatio: number;
        processingTime: number;
        createdAt: Date;
    };
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
        type: String,
        select: true
    },
    stats: {
        originalLength: { type: Number, default: 0 },
        summaryLength: { type: Number, default: 0 },
        compressionRatio: { type: Number, default: 0 },
        processingTime: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

//Indexes
CaseSchema.index({ userId: 1, createdAt: -1 });
CaseSchema.index({ title: 'text', description: 'text' }); 
CaseSchema.index({ 'stats.compressionRatio': 1 });
CaseSchema.index({ createdAt: -1 }); 

export const Case = mongoose.model<ICase>('Case', CaseSchema);