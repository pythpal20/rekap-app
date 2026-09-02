import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function UserModal({ show, onHide, editingUser, form, setForm, onSave, loading }) {
  return (
    <Modal show={show} onHide={() => !loading && onHide()} centered>
      <Modal.Header closeButton={!loading}>
        <Modal.Title className="fw-bold fs-6">{editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSave}>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Nama Lengkap <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" placeholder="Contoh: Ahmad Fauzi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Alamat Email <span className="text-danger">*</span></Form.Label>
            <Form.Control type="email" placeholder="ahmad@gmail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>*Domain email akan diverifikasi otomatis.</Form.Text>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">No. WhatsApp / HP</Form.Label>
            <Form.Control type="text" placeholder="081234567890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Role Akses</Form.Label>
            <Form.Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="guest">Guest (Hanya Melihat Data)</option>
              <option value="admin">Admin (Input Pengambilan & Lihat Data)</option>
              <option value="superadmin">Superadmin (Semua Akses & CRUD Master)</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">
              Password {editingUser ? '(Kosongkan jika tidak ingin diubah)' : <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingUser} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" disabled={loading} onClick={onHide}>Batal</Button>
          <Button variant="primary" size="sm" type="submit" className="fw-bold" disabled={loading}>
            {loading ? 'Memverifikasi...' : 'Simpan User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}