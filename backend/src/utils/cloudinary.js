import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Log the local file path BEFORE uploading
    console.log("Cloudinary Local File Path:", localFilePath);
    console.log("File exists before upload:", fs.existsSync(localFilePath));

    // Configure cloudinary here (after .env is loaded)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded successfully
    console.log("File uploaded to Cloudinary:", response.url);

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Remove locally saved temporary file if upload fails
    if (fs.existsSync(localFilePath)) {
      console.log("Deleting temp file after failed upload:", localFilePath);
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

// Optimize delivery by resizing and applying auto-format and auto-quality
const getOptimizedUrl = (publicId) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
  });
};


// Transform the image: auto-crop to square aspect_ratio
const getAutoCropUrl = (publicId, width = 500, height = 500) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary.url(publicId, {
    crop: "auto",
    gravity: "auto",
    width,
    height,
  });
};

export { uploadOnCloudinary, getOptimizedUrl, getAutoCropUrl, cloudinary };
