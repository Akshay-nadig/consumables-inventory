import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Package } from 'lucide-react';
import StorageLocationFields from './StorageLocationFields';
import { buildStorageLocation, CATEGORY_LOCATION_SUGGESTIONS, parseStorageLocation } from '../utils/storageLocation';

const COMMON_UOMS = [
  'Pcs', 'Box', 'Pack', 'Ream', 'Roll', 'Unit', 'Set', 
  'Cartridge', 'Bottle', 'Tube', 'Can', 'Copy', 'Book', 'Meter'
];

export default function MaterialModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialMaterial = null
}) {
  const isEdit = !!initialMaterial;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [minimumReorderLevel, setMinimumReorderLevel] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [storageZone, setStorageZone] = useState('');
  const [storageRack, setStorageRack] = useState('');
  const [storageDetails, setStorageDetails] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategoryName = categories.find(category => category.id === Number(categoryId))?.name;
  const locationSuggestion = CATEGORY_LOCATION_SUGGESTIONS[selectedCategoryName];

  useEffect(() => {
    if (initialMaterial) {
      setName(initialMaterial.name || '');
      setCategoryId(initialMaterial.categoryId || '');
      setItemCode(initialMaterial.itemCode || '');
      setDescription(initialMaterial.description || '');
      setUnitOfMeasure(initialMaterial.unitOfMeasure || '');
      setInitialStock(initialMaterial.currentStock !== undefined ? initialMaterial.currentStock : '');
      setMinimumReorderLevel(initialMaterial.minimumReorderLevel !== undefined ? initialMaterial.minimumReorderLevel : '');
      setUnitPrice(initialMaterial.unitPrice !== undefined ? initialMaterial.unitPrice : '');
      const location = parseStorageLocation(initialMaterial.storageLocation || '');
      setStorageZone(location.zone);
      setStorageRack(location.rack);
      setStorageDetails(location.details);
      setChangeReason('Supplier price adjustment');
    } else {
      setName('');
      setCategoryId('');
      setItemCode('');
      setDescription('');
      setUnitOfMeasure('');
      setInitialStock('');
      setMinimumReorderLevel('');
      setUnitPrice('');
      setStorageZone('');
      setStorageRack('');
      setStorageDetails('');
      setChangeReason('');
    }
    setError('');
  }, [initialMaterial, isOpen]);

  // Helper to generate SKU based on category code
  const generateSku = (catId) => {
    let prefix = 'GEN';
    if (catId) {
      const selectedCat = categories.find(c => c.id === Number(catId));
      if (selectedCat?.code) {
        prefix = selectedCat.code.replace('CAT-', '');
      }
    }
    const randNum = Math.floor(100 + Math.random() * 900);
    setItemCode(`CON-${prefix}-${randNum}`);
  };

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value ? Number(e.target.value) : '';
    setCategoryId(newCatId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Please select a Consumable Category.');
      return;
    }
    if (!name.trim()) {
      setError('Material Name is required.');
      return;
    }
    if (!itemCode.trim()) {
      setError('Item SKU Code is required.');
      return;
    }
    if (!unitOfMeasure) {
      setError('Please select a Unit of Measure.');
      return;
    }
    if (minimumReorderLevel === '' || isNaN(Number(minimumReorderLevel))) {
      setError('Please enter a valid Re-order Threshold.');
      return;
    }
    if (unitPrice === '' || isNaN(Number(unitPrice))) {
      setError('Please enter a valid Unit Cost.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        id: initialMaterial?.id,
        name: name.trim(),
        categoryId: Number(categoryId),
        itemCode: itemCode.trim().toUpperCase(),
        description: description.trim(),
        unitOfMeasure: unitOfMeasure.trim(),
        initialStock: Number(initialStock) || 0,
        minimumReorderLevel: Number(minimumReorderLevel) || 0,
        unitPrice: Number(unitPrice) || 0,
        storageLocation: buildStorageLocation(storageZone, storageRack, storageDetails),
        changeReason: changeReason?.trim() || 'Manual Cost Adjustment',
        changedBy: 'Store Manager'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving material.');
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
          <div className="modal-title">
            <Package size={20} color="var(--primary-light)" />
            <span>{isEdit ? 'Edit Consumable Material' : 'Add New Consumable Material'}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Category */}
              <div className="form-group col-span-2">
                <label className="form-label">Consumable Category *</label>
                <select 
                  className="form-select"
                  value={categoryId}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">-- Select Consumable Category * --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                <span className="form-help-text">Select one of the corporate consumable categories</span>
              </div>

              {/* Material Name */}
              <div className="form-group col-span-2">
                <label className="form-label">Material Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wireless Optical Mouse, Toner 85A, Paper Cups"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              {/* Item Code (SKU) */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">SKU / Item Code *</label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => generateSku(categoryId)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <Sparkles size={11} /> Auto-Generate
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. CON-IT-005"
                  value={itemCode}
                  onChange={e => setItemCode(e.target.value)}
                  disabled={isEdit}
                  required
                />
              </div>

              {/* Unit of Measure */}
              <div className="form-group">
                <label className="form-label">Unit of Measure (UoM) *</label>
                <select
                  className="form-select"
                  value={unitOfMeasure}
                  onChange={e => setUnitOfMeasure(e.target.value)}
                  required
                >
                  <option value="">-- Select Unit of Measure * --</option>
                  {COMMON_UOMS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Initial Stock (Only for new) */}
              <div className="form-group">
                <label className="form-label">{isEdit ? 'Current Stock' : 'Opening Stock'}</label>
                <input
                  type="number"
                  min="0"
                  className="form-input font-mono"
                  placeholder="0"
                  value={initialStock}
                  onChange={e => setInitialStock(e.target.value)}
                  disabled={isEdit}
                />
                <span className="form-help-text">{isEdit ? 'Adjust stock via Inward/Outward movements' : 'Initial count in physical store (optional)'}</span>
              </div>

              {/* Minimum Reorder Level */}
              <div className="form-group">
                <label className="form-label">Re-order Threshold *</label>
                <input
                  type="number"
                  min="0"
                  className="form-input font-mono"
                  placeholder="e.g. 5"
                  value={minimumReorderLevel}
                  onChange={e => setMinimumReorderLevel(e.target.value)}
                  required
                />
                <span className="form-help-text">Triggers low-stock alert when reached</span>
              </div>

              {/* Unit Price */}
              <div className="form-group">
                <label className="form-label">{isEdit ? 'Current Active Unit Price (₹) *' : 'Standard Unit Price (₹) *'}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input font-mono"
                  placeholder="0.00"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  required
                />
                <span className="form-help-text">
                  {isEdit 
                    ? 'Updating this price will be logged in Price History without altering existing stock total cost.'
                    : 'Initial standard unit purchase price'}
                </span>
              </div>

              {/* Optional physical storage location */}
              <div className="form-group col-span-2">
                <div>
                  <label className="form-label">Storage location</label>
                  <span className="form-help-text">Choose a zone, rack, and optional row details. You can leave all fields blank.</span>
                </div>
              </div>
              <StorageLocationFields
                zone={storageZone}
                rack={storageRack}
                details={storageDetails}
                onZoneChange={setStorageZone}
                onRackChange={setStorageRack}
                onDetailsChange={setStorageDetails}
                idPrefix="material-location"
              />
              {locationSuggestion && (
                <p className="store-map-hint col-span-2">
                  Store map suggestion: {locationSuggestion.zone ? `${locationSuggestion.zone} · ` : ''}Rack(s): {locationSuggestion.racks}. This is a guide; choose the actual location above.
                </p>
              )}

              {/* Price Change Reason (Shown when editing if price differs) */}
              {isEdit && Number(unitPrice) !== Number(initialMaterial?.unitPrice) && (
                <div className="form-group col-span-2" style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <label className="form-label" style={{ color: 'var(--primary-light)' }}>
                    Reason for Price Revision (Saved to Price History)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vendor price increase, Bulk contract discount, Inflation adjustment"
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                  />
                  <span className="form-help-text" style={{ color: 'var(--text-muted)' }}>
                    Previous price {initialMaterial?.unitPrice ? `(₹${Number(initialMaterial.unitPrice).toFixed(2)})` : ''} will be logged in the item's price change history.
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="form-group col-span-2">
                <label className="form-label">Specifications & Description</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Optional details, model numbers, or notes for stock keepers..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Consumable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
