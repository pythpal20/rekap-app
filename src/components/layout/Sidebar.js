import React from 'react';
import { Nav, Badge, Button } from 'react-bootstrap';

export default function Sidebar({
    isMobileOpen,
    setIsMobileOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activeMenu,
    setActiveMenu,
    openRekapSubmenu,
    setOpenRekapSubmenu,
    canAddPickup,
    isSuperadmin,
    countBelumLunas,
    allProductsCount,
    suppliersCount,
    usersCount,
    currentUser,
    onLogout
}) {
    const isSupplier = currentUser?.role === 'supplier';

    const handleNav = (menu) => {
        setActiveMenu(menu);
        setIsMobileOpen(false);
        if (!menu.startsWith('rekap')) setOpenRekapSubmenu(false);
    };

    return (
        <aside
            className={`d-flex flex-column text-white shadow ${isMobileOpen ? 'position-fixed top-0 start-0 h-100' : 'd-none d-md-flex'}`}
            style={{
                width: isSidebarCollapsed ? '75px' : '260px',
                minWidth: isSidebarCollapsed ? '75px' : '260px',
                transition: 'all 0.25s ease-in-out',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                zIndex: 1050
            }}
        >
            {/* Header Sidebar dengan Tombol Burger */}
            <div
                className={`d-flex align-items-center border-bottom border-secondary border-opacity-25 ${isSidebarCollapsed ? 'justify-content-center px-0 flex-column gap-1' : 'justify-content-between px-3'}`}
                style={{ height: '70px' }}
            >
                {!isSidebarCollapsed ? (
                    <>
                        <div className="d-flex align-items-center gap-2 overflow-hidden">
                            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '38px', height: '38px', minWidth: '38px' }}>
                                <i className="bi bi-box-seam-fill fs-5"></i>
                            </div>
                            <div className="text-truncate">
                                <h5 className="fw-bold mb-0 text-white tracking-wide">SiRekap</h5>
                                <small className="text-secondary" style={{ fontSize: '0.7rem' }}>InspireShopi</small>
                            </div>
                        </div>

                        {/* Burger Button untuk Collapse Sidebar (Desktop) */}
                        <Button
                            variant="link"
                            className="text-white-50 text-hover-white p-1 d-none d-md-inline-flex align-items-center justify-content-center text-decoration-none"
                            onClick={() => setIsSidebarCollapsed(true)}
                            title="Perkecil Sidebar"
                        >
                            <i className="bi bi-list fs-4"></i>
                        </Button>
                    </>
                ) : (
                    /* Burger Button untuk Expand Sidebar saat kondisi Collapsed (Desktop) */
                    <Button
                        variant="link"
                        className="text-white p-0 border-0 d-none d-md-inline-flex align-items-center justify-content-center text-decoration-none"
                        onClick={() => setIsSidebarCollapsed(false)}
                        title="Perluas Sidebar"
                    >
                        <i className="bi bi-list fs-3 text-warning"></i>
                    </Button>
                )}

                {/* Tombol Tutup (Mobile) */}
                <Button
                    variant="link"
                    className="text-white d-md-none p-0 text-decoration-none"
                    onClick={() => setIsMobileOpen(false)}
                    title="Tutup Menu"
                >
                    <i className="bi bi-x-lg fs-5"></i>
                </Button>
            </div>

            <div className="p-2 flex-grow-1 overflow-auto">
                {!isSidebarCollapsed && (
                    <div className="text-uppercase text-secondary fw-bold px-3 py-2" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
                        Menu Utama
                    </div>
                )}

                <Nav className="flex-column gap-1">
                    {/* 1. DASHBOARD */}
                    <button
                        onClick={() => handleNav('dashboard')}
                        className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 ${activeMenu === 'dashboard' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                        title={isSidebarCollapsed ? 'Dashboard' : ''}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-speedometer2 fs-5 text-warning"></i>
                            {!isSidebarCollapsed && <span className="small">Dashboard</span>}
                        </div>
                    </button>

                    {/* 2. REKAP PENGAMBILAN */}
                    {isSupplier ? (
                        <button
                            onClick={() => handleNav('rekap-riwayat')}
                            className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'rekap-riwayat' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                            title={isSidebarCollapsed ? 'Riwayat & Tagihan' : ''}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-journal-text fs-5 text-info"></i>
                                {!isSidebarCollapsed && <span className="small">Riwayat & Tagihan</span>}
                            </div>
                            {!isSidebarCollapsed && countBelumLunas > 0 && (
                                <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>{countBelumLunas}</Badge>
                            )}
                        </button>
                    ) : (
                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
                                    if (!activeMenu.startsWith('rekap')) {
                                        setActiveMenu(canAddPickup ? 'rekap-input' : 'rekap-riwayat');
                                        setOpenRekapSubmenu(true);
                                    } else {
                                        setOpenRekapSubmenu(!openRekapSubmenu);
                                    }
                                }}
                                className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu.startsWith('rekap') ? 'bg-primary bg-opacity-25 text-white fw-bold' : 'text-light text-opacity-75'}`}
                                title={isSidebarCollapsed ? 'Rekap Pengambilan' : ''}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-journal-text fs-5 text-info"></i>
                                    {!isSidebarCollapsed && <span className="small">Rekap Pengambilan</span>}
                                </div>
                                {!isSidebarCollapsed && (
                                    <i className={`bi ${activeMenu.startsWith('rekap') && openRekapSubmenu ? 'bi-chevron-up' : 'bi-chevron-down'} text-secondary`} style={{ fontSize: '0.75rem' }}></i>
                                )}
                            </button>

                            {activeMenu.startsWith('rekap') && openRekapSubmenu && !isSidebarCollapsed && (
                                <div className="ps-3 pe-1 py-1 d-flex flex-column gap-1 mt-1">
                                    {canAddPickup && (
                                        <button
                                            onClick={() => handleNav('rekap-input')}
                                            className={`btn text-start px-3 py-2 rounded-3 border-0 small d-flex align-items-center gap-2 ${activeMenu === 'rekap-input' ? 'bg-primary text-white fw-semibold shadow-sm' : 'text-white-50'}`}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                            <span>Input Pengambilan</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleNav('rekap-riwayat')}
                                        className={`btn text-start px-3 py-2 rounded-3 border-0 small d-flex align-items-center justify-content-between ${activeMenu === 'rekap-riwayat' ? 'bg-primary text-white fw-semibold shadow-sm' : 'text-white-50'}`}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-clock-history"></i>
                                            <span>Riwayat & Hutang</span>
                                        </div>
                                        {countBelumLunas > 0 && <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>{countBelumLunas}</Badge>}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. KELOLA BARANG */}
                    <button
                        onClick={() => handleNav('barang')}
                        className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'barang' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                        title={isSidebarCollapsed ? 'Kelola Barang' : ''}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-tag-fill fs-5 text-warning"></i>
                            {!isSidebarCollapsed && <span className="small">{isSupplier ? 'Data Barang Saya' : 'Kelola Barang'}</span>}
                        </div>
                        {!isSidebarCollapsed && <Badge bg="secondary" pill style={{ fontSize: '0.65rem' }}>{allProductsCount}</Badge>}
                    </button>

                    <button
                        onClick={() => handleNav('rekomendasi-modal')}
                        className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'rekomendasi-modal' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                        title={isSidebarCollapsed ? 'Rekomendasi Restock' : ''}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-calculator-fill fs-5 text-info"></i>
                            {!isSidebarCollapsed && <span className="small">Rekomendasi Modal</span>}
                        </div>
                        {!isSidebarCollapsed && <Badge bg="info" pill style={{ fontSize: '0.65rem' }}>Auto</Badge>}
                    </button>

                    {/* 4. KELOLA SUPPLIER (Hanya Non-Supplier) */}
                    {!isSupplier && (
                        <button
                            onClick={() => handleNav('supplier')}
                            className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'supplier' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                            title={isSidebarCollapsed ? 'Kelola Supplier' : ''}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-building fs-5 text-success"></i>
                                {!isSidebarCollapsed && <span className="small">Kelola Supplier</span>}
                            </div>
                            {!isSidebarCollapsed && <Badge bg="secondary" pill style={{ fontSize: '0.65rem' }}>{suppliersCount}</Badge>}
                        </button>
                    )}

                    {/* 5. RISET TREN PASAR (Hanya Non-Supplier) */}
                    {/* {!isSupplier && (
                        <button
                            onClick={() => handleNav('marketplace-trends')}
                            className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'marketplace-trends' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                            title={isSidebarCollapsed ? 'Riset Tren Pasar' : ''}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-graph-up-arrow fs-5 text-danger"></i>
                                {!isSidebarCollapsed && <span className="small">Riset Tren Pasar</span>}
                            </div>
                            {!isSidebarCollapsed && <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>Hot</Badge>}
                        </button>
                    )} */}

                    {/* 6. KELOLA USER (Superadmin Only) */}
                    {isSuperadmin && (
                        <button
                            onClick={() => handleNav('users')}
                            className={`w-100 btn text-start d-flex align-items-center ${isSidebarCollapsed ? 'justify-content-center px-0' : 'justify-content-between px-3'} py-2 rounded-3 border-0 mt-1 ${activeMenu === 'users' ? 'bg-primary text-white fw-bold shadow-sm' : 'text-light text-opacity-75'}`}
                            title={isSidebarCollapsed ? 'Kelola User' : ''}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-people-fill fs-5 text-info"></i>
                                {!isSidebarCollapsed && <span className="small">Kelola User</span>}
                            </div>
                            {!isSidebarCollapsed && <Badge bg="secondary" pill style={{ fontSize: '0.65rem' }}>{usersCount}</Badge>}
                        </button>
                    )}
                </Nav>
            </div>

            {/* Footer Profil User */}
            <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-30">
                {!isSidebarCollapsed ? (
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="overflow-hidden me-2">
                            <div className="fw-bold small text-truncate">{currentUser?.name}</div>
                            <Badge
                                bg={
                                    currentUser?.role === 'superadmin' ? 'danger' :
                                        currentUser?.role === 'admin' ? 'primary' :
                                            currentUser?.role === 'supplier' ? 'warning text-dark' :
                                                'secondary'
                                }
                                style={{ fontSize: '0.65rem' }}
                            >
                                {currentUser?.role ? currentUser.role.toUpperCase() : 'USER'}
                            </Badge>
                        </div>
                        <Button variant="outline-danger" size="sm" className="px-2 py-1" onClick={onLogout} title="Logout">
                            <i className="bi bi-box-arrow-right"></i>
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline-danger" size="sm" className="w-100 border-0 p-1" onClick={onLogout} title="Logout">
                        <i className="bi bi-box-arrow-right fs-5"></i>
                    </Button>
                )}
            </div>
        </aside>
    );
}