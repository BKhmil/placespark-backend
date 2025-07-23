export const normalizeToArray = (val: unknown): string[] => {
  if (Array.isArray(val)) {
    return val.map((v) => decodeURIComponent(String(v)));
  }
  if (typeof val === "string") {
    return val
      .split(",")
      .map((v) => decodeURIComponent(v.trim()))
      .filter(Boolean);
  }
  return [];
};
