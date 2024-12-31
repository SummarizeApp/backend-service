import { User } from '../models/userModel';

export const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId).select('-password'); 
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
