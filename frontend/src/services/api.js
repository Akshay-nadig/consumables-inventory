import { SEED_CATEGORIES, SEED_MATERIALS, SEED_TRANSACTIONS, SEED_COST_HISTORIES } from './seedData';

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
    // Migration: ensure materials in localStorage have two-bucket fields
    try {
      const mats = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS));
      let changed = false;
      mats.forEach(m => {
        if (m.previousCost === undefined) { m.previousCost = 0; changed = true; }
        if (m.previousCostStock === undefined) { m.previousCostStock = 0; changed = true; }
        if (m.currentCostStock === undefined) { m.currentCostStock = m.currentStock || 0; changed = true; }
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
    const prevCost = Number(m.previousCost) || 0;
    const prevStock = Number(m.previousCostStock) || 0;
    const currCost = Number(m.unitPrice) || 0;
    const currStock = m.currentCostStock !== undefined ? Number(m.currentCostStock) : Number(m.currentStock) || 0;
    const totalVal = m.totalValue !== undefined ? Number(m.totalValue) : (prevStock * prevCost) + (currStock * currCost);

    return {
      ...m,
      previousCost: prevCost,
      previousCostStock: prevStock,
      currentCostStock: currStock,
      totalValue: totalVal,
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
  try {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialDto)
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
    previousCost: 0.00,
    previousCostStock: 0,
    currentCostStock: initialStock,
    totalValue: initialStock * unitPrice,
    storageLocation: materialDto.storageLocation?.trim() || '',
    createdAt: new Date().toISOString()
  };

  materials.push(newMaterial);
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  // Log initial cost history entry
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
    effectiveDate: new Date().toISOString(),
    notes: `Initial standard unit cost recorded at ₹${unitPrice.toFixed(2)}`
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
      transactionDate: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  return newMaterial;
}

export async function updateMaterial(id, materialDto) {
  try {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialDto)
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
    // Preserve existing stock at PreviousCost!
    const totalRemaining = material.currentStock || 0;
    if (totalRemaining > 0) {
      const prevStock = Number(material.previousCostStock) || 0;
      const prevCost = Number(material.previousCost) || 0;
      const currStock = material.currentCostStock !== undefined ? Number(material.currentCostStock) : totalRemaining;
      const prevTotalVal = (prevStock * prevCost) + (currStock * oldUnitPrice);
      material.previousCost = Math.round((prevTotalVal / totalRemaining) * 100) / 100;
      material.previousCostStock = totalRemaining;
      material.previousCostBreakdown = prevStock > 0 && prevCost > 0 && Math.abs(prevCost - oldUnitPrice) > 0.01
        ? `[(${prevStock} × ₹${prevCost.toFixed(2)}) + (${currStock} × ₹${oldUnitPrice.toFixed(2)})] ÷ ${totalRemaining} = ₹${material.previousCost.toFixed(2)}`
        : `${totalRemaining} ${material.unitOfMeasure || 'units'} locked at pre-revision rate ₹${oldUnitPrice.toFixed(2)}`;
    } else {
      material.previousCost = oldUnitPrice;
      material.previousCostStock = 0;
      material.previousCostBreakdown = `Previous rate ₹${oldUnitPrice.toFixed(2)} (0 units held)`;
    }
    material.currentCostStock = 0; // newly received stock will take new unitPrice

    // Log cost history
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
      changeReason: materialDto.changeReason || 'Manual Cost Adjustment',
      changedBy: materialDto.changedBy || 'Store Manager',
      effectiveDate: new Date().toISOString(),
      notes: `Unit cost adjusted from ₹${oldUnitPrice.toFixed(2)} to ₹${newUnitPrice.toFixed(2)}. Existing ${material.previousCostStock} ${material.unitOfMeasure} held at ₹${material.previousCost.toFixed(2)}.`
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
  material.updatedAt = new Date().toISOString();
  material.totalValue = ((material.previousCostStock || 0) * (material.previousCost || 0)) + ((material.currentCostStock || 0) * material.unitPrice);

  materials[materialIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  return material;
}

export async function getMaterialCostHistory(materialId) {
  try {
    const res = await fetch(`/api/materials/${materialId}/cost-history`);
    if (res.ok) {
      isBackendConnected = true;
      return await res.json();
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

  if (priceChanged) {
    const totalRemaining = material.currentStock || 0;
    if (totalRemaining > 0) {
      const prevStock = Number(material.previousCostStock) || 0;
      const prevCost = Number(material.previousCost) || 0;
      const currStock = material.currentCostStock !== undefined ? Number(material.currentCostStock) : totalRemaining;
      const prevTotalVal = (prevStock * prevCost) + (currStock * material.unitPrice);
      material.previousCost = Math.round((prevTotalVal / totalRemaining) * 100) / 100;
      material.previousCostStock = totalRemaining;
      material.previousCostBreakdown = prevStock > 0 && prevCost > 0 && Math.abs(prevCost - material.unitPrice) > 0.01
        ? `[(${prevStock} × ₹${prevCost.toFixed(2)}) + (${currStock} × ₹${material.unitPrice.toFixed(2)})] ÷ ${totalRemaining} = ₹${material.previousCost.toFixed(2)}`
        : `${totalRemaining} ${material.unitOfMeasure || 'units'} locked at pre-inward rate ₹${material.unitPrice.toFixed(2)}`;
    } else {
      material.previousCost = material.unitPrice;
      material.previousCostStock = 0;
      material.previousCostBreakdown = `Previous rate ₹${material.unitPrice.toFixed(2)} (0 units held)`;
    }
    material.currentCostStock = qty;

    // Log cost history
    const histories = JSON.parse(localStorage.getItem(STORAGE_KEYS.COST_HISTORIES) || '[]');
    const histId = histories.length > 0 ? Math.max(...histories.map(h => h.id)) + 1 : 1;
    histories.unshift({
      id: histId,
      materialId: material.id,
      materialName: material.name,
      itemCode: material.itemCode,
      previousCost: material.unitPrice,
      newCost: inwardPrice,
      difference: inwardPrice - material.unitPrice,
      percentageChange: material.unitPrice > 0 ? ((inwardPrice - material.unitPrice) / material.unitPrice) * 100 : 0,
      changeReason: `Stock Inward (${inwardDto.referenceNumber?.trim() || 'PO'})`,
      changedBy: inwardDto.receivedBy?.trim() || 'Storekeeper',
      effectiveDate: inwardDto.transactionDate || new Date().toISOString(),
      notes: `Inward of ${qty} ${material.unitOfMeasure} at ₹${inwardPrice.toFixed(2)}. Preserved ${material.previousCostStock} ${material.unitOfMeasure} at ₹${material.previousCost.toFixed(2)}.`
    });
    localStorage.setItem(STORAGE_KEYS.COST_HISTORIES, JSON.stringify(histories));

    material.unitPrice = inwardPrice;
  } else {
    material.currentCostStock = (Number(material.currentCostStock) || 0) + qty;
  }

  material.currentStock = (Number(material.previousCostStock) || 0) + (Number(material.currentCostStock) || 0);
  material.totalValue = ((material.previousCostStock || 0) * (material.previousCost || 0)) + ((material.currentCostStock || 0) * material.unitPrice);
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
    totalAmount: qty * inwardPrice,
    balanceAfter: material.currentStock,
    referenceNumber: inwardDto.referenceNumber?.trim() || `PO-${Date.now().toString().slice(-6)}`,
    partyName: inwardDto.supplierName?.trim() || 'Vendor Direct',
    handledBy: inwardDto.receivedBy?.trim() || 'Storekeeper',
    remarks: inwardDto.remarks?.trim() || '',
    transactionDate: inwardDto.transactionDate || new Date().toISOString()
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

  // FIFO Outward deduction: consume from previousCostStock first, then currentCostStock
  let remaining = qty;
  let deductedFromPrev = 0;
  let deductedFromCurr = 0;

  if (material.previousCostStock > 0) {
    if (material.previousCostStock >= remaining) {
      material.previousCostStock -= remaining;
      deductedFromPrev = remaining;
      remaining = 0;
    } else {
      deductedFromPrev = material.previousCostStock;
      remaining -= material.previousCostStock;
      material.previousCostStock = 0;
    }
  }

  if (remaining > 0) {
    deductedFromCurr = remaining;
    material.currentCostStock = Math.max(0, (material.currentCostStock || 0) - remaining);
  }

  material.currentStock = (material.previousCostStock || 0) + (material.currentCostStock || 0);
  material.totalValue = ((material.previousCostStock || 0) * (material.previousCost || 0)) + ((material.currentCostStock || 0) * material.unitPrice);
  materials[materialIndex] = material;
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

  const totalDeductedVal = (deductedFromPrev * (material.previousCost || 0)) + (deductedFromCurr * material.unitPrice);
  const effectiveOutwardPrice = qty > 0 ? Math.round((totalDeductedVal / qty) * 100) / 100 : material.unitPrice;

  const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  const txId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

  const newTx = {
    id: txId,
    materialId: material.id,
    material: material,
    transactionType: 'OUTWARD',
    quantity: qty,
    unitPrice: effectiveOutwardPrice,
    totalAmount: totalDeductedVal,
    balanceAfter: material.currentStock,
    referenceNumber: outwardDto.referenceNumber?.trim() || `REQ-${Date.now().toString().slice(-6)}`,
    partyName: outwardDto.departmentOrEmployee?.trim() || 'General Requester',
    handledBy: outwardDto.issuedBy?.trim() || 'Storekeeper',
    remarks: outwardDto.remarks?.trim() || '',
    transactionDate: outwardDto.transactionDate || new Date().toISOString()
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
    const prevStock = Number(m.previousCostStock) || 0;
    const prevCost = Number(m.previousCost) || 0;
    const currStock = m.currentCostStock !== undefined ? Number(m.currentCostStock) : Number(m.currentStock) || 0;
    const currCost = Number(m.unitPrice) || 0;
    return (prevStock * prevCost) + (currStock * currCost);
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
