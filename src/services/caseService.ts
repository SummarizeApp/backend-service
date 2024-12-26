import s3 from '../config/awsConfig';
import { Case, ICase } from '../models/caseModel';
import { User } from '../models/userModel';
import { Logger } from '../utils/logger';

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
                Logger.error('Error uploading file to S3', err);
                reject('Error uploading file');
            } else {
                const caseFile = await Case.findByIdAndUpdate(caseId, {
                    $push: { files: data.Location },
                });

                if (!caseFile) {
                    reject('Case not found');
                }

                resolve(data.Location);
            }
        });
    });
};

export const createCaseWithFile = async (userId: string, title: string, description: string, file: Express.Multer.File): Promise<ICase> => {
    const newCase: ICase = new Case({ userId, title, description });
    await newCase.save();

    await User.findByIdAndUpdate(userId, {
        $push: { cases: newCase._id },
    });

    if (file) {
        const fileUrl = await uploadFileToS3(userId, newCase.id.toString(), file);
        newCase.files.push(fileUrl);
        await newCase.save();
    }

    return newCase;
};