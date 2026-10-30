import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, AlertCircle, CheckCircle2, Search, Check, RefreshCw } from 'lucide-react';
import { formatCurrency, getNowISTISOString } from '../utils/formatters';
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
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [storageZone, setStorageZone] = useState('');
  const [storageRack, setStorageRack] = useState('');
  const [storageDetails, setStorageDetails] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMaterialId('');
      setSearchQuery('');
      setQuantity('');
      setUnitPrice('');
      setReferenceNumber('');
      setSupplierName('');
      setReceivedBy('');
      setRemarks('');
      setStorageZone('');
      setStorageRack('');
      setStorageDetails('');
      setError('');
      return;
    }

    if (preSelectedMaterial) {
      setMaterialId(preSelectedMaterial.id);
      setUnitPrice(preSelectedMaterial.unitPrice !== undefined ? preSelectedMaterial.unitPrice : '');
      const location = parseStorageLocation(preSelectedMaterial.storageLocation || '');
      setStorageZone(location.zone);
      setStorageRack(location.rack);
      setStorageDetails(location.details);
    } else {
      setMaterialId('');
      setUnitPrice('');
      setStorageZone('');
      setStorageRack('');
      setStorageDetails('');
    }

    setSearchQuery('');
    setQuantity('');
    setReferenceNumber('');
    setSupplierName('');
    setReceivedBy('');
    setRemarks('');
    setError('');
  }, [preSelectedMaterial, isOpen]);

  const selectedMat = materials.find(m => m.id === Number(materialId));

  const handleSelectMaterial = (m) => {
    setMaterialId(m.id);
    setUnitPrice(m.unitPrice !== undefined ? m.unitPrice : '');
    const location = parseStorageLocation(m.storageLocation || '');
    setStorageZone(location.zone);
    setStorageRack(location.rack);
    setStorageDetails(location.details);
    setSearchQuery('');
    setError('');
  };

  const handleClearSelectedMaterial = () => {
    setMaterialId('');
    setUnitPrice('');
    setStorageZone('');
    setStorageRack('');
    setStorageDetails('');
    setSearchQuery('');
  };

  const filteredMaterials = searchQuery.trim()
    ? materials.filter(m => {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.itemCode?.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q) ||
          m.categoryName?.toLowerCase().includes(q) ||
          m.storageLocation?.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) {
      setError('Please search and select a consumable material.');
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Please enter a valid inward quantity greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        materialId: Number(materialId),
        quantity: qty,
        unitPrice: unitPrice !== '' && !isNaN(Number(unitPrice)) ? Number(unitPrice) : selectedMat?.unitPrice,
        referenceNumber: referenceNumber.trim() || 'INWARD-RECEIPT',
        supplierName: supplierName.trim() || 'Vendor Direct',
        receivedBy: receivedBy.trim() || 'Storekeeper',
        remarks: remarks.trim(),
        storageLocation: buildStorageLocation(storageZone, storageRack, storageDetails),
        transactionDate: getNowISTISOString()
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
  const numQuantity = Number(quantity) || 0;
  const newStock = currentStock + numQuantity;
  const activeCost = unitPrice !== '' && !isNaN(Number(unitPrice)) ? Number(unitPrice) : (selectedMat?.unitPrice || 0);
  const totalCost = numQuantity * activeCost;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#059669' }}>
            <ArrowDownToLine size={20} />
            <span>Record Inward Consumables (Stock Receipt)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
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

            {/* Live Calculation Preview Card when Item & Quantity are entered */}
            {selectedMat && (
              <div className="stock-preview-box" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Consumable:</div>
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
              {/* Material Search & Selection */}
              <div className="form-group col-span-2">
                <label className="form-label">Consumable Material *</label>

                {selectedMat ? (
                  /* Clean selected material display card with Change option */
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #94a3b8',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge-sku" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                        {selectedMat.itemCode}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                          {selectedMat.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.6rem', marginTop: '0.15rem' }}>
                          <span>On-Hand: <strong style={{ color: '#0f172a' }}>{selectedMat.currentStock} {selectedMat.unitOfMeasure}</strong></span>
                          <span>•</span>
                          <span>Standard Rate: <strong style={{ color: '#0f172a' }}>{formatCurrency(selectedMat.unitPrice)}</strong></span>
                          {selectedMat.category?.name && (
                            <>
                              <span>•</span>
                              <span>{selectedMat.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleClearSelectedMaterial}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <RefreshCw size={12} />
                      <span>Change Item</span>
                    </button>
                  </div>
                ) : (
                  /* Clean search input - only displays suggestions once user starts typing */
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.3rem', paddingRight: searchQuery ? '2.2rem' : '0.85rem' }}
                        placeholder="Type material name or SKU (e.g. CON-IT-001) to search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
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

                    {/* Suggestions Dropdown (Only appears when user is typing) */}
                    {searchQuery.trim().length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 30,
                          marginTop: '0.25rem',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          border: '1px solid #cbd5e1',
                          borderRadius: 'var(--radius-md)',
                          background: '#ffffff',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                        }}
                      >
                        {filteredMaterials.length === 0 ? (
                          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                            No consumable materials found matching "{searchQuery}"
                          </div>
                        ) : (
                          filteredMaterials.map(m => (
                            <div
                              key={m.id}
                              onClick={() => handleSelectMaterial(m)}
                              style={{
                                padding: '0.65rem 0.9rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                transition: 'background 0.12s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#f1f5f9';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#ffffff';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                                <span className="font-mono badge-sku" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                  {m.itemCode}
                                </span>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                                    {m.name}
                                  </span>
                                  {m.category?.name && (
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.45rem' }}>
                                      ({m.category.name})
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                                  Stock: <strong>{m.currentStock} {m.unitOfMeasure}</strong>
                                </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', fontFamily: 'var(--font-mono)' }}>
                                  {formatCurrency(m.unitPrice)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {searchQuery.trim().length === 0 && (
                      <span className="form-help-text" style={{ marginTop: '0.35rem' }}>
                        Start typing a product name or SKU to view suggestions...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Inward Quantity ({selectedMat?.unitOfMeasure || 'units'}) *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input font-mono"
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  onWheel={e => e.target.blur()}
                  required
                />
              </div>

              {/* Unit Price (Cost prepopulated from selected material) */}
              <div className="form-group">
                <label className="form-label">Inward Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input font-mono"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  onWheel={e => e.target.blur()}
                  placeholder={selectedMat?.unitPrice ? `Standard: ₹${Number(selectedMat.unitPrice).toFixed(2)}` : '0.00'}
                />
                <span className="form-help-text">
                  Total Batch Intake: {formatCurrency(totalCost)}
                </span>
              </div>

              {/* Put-away Storage Location */}
              <div className="form-group col-span-2">
                <div>
                  <label className="form-label">Storage Location (Rack / Shelf)</label>
                  <span className="form-help-text">Optional. Updating this location will save to the material catalog.</span>
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
                <label className="form-label">PO / Delivery Invoice No.</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. PO-2026-0812 (optional)"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                />
              </div>

              {/* Supplier */}
              <div className="form-group">
                <label className="form-label">Supplier / Vendor Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Office Depot, TechDirect"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                />
              </div>

              {/* Receiver */}
              <div className="form-group col-span-2">
                <label className="form-label">Received By (Staff / Storekeeper)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Store Manager / Receiver Name"
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
                  placeholder="Optional delivery notes, package inspection remarks..."
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
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderColor: '#34d399' }}
              disabled={isSubmitting || !materialId || !quantity || Number(quantity) <= 0}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Inward Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
