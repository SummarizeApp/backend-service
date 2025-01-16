import s3 from '../config/awsConfig';
import logger from '../utils/logger';

export class S3Service {
    static async uploadFile(userId: string, caseId: string, file: Express.Multer.File): Promise<string> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
            Key: `cases/${userId}/${caseId}.pdf`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err: any, data: any) => {
                if (err) {
                    logger.error('Error uploading file to S3', err);
                    reject('Error uploading file');
                } else {
                    resolve(data.Location);
                }
            });
        });
    }

    static async uploadSummary(pdfBuffer: Buffer, caseId: string): Promise<string> {
        const key = `summaries/${caseId}/summary.pdf`;

        await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
        }).promise();

        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    static async deleteFile(fileUrl: string): Promise<void> {
        const fileKey = fileUrl.split('.com/')[1];
        console.log(fileKey);
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileKey
        }).promise();
    }

    static async getFile(caseId: string, fileName: string): Promise<any> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
            Key: `cases/${caseId}/${fileName}`
        };
    
        return s3.getObject(params).createReadStream();
    }    
}