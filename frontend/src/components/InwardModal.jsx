import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, AlertCircle, CheckCircle2, Search, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import StorageLocationFields from './StorageLocationFields';
import { buildStorageLocation, parseStorageLocation } from '../utils/storageLocation';

export default function InwardModal({
  isOpen,
  onClose,
  onSubmit,
  materials,
  preSelectedMaterial = null
}) {
  const [materialId, setMaterialId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unitPrice, setUnitPrice] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [receivedBy, setReceivedBy] = useState('Sarah Jenkins (Storekeeper)');
  const [remarks, setRemarks] = useState('');
  const [storageZone, setStorageZone] = useState('');
  const [storageRack, setStorageRack] = useState('');
  const [storageDetails, setStorageDetails] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const preferredMaterial = preSelectedMaterial || materials.find(m => m.id === Number(materialId)) || materials[0];
    if (preSelectedMaterial) {
      setMaterialId(preSelectedMaterial.id);
      setUnitPrice(preSelectedMaterial.unitPrice || '');
      setSearchQuery('');
    } else if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
      setUnitPrice(materials[0].unitPrice || '');
      setSearchQuery('');
    }

    const location = parseStorageLocation(preferredMaterial?.storageLocation || '');
    setStorageZone(location.zone);
    setStorageRack(location.rack);
    setStorageDetails(location.details);

    // Generate suggested PO number
    const randomPo = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setReferenceNumber(randomPo);
    setQuantity(10);
    setError('');
  }, [preSelectedMaterial, isOpen, materials]);

  const selectedMat = materials.find(m => m.id === Number(materialId));

  const handleSelectMaterial = (m) => {
    setMaterialId(m.id);
    setUnitPrice(m.unitPrice || '');
    const location = parseStorageLocation(m.storageLocation || '');
    setStorageZone(location.zone);
    setStorageRack(location.rack);
    setStorageDetails(location.details);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) {
      setError('Please select a material.');
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Inward quantity must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        materialId: Number(materialId),
        quantity: qty,
        unitPrice: unitPrice ? Number(unitPrice) : selectedMat?.unitPrice,
        referenceNumber: referenceNumber.trim(),
        supplierName: supplierName.trim() || 'Vendor Direct',
        receivedBy: receivedBy.trim(),
        remarks: remarks.trim(),
        storageLocation: buildStorageLocation(storageZone, storageRack, storageDetails),
        transactionDate: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error recording inward stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentStock = selectedMat?.currentStock || 0;
  const newStock = currentStock + (Number(quantity) || 0);
  const totalCost = (Number(quantity) || 0) * (Number(unitPrice) || selectedMat?.unitPrice || 0);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#059669' }}>
            <ArrowDownToLine size={20} />
            <span>Record Inward Consumables (Stock Receipt)</span>
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
              <div className="stock-preview-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Selected Item:</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {selectedMat.name} <span className="font-mono" style={{ color: '#2563eb', fontSize: '0.8rem', marginLeft: '0.25rem' }}>({selectedMat.itemCode})</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock Change:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    <span style={{ color: '#475569' }}>{currentStock}</span>
                    <span style={{ color: '#059669', margin: '0 0.35rem' }}>+ {quantity || 0}</span>
                    <span style={{ color: '#059669' }}>= {newStock} {selectedMat.unitOfMeasure}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="form-grid">
              {/* Searchable Material Selector */}
              <div className="form-group col-span-2">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Select Consumable Material held in stock *</label>
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
                          onClick={() => handleSelectMaterial(m)}
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
                                color: m.currentStock > 0 ? '#15803d' : '#b45309',
                                background: m.currentStock > 0 ? '#f0fdf4' : '#fffbeb',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px'
                              }}
                            >
                              {m.currentStock} {m.unitOfMeasure}
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
                <label className="form-label">Inward Quantity ({selectedMat?.unitOfMeasure || 'units'}) *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input font-mono"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Unit Price */}
              <div className="form-group">
                <label className="form-label">Unit Purchase Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input font-mono"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  placeholder="Defaults to standard price"
                />
                <span className="form-help-text">Total Inward: {formatCurrency(totalCost)}</span>
              </div>

              <div className="form-group col-span-2">
                <div>
                  <label className="form-label">Put received stock away at</label>
                  <span className="form-help-text">Optional. Saving a location updates this item’s location in the catalog.</span>
                </div>
              </div>
              <StorageLocationFields
                zone={storageZone}
                rack={storageRack}
                details={storageDetails}
                onZoneChange={setStorageZone}
                onRackChange={setStorageRack}
                onDetailsChange={setStorageDetails}
                idPrefix="inward-location"
              />

              {/* Reference # */}
              <div className="form-group">
                <label className="form-label">PO / Delivery Invoice No. *</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. PO-2026-8941"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  required
                />
              </div>

              {/* Supplier */}
              <div className="form-group">
                <label className="form-label">Supplier / Vendor Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Office Depot, Staples, TechDirect"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                />
              </div>

              {/* Receiver */}
              <div className="form-group">
                <label className="form-label">Received By (Staff)</label>
                <input
                  type="text"
                  className="form-input"
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                />
              </div>

              {/* Remarks */}
              <div className="form-group col-span-2">
                <label className="form-label">Notes & Inspection Remarks</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. Sealed package inspected, verified batch count..."
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
            <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderColor: '#34d399' }} disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Confirm Inward Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
