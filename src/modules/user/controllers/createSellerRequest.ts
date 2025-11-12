import { Response } from "express";
import { AuthenticatedRequest } from "../../../types";
import { AppError } from "../../../classes";
import { Seller } from "../models";
import { multipleImagesUploader } from "../../media/utils";

interface SellerDocumentFiles {
  gst?: Express.Multer.File[];
  itr?: Express.Multer.File[];
  addressProof?: Express.Multer.File[];
  geoTagging?: Express.Multer.File[];
}

export const createSellerRequestController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;

  const existingSeller = await Seller.findOne({ user: user?._id }).lean();

  if (existingSeller && existingSeller?.approvalStatus !== "REJECTED") {
    throw new AppError(
      `You already ${
        existingSeller.approvalStatus === "PENDING"
          ? "registered as"
          : "requested for"
      } seller`,
      401
    );
  } else if (existingSeller?.approvalStatus === "REJECTED") {
    await Seller.findByIdAndDelete(existingSeller?._id, { new: true });
  }

  const files = req.files as SellerDocumentFiles;
  const { businessDetails, businessAddress, agreeTerms } = req.body;

  if (!agreeTerms) {
    throw new AppError("You have to agree with our terms and conditions", 401);
  }
  const gstFile = files?.gst?.[0];
  const itrFile = files?.itr?.[0];
  const addressProofFile = files?.addressProof?.[0];
  const geoTaggingFile = files?.geoTagging?.[0];

  if (!gstFile || !itrFile || !addressProofFile || !geoTaggingFile) {
    throw new AppError("All Documents are Required", 400);
  }

  const personalDetails = {
    name: `${user?.firstName} ${user?.lastName}`,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
  };

  const [gstResult, itrResult, addressProofResult, geoTaggingResult] =
    await multipleImagesUploader({
      files: [gstFile, itrFile, addressProofFile, geoTaggingFile],
      folder: `Sellers/${user?._id}`,
      cloudinaryConfigOption: "image",
    });

  const seller = await Seller.create({
    businessAddress,
    businessDetails,
    personalDetails,
    requiredDocuments: {
      gst: gstResult.secure_url,
      itr: itrResult.secure_url,
      addressProof: addressProofResult.secure_url,
      geoTagging: geoTaggingResult.secure_url,
    },
    user: user?._id,
  });
  res.success(
    201,
    "Request sent successfully, Our team will reach out to you very soon.",
    { seller }
  );
};
