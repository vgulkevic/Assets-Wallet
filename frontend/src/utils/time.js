const relative = new Intl.RelativeTimeFormat("en-GB", {numeric: "auto"});
const DAY = 24 * 60 * 60 * 1000;
export const STALE_AFTER_DAYS = 90;

// "today", "3 days ago", "2 months ago"
export function timeAgo(isoDate) {
    const days = Math.round((new Date(isoDate) - Date.now()) / DAY);
    if (days > -1) {
        return relative.format(0, "day");
    }
    if (days > -30) {
        return relative.format(days, "day");
    }
    if (days > -365) {
        return relative.format(Math.round(days / 30), "month");
    }
    return relative.format(Math.round(days / 365), "year");
}

export const isStale = (isoDate) => (Date.now() - new Date(isoDate)) / DAY > STALE_AFTER_DAYS;
