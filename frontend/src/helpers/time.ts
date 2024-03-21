enum UnitPerSec {
  YEAR = 31536000,
  MONTH = 2592000,
  DAY = 86400,
  HOUR = 3600,
  MIN = 60
}

export function timeLeft(date: Date) {
  const now = new Date().getTime();
  const diff = new Date(date).getTime() - now;
  const seconds = Math.abs(Math.floor(diff / 1000));
  let interval: number;

  interval = Math.floor(seconds / UnitPerSec.YEAR);
  if (interval >= 1) return `${interval}y`;
  
  interval = Math.floor(seconds / UnitPerSec.MONTH);
  if (interval >= 1) return `${interval}m`;

  interval = Math.floor(seconds / UnitPerSec.DAY);
  if (interval >= 1) return `${interval}d`;

  interval = Math.floor(seconds / UnitPerSec.HOUR);
  if (interval >= 1) return `${interval}h`;

  interval = Math.floor(seconds / UnitPerSec.MIN);
  if (interval >= 1) return `${interval}m`;

  return `${seconds}s`;
}
