import React, { useState, useEffect } from 'react';
import { CalendarDays, ArrowDownToLine, ArrowUpFromLine, FileBarChart2, Download, Printer } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { getMonthlyMovementReport } from '../services/api';
import { utils, writeFile } from 'xlsx';
import StorageLocationFields from './StorageLocationFields';

/**
 * MovementReport – Replacement for the old MonthlyReportTab.
 * Provides a date‑range based movement analysis, Excel download, and richer filtering.
 */
export default function MovementReport({ categories }) {
  // ==== UI state ==========================================================
  const [startDate, setStartDate] = useState(''); // YYYY‑MM‑DD
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedItemId, setSelectedItemId] = useState(''); // '' = all items
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==== Helpers ===========================================================
  const monthsBetween = (start, end) => {
    const startM = new Date(start);
    const endM = new Date(end);
    const result = [];
    let cur = new Date(startM.getFullYear(), startM.getMonth(), 1);
    while (cur <= endM) {
      result.push({ year: cur.getFullYear(), month: cur.getMonth() + 1, label: cur.toLocaleString(undefined, { month: 'short', year: '2-digit' }) });
      cur.setMonth(cur.getMonth() + 1);
    }
    return result;
  };

  // ==== Data fetching =====================================================
  // Reset selected item when category changes
  useEffect(() => {
    setSelectedItemId('');
  }, [category]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const range = monthsBetween(startDate, endDate);
    if (range.length === 0) return;
    setLoading(true);
    Promise.all(
      range.map(({ year, month }) =>
        getMonthlyMovementReport({ year, month, categoryId: category === 'ALL' ? null : Number(category) })
      )
    )
      .then(data => setMonthlyReports(data))
      .catch(err => console.error('Failed to load movement report:', err))
      .finally(() => setLoading(false));
  }, [startDate, endDate, category]);

  // ==== Derived calculations ===============================================
  const aggregate = monthlyReports.reduce(
    (tot, r) => {
      tot.inwardUnits += r.totalInwardUnits || 0;
      tot.outwardUnits += r.totalOutwardUnits || 0;
      tot.inwardValue += r.totalInwardAmount || 0;
      tot.outwardValue += r.totalOutwardAmount || 0;
      return tot;
    },
    { inwardUnits: 0, outwardUnits: 0, inwardValue: 0, outwardValue: 0 }
  );

  const closingValue = (monthlyReports.flatMap(r => r.items || [])).reduce(
    (sum, i) => sum + i.closingStock * i.unitPrice,
    0
  );

  // ==== Build item map for the transposed table ===========================
  const buildItemMap = () => {
    const map = {};
    monthlyReports.forEach(r => {
      const monthKey = `${new Date(r.year, r.month - 1).toLocaleString(undefined, { month: 'short', year: '2-digit' })}`;
      (r.items || []).forEach(it => {
        // API returns materialId and itemCode fields
        const id = it.materialId !== undefined ? it.materialId : it.id;
        if (!map[id]) {
          map[id] = { id, name: it.name, sku: it.itemCode, categoryName: it.categoryName || it.category?.name || '', monthData: {} };
        }
        map[id].monthData[monthKey] = {
          purch: it.inwardQuantity || it.inwardUnits || 0,
          issue: it.outwardQuantity || it.outwardUnits || 0,
          bal: it.closingStock || 0
        };
      });
    });
    return Object.values(map);
  };

  const allItems = buildItemMap();

  const filteredItems = allItems.filter(it => {
    // Filter by selected item
    if (selectedItemId && selectedItemId !== '' && it.id !== Number(selectedItemId)) return false;
    // Filter by selected category (if not ALL)
    if (category !== 'ALL') {
      const catObj = categories.find(c => String(c.id) === String(category));
      if (catObj && it.categoryName && it.categoryName !== catObj.name) return false;
    }
    return true;
  });

  // ==== Excel export ======================================================
  const exportExcel = () => {
    const wsData = [];
    // Header rows
    wsData.push(['Stock Movement Report', `${startDate} to ${endDate}`]);
    wsData.push([]);
    wsData.push([
      'Item', 'SKU',
      ...monthsBetween(startDate, endDate).flatMap(m => [
        `${m.label} Purch`, `${m.label} Issue`, `${m.label} Bal`
      ])
    ]);
    // Data rows (respect current filters)
    filteredItems.forEach(it => {
      const row = [it.name, it.sku];
      monthsBetween(startDate, endDate).forEach(m => {
        const data = it.monthData[m.label] || { purch: 0, issue: 0, bal: 0 };
        row.push(data.purch, data.issue, data.bal);
      });
      wsData.push(row);
    });
    // Totals row – sum across the displayed items
    wsData.push([]);
    wsData.push(['TOTAL', '', ...monthsBetween(startDate, endDate).flatMap(m => {
      let p = 0, o = 0, b = 0;
      filteredItems.forEach(it => {
        const d = it.monthData[m.label] || { purch: 0, issue: 0, bal: 0 };
        p += d.purch;
        o += d.issue;
        b += d.bal;
      });
      return [p, o, b];
    })]);
    const ws = utils.aoa_to_sheet(wsData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Movement');
    writeFile(wb, `Movement_Report_${startDate}_to_${endDate}.xlsx`);
  };

  // ==== Render =============================================================
  const monthHeaders = monthsBetween(startDate, endDate);

  return (
    <section className="movement-report" style={{ padding: '1.5rem', background: '#fafafa' }}>
      {/* Header */}
      <div className="report-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="report-title-block" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="report-icon"><FileBarChart2 size={24} /></div>
          <div>
            <p className="eyebrow" style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>INVENTORY ANALYTICS</p>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#222' }}>Stock Movement Report</h1>
            <p className="report-description" style={{ margin: 0, fontSize: '0.95rem', color: '#666' }}>
              Review inward/outward flows across a custom date range, filter by category or item, and export to Excel.
            </p>
          </div>
        </div>
        {/* Toolbar */}
        <div className="report-toolbar" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Date range */}
          <label className="report-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarDays size={16} />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>
          {/* Category selector */}
          <select className="form-select" aria-label="Filter category" value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '0.3rem 0.6rem' }}>
            <option value="ALL">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {/* Item selector (improved dropdown) */}
          <select className="form-select" value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} style={{ padding: '0.3rem 0.6rem', minWidth: '200px' }}>
            <option value="">All Items</option>
            {allItems.map(it => (
              <option key={it.id} value={it.id}>{it.name}{it.sku ? ` – ${it.sku}` : ''}</option>
            ))}
          </select>
          {/* Export & Print */}
          <button className="btn btn-primary" onClick={exportExcel} disabled={loading || !startDate || !endDate} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Download size={16} /> Export Excel
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* KPI Summary – using same visual language as other pages */}
      <div className="report-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <article className="report-kpi" style={{ background: '#e0f2fe', borderRadius: '8px', padding: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7' }}><ArrowDownToLine size={18} /> Inward (units)</span>
          <strong style={{ fontSize: '1.4rem' }}>{loading ? '—' : formatNumber(aggregate.inwardUnits)}</strong>
          <small style={{ color: '#555' }}>{formatCurrency(aggregate.inwardValue)} received</small>
        </article>
        <article className="report-kpi" style={{ background: '#fee2e2', borderRadius: '8px', padding: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626' }}><ArrowUpFromLine size={18} /> Outward (units)</span>
          <strong style={{ fontSize: '1.4rem' }}>{loading ? '—' : formatNumber(aggregate.outwardUnits)}</strong>
          <small style={{ color: '#555' }}>{formatCurrency(aggregate.outwardValue)} issued</small>
        </article>
        <article className="report-kpi" style={{ background: '#d1fae5', borderRadius: '8px', padding: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a' }}><Download size={18} /> Closing Stock Value</span>
          <strong style={{ fontSize: '1.4rem' }}>{loading ? '—' : formatCurrency(closingValue)}</strong>
          <small style={{ color: '#555' }}>valued at purchase price</small>
        </article>
      </div>

      {/* Transposed Table – Items on the left, months on top */}
      <div className="table-responsive" style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
        <table className="movement-table" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: '#fafafa', border: '1px solid #ddd', padding: '0.5rem' }}>Item (SKU)</th>
              {monthHeaders.map(mh => (
                <th key={mh.label} colSpan={3} style={{ background: '#fafafa', border: '1px solid #ddd', textAlign: 'center' }}>{mh.label}</th>
              ))}
            </tr>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: '#f0f0f0', border: '1px solid #ddd', padding: '0.3rem' }}></th>
              {monthHeaders.flatMap(mh => [
                <th key={`${mh.label}-purch`} style={{ border: '1px solid #ddd', padding: '0.3rem' }}>Purch</th>,
                <th key={`${mh.label}-issue`} style={{ border: '1px solid #ddd', padding: '0.3rem' }}>Issue</th>,
                <th key={`${mh.label}-bal`} style={{ border: '1px solid #ddd', padding: '0.3rem' }}>Bal</th>
              ])}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
              <tr key={it.id} style={{ background: '#fff' }}>
                <td style={{ position: 'sticky', left: 0, background: '#fff', border: '1px solid #eee', padding: '0.4rem', whiteSpace: 'nowrap' }}>{it.name}{it.sku ? ` – ${it.sku}` : ''}</td>
                {monthHeaders.map(mh => {
                  const data = it.monthData[mh.label] || { purch: 0, issue: 0, bal: 0 };
                  return (
                    <React.Fragment key={mh.label}>
                      <td style={{ border: '1px solid #eee', padding: '0.3rem', textAlign: 'right' }}>{data.purch}</td>
                      <td style={{ border: '1px solid #eee', padding: '0.3rem', textAlign: 'right' }}>{data.issue}</td>
                      <td style={{ border: '1px solid #eee', padding: '0.3rem', textAlign: 'right' }}>{data.bal}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            {/* Totals row – reflects currently displayed items */}
            <tr style={{ background: '#f9fafb', fontWeight: '600' }}>
              <td style={{ position: 'sticky', left: 0, background: '#f9fafb', border: '1px solid #ddd', padding: '0.4rem' }}>TOTAL</td>
              {monthHeaders.map(mh => {
                let totalPurch = 0, totalIssue = 0, totalBal = 0;
                filteredItems.forEach(it => {
                  const d = it.monthData[mh.label] || { purch: 0, issue: 0, bal: 0 };
                  totalPurch += d.purch;
                  totalIssue += d.issue;
                  totalBal += d.bal;
                });
                return (
                  <React.Fragment key={mh.label}>
                    <td style={{ border: '1px solid #ddd', padding: '0.3rem', textAlign: 'right' }}>{totalPurch}</td>
                    <td style={{ border: '1px solid #ddd', padding: '0.3rem', textAlign: 'right' }}>{totalIssue}</td>
                    <td style={{ border: '1px solid #ddd', padding: '0.3rem', textAlign: 'right' }}>{totalBal}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
