import { cloudinary } from "../configs/cloudinary.config";
import { regexConstant } from "../constants/regex.constant";

export const getCloudinaryPublicId = (url: string): string | null => {
  const match = url?.match(regexConstant.CLOUDINARY_PUBLIC_ID);
  return match ? match[1] : null;
};

export const deleteFile = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};

export const deleteFolder = async (folderPath: string) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 1000,
    });

    if (result.resources && result.resources.length > 0) {
      const publicIds = result.resources.map((resource) => resource.public_id);
      await cloudinary.api.delete_resources(publicIds);
    }
  } catch (error) {
    // the thing is that cloudinary doesn't allow to delete folders
    // through the api, so we need to delete the files in the folder one by one
    if (error.message && error.message.includes("No resources found")) {
      return;
    }
    throw error;
  }
};
