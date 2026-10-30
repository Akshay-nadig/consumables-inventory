import { SEED_CATEGORIES, SEED_MATERIALS, SEED_TRANSACTIONS, SEED_COST_HISTORIES } from './seedData';
import { getNowISTISOString } from '../utils/formatters';

const STORAGE_KEYS = {
  CATEGORIES: 'consumables_categories_v2_inr',
  MATERIALS: 'consumables_materials_v2_inr',
  TRANSACTIONS: 'consumables_transactions_v2_inr',
  COST_HISTORIES: 'consumables_cost_history_v2_inr'
};

// Initialize LocalStorage if empty
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
  } else {
    // Migration: ensure materials have accurate totalCost and remove legacy previousCost buckets
    try {
      const mats = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS));
      let changed = false;
      mats.forEach(m => {
        if (m.totalCost === undefined) {
          m.totalCost = m.totalValue !== undefined 
            ? Number(m.totalValue) 
            : (Number(m.currentStock) || 0) * (Number(m.unitPrice) || 0);
          changed = true;
        }
        m.totalValue = m.totalCost;
        if (m.previousCost !== undefined || m.previousCostStock !== undefined || m.currentCostStock !== undefined || m.previousCostBreakdown !== undefined) {
          delete m.previousCost;
          delete m.previousCostStock;
          delete m.currentCostStock;
          delete m.previousCostBreakdown;
          changed = true;
        }
      });
      if (changed) localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(mats));
    } catch (e) { }
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COST_HISTORIES)) {
    localStorage.setItem(STORAGE_KEYS.COST_HISTORIES, JSON.stringify(SEED_COST_HISTORIES));
  }
}

initStorage();

export let isBackendConnected = false;

