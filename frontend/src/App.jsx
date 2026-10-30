import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardTab from './components/DashboardTab';
import MaterialsTab from './components/MaterialsTab';
import TransactionsTab from './components/TransactionsTab';
import MovementReport from './components/MovementReport';
import MaterialModal from './components/MaterialModal';
import InwardModal from './components/InwardModal';
import OutwardModal from './components/OutwardModal';
import CostHistoryModal from './components/CostHistoryModal';
import {
  getCategories,
  getMaterials,
  getTransactions,
  getDashboardSummary,
  createMaterial,
  updateMaterial,
  recordInward,
  recordOutward,
  checkBackendConnection,
  isBackendConnected
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Core Data State
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState(null);

  const [isCostHistoryOpen, setIsCostHistoryOpen] = useState(false);
  const [materialForCostHistory, setMaterialForCostHistory] = useState(null);

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [preSelectedInwardMat, setPreSelectedInwardMat] = useState(null);

  const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false);
  const [preSelectedOutwardMat, setPreSelectedOutwardMat] = useState(null);

  // Success Notification Banner
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Load All Core Data
  const loadData = async () => {
    try {
      const online = await checkBackendConnection();
      setIsBackendOnline(online);

      const [cats, mats, txs, summary] = await Promise.all([
        getCategories(),
        getMaterials(),
        getTransactions(),
        getDashboardSummary()
      ]);

      setCategories(cats || []);
      setMaterials(mats || []);
      setTransactions(txs || []);
      setDashboardSummary(summary || null);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll backend health every 15s
    const interval = setInterval(async () => {
      const online = await checkBackendConnection();
      setIsBackendOnline(online);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleOpenAddMaterial = () => {
    setMaterialToEdit(null);
    setIsMaterialModalOpen(true);
  };

  const handleEditMaterial = (material) => {
    setMaterialToEdit(material);
    setIsMaterialModalOpen(true);
  };

  const handleOpenCostHistory = (material) => {
    setMaterialForCostHistory(material);
    setIsCostHistoryOpen(true);
  };

  const handleSaveMaterial = async (materialDto) => {
    if (materialDto.id) {
      await updateMaterial(materialDto.id, materialDto);
      showToast(`Consumable item "${materialDto.name}" updated successfully!`);
    } else {
      await createMaterial(materialDto);
      showToast(`Consumable item "${materialDto.name}" successfully registered!`);
    }
    await loadData();
  };

  const handleOpenInward = (mat = null) => {
    setPreSelectedInwardMat(mat);
    setIsInwardModalOpen(true);
  };

  const handleRecordInward = async (inwardDto) => {
    const res = await recordInward(inwardDto);
    await loadData();
    const item = materials.find(m => m.id === inwardDto.materialId);
    showToast(`Successfully received ${inwardDto.quantity} ${item?.unitOfMeasure || 'units'} of inward stock!`);
  };

  const handleOpenOutward = (mat = null) => {
    setPreSelectedOutwardMat(mat);
    setIsOutwardModalOpen(true);
  };

  const handleRecordOutward = async (outwardDto) => {
    const res = await recordOutward(outwardDto);
    await loadData();
    const item = materials.find(m => m.id === outwardDto.materialId);
    showToast(`Successfully issued ${outwardDto.quantity} ${item?.unitOfMeasure || 'units'} outward to ${outwardDto.departmentOrEmployee}!`);
  };

  const handleSelectCategoryFromDashboard = (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveTab('materials');
  };

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddMaterial={handleOpenAddMaterial}
        onOpenInward={() => handleOpenInward(null)}
        onOpenOutward={() => handleOpenOutward(null)}
        isBackendOnline={isBackendOnline}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
          border: '1px solid #34d399',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-wrapper">
        <div className="container-custom">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: '0.5rem' }}>
                Loading Consumables Inventory System...
              </div>
              <div>Initializing 16 categories, available stock, and movement records</div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <DashboardTab
                  summary={dashboardSummary}
                  categories={categories}
                  onSelectCategory={handleSelectCategoryFromDashboard}
                  onQuickInward={handleOpenInward}
                  onNavigateMaterials={() => setActiveTab('materials')}
                  onNavigateReport={() => setActiveTab('reports')}
                />
              )}

              {/* Materials Catalog Tab */}
              {activeTab === 'materials' && (
                <MaterialsTab
                  materials={materials}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onOpenAddMaterial={handleOpenAddMaterial}
                  onOpenInward={handleOpenInward}
                  onOpenOutward={handleOpenOutward}
                  onEditMaterial={handleEditMaterial}
                  onOpenCostHistory={handleOpenCostHistory}
                />
              )}

              {/* Inward / Outward Movement Logs Tab */}
              {activeTab === 'transactions' && (
                <TransactionsTab
                  transactions={transactions}
                  categories={categories}
                  materials={materials}
                  onOpenInward={handleOpenInward}
                  onOpenOutward={handleOpenOutward}
                />
              )}

              {/* Monthly Movement Report Tab */}
              {activeTab === 'reports' && (
                <MovementReport
                  categories={categories}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Add / Edit Material Modal */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSubmit={handleSaveMaterial}
        categories={categories}
        initialMaterial={materialToEdit}
      />

      {/* Inward Modal */}
      <InwardModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onSubmit={handleRecordInward}
        materials={materials}
        preSelectedMaterial={preSelectedInwardMat}
      />

      {/* Outward Modal */}
      <OutwardModal
        isOpen={isOutwardModalOpen}
        onClose={() => setIsOutwardModalOpen(false)}
        onSubmit={handleRecordOutward}
        materials={materials}
        preSelectedMaterial={preSelectedOutwardMat}
      />

      {/* Cost History & Valuation Modal */}
      <CostHistoryModal
        isOpen={isCostHistoryOpen}
        onClose={() => setIsCostHistoryOpen(false)}
        material={materialForCostHistory}
      />
    </div>
  );
}
