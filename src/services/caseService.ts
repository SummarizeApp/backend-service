import { Case, ICase } from '../models/caseModel';
import { User } from '../models/userModel';
import logger from '../utils/logger';
import s3 from '../config/awsConfig';
import pdfParse from 'pdf-parse';

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

export const createCaseWithFile = async (userId: string, title: string, description: string, file: Express.Multer.File): Promise<ICase> => {

    const fileUrl = await uploadFileToS3(userId, Date.now().toString(), file);
    
    const pdfData = await pdfParse(file.buffer);
    const cleanedText = cleanPdfText(pdfData.text);

    const newCase = await Case.create({
        userId,
        title,
        description,
        file: fileUrl, 
        textContent: cleanedText
    });

    await User.findByIdAndUpdate(userId, {
        $push: { cases: newCase._id },
    });

    return newCase;
};

export const getFileFromS3 = async (caseId: string, fileName: string): Promise<any> => {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
        throw new Error('Case not found');
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
        Key: caseDoc.file 
    };

    return s3.getObject(params).createReadStream();
};

export const getCasesByUserId = async (userId: string): Promise<ICase[]> => {
    return Case.find({ userId });
};

const cleanPdfText = (text: string): string => {
    return text
        .replace(/\n/g, ' ')
        .replace(/\s\s+/g, ' ')
        .trim();
};