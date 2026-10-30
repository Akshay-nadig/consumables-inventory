import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Edit3, 
  AlertCircle,
  MapPin,
  Layers,
  Sparkles,
  History
} from 'lucide-react';
import { formatCurrency, formatNumber, getStockStatus } from '../utils/formatters';
import { parseStorageLocation } from '../utils/storageLocation';

export default function MaterialsTab({
  materials,
  categories,
  selectedCategory,
  setSelectedCategory,
  onOpenAddMaterial,
  onOpenInward,
  onOpenOutward,
  onEditMaterial,
  onOpenCostHistory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter materials based on search and status
  const filteredMaterials = materials.filter(m => {
    // Category match
    if (selectedCategory && selectedCategory !== 'all' && m.categoryId !== Number(selectedCategory)) {
      return false;
    }

    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(term);
      const matchCode = m.itemCode?.toLowerCase().includes(term);
      const matchLoc = m.storageLocation?.toLowerCase().includes(term);
      const matchDesc = m.description?.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchLoc && !matchDesc) {
        return false;
      }
    }

    // Status match
    if (statusFilter === 'low') {
      return m.currentStock > 0 && m.currentStock <= m.minimumReorderLevel;
    }
    if (statusFilter === 'out') {
      return m.currentStock <= 0;
    }
    if (statusFilter === 'healthy') {
      return m.currentStock > m.minimumReorderLevel;
    }

    return true;
  });

  // Calculate items count per category for pills
  const countsByCategory = {};
  materials.forEach(m => {
    countsByCategory[m.categoryId] = (countsByCategory[m.categoryId] || 0) + 1;
  });

  const selectedCatObj = categories.find(c => c.id === Number(selectedCategory));

  return (
    <div>
      {/* Controls / Search & Actions Bar with Category Dropdown */}
      <div className="controls-bar">
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by consumable name, item code, rack location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Group: Category Dropdown, Stock Status, and Add Action */}
        <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Layers size={15} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>Category:</span>
          </div>
          <select
            className="select-custom"
            style={{ minWidth: '200px', fontWeight: 500 }}
            value={selectedCategory || 'all'}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({materials.length} items)</option>
            {categories.map(cat => {
              const count = countsByCategory[cat.id] || 0;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({count} items)
                </option>
              );
            })}
          </select>

          {/* Stock Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span style={{ fontWeight: 600 }}>Status:</span>
          </div>
          <select
            className="select-custom"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="healthy">In Stock (Healthy)</option>
            <option value="low">Low Stock (Alert)</option>
            <option value="out">Depleted (0 Stock)</option>
          </select>

          {/* Add Consumable Button */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenAddMaterial}
            style={{ fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <Plus size={16} />
            <span>Add Consumable</span>
          </button>
        </div>
      </div>

      {/* Active Category Filter Pill Indicator */}
      {selectedCategory && selectedCategory !== 'all' && selectedCatObj && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '-0.75rem 0 1rem 0.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Showing category:</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontWeight: 600
          }}>
            <Layers size={13} />
            <span>{selectedCatObj.name}</span>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                marginLeft: '0.2rem',
                fontSize: '0.9rem',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Reset to All Categories"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* 3. Materials List Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Item Code</th>
              <th>Material Name & Description</th>
              <th>Category</th>
              <th style={{ width: '140px' }}>Current Stock</th>
              <th>Unit</th>
              <th>Unit Cost</th>
              <th>Total Value</th>
              <th style={{ minWidth: '190px' }}>Storage Location</th>
              <th style={{ textAlign: 'right', width: '220px' }}>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 0.75rem auto', color: '#64748b' }} />
                  <div>No consumable materials found matching the selected filter criteria.</div>
                </td>
              </tr>
            ) : (
              filteredMaterials.map(item => {
                const stockInfo = getStockStatus(item.currentStock, item.minimumReorderLevel);
                const categoryName = item.category?.name || categories.find(c => c.id === item.categoryId)?.name || 'Consumables';
                const location = parseStorageLocation(item.storageLocation || '');
                const hasLocation = Boolean(location.zone || location.rack || location.details);
                
                const prevCost = Number(item.previousCost) || 0;
                const prevStock = Number(item.previousCostStock) || 0;
                const currCost = Number(item.unitPrice) || 0;
                const currStock = item.currentCostStock !== undefined ? Number(item.currentCostStock) : Math.max(0, item.currentStock - prevStock);
                
                const prevVal = prevStock * prevCost;
                const currVal = currStock * currCost;
                const totalVal = item.totalValue !== undefined && item.totalValue > 0 
                  ? Number(item.totalValue) 
                  : prevVal + currVal;

                return (
                  <tr key={item.id}>
                    {/* Item Code */}
                    <td>
                      <span className="badge-sku">{item.itemCode}</span>
                    </td>

                    {/* Name & Description */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge-category">{categoryName}</span>
                    </td>

                    {/* Stock Level with Gauge */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: stockInfo.barColor }}>
                          {formatNumber(item.currentStock)}
                        </span>
                        <span className={`badge ${stockInfo.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.08rem 0.35rem' }}>
                          {stockInfo.label}
                        </span>
                      </div>
                      <div className="stock-level-bar-wrap" title={`Current: ${item.currentStock} / Reorder: ${item.minimumReorderLevel}`}>
                        <div 
                          className="stock-level-bar" 
                          style={{ 
                            width: `${Math.max(5, stockInfo.percent)}%`, 
                            backgroundColor: stockInfo.barColor 
                          }} 
                        />
                      </div>
                    </td>

                    {/* Unit */}
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.unitOfMeasure}
                    </td>

                    {/* Unit Cost */}
                    <td className="font-mono">
                      <div style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: '0.85rem' }}>
                        {formatCurrency(currCost)}
                      </div>
                      {prevStock > 0 && prevCost > 0 ? (
                        <div 
                          style={{ fontSize: '0.68rem', color: '#facc15', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          title={`${prevStock} ${item.unitOfMeasure} held at previous cost ${formatCurrency(prevCost)}`}
                        >
                          <span>Prev:</span>
                          <span>{formatCurrency(prevCost)}</span>
                          <span style={{ opacity: 0.85 }}>({prevStock})</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Current cost
                        </div>
                      )}
                    </td>

                    {/* Total Value */}
                    <td className="font-mono">
                      <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.88rem' }}>
                        {formatCurrency(totalVal)}
                      </div>
                      {prevStock > 0 && prevCost > 0 ? (
                        <div 
                          style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}
                          title={`Previous stock value (${formatCurrency(prevVal)}) + Current stock value (${formatCurrency(currVal)})`}
                        >
                          {formatCurrency(prevVal)} + {formatCurrency(currVal)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {item.currentStock} × {formatCurrency(currCost)}
                        </div>
                      )}
                    </td>

                    {/* Storage Location */}
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '190px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                        <MapPin size={14} color={hasLocation ? 'var(--primary)' : 'var(--text-muted)'} style={{ flexShrink: 0, marginTop: '0.12rem' }} />
                        <div style={{ minWidth: 0 }}>
                          {hasLocation ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {location.zone && <span className="badge-category">{location.zone}</span>}
                                {location.rack && <span className="badge-sku">{location.rack}</span>}
                              </div>
                              {location.details && (
                                <div title={location.details} style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                                  {location.details}
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-inward btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => onOpenInward(item)}
                          title="Record Inward Stock"
                        >
                          <ArrowDownToLine size={13} />
                          <span>+ Inward</span>
                        </button>

                        <button
                          className="btn btn-outward btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => onOpenOutward(item)}
                          disabled={item.currentStock <= 0}
                          title={item.currentStock <= 0 ? "Cannot issue: Stock is 0" : "Issue Outward Stock"}
                        >
                          <ArrowUpFromLine size={13} />
                          <span>- Outward</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ 
                            padding: '0.3rem 0.55rem', 
                            fontSize: '0.75rem',
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem',
                            color: '#818cf8',
                            background: 'rgba(99, 102, 241, 0.12)',
                            borderColor: 'rgba(99, 102, 241, 0.3)'
                          }}
                          onClick={() => onOpenCostHistory(item)}
                          title="View Cost History & Valuation Breakdown"
                        >
                          <History size={13} />
                          <span>History</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.45rem' }}
                          onClick={() => onEditMaterial(item)}
                          title="Edit Consumable Details"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Showing {filteredMaterials.length} of {materials.length} consumable items</span>
        <span>Tracking only internal company consumable materials</span>
      </div>
    </div>
  );
}
