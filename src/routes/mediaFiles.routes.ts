import { Router } from "express";
import upload from "../configs/upload.multer.config";
import {
  removeMultipleImageUrls,
  removeSingleImageUrl,
  uploadMultipleImages,
  uploadSingleImage,
  uploadHomeVideo,
  getAllHomeVideos,
} from "../controllers/mediaFiles.controller";
import isAuthorized from "../middlewares/authorization.middleware";

const mediaRouter = Router();

// Image Upload
// For Multiple Images Upload
mediaRouter.post("/images/upload", upload.array("images"), uploadMultipleImages);
// For Single Image Upload
mediaRouter.post("/image/upload", upload.single("image"), uploadSingleImage);
// For Single Image Remove
mediaRouter.delete("/image/delete", removeSingleImageUrl);
// For Multiple Images Remove
mediaRouter.delete("/images/delete", removeMultipleImageUrls);

// Video Upload
// For Single Video Upload
mediaRouter.post(
  "/video/upload",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  isAuthorized(["MASTER"]),
  uploadHomeVideo
);

mediaRouter.get("/videos/home", getAllHomeVideos);

export default mediaRouter;
