import React, { useState, useEffect, useCallback } from 'react';
import axios, { API_BASE } from './api/axiosConfig';

// Layout & Views
import Sidebar from './components/layout/Sidebar';
import DashboardView from './views/DashboardView';
import InputPickupView from './views/InputPickupView';
import HistoryPickupView from './views/HistoryPickupView';
import ProductCatalogView from './views/ProductCatalogView';
import SupplierView from './views/SupplierView';
import UserManagementView from './views/UserManagementView';

// Modals
import PaymentModal from './components/modals/PaymentModal';
import EditDateModal from './components/modals/EditDateModal';
import ProductModal from './components/modals/ProductModal';
import SupplierModal from './components/modals/SupplierModal';
import UserModal from './components/modals/UserModal';
import HistoryModal from './components/modals/HistoryModal';

import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function App() {
  // 1. State Autentikasi
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sirekap_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 2. State Navigasi & Layout
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openRekapSubmenu, setOpenRekapSubmenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 3. State Master Data
  const [suppliers, setSuppliers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productsForPickup, setProductsForPickup] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // 4. State Form Pengambilan (Input Pickup)
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [pageCart, setPageCart] = useState(1);

  // 5. State Modal Pelunasan & Batch Pay
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetPayPickups, setTargetPayPickups] = useState([]);
  const [proofFile, setProofFile] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedPickupIds, setSelectedPickupIds] = useState([]);

  // 6. State Modal Edit Tanggal
  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [targetEditDatePickup, setTargetEditDatePickup] = useState(null);
  const [newPickupDate, setNewPickupDate] = useState('');
  const [editDateLoading, setEditDateLoading] = useState(false);

  // 7. State Modal Master Data (Produk, Supplier, User, History)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ supplier_id: '', name: '', size: '', buy_price: '' });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '' });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'guest', password: '' });
  const [userFormLoading, setUserFormLoading] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [histories, setHistories] = useState([]);

  // Hak Akses Role
  const isSuperadmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const canAddPickup = isSuperadmin || isAdmin;

  // Set Document Title
  useEffect(() => {
    document.title = "SiRekap - InspireShopi";
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('sirekap_token');
    localStorage.removeItem('sirekap_user');
    setCurrentUser(null);
  }, []);

  // Fetch API Functions
  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(res.data);
      if (res.data.length > 0) {
        setSupplierId((prevId) => (prevId ? prevId : res.data[0].id));
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
    }
  }, [handleLogout]);

  const fetchPickups = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/pickups`);
      setPickups(res.data);
      setSelectedPickupIds([]);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
    }
  }, [handleLogout]);

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/all-products`);
      setAllProducts(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
    }
  }, [handleLogout]);

  const fetchUsers = useCallback(async () => {
    if (!isSuperadmin) return;
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [isSuperadmin]);

  useEffect(() => {
    if (currentUser) {
      fetchSuppliers();
      fetchPickups();
      fetchAllProducts();
      fetchUsers();
    }
  }, [currentUser, fetchSuppliers, fetchPickups, fetchAllProducts, fetchUsers]);

  // Load Produk sesuai Supplier yang dipilih di Form Input
  useEffect(() => {
    if (supplierId && currentUser) {
      axios.get(`${API_BASE}/products/${supplierId}`)
        .then((res) => setProductsForPickup(res.data))
        .catch(() => setProductsForPickup([]));
      setCart([]);
    } else {
      setProductsForPickup([]);
    }
  }, [supplierId, currentUser]);

  // Auth Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, loginForm);
      localStorage.setItem('sirekap_token', res.data.token);
      localStorage.setItem('sirekap_user', JSON.stringify(res.data.user));
      setCurrentUser(res.data.user);
      setActiveMenu('dashboard');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Email atau password salah!');
    } finally {
      setAuthLoading(false);
    }
  };

  // Cart & Input Pickup Handlers
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const prod = productsForPickup.find((p) => p.id === parseInt(selectedProduct));
    if (!prod) return;
    const subtotal = Number(prod.buy_price) * parseInt(qty);
    const existingIndex = cart.findIndex((item) => item.product_id === prod.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += parseInt(qty);
      updated[existingIndex].subtotal += subtotal;
      setCart(updated);
    } else {
      setCart([...cart, { product_id: prod.id, name: prod.name, size: prod.size, buy_price: Number(prod.buy_price), qty: parseInt(qty), subtotal }]);
    }
    setSelectedProduct('');
    setQty(1);
  };

  const handleSubmitPickup = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post(`${API_BASE}/pickups`, { supplier_id: supplierId, pickup_date: date, items: cart });
      setCart([]);
      fetchPickups();
      alert('Pengambilan barang berhasil disimpan!');
      setActiveMenu('rekap-riwayat');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan pengambilan');
    }
  };

  // Payment Handlers
  const handleOpenSinglePay = (pickup) => {
    setTargetPayPickups([pickup]);
    setProofFile(null);
    setShowPayModal(true);
  };

  const handleOpenBatchPay = () => {
    const selected = pickups.filter(p => selectedPickupIds.includes(p.id));
    setTargetPayPickups(selected);
    setProofFile(null);
    setShowPayModal(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!proofFile) return alert('Pilih file bukti transfer!');
    const formData = new FormData();
    formData.append('proof', proofFile);
    formData.append('ids', JSON.stringify(targetPayPickups.map(p => p.id)));

    setPayLoading(true);
    try {
      await axios.patch(`${API_BASE}/pickups/batch-pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowPayModal(false);
      fetchPickups();
      alert('Pelunasan berhasil dikonfirmasi!');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan pelunasan');
    } finally {
      setPayLoading(false);
    }
  };

  const handleUnpay = async (pickupId) => {
    if (window.confirm('Kembalikan status transaksi menjadi BELUM LUNAS?')) {
      try {
        await axios.patch(`${API_BASE}/pickups/${pickupId}/unpay`);
        fetchPickups();
      } catch (err) {
        alert('Gagal mengubah status');
      }
    }
  };

  // Edit Tanggal Handlers
  const handleOpenEditDate = (pickup) => {
    setTargetEditDatePickup(pickup);
    const d = new Date(pickup.pickup_date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewPickupDate(`${year}-${month}-${day}`);
    setShowEditDateModal(true);
  };

  const handleSavePickupDate = async () => {
    if (!newPickupDate || !targetEditDatePickup) return;
    setEditDateLoading(true);
    try {
      await axios.patch(`${API_BASE}/pickups/${targetEditDatePickup.id}/date`, {
        pickup_date: newPickupDate
      });
      setShowEditDateModal(false);
      fetchPickups();
      alert('Tanggal pengambilan berhasil diperbarui!');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengubah tanggal');
    } finally {
      setEditDateLoading(false);
    }
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ supplier_id: suppliers[0]?.id || '', name: '', size: '', buy_price: '' });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({ supplier_id: prod.supplier_id, name: prod.name, size: prod.size, buy_price: prod.buy_price });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) await axios.put(`${API_BASE}/products/${editingProduct.id}`, productForm);
      else await axios.post(`${API_BASE}/products`, productForm);
      setShowProductModal(false);
      fetchAllProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan produk');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Hapus produk ini?')) {
      try {
        await axios.delete(`${API_BASE}/products/${id}`);
        fetchAllProducts();
      } catch (err) {
        alert('Gagal menghapus produk');
      }
    }
  };

  const handleViewHistory = async (prod) => {
    setHistoryProduct(prod);
    try {
      const res = await axios.get(`${API_BASE}/products/${prod.id}/histories`);
      setHistories(res.data);
      setShowHistoryModal(true);
    } catch (err) {
      alert('Gagal mengambil riwayat perubahan');
    }
  };

  // Supplier Handlers
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({ name: '', contact: '' });
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupplierForm({ name: sup.name, contact: sup.contact || '' });
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) await axios.put(`${API_BASE}/suppliers/${editingSupplier.id}`, supplierForm);
      else await axios.post(`${API_BASE}/suppliers`, supplierForm);
      setShowSupplierModal(false);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan supplier');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Hapus supplier ini?')) {
      try {
        await axios.delete(`${API_BASE}/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert('Gagal menghapus supplier');
      }
    }
  };

  // User Handlers
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', phone: '', role: 'guest', password: '' });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    try {
      if (editingUser) {
        await axios.put(`${API_BASE}/users/${editingUser.id}`, userForm);
        alert('User berhasil diperbarui!');
      } else {
        await axios.post(`${API_BASE}/users`, userForm);
        alert('User baru berhasil ditambahkan!');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan user');
    } finally {
      setUserFormLoading(false);
    }
  };

  const handleToggleUserStatus = async (userItem) => {
    const newStatus = userItem.status === 'aktif' ? 'nonaktif' : 'aktif';
    if (window.confirm(`Ubah status ${userItem.name} menjadi ${newStatus}?`)) {
      try {
        await axios.patch(`${API_BASE}/users/${userItem.id}/status`, { status: newStatus });
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.error || 'Gagal mengubah status');
      }
    }
  };

  const totalHutang = pickups.filter(p => p.status === 'UNPAID').reduce((sum, p) => sum + Number(p.total_amount), 0);
  const countBelumLunas = pickups.filter(p => p.status === 'UNPAID').length;

  // Render Login Page jika Belum Terotentikasi
  if (!currentUser) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '420px', width: '100%' }}>
          <div className="bg-dark text-white p-4 text-center">
            <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow" style={{ width: '56px', height: '56px' }}>
              <i className="bi bi-box-seam-fill fs-3 text-white"></i>
            </div>
            <h4 className="fw-bold mb-0">SiRekap</h4>
            <small className="text-secondary">InspireShopi - Portal Masuk</small>
          </div>
          <Card.Body className="p-4">
            <h5 className="fw-bold text-center mb-3">Login Pengguna</h5>
            {authError && <Alert variant="danger" className="small py-2">{authError}</Alert>}
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Alamat Email</Form.Label>
                <Form.Control type="email" placeholder="admin@inspireshopi.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">Password</Form.Label>
                <Form.Control type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 fw-bold py-2 shadow-sm" disabled={authLoading}>
                {authLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Render Layout Aplikasi Utama
  return (
    <div className="d-flex position-relative" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {isMobileOpen && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" style={{ zIndex: 1040 }} onClick={() => setIsMobileOpen(false)} />}

      <Sidebar 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        openRekapSubmenu={openRekapSubmenu}
        setOpenRekapSubmenu={setOpenRekapSubmenu}
        canAddPickup={canAddPickup}
        isSuperadmin={isSuperadmin}
        countBelumLunas={countBelumLunas}
        allProductsCount={allProducts.length}
        suppliersCount={suppliers.length}
        usersCount={usersList.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <header className="bg-white border-bottom px-3 px-md-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-dark" size="sm" className="d-md-none border-0" onClick={() => setIsMobileOpen(true)}>
              <i className="bi bi-list fs-4"></i>
            </Button>
            <h5 className="mb-0 fw-bold text-dark text-capitalize">{activeMenu.replace('-', ' ')}</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">{currentUser.name} ({currentUser.role})</span>
            <Button variant="outline-danger" size="sm" onClick={handleLogout}>Keluar</Button>
          </div>
        </header>

        <main className="p-3 p-md-4 overflow-auto flex-grow-1">
          {activeMenu === 'dashboard' && (
            <DashboardView 
              currentUser={currentUser}
              pickups={pickups}
              allProducts={allProducts}
              suppliers={suppliers}
              countBelumLunas={countBelumLunas}
              onNavigate={setActiveMenu}
            />
          )}

          {activeMenu === 'rekap-input' && canAddPickup && (
            <InputPickupView 
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              date={date}
              setDate={setDate}
              suppliers={suppliers}
              productsForPickup={productsForPickup}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              qty={qty}
              setQty={setQty}
              cart={cart}
              setCart={setCart}
              onAddToCart={handleAddToCart}
              onSubmitPickup={handleSubmitPickup}
              pageCart={pageCart}
              setPageCart={setPageCart}
            />
          )}

          {activeMenu === 'rekap-riwayat' && (
            <HistoryPickupView 
              pickups={pickups}
              suppliers={suppliers}
              isSuperadmin={isSuperadmin}
              isAdmin={isAdmin}
              totalHutang={totalHutang}
              onOpenSinglePay={handleOpenSinglePay}
              onOpenBatchPay={handleOpenBatchPay}
              onUnpay={handleUnpay}
              onOpenEditDate={handleOpenEditDate}
              selectedPickupIds={selectedPickupIds}
              setSelectedPickupIds={setSelectedPickupIds}
            />
          )}

          {activeMenu === 'barang' && (
            <ProductCatalogView 
              allProducts={allProducts}
              suppliers={suppliers}
              isSuperadmin={isSuperadmin}
              onOpenAddProduct={handleOpenAddProduct}
              onOpenEditProduct={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onViewHistory={handleViewHistory}
            />
          )}

          {activeMenu === 'supplier' && (
            <SupplierView 
              suppliers={suppliers}
              isSuperadmin={isSuperadmin}
              onOpenAddSupplier={handleOpenAddSupplier}
              onOpenEditSupplier={handleOpenEditSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {activeMenu === 'users' && isSuperadmin && (
            <UserManagementView 
              usersList={usersList}
              currentUserId={currentUser.id}
              onOpenAddUser={handleOpenAddUser}
              onOpenEditUser={handleOpenEditUser}
              onToggleStatus={handleToggleUserStatus}
            />
          )}
        </main>
      </div>

      {/* Semua Modal Terpasang Rapi */}
      <PaymentModal 
        show={showPayModal}
        onHide={() => setShowPayModal(false)}
        targetPickups={targetPayPickups}
        proofFile={proofFile}
        setProofFile={setProofFile}
        onConfirm={handleConfirmPayment}
        loading={payLoading}
      />

      <EditDateModal
        show={showEditDateModal}
        onHide={() => setShowEditDateModal(false)}
        pickup={targetEditDatePickup}
        newDate={newPickupDate}
        setNewDate={setNewPickupDate}
        onSave={handleSavePickupDate}
        loading={editDateLoading}
      />

      <ProductModal 
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        editingProduct={editingProduct}
        form={productForm}
        setForm={setProductForm}
        suppliers={suppliers}
        onSave={handleSaveProduct}
      />

      <SupplierModal 
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        editingSupplier={editingSupplier}
        form={supplierForm}
        setForm={setSupplierForm}
        onSave={handleSaveSupplier}
      />

      <UserModal 
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        editingUser={editingUser}
        form={userForm}
        setForm={setUserForm}
        onSave={handleSaveUser}
        loading={userFormLoading}
      />

      <HistoryModal 
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        product={historyProduct}
        histories={histories}
      />
    </div>
  );
}