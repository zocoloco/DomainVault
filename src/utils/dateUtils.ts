export function getDaysUntilExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  // Normalize both dates to midnight UTC to prevent hour timezone drifts
  const utcExpiry = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = utcExpiry - utcNow;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryBadgeProps(expiryDateStr: string): {
  daysLeft: number;
  label: string;
  badgeClass: string;
  isUrgent: boolean;
} {
  const days = getDaysUntilExpiry(expiryDateStr);

  if (days < 0) {
    return {
      daysLeft: days,
      label: `Expired (${Math.abs(days)}d ago)`,
      badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      isUrgent: true,
    };
  }

  if (days <= 30) {
    return {
      daysLeft: days,
      label: `${days}d left`,
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse',
      isUrgent: true,
    };
  }

  if (days <= 90) {
    return {
      daysLeft: days,
      label: `${days}d left`,
      badgeClass: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
      isUrgent: false,
    };
  }

  if (days <= 365) {
    const months = Math.round(days / 30);
    return {
      daysLeft: days,
      label: `~${months} mos`,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      isUrgent: false,
    };
  }

  const years = (days / 365).toFixed(1);
  return {
    daysLeft: days,
    label: `${years} yrs`,
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    isUrgent: false,
  };
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
