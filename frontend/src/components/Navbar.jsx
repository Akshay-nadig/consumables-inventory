import React from 'react';
import { 
  Boxes, 
  LayoutDashboard, 
  ListFilter, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  FileBarChart2, 
  Plus, 
  RotateCcw,
  Server,
  Sparkles
} from 'lucide-react';
import { resetDemoData } from '../services/api';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAddMaterial, 
  onOpenInward, 
  onOpenOutward,
  isBackendOnline 
}) {
  return (
    <header className="app-header">
      <div className="container-custom header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">
            <Boxes size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-title">Inventory</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Inventory management
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <ListFilter size={16} />
            <span>Materials Catalog</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <ArrowDownToLine size={16} />
            <span>Inward / Outward Logs</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileBarChart2 size={16} />
            <span>Monthly Movement Report</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="header-actions">
          {/* Backend Status indicator */}
          <div className="connection-pill" title={isBackendOnline ? "Connected to ASP.NET Core API with SQL Server" : "Operating in Standalone Interactive Demo Mode"}>
            <span className={`status-dot ${isBackendOnline ? 'online' : 'demo'}`}></span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {isBackendOnline ? 'API Connected' : 'Demo Mode'}
            </span>
          </div>

          <button 
            className="btn btn-inward btn-sm"
            onClick={onOpenInward}
            title="Receive incoming consumable stock"
          >
            <ArrowDownToLine size={15} />
            <span>Inward</span>
          </button>

          <button 
            className="btn btn-outward btn-sm"
            onClick={onOpenOutward}
            title="Issue consumable stock to department/employee"
          >
            <ArrowUpFromLine size={15} />
            <span>Outward</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenAddMaterial}
            title="Register a new consumable item"
          >
            <Plus size={15} />
            <span>New Material</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={resetDemoData}
            title="Reload default demo data"
            style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
