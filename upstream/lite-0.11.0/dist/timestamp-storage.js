/** Fixed ISO calendar validation without Date's implicit 1900 offset for years 00–99. */
export function isIsoTimestamp(value) {
  const parts =
    typeof value === "string" &&
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(?:Z|[+-](\d{2}):?(\d{2}))?)?$/,
    );
  if (!parts) return false;
  const year = Number(parts[1]),
    month = Number(parts[2]),
    day = Number(parts[3]);
  const hour = parts[4] === undefined ? 0 : Number(parts[4]);
  const minute = parts[5] === undefined ? 0 : Number(parts[5]);
  const second = parts[6] === undefined ? 0 : Number(parts[6]);
  const offsetHour = parts[8] === undefined ? 0 : Number(parts[8]);
  const offsetMinute = parts[9] === undefined ? 0 : Number(parts[9]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days =
    month === 2
      ? leap
        ? 29
        : 28
      : month === 4 || month === 6 || month === 9 || month === 11
        ? 30
        : 31;
  return (
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= days &&
    hour <= 24 &&
    minute <= 59 &&
    second <= 59 &&
    (hour !== 24 || (minute === 0 && second === 0)) &&
    offsetHour <= 15 &&
    offsetMinute <= 59
  );
}
