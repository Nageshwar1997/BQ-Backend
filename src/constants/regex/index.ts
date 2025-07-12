type RegexKeys = "escapeSpecialChars";
export const regexes: Record<RegexKeys, RegExp> = {
  escapeSpecialChars: /[.*+?^${}()|[\]\\]/g,
};
