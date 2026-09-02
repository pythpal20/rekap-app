import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function SupplierModal({ show, onHide, editingSupplier, form, setForm, onSave }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-6">{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSave}>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Nama Supplier</Form.Label>
            <Form.Control type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Kontak</Form.Label>
            <Form.Control type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
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