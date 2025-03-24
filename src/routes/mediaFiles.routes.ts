import { Router } from "express";
import upload from "configs/upload.multer.config";
import {
  removeMultipleImageUrls,
  removeSingleImageUrl,
  uploadImages,
  uploadSingleImage,
  uploadHomeVideo,
  getAllHomeVideos,
} from "controllers/mediaFiles.controller";
import isAuthorized from "middlewares/authorization.middleware";

const mediaRouter = Router();

// Image Upload
// For Multiple Images Upload
mediaRouter.post("/images", upload.array("images"), uploadImages);
// For Single Image Upload
mediaRouter.post("/image", upload.single("image"), uploadSingleImage);
// For Single Image Remove
mediaRouter.delete("/image", removeSingleImageUrl);
// For Multiple Images Remove
mediaRouter.delete("/images", removeMultipleImageUrls);

// Video Upload
// For Single Video Upload
mediaRouter.post(
  "/video/upload",
  upload.single("video"),
  isAuthorized(["MASTER"]),
  uploadHomeVideo
);
mediaRouter.get("/videos/home", getAllHomeVideos);

export default mediaRouter;
