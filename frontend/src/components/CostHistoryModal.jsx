import React, { useState, useEffect } from 'react';
import { X, History, TrendingUp, TrendingDown, Clock, ArrowRight, Layers, DollarSign, AlertCircle } from 'lucide-react';
import { getMaterialCostHistory } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function CostHistoryModal({
  isOpen,
  onClose,
  material
}) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && material) {
      loadHistory();
    } else {
      setHistory([]);
      setError('');
    }
  }, [isOpen, material]);

  const loadHistory = async () => {
    if (!material?.id) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getMaterialCostHistory(material.id);
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading cost history:', err);
      setError('Unable to load cost change history.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !material) return null;

  const prevCost = Number(material.previousCost) || 0;
  const prevStock = Number(material.previousCostStock) || 0;
  const currCost = Number(material.unitPrice) || 0;
  const currStock = material.currentCostStock !== undefined ? Number(material.currentCostStock) : Math.max(0, Number(material.currentStock) - prevStock);
  const totalValue = material.totalValue !== undefined && material.totalValue > 0
    ? Number(material.totalValue) 
    : (prevStock * prevCost) + (currStock * currCost);

  // Determine how the previous unit cost was calculated
  const getPreviousCostBreakdown = () => {
    if (prevStock <= 0 || prevCost <= 0) {
      return {
        formula: 'No units held at previous cost (₹0.00)',
        explanation: 'All on-hand stock is valued at the active unit cost.'
      };
    }

    if (material.previousCostBreakdown) {
      return {
        formula: material.previousCostBreakdown,
        explanation: 'Formula evaluated at the time of the price revision.'
      };
    }

    // Inspect historical cost revisions to determine exact basis
    const priceRevisions = history.filter(h => h.previousCost !== undefined && Number(h.previousCost) > 0);
    const latestRevision = priceRevisions[0];

    if (latestRevision) {
      const priorRate = Number(latestRevision.previousCost);
      if (Math.abs(priorRate - prevCost) < 0.01) {
        return {
          formula: `${prevStock} ${material.unitOfMeasure} locked @ earlier active rate of ${formatCurrency(priorRate)}`,
          explanation: `Preserved from ${latestRevision.changeReason || 'price revision'}`
        };
      }
      return {
        formula: `Weighted average of on-hand batches prior to revision = ${formatCurrency(prevCost)} / unit`,
        explanation: `Calculated from on-hand batches before ${latestRevision.changeReason || 'price adjustment'}`
      };
    }

    return {
      formula: `${prevStock} ${material.unitOfMeasure} locked @ earlier active rate of ${formatCurrency(prevCost)}`,
      explanation: 'Preserved at previous purchase cost prior to unit price revision.'
    };
  };

  const prevBreakdown = getPreviousCostBreakdown();

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '880px', background: '#ffffff', color: '#0f172a' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8'
            }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Cost History & Valuation Breakdown
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span className="badge-sku" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>{material.itemCode}</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{material.name}</span>
                <span>•</span>
                <span>Unit: <strong style={{ color: '#0f172a' }}>{material.unitOfMeasure}</strong></span>
                <span>•</span>
                <span>Total On-Hand: <strong style={{ color: '#0f172a' }}>{formatNumber(material.currentStock)} {material.unitOfMeasure}</strong></span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '1.5rem', background: '#ffffff' }}>
          {/* Summary Metric Cards with High-Contrast Colors */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Card 1: Current Cost & Stock */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1e40af' }}>
                  Current Unit Cost
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 700,
                  border: '1px solid #93c5fd'
                }}>
                  Active Rate
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1d4ed8', margin: '0.2rem 0' }}>
                {formatCurrency(currCost)}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>
                Units at this cost: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{formatNumber(currStock)} {material.unitOfMeasure}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Bucket Value: <span className="font-mono" style={{ fontWeight: 600, color: '#1e40af' }}>{formatCurrency(currStock * currCost)}</span>
              </div>
            </div>

            {/* Card 2: Previous Cost & Stock */}
            <div style={{
              background: prevStock > 0 ? '#fffbeb' : '#f8fafc',
              border: prevStock > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: prevStock > 0 ? '#92400e' : '#475569' }}>
                  Previous Unit Cost
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: prevStock > 0 ? '#fef3c7' : '#f1f5f9',
                  color: prevStock > 0 ? '#92400e' : '#64748b',
                  fontWeight: 700,
                  border: prevStock > 0 ? '1px solid #fcd34d' : '1px solid #cbd5e1'
                }}>
                  {prevStock > 0 ? `${prevStock} Held` : 'None Held'}
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: prevCost > 0 ? '#b45309' : '#94a3b8', margin: '0.2rem 0' }}>
                {prevCost > 0 ? formatCurrency(prevCost) : '₹0.00'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>
                Units held at previous cost: <strong style={{ color: prevStock > 0 ? '#92400e' : '#64748b', fontWeight: 700 }}>{formatNumber(prevStock)} {material.unitOfMeasure}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Bucket Value: <span className="font-mono" style={{ fontWeight: 600, color: prevStock > 0 ? '#b45309' : '#64748b' }}>{formatCurrency(prevStock * prevCost)}</span>
                {prevStock > 0 && <span style={{ color: '#94a3b8' }}> ({prevStock} × {formatCurrency(prevCost)})</span>}
              </div>
              <div style={{ fontSize: '0.82rem', color: prevStock > 0 ? '#92400e' : '#475569', fontWeight: 600 }}>
                Cost Determination:
              </div>
              <div className="font-mono" style={{ fontSize: '0.74rem', color: prevStock > 0 ? '#92400e' : '#64748b', background: prevStock > 0 ? '#fef3c7' : '#f1f5f9', padding: '0.35rem 0.55rem', borderRadius: '4px', border: prevStock > 0 ? '1px solid #fde68a' : '1px solid #cbd5e1', lineHeight: 1.4 }}>
                {prevBreakdown.formula}
              </div>
              <div style={{ fontSize: '0.72rem', color: prevStock > 0 ? '#b45309' : '#64748b' }}>
                {prevBreakdown.explanation}
              </div>
            </div>

            {/* Card 3: Combined Stock Valuation */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534' }}>
                  Total Available Stock Value
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 700,
                  border: '1px solid #86efac'
                }}>
                  Previous + Current
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d', margin: '0.2rem 0' }}>
                {formatCurrency(totalValue)}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#14532d', fontWeight: 600 }}>
                Calculation Breakdown:
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: '#166534', background: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                ({prevStock} × {formatCurrency(prevCost)}) + ({currStock} × {formatCurrency(currCost)})
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={16} color="#2563eb" />
              <span>Historical Cost Revisions Log</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {history.length} audit entry{history.length === 1 ? '' : 'ies'} found
            </span>
          </div>

          {/* Table of History */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              <div>Loading cost audit trail...</div>
            </div>
          ) : error ? (
            <div className="form-error-alert" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <History size={26} style={{ margin: '0 auto 0.5rem auto', color: '#94a3b8' }} />
              <div style={{ fontWeight: 600, color: '#334155' }}>No historical cost revisions found</div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Changes to this item's cost will be tracked here automatically.</div>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="custom-table" style={{ fontSize: '0.84rem', margin: 0 }}>
                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ width: '150px', color: '#334155', fontWeight: 700 }}>Date & Time</th>
                    <th style={{ color: '#334155', fontWeight: 700 }}>Cost Shift</th>
                    <th style={{ color: '#334155', fontWeight: 700 }}>Price Shift</th>
                    <th style={{ color: '#334155', fontWeight: 700 }}>Reason / Event</th>
                    <th style={{ color: '#334155', fontWeight: 700 }}>Logged By</th>
                    <th style={{ color: '#334155', fontWeight: 700 }}>Notes & Preserved Units</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => {
                    const prevC = Number(h.previousCost) || 0;
                    const newC = Number(h.newCost) || 0;
                    const diff = newC - prevC;
                    const isIncrease = diff > 0 && prevC > 0;
                    const isDecrease = diff < 0 && prevC > 0;
                    const isInitial = prevC === 0;

                    const formattedDate = new Date(h.effectiveDate).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={h.id || i} style={{ background: i % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                        {/* Date */}
                        <td style={{ whiteSpace: 'nowrap', color: '#475569', fontWeight: 500 }}>
                          {formattedDate}
                        </td>

                        {/* Cost Shift */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="font-mono" style={{ color: prevC > 0 ? '#64748b' : '#94a3b8', textDecoration: prevC > 0 ? 'line-through' : 'none' }}>
                              {prevC > 0 ? formatCurrency(prevC) : '₹0.00'}
                            </span>
                            <ArrowRight size={13} color="#94a3b8" />
                            <span className="font-mono" style={{ fontWeight: 700, color: '#0f172a' }}>
                              {formatCurrency(newC)}
                            </span>
                          </div>
                        </td>

                        {/* Difference */}
                        <td>
                          {isInitial ? (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 700,
                              border: '1px solid #cbd5e1'
                            }}>
                              Initial Registration
                            </span>
                          ) : isIncrease ? (
                            <span style={{
                              fontSize: '0.74rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: '#f0fdf4',
                              color: '#15803d',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              border: '1px solid #bbf7d0'
                            }}>
                              <TrendingUp size={12} />
                              +{formatCurrency(diff)}
                            </span>
                          ) : isDecrease ? (
                            <span style={{
                              fontSize: '0.74rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              border: '1px solid #fecaca'
                            }}>
                              <TrendingDown size={12} />
                              {formatCurrency(diff)}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b' }}>No change</span>
                          )}
                        </td>

                        {/* Reason / Trigger */}
                        <td>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {h.changeReason}
                          </span>
                        </td>

                        {/* Changed By */}
                        <td style={{ color: '#475569' }}>
                          {h.changedBy || 'System'}
                        </td>

                        {/* Notes */}
                        <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '240px' }}>
                          {h.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Inventory values are strictly calculated by summing stock at each respective unit cost.
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontWeight: 600 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
