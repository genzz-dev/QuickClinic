import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'image',
    });

    // Remove file after upload
    fs.unlinkSync(localFilePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove file even if upload fails
    throw error;
  }
};
