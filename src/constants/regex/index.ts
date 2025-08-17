type RegexKeys =
  | "noSpace"
  | "validDate"
  | "validPhone"
  | "validName"
  | "validEmail"
  | "singleSpace"
  | "validPassword"
  | "validHexColorCode"
  | "escapeSpecialChars";

export const regexes: Record<RegexKeys, RegExp> = {
  validPhone: /^[6-9][0-9]{9}$/,
  noSpace: /^\S+$/,
  validDate:
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|([+-]\d{2}:\d{2}))?)?$/,
  validName: /^(?!.*\d)(?!.* {2})([A-Za-z]+( [A-Za-z]+)*)$/,
  validEmail:
    /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})+$/,
  singleSpace: /^(?!.* {2,}).*$/s,
  validPassword:
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])(?=\S.*$).{6,20}$/,
  validHexColorCode:
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  escapeSpecialChars: /[.*+?^${}()|[\]\\]/g,
};
