/** Convert Western digits to Persian digits */
export function toPersianNumber(value: string | number): string {
  const str = String(value);
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/\d/g, (d) => map[Number(d)]);
}

export function formatToman(amount: number): string {
  if (amount === 0) return "رایگان";
  return `${toPersianNumber(amount.toLocaleString("en-US"))} تومان`;
}
