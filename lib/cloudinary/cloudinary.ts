import { v2 as cloudinary } from "cloudinary";

// 1. Configure it immediately
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

// 2. Export the configured library object (NOT a function)
export default cloudinary;
