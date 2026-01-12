"use server";
import axios from "axios";

export const uploadToCloudinary = async (formData: FormData) => {
  formData.append("upload_preset", process.env.CLOUDINARY_PRESET as string);
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return { error: false, url: response.data.secure_url };
  } catch (e) {
    console.error(e);
    return { error: true, url: null };
  }
};
