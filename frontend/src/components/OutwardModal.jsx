import React, { useState, useEffect } from 'react';
import { X, ArrowUpFromLine, AlertTriangle, AlertCircle, Search, Check, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getNowISTISOString } from '../utils/formatters';

const COMMON_DEPTS = [
  'Engineering & Development',
  'Human Resources & Talent',
  'Marketing & Events',
  'Finance & Accounting',
  'IT Support & Infrastructure',
  'Operations & Logistics',
  'Customer Support',
  'Executive & Board',
  'Facilities & Housekeeping',
  'Cafeteria & Pantry'
];

export default function OutwardModal({
  isOpen,
  onClose,
  onSubmit,
  materials,
  preSelectedMaterial = null
}) {
  const [materialId, setMaterialId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [departmentOrEmployee, setDepartmentOrEmployee] = useState('Engineering & Development');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [issuedBy, setIssuedBy] = useState('Marcus Vance (Stores)');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preSelectedMaterial) {
      setMaterialId(preSelectedMaterial.id);
      setSearchQuery('');
    } else if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
      setSearchQuery('');
    }

    const randomReq = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    setReferenceNumber(randomReq);
    setQuantity(1);
    setError('');
  }, [preSelectedMaterial, isOpen, materials]);

  const filteredMaterials = materials.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.itemCode?.toLowerCase().includes(q) ||
      m.category?.name?.toLowerCase().includes(q) ||
      m.categoryName?.toLowerCase().includes(q) ||
      m.storageLocation?.toLowerCase().includes(q)
    );
  });

  const selectedMat = materials.find(m => m.id === Number(materialId));
  const currentStock = selectedMat?.currentStock || 0;
  const qty = Number(quantity) || 0;
  const remainingStock = currentStock - qty;
  const isOverStock = qty > currentStock;
  const isBelowReorder = !isOverStock && remainingStock <= (selectedMat?.minimumReorderLevel || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) {
      setError('Please select a material.');
      return;
    }
    if (!qty || qty <= 0) {
      setError('Outward quantity must be greater than zero.');
      return;
    }
    if (isOverStock) {
      setError(`Cannot issue ${qty} units. Only ${currentStock} ${selectedMat?.unitOfMeasure} available in inventory.`);
      return;
    }
    if (!departmentOrEmployee.trim()) {
      setError('Requesting Department / Employee is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        materialId: Number(materialId),
        quantity: qty,
        departmentOrEmployee: departmentOrEmployee.trim(),
        referenceNumber: referenceNumber.trim(),
        issuedBy: issuedBy.trim(),
        remarks: remarks.trim(),
        transactionDate: getNowISTISOString()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error recording outward stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#fb923c' }}>
            <ArrowUpFromLine size={20} />
            <span>Issue Consumables Outward (Consumption)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Live Calculation Preview Card */}
            {selectedMat && (
              <div 
                className="stock-preview-box"
                style={{ 
                  background: '#f8fafc', 
                  border: isOverStock ? '1px solid #fca5a5' : isBelowReorder ? '1px solid #fcd34d' : '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Consumable Item:</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {selectedMat.name} <span className="font-mono" style={{ color: '#2563eb', fontSize: '0.8rem', marginLeft: '0.25rem' }}>({selectedMat.itemCode})</span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Unit Value: {formatCurrency(selectedMat.unitPrice)} | Reorder Level: {selectedMat.minimumReorderLevel} {selectedMat.unitOfMeasure}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Projected Balance:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    <span style={{ color: '#475569' }}>{currentStock}</span>
                    <span style={{ color: '#ea580c', margin: '0 0.35rem' }}>- {qty}</span>
                    <span style={{ color: isOverStock ? '#dc2626' : isBelowReorder ? '#d97706' : '#15803d' }}>
                      = {remainingStock} {selectedMat.unitOfMeasure}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Overstock Warning */}
            {isOverStock && (
              <div className="form-error-alert" style={{ marginBottom: '1.25rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                <AlertTriangle size={16} />
                <span>Insufficient Stock! Requested {qty} units, but only {currentStock} {selectedMat?.unitOfMeasure} available in inventory.</span>
              </div>
            )}

            {/* Low Reorder Warning */}
            {isBelowReorder && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', color: '#92400e', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <AlertTriangle size={15} />
                <span>Notice: This outward issuance will drop remaining stock to/below the safety reorder threshold ({selectedMat.minimumReorderLevel} {selectedMat.unitOfMeasure}).</span>
              </div>
            )}

            <div className="form-grid">
              {/* Searchable Material Selector */}
              <div className="form-group col-span-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Select Consumable Material to Issue *</label>
                  {selectedMat && (
                    <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Active: {selectedMat.itemCode}
                    </span>
                  )}
                </div>

                {/* Search Bar Input */}
                <div style={{ position: 'relative', marginBottom: '0.4rem' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem', paddingRight: searchQuery ? '2.2rem' : '0.85rem' }}
                    placeholder="Search by product name, SKU (e.g. CON-IT), or category..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '0.65rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Scrollable Filtered Product List */}
                <div
                  style={{
                    maxHeight: '175px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {filteredMaterials.length === 0 ? (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No consumable items found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredMaterials.map(m => {
                      const isSelected = m.id === Number(materialId);
                      return (
                        <div
                          key={m.id}
                          onClick={() => setMaterialId(m.id)}
                          style={{
                            padding: '0.55rem 0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isSelected ? '#eff6ff' : 'transparent',
                            borderLeft: isSelected ? '3px solid #1a56db' : '3px solid transparent',
                            transition: 'background 0.12s ease'
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: isSelected ? '#dbeafe' : '#f1f5f9',
                                color: isSelected ? '#1e40af' : '#475569',
                                fontWeight: 600,
                                flexShrink: 0
                              }}
                            >
                              {m.itemCode}
                            </span>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: isSelected ? 600 : 500, color: '#0f172a', fontSize: '0.85rem' }}>
                                {m.name}
                              </span>
                              {m.category?.name && (
                                <span style={{ fontSize: '0.725rem', color: '#64748b', marginLeft: '0.45rem' }}>
                                  ({m.category.name})
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: m.currentStock > 0 ? '#15803d' : '#dc2626',
                                background: m.currentStock > 0 ? '#f0fdf4' : '#fef2f2',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px'
                              }}
                            >
                              In Stock: {m.currentStock} {m.unitOfMeasure}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                              {formatCurrency(m.unitPrice)}
                            </span>
                            {isSelected && <Check size={16} color="#1a56db" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <span className="form-help-text" style={{ marginTop: '0.2rem' }}>
                  Showing {filteredMaterials.length} of {materials.length} items. Click an item to select.
                </span>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Outward Quantity ({selectedMat?.unitOfMeasure || 'units'}) *</label>
                <input
                  type="number"
                  min="1"
                  max={currentStock > 0 ? currentStock : undefined}
                  className="form-input font-mono"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Reference # */}
              <div className="form-group">
                <label className="form-label">Internal Requisition / Ticket # *</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. REQ-2026-042"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  required
                />
              </div>

              {/* Department / Employee */}
              <div className="form-group col-span-2">
                <label className="form-label">Requesting Department or Recipient *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <select
                    className="form-select"
                    value={departmentOrEmployee}
                    onChange={e => setDepartmentOrEmployee(e.target.value)}
                  >
                    {COMMON_DEPTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Or specify employee name / room"
                    value={departmentOrEmployee}
                    onChange={e => setDepartmentOrEmployee(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Issued By */}
              <div className="form-group">
                <label className="form-label">Issued By (Stores Staff)</label>
                <input
                  type="text"
                  className="form-input"
                  value={issuedBy}
                  onChange={e => setIssuedBy(e.target.value)}
                />
              </div>

              {/* Value of issue */}
              <div className="form-group">
                <label className="form-label">Total Consumption Value</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={formatCurrency(qty * (selectedMat?.unitPrice || 0))}
                  disabled
                />
              </div>

              {/* Remarks */}
              <div className="form-group col-span-2">
                <label className="form-label">Purpose / Allocation Details</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. For new joiner onboarding workstation setup, floor 3 printer replacement..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)', borderColor: '#fb923c' }} 
              disabled={isSubmitting || isOverStock || currentStock <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Issue Consumables'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
