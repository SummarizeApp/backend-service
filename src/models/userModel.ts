import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    username: string;
    connactNumber?: string;
    cases: mongoose.Types.ObjectId[];
    isVerified: boolean;
    resetToken?: string;
    resetTokenExpires?: Date;
    stats: {
        totalCases: number;
        totalOriginalLength: number;
        totalSummaryLength: number;
        averageCompressionRatio: number;
        lastUpdateDate: Date;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
    role: UserRole;
}

const userSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    connactNumber: { type: String },
    cases: [{ type: mongoose.Types.ObjectId, ref: 'Case' }],
    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpires: Date,
    stats: {
        totalCases: { type: Number, default: 0 },
        totalOriginalLength: { type: Number, default: 0 },
        totalSummaryLength: { type: Number, default: 0 },
        averageCompressionRatio: { type: Number, default: 0 },
        lastUpdateDate: { type: Date, default: Date.now }
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER
    }
}, { timestamps: true });

//Indexes
userSchema.index({ resetToken: 1 }, { sparse: true }); 
userSchema.index({ resetTokenExpires: 1 }, { sparse: true, expireAfterSeconds: 0 });
userSchema.index({ isVerified: 1 }); 
userSchema.index({ email: 1, username: 1 }); 

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const User = mongoose.model<IUser>('User', userSchema);