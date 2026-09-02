import React from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import Select from 'react-select';
import TablePagination from '../components/common/TablePagination';

export default function InputPickupView({
    supplierId,
    setSupplierId,
    date,
    setDate,
    suppliers,
    productsForPickup,
    selectedProduct,
    setSelectedProduct,
    qty,
    setQty,
    cart,
    setCart,
    onAddToCart,
    onSubmitPickup,
    pageCart,
    setPageCart,
    rowsPerPage = 5
}) {
    const paginatedCart = cart.slice((pageCart - 1) * rowsPerPage, pageCart * rowsPerPage);
    const totalPagesCart = Math.ceil(cart.length / rowsPerPage);

    // Format data produk menjadi format Options Select2: [{ value, label }]
    const productOptions = (productsForPickup || []).map((p) => ({
        value: p.id,
        label: `${p.name} (${p.size}) - Rp ${Number(p.buy_price).toLocaleString('id-ID')}`
    }));

    // Cari objek opsi yang sedang terpilih berdasarkan selectedProduct ID
    const currentSelectedOption = productOptions.find((opt) => opt.value === Number(selectedProduct)) || null;

    // Kustom styling agar serasi dengan Bootstrap
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderRadius: '0.375rem',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : null,
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    return (
        <Container fluid className="p-0">
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white py-3 fw-bold border-bottom">
                    Pencatatan Pengambilan Barang Baru
                </Card.Header>
                <Card.Body className="p-3 p-md-4">
                    <Row className="g-3 mb-3">
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold small">Pilih Supplier / Konveksi</Form.Label>
                            <Form.Select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="bg-light"
                            >
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold small">Tanggal Pengambilan</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-light"
                            />
                        </Col>
                    </Row>

                    <div className="p-3 bg-light rounded-3 border mb-3">
                        <Row className="g-2 align-items-end">
                            {/* Dropdown Select2 dengan Pencarian / Filter Otomatis */}
                            <Col xs={12} md={6}>
                                <Form.Label className="small fw-bold text-muted">PILIH BARANG & UKURAN</Form.Label>
                                <Select
                                    options={productOptions}
                                    value={currentSelectedOption}
                                    onChange={(selectedOption) => setSelectedProduct(selectedOption ? selectedOption.value : '')}
                                    placeholder="-- Ketik / Cari Nama Barang atau Ukuran --"
                                    isClearable
                                    isSearchable
                                    noOptionsMessage={() => "Barang tidak ditemukan untuk supplier ini"}
                                    styles={customSelectStyles}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Form.Label className="small fw-bold text-muted">QTY (PCS)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                />
                            </Col>
                            <Col xs={6} md={3}>
                                <Button variant="primary" className="w-100 fw-semibold" onClick={onAddToCart}>
                                    + Tambah
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {cart.length > 0 && (
                        <Card className="border rounded-3 overflow-hidden mt-3">
                            <Table responsive bordered hover size="sm" className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Barang</th>
                                        <th>Ukuran</th>
                                        <th className="text-center">Qty</th>
                                        <th>Harga Satuan</th>
                                        <th>Subtotal</th>
                                        <th className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCart.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{item.name}</td>
                                            <td><Badge bg="secondary">{item.size}</Badge></td>
                                            <td className="text-center">{item.qty} pcs</td>
                                            <td className="text-nowrap">Rp {item.buy_price.toLocaleString('id-ID')}</td>
                                            <td className="fw-bold text-success text-nowrap">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                                >
                                                    Hapus
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <TablePagination
                                currentPage={pageCart}
                                totalPages={totalPagesCart}
                                onPageChange={setPageCart}
                                totalItems={cart.length}
                                itemsPerPage={rowsPerPage}
                            />
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 bg-light border-top">
                                <h6 className="mb-0 fw-bold">
                                    Total: <span className="text-success h5 mb-0 fw-bold ms-2">Rp {cart.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}</span>
                                </h6>
                                <Button variant="success" size="lg" className="fw-bold px-4 shadow-sm w-100 w-md-auto" onClick={onSubmitPickup}>
                                    💾 Simpan Pengambilan
                                </Button>
                            </div>
                        </Card>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}