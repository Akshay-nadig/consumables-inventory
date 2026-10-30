// Formatting utilities for Consumables Inventory System

// Ensure UTC strings without trailing 'Z' are parsed correctly as UTC
function parseDate(dateString) {
  if (!dateString) return null;
  // If the string doesn't end with Z or an offset, assume UTC
  const s = String(dateString);
  if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s + 'Z');
  }
  return new Date(s);
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
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const d = parseDate(dateString);
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
