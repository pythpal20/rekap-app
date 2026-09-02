import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function ProductModal({ show, onHide, editingProduct, form, setForm, suppliers, onSave }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold fs-6">{editingProduct ? 'Edit Barang' : 'Tambah Barang'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSave}>
                <Modal.Body>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Supplier</Form.Label>
                        <Form.Select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} required>
                            <option value="">-- Pilih Supplier --</option>
                            {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Nama Barang</Form.Label>
                        <Form.Control type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Ukuran</Form.Label>
                        <Form.Control type="text" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small fw-semibold">Harga Modal (Rp)</Form.Label>
                        <Form.Control type="number" value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={onHide}>Batal</Button>
                    <Button variant="primary" size="sm" type="submit" className="fw-bold">Simpan</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}