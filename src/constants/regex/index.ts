type RegexKeys =
  | "noSpace"
  | "date"
  | "phoneNumber"
  | "name"
  | "email"
  | "singleSpace"
  | "password"
  | "hexCode"
  | "escapeSpecialChars"
  | "gst"
  | "url"
  | "pinCode"
  | "phoneStart"
  | "phoneExactLength"
  | "onlyDigits"
  | "onlyLetters"
  | "onlyUppercase"
  | "onlyLowercase"
  | "otp"
  | "atLeastOneDigit"
  | "onlyLettersAndSpaces"
  | "atLeastOneLowercaseLetter"
  | "atLeastOneSpecialCharacter"
  | "atLeastOneUppercaseLetter"
  | "onlyLettersAndSpacesAndDots"
  | "pan";

export const regexes: Record<RegexKeys, RegExp> = {
  phoneStart: /^[6-9]/, // Starts with 6, 7, 8, or 9
  phoneExactLength: /^\d{10}$/, // Exactly 10 digits
  phoneNumber: /^[6-9][0-9]{9}$/, // Phone number e.g. 9876543210
  noSpace: /^\S+$/, // No spaces allowed
  singleSpace: /^(?!.* {2,}).*$/s, // Single space allowed
  date: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|([+-]\d{2}:\d{2}))?)?$/, // Date e.g. 2022-01-01T12:00:00Z
  name: /^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/, // Only letters & single space
  email:
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/, // Email e.g. 3oYQK@example.com
  password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/, // Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long
  hexCode: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, // Hex color code
  escapeSpecialChars: /[.*+?^${}()|[\]\\]/g,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, // Check valid GST number
  pinCode: /^[1-9][0-9]{5}$/, // Check valid pin code
  otp: /^[0-9]{6}$/,
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i,
  pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
  atLeastOneUppercaseLetter: /[A-Z]/, // At least one uppercase letter
  atLeastOneLowercaseLetter: /[a-z]/, // At least one lowercase letter
  atLeastOneDigit: /\d/, // At least one digit
  atLeastOneSpecialCharacter: /[@$!%*?&#]/, // At least one special character
  onlyDigits: /^\d+$/, // All characters are digits
  onlyUppercase: /^[A-Z]+$/, // All characters are uppercase
  onlyLowercase: /^[a-z]+$/, // All characters are lowercase
  onlyLetters: /^[a-zA-Z]+$/, // All characters are letters
  onlyLettersAndSpaces: /^[a-zA-Z\s]+$/, // All characters are letters and spaces
  onlyLettersAndSpacesAndDots: /^[a-zA-Z\s.]+$/, // Only letters, spaces, and dots
};
