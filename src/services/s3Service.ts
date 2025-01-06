import AWS from 'aws-sdk';
import logger from '../utils/logger';
import { Case } from '../models/caseModel';

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

export const uploadFileToS3 = async (userId: string, caseId: string, file: Express.Multer.File): Promise<string> => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
        Key: `cases/${userId}/${caseId}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, async (err: any, data: any) => {
            if (err) {
                logger.error('Error uploading file to S3', err);
                reject('Error uploading file');
            } else {
                resolve(data.Location);
            }
        });
    });
};

export const getFileFromS3 = async (caseId: string, fileName: string): Promise<any> => {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
        throw new Error('Case not found');
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
        Key: caseDoc.fileUrl 
    };

    return s3.getObject(params).createReadStream();
};

export const uploadSummaryToS3 = async (pdfBuffer: Buffer, caseId: string): Promise<string> => {
    const key = `summaries/${caseId}/summary.pdf`;
    
    await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf'
    }).promise();

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};