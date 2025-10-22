export function leadingZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

export function trimYear(year: string) {
  if (year.length > 2) {
    return year.slice(2, year.length);
  }
  return year;
}

export function isExpired(date: Date) {
  const today = new Date();
  return date.getTime() < today.getTime();
}

// Convert seconds to hours
// Below 1 hour return format: 0:30
// Above 1 hour return format: 1:30
// above 10 hours return 10h
export function getTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 10) {
    return `${hours}h`;
  }
  return `${hours}:${minutes}`;
}
