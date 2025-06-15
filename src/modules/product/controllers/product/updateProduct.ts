import { Response } from "express";
import { AuthorizedRequest } from "../../../../types";

export const updateProductController = async (
  req: AuthorizedRequest,
  res: Response
) => {
  const user = req.user;

  console.log("REQ.FIle", req.file);

  res.success(201, "Product updated successfully", { data: req.body });
};
