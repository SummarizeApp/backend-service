import mongoose, { Document, Schema } from 'mongoose';

interface IOTP extends Document {
    userId: mongoose.Types.ObjectId;
    otpCode: string;
    expiresAt: Date;
}

const otpSchema = new Schema<IOTP>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

const OTP = mongoose.model<IOTP>('OTP', otpSchema);

export default OTP; 