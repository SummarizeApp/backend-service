import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
    comparePassword(candidatePassword: string): Promise<boolean>;
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
    resetTokenExpires: Date
}, { timestamps: true });

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