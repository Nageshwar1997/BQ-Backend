export interface ShadeProps {
  colorCode: string;
  shadeName: string;
  images: string[];
  stock: number;
}

export type TShadesFieldOnly = "colorCode" | "shadeName" | "stock";
