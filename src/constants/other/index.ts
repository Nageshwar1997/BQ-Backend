import {
  FRONTEND_LOCAL_HOST_CLIENT_URL,
  FRONTEND_LOCAL_HOST_ADMIN_URL,
  FRONTEND_LOCAL_HOST_MASTER_URL,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
  FRONTEND_PRODUCTION_CLIENT_URL,
  FRONTEND_PRODUCTION_ADMIN_URL,
  FRONTEND_PRODUCTION_MASTER_URL,
} from "../../envs";
import { TAuthProvider } from "../../modules/user/types";
import { TRole } from "../../types";

export const AUTH_PROVIDERS: TAuthProvider[] = [
  "MANUAL",
  "GOOGLE",
  "LINKEDIN",
  "GITHUB",
] as const;

export const allowedOrigins = [
  FRONTEND_LOCAL_HOST_CLIENT_URL,
  FRONTEND_LOCAL_HOST_ADMIN_URL,
  FRONTEND_LOCAL_HOST_MASTER_URL,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
  FRONTEND_PRODUCTION_CLIENT_URL,
  FRONTEND_PRODUCTION_ADMIN_URL,
  FRONTEND_PRODUCTION_MASTER_URL,
];

export const ROLES: TRole[] = ["USER", "SELLER", "ADMIN", "MASTER"] as const;

export const STATES_AND_UNION_TERRITORIES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (National Capital Territory of Delhi)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const ALLOWED_COUNTRIES = ["India"];

export const ALLOWED_BUSINESSES = [
  "Individual",
  "Freelance Seller",
  "Small Business",
  "Home-based Seller",
  "Retail Store",
  "Salon",
  "Wholesale Distributor",
];

export const MINUTE = 60;

export const OTP_EXPIRY = 10 * MINUTE;

export const MAX_RESEND_OTP = 3;
