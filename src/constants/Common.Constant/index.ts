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

const AUTH_PROVIDERS: TAuthProvider[] = [
  "MANUAL",
  "GOOGLE",
  "LINKEDIN",
  "GITHUB",
] as const;

const ALLOWED_ORIGINS = [
  FRONTEND_LOCAL_HOST_CLIENT_URL,
  FRONTEND_LOCAL_HOST_ADMIN_URL,
  FRONTEND_LOCAL_HOST_MASTER_URL,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_1,
  FRONTEND_LOCAL_HOST_PUBLIC_URL_2,
  FRONTEND_PRODUCTION_CLIENT_URL,
  FRONTEND_PRODUCTION_ADMIN_URL,
  FRONTEND_PRODUCTION_MASTER_URL,
];

const ROLES: TRole[] = ["USER", "SELLER", "ADMIN", "MASTER"] as const;

const STATES_AND_UNION_TERRITORIES = [
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

const ALLOWED_COUNTRIES = ["India"];

const ALLOWED_BUSINESSES = [
  "Individual",
  "Freelance Seller",
  "Small Business",
  "Home-based Seller",
  "Retail Store",
  "Salon",
  "Wholesale Distributor",
];

const MINUTE = 60;

const OTP_EXPIRY = 10 * MINUTE;

const MAX_RESEND = 3;

export const CommonConstants = {
  AUTH_PROVIDERS,
  ALLOWED_ORIGINS,
  ROLES,
  STATES_AND_UNION_TERRITORIES,
  ALLOWED_COUNTRIES,
  ALLOWED_BUSINESSES,
  MINUTE,
  OTP_EXPIRY,
  MAX_RESEND,
};
