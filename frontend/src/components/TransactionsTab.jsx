import React, { useState } from 'react';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Search, 
  Filter, 
  Clock, 
  FileText,
  Building,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';

export default function TransactionsTab({
  transactions,
  categories,
  materials,
  onOpenInward,
  onOpenOutward
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredTransactions = transactions.filter(t => {
    // Type filter
    if (typeFilter !== 'ALL' && t.transactionType.toUpperCase() !== typeFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      const mat = materials.find(m => m.id === t.materialId);
      if (mat && mat.categoryId !== Number(categoryFilter)) {
        return false;
      }
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchMatName = t.material?.name?.toLowerCase().includes(term);
      const matchCode = t.material?.itemCode?.toLowerCase().includes(term);
      const matchRef = t.referenceNumber?.toLowerCase().includes(term);
      const matchParty = t.partyName?.toLowerCase().includes(term);
      const matchHandler = t.handledBy?.toLowerCase().includes(term);
      const matchRemarks = t.remarks?.toLowerCase().includes(term);
      if (!matchMatName && !matchCode && !matchRef && !matchParty && !matchHandler && !matchRemarks) {
        return false;
      }
    }

    return true;
  });

  const totalInwardCount = transactions.filter(t => t.transactionType === 'INWARD').length;
  const totalOutwardCount = transactions.filter(t => t.transactionType === 'OUTWARD').length;
  const totalInwardUnits = transactions.filter(t => t.transactionType === 'INWARD').reduce((s, t) => s + (t.quantity || 0), 0);
  const totalOutwardUnits = transactions.filter(t => t.transactionType === 'OUTWARD').reduce((s, t) => s + (t.quantity || 0), 0);

  return (
    <div>
      {/* 1. Quick Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Inward Events</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)', marginTop: '0.35rem' }}>
            {totalInwardCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>+{formatNumber(totalInwardUnits)} total units received</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Outward Issues</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--orange)', marginTop: '0.35rem' }}>
            {totalOutwardCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>-{formatNumber(totalOutwardUnits)} total units issued</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Net Stock Balance</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {totalInwardUnits - totalOutwardUnits > 0 ? `+${formatNumber(totalInwardUnits - totalOutwardUnits)}` : formatNumber(totalInwardUnits - totalOutwardUnits)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Cumulative net movement</div>
        </div>

        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <button className="btn btn-inward btn-sm" onClick={() => onOpenInward(null)}>
            <ArrowDownToLine size={14} /> + Inward
          </button>
          <button className="btn btn-outward btn-sm" onClick={() => onOpenOutward(null)}>
            <ArrowUpFromLine size={14} /> - Outward
          </button>
        </div>
      </div>

      {/* 2. Controls & Filters */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search movements by PO#, Requisition#, supplier, dept, item..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Movement Type Filter */}
          <select
            className="select-custom"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Movements (Inward & Outward)</option>
            <option value="INWARD">Inward Only (Stock Receipts)</option>
            <option value="OUTWARD">Outward Only (Department Issues)</option>
          </select>

          {/* Category Filter */}
          <select
            className="select-custom"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All 16 Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Movement Transactions Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '150px' }}>Date & Time</th>
              <th style={{ width: '120px' }}>Movement</th>
              <th>Consumable Material</th>
              <th>Quantity</th>
              <th>Stock After</th>
              <th>PO / Requisition #</th>
              <th>Supplier / Department</th>
              <th>Staff / Handler</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No stock transactions found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(t => {
                const isInward = t.transactionType === 'INWARD';
                return (
                  <tr key={t.id}>
                    {/* Timestamp */}
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{formatDateTime(t.transactionDate)}</span>
                      </div>
                    </td>

                    {/* Movement Pill */}
                    <td>
                      <span className={`badge ${isInward ? 'badge-inward' : 'badge-outward'}`}>
                        {isInward ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                        {t.transactionType}
                      </span>
                    </td>

                    {/* Material */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>
                        {t.material?.name || 'Material Item'}
                      </div>
                      <span className="badge-sku" style={{ fontSize: '0.675rem' }}>
                        {t.material?.itemCode || 'N/A'}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="font-mono" style={{ fontWeight: 600, color: isInward ? 'var(--green)' : 'var(--orange)' }}>
                      {isInward ? `+${t.quantity}` : `-${t.quantity}`} {t.material?.unitOfMeasure || 'units'}
                    </td>

                    {/* Balance After */}
                    <td className="font-mono" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {t.balanceAfter} {t.material?.unitOfMeasure || ''}
                    </td>

                    {/* Reference # */}
                    <td className="font-mono" style={{ fontSize: '0.775rem', color: 'var(--primary-light)' }}>
                      {t.referenceNumber || '-'}
                    </td>

                    {/* Supplier / Dept */}
                    <td style={{ fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building size={12} color="var(--text-muted)" />
                        <span>{t.partyName || '-'}</span>
                      </div>
                    </td>

                    {/* Handled By */}
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t.handledBy || '-'}
                    </td>

                    {/* Remarks */}
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                      {t.remarks || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Showing {filteredTransactions.length} transaction movement records
      </div>
    </div>
  );
}
