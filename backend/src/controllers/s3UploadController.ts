import { Request, Response } from 'express';
import { getUploadSignedUrl, getFileUrl, uploadToS3Direct } from '../utils/s3';

export const getSignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      res.status(400).json({ message: 'fileName and fileType are required' });
      return;
    }

    // Generate a unique file name to avoid collisions
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;

    const signedUrl = await getUploadSignedUrl(uniqueFileName, fileType);
    const fileUrl = getFileUrl(uniqueFileName);

    res.json({
      uploadUrl: signedUrl,
      fileUrl: fileUrl,
      key: uniqueFileName
    });
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ message: error.message });
  }
};

export const proxyUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const fileName = req.body.fileName || (req.file as any).originalname;
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    
    const fileUrl = await uploadToS3Direct(req.file.buffer, uniqueFileName, req.file.mimetype);
    
    res.json({
      fileUrl: fileUrl,
      key: uniqueFileName
    });
  } catch (error: any) {
    console.error('Error in proxy upload:', error);
    res.status(500).json({ message: error.message });
  }
};
