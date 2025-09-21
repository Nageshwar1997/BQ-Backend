import { Request, Response } from "express";

export const addAddressController = async (req: Request, res: Response) => {
  res.success(200, "Address added successfully");
};
