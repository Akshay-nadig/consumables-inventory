import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Boxes, CalendarDays, Download, FileBarChart2, PackageCheck, Printer, Wallet } from 'lucide-react';
import { getMonthlyMovementReport } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';

const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(2000, i, 1).toLocaleString('en', { month: 'long' }) }));
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function MonthlyReportTab({ categories }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [category, setCategory] = useState('ALL');
  const [report, setReport] = useState(null);
  const [yearReports, setYearReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMonthlyMovementReport({ year, month, categoryId: category === 'ALL' ? null : Number(category) })
      .then(data => { if (active) setReport(data); })
      .catch(error => console.error('Failed to load monthly movement report:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, month, category]);

  useEffect(() => {
    let active = true;
    setYearLoading(true);
    Promise.all(months.map(m => getMonthlyMovementReport({ year, month: m.value, categoryId: category === 'ALL' ? null : Number(category) })))
      .then(data => { if (active) setYearReports(data); })
      .catch(error => console.error('Failed to load annual movement report:', error))
      .finally(() => { if (active) setYearLoading(false); });
    return () => { active = false; };
  }, [year, category]);

  const categoryRows = useMemo(() => {
    const groups = new Map();
    (report?.items || []).forEach(item => {
      const row = groups.get(item.categoryName) || { name: item.categoryName, inward: 0, outward: 0, closing: 0, inwardCost: 0, outwardCost: 0, remainingValue: 0, items: 0 };
      row.inward += item.inwardQuantity;
      row.outward += item.outwardQuantity;
      row.closing += item.closingStock;
      row.inwardCost += item.totalInwardValue;
      row.outwardCost += item.totalOutwardValue;
      row.remainingValue += item.closingStock * item.unitPrice;
      row.items += 1;
      groups.set(item.categoryName, row);
    });
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [report]);

  const exportCsv = () => {
    if (!report || yearReports.length !== 12) return;
    const annualItems = new Map();
    yearReports.forEach(monthReport => monthReport.items.forEach(item => {
      const row = annualItems.get(item.categoryName) || { name: item.categoryName, inward: 0, outward: 0, inwardCost: 0, outwardCost: 0, items: new Set() };
      row.inward += item.inwardQuantity;
      row.outward += item.outwardQuantity;
      row.inwardCost += item.totalInwardValue;
      row.outwardCost += item.totalOutwardValue;
      row.items.add(item.materialId);
      annualItems.set(item.categoryName, row);
    }));
    const annualTotals = yearReports.reduce((totals, r) => ({
      inward: totals.inward + r.totalInwardUnits,
      outward: totals.outward + r.totalOutwardUnits,
      inwardCost: totals.inwardCost + r.totalInwardAmount,
      outwardCost: totals.outwardCost + r.totalOutwardAmount
    }), { inward: 0, outward: 0, inwardCost: 0, outwardCost: 0 });
    const lines = [
      [csvCell(`Annual Inventory Movement Report — ${year}`)].join(','),
      [csvCell('Generated'), csvCell(new Date().toLocaleString())].join(','),
      [],
      [csvCell('MONTHLY MOVEMENT')].join(','),
      ['Month', 'Inward Qty', 'Outward Qty', 'Net Change', 'Inward Cost (INR)', 'Outward Cost (INR)'].map(csvCell).join(','),
      ...yearReports.map(r => [r.monthName, r.totalInwardUnits, r.totalOutwardUnits, r.netStockChange, r.totalInwardAmount.toFixed(2), r.totalOutwardAmount.toFixed(2)].map(csvCell).join(',')),
      ['YEAR TOTAL', annualTotals.inward, annualTotals.outward, annualTotals.inward - annualTotals.outward, annualTotals.inwardCost.toFixed(2), annualTotals.outwardCost.toFixed(2)].map(csvCell).join(','),
      [],
      [csvCell('YEAR TOTAL BY CATEGORY')].join(','),
      ['Category', 'Items', 'Inward Qty', 'Outward Qty', 'Net Change', 'Inward Cost (INR)', 'Outward Cost (INR)'].map(csvCell).join(','),
      ...[...annualItems.values()].sort((a, b) => a.name.localeCompare(b.name)).map(r => [r.name, r.items.size, r.inward, r.outward, r.inward - r.outward, r.inwardCost.toFixed(2), r.outwardCost.toFixed(2)].map(csvCell).join(',')),
      ['YEAR TOTAL', '', annualTotals.inward, annualTotals.outward, annualTotals.inward - annualTotals.outward, annualTotals.inwardCost.toFixed(2), annualTotals.outwardCost.toFixed(2)].map(csvCell).join(','),
      [],
      [csvCell(`SELECTED MONTH DETAIL — ${report.monthName}`)].join(','),
      ['Item Code', 'Item', 'Category', 'Unit', 'Opening Stock', 'Inward Qty', 'Outward Qty', 'Closing Stock', 'Unit Cost (INR)', 'Inward Cost (INR)', 'Outward Cost (INR)', 'Remaining Stock Value (INR)'].map(csvCell).join(','),
      ...report.items.map(i => [i.itemCode, i.name, i.categoryName, i.unitOfMeasure, i.openingStock, i.inwardQuantity, i.outwardQuantity, i.closingStock, i.unitPrice.toFixed(2), i.totalInwardValue.toFixed(2), i.totalOutwardValue.toFixed(2), (i.closingStock * i.unitPrice).toFixed(2)].map(csvCell).join(','))
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventory_Annual_Report_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const years = Array.from({ length: Math.max(8, today.getFullYear() - 2019) }, (_, i) => today.getFullYear() - i);
  const closingValue = (report?.items || []).reduce((sum, item) => sum + item.closingStock * item.unitPrice, 0);
  const itemRows = report?.items || [];
  const annualTotals = yearReports.reduce((totals, r) => ({ inward: totals.inward + r.totalInwardUnits, outward: totals.outward + r.totalOutwardUnits, inwardCost: totals.inwardCost + r.totalInwardAmount, outwardCost: totals.outwardCost + r.totalOutwardAmount }), { inward: 0, outward: 0, inwardCost: 0, outwardCost: 0 });

  return <section className="monthly-report">
    <div className="report-hero">
      <div className="report-title-block">
        <div className="report-icon"><FileBarChart2 size={22} /></div>
        <div><p className="eyebrow">INVENTORY ANALYTICS</p><h1>Inventory movement report</h1><p className="report-description">Review monthly receipts and issues, compare categories, and download the full year summary.</p></div>
      </div>
      <div className="report-toolbar no-print">
        <label className="report-filter"><CalendarDays size={16} /><select aria-label="Report month" value={month} onChange={e => setMonth(Number(e.target.value))}>{months.map(m => <option value={m.value} key={m.value}>{m.label}</option>)}</select></label>
        <select className="report-select" aria-label="Report year" value={year} onChange={e => setYear(Number(e.target.value))}>{years.map(y => <option value={y} key={y}>{y}</option>)}</select>
        <select className="report-select category-select" aria-label="Filter category" value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button className="btn btn-primary report-download" onClick={exportCsv} disabled={!report || loading || yearLoading}><Download size={16} /> Download annual report</button>
        <button className="btn btn-secondary report-print no-print" onClick={() => window.print()} title="Print or save as PDF"><Printer size={16} /></button>
      </div>
    </div>

    <div className="report-kpis">
      <article className="report-kpi"><span className="kpi-icon inward-icon"><ArrowDownToLine size={18} /></span><p>Received this month</p><strong>{loading ? '—' : formatNumber(report?.totalInwardUnits || 0)}</strong><small>units · {formatCurrency(report?.totalInwardAmount || 0)} received value</small></article>
      <article className="report-kpi"><span className="kpi-icon outward-icon"><ArrowUpFromLine size={18} /></span><p>Issued this month</p><strong>{loading ? '—' : formatNumber(report?.totalOutwardUnits || 0)}</strong><small>units · {formatCurrency(report?.totalOutwardAmount || 0)} issued value</small></article>
      <article className="report-kpi"><span className="kpi-icon stock-icon"><PackageCheck size={18} /></span><p>Stock remaining</p><strong>{loading ? '—' : formatNumber(itemRows.reduce((s, i) => s + i.closingStock, 0))}</strong><small>units on hand at month end</small></article>
      <article className="report-kpi"><span className="kpi-icon value-icon"><Wallet size={18} /></span><p>Remaining stock value</p><strong>{loading ? '—' : formatCurrency(closingValue)}</strong><small>valued at current item cost</small></article>
    </div>

    <section className="report-panel">
      <div className="report-panel-heading"><div><h2>Year at a glance · {year}</h2><p>Monthly stock received and issued, with annual totals. Quantities are summed across items.</p></div><span className="report-count">{yearLoading ? 'Loading year…' : '12 months'}</span></div>
      <div className="table-responsive report-table-wrap"><table className="custom-table report-table"><thead><tr><th>Month</th><th className="numeric">Inward</th><th className="numeric">Outward</th><th className="numeric">Net change</th><th className="numeric">Inward cost</th><th className="numeric">Outward cost</th></tr></thead><tbody>
        {yearLoading ? <tr><td colSpan="6" className="report-empty">Loading annual movement…</td></tr> : <>{yearReports.map(r => <tr key={r.month}><td className="category-name-cell">{months[r.month - 1]?.label}</td><td className="numeric movement-in">+{formatNumber(r.totalInwardUnits)}</td><td className="numeric movement-out">−{formatNumber(r.totalOutwardUnits)}</td><td className="numeric strong-cell">{formatNumber(r.netStockChange)}</td><td className="numeric">{formatCurrency(r.totalInwardAmount)}</td><td className="numeric">{formatCurrency(r.totalOutwardAmount)}</td></tr>)}<tr className="report-total-row"><td>Year total</td><td className="numeric movement-in">+{formatNumber(annualTotals.inward)}</td><td className="numeric movement-out">−{formatNumber(annualTotals.outward)}</td><td className="numeric">{formatNumber(annualTotals.inward - annualTotals.outward)}</td><td className="numeric">{formatCurrency(annualTotals.inwardCost)}</td><td className="numeric">{formatCurrency(annualTotals.outwardCost)}</td></tr></>}
      </tbody></table></div>
    </section>

    <section className="report-panel">
      <div className="report-panel-heading"><div><h2>Category breakdown</h2><p>Monthly quantities and cost by category · {report?.monthName || `${months[month - 1].label} ${year}`}</p></div><span className="report-count"><Boxes size={15} /> {categoryRows.length} categories</span></div>
      <div className="table-responsive report-table-wrap"><table className="custom-table report-table"><thead><tr><th>Category</th><th className="numeric">Items</th><th className="numeric">Inward</th><th className="numeric">Outward</th><th className="numeric">Closing stock</th><th className="numeric">Inward cost</th><th className="numeric">Outward cost</th><th className="numeric">Stock value</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="8" className="report-empty">Loading monthly figures…</td></tr> : categoryRows.length === 0 ? <tr><td colSpan="8" className="report-empty">No inventory items match this report.</td></tr> : <>{categoryRows.map(row => <tr key={row.name}><td className="category-name-cell">{row.name}</td><td className="numeric">{formatNumber(row.items)}</td><td className="numeric movement-in">+{formatNumber(row.inward)}</td><td className="numeric movement-out">−{formatNumber(row.outward)}</td><td className="numeric strong-cell">{formatNumber(row.closing)}</td><td className="numeric">{formatCurrency(row.inwardCost)}</td><td className="numeric">{formatCurrency(row.outwardCost)}</td><td className="numeric strong-cell">{formatCurrency(row.remainingValue)}</td></tr>)}<tr className="report-total-row"><td>Total</td><td className="numeric">{itemRows.length}</td><td className="numeric">+{formatNumber(report.totalInwardUnits)}</td><td className="numeric">−{formatNumber(report.totalOutwardUnits)}</td><td className="numeric">{formatNumber(itemRows.reduce((s, i) => s + i.closingStock, 0))}</td><td className="numeric">{formatCurrency(report.totalInwardAmount)}</td><td className="numeric">{formatCurrency(report.totalOutwardAmount)}</td><td className="numeric">{formatCurrency(closingValue)}</td></tr></>}
      </tbody></table></div>
    </section>

    <section className="report-panel detail-panel">
      <div className="report-panel-heading"><div><h2>Item movement</h2><p>Opening balance + received − issued = closing balance</p></div></div>
      <div className="table-responsive report-table-wrap"><table className="custom-table report-table"><thead><tr><th>Item</th><th>Category</th><th className="numeric">Opening</th><th className="numeric">Inward</th><th className="numeric">Outward</th><th className="numeric">Closing</th><th className="numeric">Unit cost</th><th className="numeric">Stock value</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="8" className="report-empty">Loading item movement…</td></tr> : itemRows.length === 0 ? <tr><td colSpan="8" className="report-empty">No items to display.</td></tr> : itemRows.map(i => <tr key={i.materialId}><td><span className="report-item-name">{i.name}</span><span className="report-item-code">{i.itemCode}</span></td><td>{i.categoryName}</td><td className="numeric">{formatNumber(i.openingStock)} <span className="unit-label">{i.unitOfMeasure}</span></td><td className="numeric movement-in">+{formatNumber(i.inwardQuantity)}</td><td className="numeric movement-out">−{formatNumber(i.outwardQuantity)}</td><td className="numeric strong-cell">{formatNumber(i.closingStock)} <span className="unit-label">{i.unitOfMeasure}</span></td><td className="numeric">{formatCurrency(i.unitPrice)}</td><td className="numeric strong-cell">{formatCurrency(i.closingStock * i.unitPrice)}</td></tr>)}
      </tbody></table></div>
    </section>
    <p className="report-footnote">Remaining stock value uses each item’s current unit cost. Movement costs use the recorded transaction values.</p>
  </section>;
}