// Check backend health
export async function checkBackendConnection() {
  try {
    const res = await fetch('/api/categories', { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      isBackendConnected = true;
      return true;
    }
  } catch (err) {
    // API not reachable, fallback to client mode
  }
  isBackendConnected = false;
  return false;
}

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
export async function getCategories() {
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      isBackendConnected = true;
      return data;
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  return categories;
}

// -------------------------------------------------------------
// MATERIALS
// -------------------------------------------------------------
export async function getMaterials({ categoryId, search, status } = {}) {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const res = await fetch(`/api/materials?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      isBackendConnected = true;
      return data;
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  let filtered = materials.map(m => {
    const totalCost = m.totalCost !== undefined 
      ? Number(m.totalCost) 
      : (m.totalValue !== undefined ? Number(m.totalValue) : (Number(m.currentStock) || 0) * (Number(m.unitPrice) || 0));

    return {
      ...m,
      totalCost,
      totalValue: totalCost,
      category: catMap[m.categoryId] || { name: 'Unknown' }
    };
  });

  if (categoryId && Number(categoryId) > 0) {
    filtered = filtered.filter(m => m.categoryId === Number(categoryId));
  }

  if (search) {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(term) ||
      m.itemCode.toLowerCase().includes(term) ||
      (m.storageLocation && m.storageLocation.toLowerCase().includes(term)) ||
      (m.description && m.description.toLowerCase().includes(term))
    );
  }

  if (status) {
    if (status === 'low') {
      filtered = filtered.filter(m => m.currentStock > 0 && m.currentStock <= m.minimumReorderLevel);
    } else if (status === 'out') {
      filtered = filtered.filter(m => m.currentStock <= 0);
    } else if (status === 'healthy') {
      filtered = filtered.filter(m => m.currentStock > m.minimumReorderLevel);
    }
  }

  return filtered;
}

export async function createMaterial(materialDto) {
  const nowIST = getNowISTISOString();
  const payload = {
    ...materialDto,
    createdAt: materialDto.createdAt || nowIST,
    effectiveDate: materialDto.effectiveDate || nowIST,
    transactionDate: materialDto.transactionDate || nowIST
  };

  try {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      isBackendConnected = true;
      const created = await res.json();
      if (created && created.id) {
        localStorage.setItem(`material_created_ist_${created.id}`, nowIST);
      }
      return created;
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const category = categories.find(c => c.id === Number(materialDto.categoryId));

  const newId = materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1;
  const initialStock = Number(materialDto.initialStock) || 0;
  const unitPrice = Number(materialDto.unitPrice) || 0;

  const newMaterial = {
    id: newId,
    itemCode: materialDto.itemCode.trim().toUpperCase(),
    name: materialDto.name.trim(),
    categoryId: Number(materialDto.categoryId),
    category: category,
    description: materialDto.description?.trim() || '',
    unitOfMeasure: materialDto.unitOfMeasure.trim(),
    currentStock: initialStock,
    minimumReorderLevel: Number(materialDto.minimumReorderLevel) || 10,
    unitPrice: unitPrice,
    totalCost: initialStock * unitPrice,
    totalValue: initialStock * unitPrice,
    storageLocation: materialDto.storageLocation?.trim() || '',
    createdAt: getNowISTISOString()
  };

  materials.push(newMaterial);
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  // Log initial price history entry
  const histories = JSON.parse(localStorage.getItem(STORAGE_KEYS.COST_HISTORIES) || '[]');
  const histId = histories.length > 0 ? Math.max(...histories.map(h => h.id)) + 1 : 1;
  histories.unshift({
    id: histId,
    materialId: newId,
    materialName: newMaterial.name,
    itemCode: newMaterial.itemCode,
    previousCost: 0.00,
    newCost: unitPrice,
    difference: unitPrice,
    percentageChange: 0,
    changeReason: 'Initial Item Registration',
    changedBy: 'System Administrator',
    effectiveDate: getNowISTISOString(),
    notes: `Initial standard unit price recorded at ₹${unitPrice.toFixed(2)}`
  });
  localStorage.setItem(STORAGE_KEYS.COST_HISTORIES, JSON.stringify(histories));

  // If opening stock > 0, log an inward transaction
  if (initialStock > 0) {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    transactions.push({
      id: txId,
      materialId: newId,
      transactionType: 'INWARD',
      quantity: initialStock,
      unitPrice: newMaterial.unitPrice,
      totalAmount: initialStock * newMaterial.unitPrice,
      balanceAfter: initialStock,
      referenceNumber: 'INIT-STOCK',
      partyName: 'Initial Opening Balance',
      handledBy: 'System Administrator',
      remarks: 'Initial stock entered during creation',
      transactionDate: getNowISTISOString()
    });
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  return newMaterial;
}

export async function updateMaterial(id, materialDto) {
  const nowIST = getNowISTISOString();
  const payload = {
    ...materialDto,
    effectiveDate: materialDto.effectiveDate || nowIST,
    updatedAt: nowIST
  };

  try {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const materialIndex = materials.findIndex(m => m.id === Number(id));

  if (materialIndex === -1) {
    throw new Error(`Material with ID ${id} not found.`);
  }

  const material = materials[materialIndex];
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const category = categories.find(c => c.id === Number(materialDto.categoryId));

  const newUnitPrice = Number(materialDto.unitPrice);
  const oldUnitPrice = Number(material.unitPrice) || 0;
  const priceChanged = !isNaN(newUnitPrice) && newUnitPrice !== oldUnitPrice;

  if (priceChanged) {
    // Log price revision history
    const histories = JSON.parse(localStorage.getItem(STORAGE_KEYS.COST_HISTORIES) || '[]');
    const histId = histories.length > 0 ? Math.max(...histories.map(h => h.id)) + 1 : 1;
    histories.unshift({
      id: histId,
      materialId: material.id,
      materialName: materialDto.name || material.name,
      itemCode: material.itemCode,
      previousCost: oldUnitPrice,
      newCost: newUnitPrice,
      difference: newUnitPrice - oldUnitPrice,
      percentageChange: oldUnitPrice > 0 ? ((newUnitPrice - oldUnitPrice) / oldUnitPrice) * 100 : 0,
      changeReason: materialDto.changeReason || 'Catalogue Price Revision',
      changedBy: materialDto.changedBy || 'Store Manager',
      effectiveDate: getNowISTISOString(),
      notes: `Standard unit price adjusted from ₹${oldUnitPrice.toFixed(2)} to ₹${newUnitPrice.toFixed(2)}. Total inventory cost remains tracked by actual stock additions.`
    });
    localStorage.setItem(STORAGE_KEYS.COST_HISTORIES, JSON.stringify(histories));

    material.unitPrice = newUnitPrice;
  }

  material.name = materialDto.name?.trim() || material.name;
  material.categoryId = Number(materialDto.categoryId) || material.categoryId;
  material.category = category || material.category;
  material.description = materialDto.description?.trim();
  material.unitOfMeasure = materialDto.unitOfMeasure?.trim() || material.unitOfMeasure;
  material.minimumReorderLevel = Number(materialDto.minimumReorderLevel) || material.minimumReorderLevel;
  material.storageLocation = materialDto.storageLocation?.trim();
  material.updatedAt = getNowISTISOString();
  
  // Total cost remains accurately tracked from stock additions; ensure totalValue stays in sync
  const currentTotalCost = Number(material.totalCost !== undefined ? material.totalCost : material.totalValue);
  material.totalCost = !isNaN(currentTotalCost) ? currentTotalCost : (material.currentStock || 0) * material.unitPrice;
  material.totalValue = material.totalCost;

  materials[materialIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  return material;
}

export async function getMaterialCostHistory(materialId) {
  try {
    const res = await fetch(`/api/materials/${materialId}/cost-history`);
    if (res.ok) {
      isBackendConnected = true;
      const history = await res.json();
      const cachedCreated = localStorage.getItem(`material_created_ist_${materialId}`);
      return (history || []).map(h => {
        if (h.changeReason === 'Initial Item Registration') {
          if (cachedCreated) {
            return { ...h, effectiveDate: cachedCreated };
          }
          const s = String(h.effectiveDate || '').trim();
          if (s && !s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
            // Backend stored DateTime.UtcNow without 'Z'; appending 'Z' parses 10:00 UTC -> 3:30 PM IST correctly
            return { ...h, effectiveDate: `${s}Z` };
          }
        }
        return h;
      });
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const histories = JSON.parse(localStorage.getItem(STORAGE_KEYS.COST_HISTORIES) || '[]');
  return histories
    .filter(h => h.materialId === Number(materialId))
    .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
}

// -------------------------------------------------------------
// INWARD / OUTWARD TRANSACTIONS
// -------------------------------------------------------------
export async function recordInward(inwardDto) {
  try {
    const res = await fetch('/api/transactions/inward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inwardDto)
    });
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const materialIndex = materials.findIndex(m => m.id === Number(inwardDto.materialId));

  if (materialIndex === -1) {
    throw new Error('Material not found');
  }

  const material = materials[materialIndex];
  const qty = Number(inwardDto.quantity);
  if (inwardDto.storageLocation?.trim()) {
    material.storageLocation = inwardDto.storageLocation.trim();
  }
  const inwardPrice = inwardDto.unitPrice ? Number(inwardDto.unitPrice) : material.unitPrice;
  const priceChanged = inwardDto.unitPrice && Number(inwardDto.unitPrice) !== material.unitPrice;

  // Add to total inventory cost directly as items are received
  const addedCost = qty * inwardPrice;
  const currentTotalCost = Number(material.totalCost !== undefined ? material.totalCost : material.totalValue) || 0;
  material.totalCost = Math.round((currentTotalCost + addedCost) * 100) / 100;
  material.totalValue = material.totalCost;
  material.currentStock = (Number(material.currentStock) || 0) + qty;

  if (priceChanged) {
    const oldUnitPrice = material.unitPrice;
    // Log price revision history
    const histories = JSON.parse(localStorage.getItem(STORAGE_KEYS.COST_HISTORIES) || '[]');
    const histId = histories.length > 0 ? Math.max(...histories.map(h => h.id)) + 1 : 1;
    histories.unshift({
      id: histId,
      materialId: material.id,
      materialName: material.name,
      itemCode: material.itemCode,
      previousCost: oldUnitPrice,
      newCost: inwardPrice,
      difference: inwardPrice - oldUnitPrice,
      percentageChange: oldUnitPrice > 0 ? ((inwardPrice - oldUnitPrice) / oldUnitPrice) * 100 : 0,
      changeReason: `Stock Inward (${inwardDto.referenceNumber?.trim() || 'PO'})`,
      changedBy: inwardDto.receivedBy?.trim() || 'Storekeeper',
      effectiveDate: inwardDto.transactionDate || getNowISTISOString(),
      notes: `Received ${qty} ${material.unitOfMeasure} at ₹${inwardPrice.toFixed(2)}. Added ₹${addedCost.toFixed(2)} to item total cost.`
    });
    localStorage.setItem(STORAGE_KEYS.COST_HISTORIES, JSON.stringify(histories));

    material.unitPrice = inwardPrice;
  }

  materials[materialIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

  const newTx = {
    id: txId,
    materialId: material.id,
    material: material,
    transactionType: 'INWARD',
    quantity: qty,
    unitPrice: inwardPrice,
    totalAmount: addedCost,
    balanceAfter: material.currentStock,
    referenceNumber: inwardDto.referenceNumber?.trim() || `PO-${Date.now().toString().slice(-6)}`,
    partyName: inwardDto.supplierName?.trim() || 'Vendor Direct',
    handledBy: inwardDto.receivedBy?.trim() || 'Storekeeper',
    remarks: inwardDto.remarks?.trim() || '',
    transactionDate: inwardDto.transactionDate || getNowISTISOString()
  };

  transactions.unshift(newTx);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  return newTx;
}

export async function recordOutward(outwardDto) {
  try {
    const res = await fetch('/api/transactions/outward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outwardDto)
    });
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    } else {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to issue outward stock');
    }
  } catch (err) {
    if (err.message && err.message.includes('Insufficient stock')) {
      throw err;
    }
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const materialIndex = materials.findIndex(m => m.id === Number(outwardDto.materialId));

  if (materialIndex === -1) {
    throw new Error('Material not found');
  }

  const material = materials[materialIndex];
  const qty = Number(outwardDto.quantity);

  if (material.currentStock < qty) {
    throw new Error(`Insufficient stock for ${material.name}. Available: ${material.currentStock} ${material.unitOfMeasure}, Requested: ${qty} ${material.unitOfMeasure}.`);
  }

  const oldStock = Number(material.currentStock) || 0;
  const currentTotalCost = Number(material.totalCost !== undefined ? material.totalCost : material.totalValue) || 0;
  const unitCostAtIssue = oldStock > 0 ? (currentTotalCost / oldStock) : (Number(material.unitPrice) || 0);

  const costDeducted = Math.min(currentTotalCost, Math.round((qty * unitCostAtIssue) * 100) / 100);
  material.currentStock = Math.max(0, oldStock - qty);
  material.totalCost = material.currentStock > 0 ? Math.max(0, Math.round((currentTotalCost - costDeducted) * 100) / 100) : 0;
  material.totalValue = material.totalCost;

  materials[materialIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  const effectiveOutwardPrice = Math.round(unitCostAtIssue * 100) / 100;

  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

  const newTx = {
    id: txId,
    materialId: material.id,
    material: material,
    transactionType: 'OUTWARD',
    quantity: qty,
    unitPrice: effectiveOutwardPrice,
    totalAmount: costDeducted,
    balanceAfter: material.currentStock,
    referenceNumber: outwardDto.referenceNumber?.trim() || `REQ-${Date.now().toString().slice(-6)}`,
    partyName: outwardDto.departmentOrEmployee?.trim() || 'General Requester',
    handledBy: outwardDto.issuedBy?.trim() || 'Storekeeper',
    remarks: outwardDto.remarks?.trim() || '',
    transactionDate: outwardDto.transactionDate || getNowISTISOString()
  };

  transactions.unshift(newTx);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  return newTx;
}

export async function getTransactions({ materialId, type, startDate, endDate, limit = 100 } = {}) {
  try {
    const params = new URLSearchParams();
    if (materialId) params.append('materialId', materialId);
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit);

    const res = await fetch(`/api/transactions?${params.toString()}`);
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const matMap = Object.fromEntries(materials.map(m => [m.id, m]));

  let filtered = transactions.map(t => ({
    ...t,
    material: matMap[t.materialId] || { name: 'Unknown Material', itemCode: 'N/A', unitOfMeasure: 'Pcs' }
  }));

  if (materialId) {
    filtered = filtered.filter(t => t.materialId === Number(materialId));
  }

  if (type) {
    filtered = filtered.filter(t => t.transactionType.toUpperCase() === type.toUpperCase());
  }

  filtered.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  return filtered.slice(0, limit);
}

// -------------------------------------------------------------
// DASHBOARD ANALYTICS
// -------------------------------------------------------------
export async function getDashboardSummary() {
  try {
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const matMap = Object.fromEntries(materials.map(m => [m.id, m]));

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const inwardThisMonth = currentMonthTxs
    .filter(t => t.transactionType === 'INWARD')
    .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  const outwardThisMonth = currentMonthTxs
    .filter(t => t.transactionType === 'OUTWARD')
    .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

  const calculateMatVal = (m) => {
    return Number(m.totalCost !== undefined ? m.totalCost : (m.totalValue !== undefined ? m.totalValue : (Number(m.currentStock) || 0) * (Number(m.unitPrice) || 0))) || 0;
  };

  const categoryBreakdown = categories.map(cat => {
    const catMats = materials.filter(m => m.categoryId === cat.id);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      totalItems: catMats.length,
      totalUnits: catMats.reduce((sum, m) => sum + m.currentStock, 0),
      valuation: catMats.reduce((sum, m) => sum + calculateMatVal(m), 0),
      lowStockCount: catMats.filter(m => m.currentStock <= m.minimumReorderLevel).length
    };
  });

  // 6 Months Movement Trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentYear, currentMonth - i, 1);
    const m = targetDate.getMonth();
    const y = targetDate.getFullYear();

    const mTxs = transactions.filter(t => {
      const d = new Date(t.transactionDate);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const inQty = mTxs.filter(t => t.transactionType === 'INWARD').reduce((sum, t) => sum + t.quantity, 0);
    const outQty = mTxs.filter(t => t.transactionType === 'OUTWARD').reduce((sum, t) => sum + t.quantity, 0);
    const inVal = mTxs.filter(t => t.transactionType === 'INWARD').reduce((sum, t) => sum + (t.totalAmount || t.quantity * t.unitPrice), 0);
    const outVal = mTxs.filter(t => t.transactionType === 'OUTWARD').reduce((sum, t) => sum + (t.totalAmount || t.quantity * t.unitPrice), 0);

    monthlyTrend.push({
      year: y,
      month: m + 1,
      monthLabel: `${monthNames[m]} ${y}`,
      inwardQuantity: inQty,
      outwardQuantity: outQty,
      inwardValue: inVal,
      outwardValue: outVal,
      netMovement: inQty - outQty
    });
  }

  const lowStockAlerts = materials
    .filter(m => m.currentStock <= m.minimumReorderLevel)
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 8);

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    .slice(0, 8)
    .map(t => ({
      ...t,
      material: matMap[t.materialId] || { name: 'Item', itemCode: 'N/A' }
    }));

  return {
    totalItems: materials.length,
    totalStockUnits: materials.reduce((sum, m) => sum + m.currentStock, 0),
    lowStockItemsCount: materials.filter(m => m.currentStock <= m.minimumReorderLevel && m.currentStock > 0).length,
    outOfStockItemsCount: materials.filter(m => m.currentStock <= 0).length,
    totalInventoryValue: materials.reduce((sum, m) => sum + calculateMatVal(m), 0),
    thisMonthInwardQuantity: inwardThisMonth,
    thisMonthOutwardQuantity: outwardThisMonth,
    categoryBreakdown,
    monthlyTrend,
    lowStockAlerts,
    recentTransactions
  };
}

// -------------------------------------------------------------
// MONTHLY MOVEMENT REPORT
// -------------------------------------------------------------
export async function getMonthlyMovementReport({ year, month, categoryId } = {}) {
  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (categoryId) params.append('categoryId', categoryId);

    const res = await fetch(`/api/reports/monthly-movement?${params.toString()}`);
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
    }
  } catch (err) {
    // Fallback
  }

  isBackendConnected = false;
  const now = new Date();
  const targetYear = year ? Number(year) : now.getFullYear();
  const targetMonth = month ? Number(month) : now.getMonth() + 1; // 1-indexed

  const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]');
  const categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  let filteredMaterials = materials;
  if (categoryId && Number(categoryId) > 0) {
    filteredMaterials = filteredMaterials.filter(m => m.categoryId === Number(categoryId));
  }

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 1);

  // Month transactions
  const monthTxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d >= startDate && d < endDate;
  });

  // Later transactions
  const laterTxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d >= endDate;
  });

  const items = filteredMaterials.map(m => {
    const matTxs = monthTxs.filter(t => t.materialId === m.id);
    const inQty = matTxs.filter(t => t.transactionType === 'INWARD').reduce((sum, t) => sum + t.quantity, 0);
    const outQty = matTxs.filter(t => t.transactionType === 'OUTWARD').reduce((sum, t) => sum + t.quantity, 0);

    const netAfter = laterTxs
      .filter(t => t.materialId === m.id)
      .reduce((sum, t) => sum + (t.transactionType === 'INWARD' ? t.quantity : -t.quantity), 0);

    const closingStock = Math.max(0, m.currentStock - netAfter);
    const openingStock = Math.max(0, closingStock - inQty + outQty);

    return {
      materialId: m.id,
      itemCode: m.itemCode,
      name: m.name,
      categoryName: catMap[m.categoryId]?.name || 'Consumables',
      unitOfMeasure: m.unitOfMeasure,
      openingStock,
      inwardQuantity: inQty,
      outwardQuantity: outQty,
      closingStock,
      unitPrice: m.unitPrice,
      totalInwardValue: matTxs.filter(t => t.transactionType === 'INWARD').reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.quantity) * Number(t.unitPrice || m.unitPrice)), 0),
      totalOutwardValue: matTxs.filter(t => t.transactionType === 'OUTWARD').reduce((sum, t) => sum + (Number(t.totalAmount) || Number(t.quantity) * Number(t.unitPrice || m.unitPrice)), 0)
    };
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const totalInwardUnits = items.reduce((sum, i) => sum + i.inwardQuantity, 0);
  const totalOutwardUnits = items.reduce((sum, i) => sum + i.outwardQuantity, 0);
  const totalInwardAmount = items.reduce((sum, i) => sum + i.totalInwardValue, 0);
  const totalOutwardAmount = items.reduce((sum, i) => sum + i.totalOutwardValue, 0);

  return {
    year: targetYear,
    month: targetMonth,
    monthName: `${monthNames[targetMonth - 1]} ${targetYear}`,
    totalInwardUnits,
    totalOutwardUnits,
    totalInwardAmount,
    totalOutwardAmount,
    netStockChange: totalInwardUnits - totalOutwardUnits,
    items
  };
}

// Reset LocalStorage back to original demo seed if user requests
export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
  window.location.reload();
}
