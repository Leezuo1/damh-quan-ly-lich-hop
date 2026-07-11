import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// "T2, 15/06/2026"
export function formatVNDate(isoOrDate) {
  const date = new Date(isoOrDate);
  return `${WEEKDAY_LABELS[date.getDay()]}, ${format(date, "dd/MM/yyyy")}`;
}

// "09:00"
export function formatTime(isoOrDate) {
  return format(new Date(isoOrDate), "HH:mm");
}

// "09:00 - 10:00"
export function formatTimeRange(startIso, endIso) {
  return `${formatTime(startIso)} - ${formatTime(endIso)}`;
}

// "2 phút trước"
export function formatRelativeTime(isoOrDate) {
  return formatDistanceToNow(new Date(isoOrDate), { addSuffix: true, locale: vi });
}
