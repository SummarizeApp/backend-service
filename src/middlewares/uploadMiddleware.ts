import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const limits = {
    fileSize: 10 * 1024 * 1024, 
};

const upload = multer({ storage, fileFilter, limits });

export default upload;