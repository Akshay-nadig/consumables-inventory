// Formatting utilities for Consumables Inventory System

// Ensure UTC strings without trailing 'Z' are parsed correctly as UTC
function parseDate(dateString) {
  if (!dateString) return null;
  const s = String(dateString);
  if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s + 'Z');
  }
  return new Date(s);
}

// Generate current timestamp formatted as ISO with Indian Standard Time offset (+05:30)
export function getNowISTISOString() {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMs + now.getTimezoneOffset() * 60000);

  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const pad3 = (n) => String(Math.floor(n)).padStart(3, '0');

  const yyyy = istTime.getFullYear();
  const MM = pad(istTime.getMonth() + 1);
  const dd = pad(istTime.getDate());
  const hh = pad(istTime.getHours());
  const mm = pad(istTime.getMinutes());
  const ss = pad(istTime.getSeconds());
  const ms = pad3(istTime.getMilliseconds());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}+05:30`;
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = parseDate(dateString);
  if (!d || isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const d = parseDate(dateString);
  if (!d || isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

export function getStockStatus(currentStock, minReorder) {
  if (currentStock <= 0) {
    return {
      status: 'Out of Stock',
      label: 'Depleted',
      badgeClass: 'badge-out-of-stock',
      barColor: '#dc2626',
      percent: 0
    };
  }
  if (currentStock <= minReorder) {
    return {
      status: 'Low Stock',
      label: 'Low Stock',
      badgeClass: 'badge-low-stock',
      barColor: '#d97706',
      percent: Math.min(100, Math.round((currentStock / (minReorder * 2)) * 100))
    };
  }
  return {
    status: 'In Stock',
    label: 'Healthy',
    badgeClass: 'badge-in-stock',
    barColor: '#16a34a',
    percent: Math.min(100, Math.round((currentStock / (minReorder * 3)) * 100))
  };
}
