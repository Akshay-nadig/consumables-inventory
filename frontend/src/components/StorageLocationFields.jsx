import React from 'react';
import { STORAGE_RACKS, STORAGE_ZONES } from '../utils/storageLocation';

export default function StorageLocationFields({ zone, rack, details, onZoneChange, onRackChange, onDetailsChange, idPrefix = 'storage' }) {
  return <>
    <div className="form-group">
      <label className="form-label" htmlFor={`${idPrefix}-zone`}>Zone <span className="optional-label">Optional</span></label>
      <select id={`${idPrefix}-zone`} className="form-select" value={zone} onChange={event => onZoneChange(event.target.value)}>
        <option value="">No zone selected</option>
        {STORAGE_ZONES.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
    <div className="form-group">
      <label className="form-label" htmlFor={`${idPrefix}-rack`}>Rack / cabinet <span className="optional-label">Optional</span></label>
      <select id={`${idPrefix}-rack`} className="form-select" value={rack} onChange={event => onRackChange(event.target.value)}>
        <option value="">No rack selected</option>
        {STORAGE_RACKS.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
    <div className="form-group col-span-2">
      <label className="form-label" htmlFor={`${idPrefix}-details`}>Shelf, row, or location details <span className="optional-label">Optional</span></label>
      <input id={`${idPrefix}-details`} type="text" className="form-input" placeholder="e.g. Row 1, shelf 2" maxLength={120} value={details} onChange={event => onDetailsChange(event.target.value)} />
    </div>
  </>;
}
