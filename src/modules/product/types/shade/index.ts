import { ValidateZodFieldProps } from "../../../../types";

export interface ShadeProps {
  colorCode: string;
  shadeName: string;
  images: string[];
  stock: number;
}

export type ValidateShadeFieldProps = ValidateZodFieldProps;
