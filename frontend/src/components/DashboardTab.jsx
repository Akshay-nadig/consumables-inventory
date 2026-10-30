import React from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  IndianRupee, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  TrendingUp, 
  Layers, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, getStockStatus } from '../utils/formatters';

export default function DashboardTab({ 
  summary, 
  categories, 
  onSelectCategory, 
  onQuickInward,
  onNavigateMaterials,
  onNavigateReport
}) {
  if (!summary) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading dashboard metrics...</div>;
  }

  const {
    totalItems,
    totalStockUnits,
    lowStockItemsCount,
    outOfStockItemsCount,
    totalInventoryValue,
    thisMonthInwardQuantity,
    thisMonthOutwardQuantity,
    categoryBreakdown = [],
    monthlyTrend = [],
    lowStockAlerts = [],
    recentTransactions = []
  } = summary;

  // Find max value in monthly trend for relative scaling
  const maxMonthlyQty = Math.max(
    ...monthlyTrend.map(m => Math.max(m.inwardQuantity, m.outwardQuantity)),
    20
  );

  return (
    <div>
      {/* 1. KPI Top Grid */}
      <div className="kpi-grid">
        {/* Total Consumables - distinct item types */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Item Types (SKUs)</span>
            <div className="kpi-icon-wrap">
              <Package size={16} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(totalItems)}</div>
          <div className="kpi-subtext">Distinct consumable products tracked</div>
        </div>

        {/* Total Available Units */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Stock Units</span>
            <div className="kpi-icon-wrap">
              <Boxes size={16} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(totalStockUnits)}</div>
          <div className="kpi-subtext">Physical units across all locations</div>
        </div>

        {/* Total Inventory Valuation */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Inventory Value</span>
            <div className="kpi-icon-wrap">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(totalInventoryValue)}</div>
          <div className="kpi-subtext">Current stock holding value</div>
        </div>

        {/* Low Stock Warning */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Low Stock Alerts</span>
            <div className="kpi-icon-wrap">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="kpi-value">{lowStockItemsCount}</div>
          <div className="kpi-subtext">
            {outOfStockItemsCount > 0 ? `${outOfStockItemsCount} fully depleted` : 'Items near reorder threshold'}
          </div>
        </div>

        {/* Monthly Inward Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Inward This Month</span>
            <div className="kpi-icon-wrap">
              <ArrowDownToLine size={16} />
            </div>
          </div>
          <div className="kpi-value">+{formatNumber(thisMonthInwardQuantity)}</div>
          <div className="kpi-subtext">Units received from suppliers</div>
        </div>

        {/* Monthly Outward Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Outward This Month</span>
            <div className="kpi-icon-wrap">
              <ArrowUpFromLine size={16} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(thisMonthOutwardQuantity)}</div>
          <div className="kpi-subtext">Units issued to departments</div>
        </div>
      </div>

      {/* 2. Middle Row: Monthly Movement Trend & Low Stock Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Trend Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)' }}>
                Stock Movement Trend (Inward vs Outward)
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Comparison of consumable stock inflow vs outward consumption
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onNavigateReport}
            >
              <span>View Full Report</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Bar Visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.25rem 0' }}>
            {monthlyTrend.map((m, idx) => {
              const inWidth = Math.round((m.inwardQuantity / maxMonthlyQty) * 100);
              const outWidth = Math.round((m.outwardQuantity / maxMonthlyQty) * 100);

              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {m.monthLabel}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {/* Inward Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.max(4, inWidth)}%`, 
                            height: '100%', 
                            background: '#16a34a',
                            borderRadius: '3px'
                          }} 
                        />
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 500, width: '40px', textAlign: 'right' }}>
                        +{m.inwardQuantity}
                      </span>
                    </div>

                    {/* Outward Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.max(4, outWidth)}%`, 
                            height: '100%', 
                            background: '#b45309',
                            borderRadius: '3px'
                          }} 
                        />
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--orange)', fontWeight: 500, width: '40px', textAlign: 'right' }}>
                        {m.outwardQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Inward</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#b45309', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Outward</span>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)' }}>
                Re-order Priority Alerts
              </h3>
            </div>
            <span className="badge badge-low-stock">{lowStockAlerts.length} items</span>
          </div>

          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Consumable materials at or below designated safety thresholds.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
            {lowStockAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All consumable items have healthy stock levels.
              </div>
            ) : (
              lowStockAlerts.map(item => {
                const stockInfo = getStockStatus(item.currentStock, item.minimumReorderLevel);
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-white)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                        <span className="font-mono">{item.itemCode}</span>
                        <span>•</span>
                        <span>Reorder threshold: {item.minimumReorderLevel} {item.unitOfMeasure}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-mono" style={{ fontWeight: 700, color: stockInfo.barColor, fontSize: '0.9rem' }}>
                          {item.currentStock} {item.unitOfMeasure}
                        </div>
                        <span className={`badge ${stockInfo.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                          {stockInfo.label}
                        </span>
                      </div>

                      <button 
                        className="btn btn-inward btn-sm"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onQuickInward(item)}
                        title="Quickly record incoming stock"
                      >
                        + Inward
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Category Stock Breakdown Grid (The 16 Categories) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary-light)" />
              Consumables Categories & Available Stock (16 Groups)
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Click any category card to inspect materials or register new stock
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onNavigateMaterials}
          >
            <span>Open Catalog</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {categoryBreakdown.map(cat => {
            return (
              <div 
                key={cat.categoryId}
                className="card"
                style={{ padding: '1.15rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => onSelectCategory(cat.categoryId)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-white)' }}>
                    {cat.categoryName}
                  </div>
                  {cat.lowStockCount > 0 && (
                    <span className="badge badge-low-stock" style={{ fontSize: '0.65rem' }}>
                      {cat.lowStockCount} low
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</div>
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {cat.totalItems}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</div>
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-light)' }}>
                      {formatNumber(cat.totalUnits)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valuation</div>
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
                      {formatCurrency(cat.valuation)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Stock Activity Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)' }}>
              Recent Stock Movements (Inward & Outward)
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Audit timeline of stock receipts and department issues
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Ref / PO #</th>
                <th>Party / Department</th>
                <th>Handler</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(t => {
                const isInward = t.transactionType === 'INWARD';
                return (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDate(t.transactionDate)}
                    </td>
                    <td>
                      <span className={`badge ${isInward ? 'badge-inward' : 'badge-outward'}`}>
                        {isInward ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                        {t.transactionType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>
                        {t.material?.name || 'Material Item'}
                      </div>
                      <span className="badge-sku" style={{ fontSize: '0.7rem' }}>
                        {t.material?.itemCode || 'SKU'}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 700, color: isInward ? '#34d399' : '#fb923c' }}>
                      {isInward ? `+${t.quantity}` : `-${t.quantity}`} {t.material?.unitOfMeasure || 'units'}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {t.referenceNumber || '-'}
                    </td>
                    <td style={{ fontSize: '0.825rem' }}>
                      {t.partyName || '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {t.handledBy || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
