import AWS from 'aws-sdk';
import logger from '../utils/logger';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export const uploadProfileImage = async (
    userId: string,
    file: Express.Multer.File
): Promise<string> => {
    try {
        const fileExtension = file.originalname.split('.').pop();
        const key = `profile-images/${userId}.${fileExtension}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const result = await s3.upload(uploadParams).promise();
        return result.Location;
    } catch (error) {
        logger.error('Error uploading profile image to S3:', error);
        throw new Error('Failed to upload profile image');
    }
};

export const deleteProfileImage = async (imageUrl: string): Promise<void> => {
    try {
        const key = imageUrl.split('.com/')[1];
        
        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        await s3.deleteObject(deleteParams).promise();
    } catch (error) {
        logger.error('Error deleting profile image from S3:', error);
        throw new Error('Failed to delete profile image');
    }
};