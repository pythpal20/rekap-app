import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, InputGroup } from 'react-bootstrap';
import TablePagination from '../components/common/TablePagination';

export default function UserManagementView({
    usersList,
    currentUserId,
    onOpenAddUser,
    onOpenEditUser,
    onToggleStatus
}) {
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [filterUserRole, setFilterUserRole] = useState('');
    const [filterUserStatus, setFilterUserStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const filteredUsers = usersList.filter((u) => {
        const query = searchUserQuery.toLowerCase();
        const matchSearch =
            (u.name && u.name.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.phone && u.phone.toLowerCase().includes(query));

        const matchRole = filterUserRole === '' || u.role === filterUserRole;
        const matchStatus = filterUserStatus === '' || u.status === filterUserStatus;
        return matchSearch && matchRole && matchStatus;
    });

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPagesUsers = Math.ceil(filteredUsers.length / rowsPerPage);

    return (
        <Container fluid className="p-0">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                <div>
                    <h5 className="fw-bold mb-0">Pengelolaan Pengguna Sistem</h5>
                    <small className="text-muted">Kelola akun, hak akses, dan status login pengguna</small>
                </div>
                <Button variant="primary" className="fw-bold align-self-start align-self-sm-auto" onClick={onOpenAddUser}>
                    + Tambah User Baru
                </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-3">
                    <Row className="g-2">
                        <Col xs={12} md={6}>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-light"><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Cari nama, email, atau nomor HP..."
                                    value={searchUserQuery}
                                    onChange={(e) => { setSearchUserQuery(e.target.value); setCurrentPage(1); }}
                                />
                                {searchUserQuery && (
                                    <Button variant="outline-secondary" onClick={() => { setSearchUserQuery(''); setCurrentPage(1); }}>
                                        Reset
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Select size="sm" value={filterUserRole} onChange={(e) => { setFilterUserRole(e.target.value); setCurrentPage(1); }}>
                                <option value="">-- Semua Role --</option>
                                <option value="superadmin">Superadmin</option>
                                <option value="admin">Admin</option>
                                <option value="guest">Guest</option>
                            </Form.Select>
                        </Col>
                        <Col xs={6} md={3}>
                            <Form.Select size="sm" value={filterUserStatus} onChange={(e) => { setFilterUserStatus(e.target.value); setCurrentPage(1); }}>
                                <option value="">-- Semua Status --</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-semibold small">Daftar Pengguna</span>
                    <Badge bg="secondary">{filteredUsers.length} total user</Badge>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-3 ps-md-4">Nama Lengkap</th>
                                <th>Email</th>
                                <th>No. WhatsApp / HP</th>
                                <th>Role Akses</th>
                                <th>Status</th>
                                <th className="text-center pe-3 pe-md-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Tidak ditemukan data pengguna yang sesuai.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id}>
                                        <td className="ps-3 ps-md-4 fw-semibold text-nowrap">{u.name}</td>
                                        <td className="text-nowrap">{u.email}</td>
                                        <td className="text-nowrap">{u.phone || '-'}</td>
                                        <td>
                                            <Badge bg={u.role === 'superadmin' ? 'danger' : u.role === 'admin' ? 'primary' : 'secondary'}>
                                                {u.role.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={u.status === 'aktif' ? 'success' : 'danger'}>
                                                {u.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'}
                                            </Badge>
                                        </td>
                                        <td className="text-center pe-3 pe-md-4 text-nowrap">
                                            <Button size="sm" variant="outline-primary" className="me-1" onClick={() => onOpenEditUser(u)}>
                                                Edit
                                            </Button>
                                            {u.id !== currentUserId && (
                                                <Button
                                                    size="sm"
                                                    variant={u.status === 'aktif' ? 'outline-danger' : 'outline-success'}
                                                    onClick={() => onToggleStatus(u)}
                                                >
                                                    {u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPagesUsers}
                    onPageChange={setCurrentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={rowsPerPage}
                />
            </Card>
        </Container>
    );
}