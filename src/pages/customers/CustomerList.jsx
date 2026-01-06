import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchContacts, deleteContact } from '../../services/api';
import { FaPlus, FaSearch, FaFilter, FaFileImport, FaDownload, FaTrash, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Sort & Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'descending' }); // Default: Newest first

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    let result = [...customers];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c =>
        (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
        (c.email && c.email.toLowerCase().includes(lowerSearch)) ||
        (c.company && c.company.toLowerCase().includes(lowerSearch))
      );
    }

    // 2. Status Filter
    if (filterStatus !== 'All') {
      const isActive = filterStatus === 'Active';
      result = result.filter(c => !!c.is_active === isActive);
    }

    // 3. Sorting Logic
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric ID sorting specifically
        if (sortConfig.key === 'id') {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCustomers(result);
  }, [customers, searchTerm, filterStatus, sortConfig]);

  const loadCustomers = async () => {
    try {
      const { data } = await fetchContacts();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Sorting Handler ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const headers = ["ID", "Company", "Name", "Email", "Phone", "Group", "Status", "Date Created"];
    const csvRows = filteredCustomers.map(c => [
      c.id,
      `"${c.company || ''}"`,
      `"${c.name}"`,
      c.email,
      c.phone,
      c.group_name || 'None',
      c.is_active ? 'Active' : 'Inactive',
      new Date(c.created_at).toLocaleString()
    ]);

    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_export.csv`;
    a.click();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteContact(id);
        setCustomers(customers.filter(c => c.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete customer");
      }
    }
  };

  const handleViewContact = (customer) => {
    setSelectedCustomer(customer);
    setShowContactModal(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    setCustomers(customers.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
    try {
      await axios.put(`http://localhost:5000/api/contact/${id}/status`, { is_active: newStatus });
    } catch (error) {
      console.error("Failed", error);
      setCustomers(customers.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    }
  };

  // Helper colors
  const getGroupBadgeColor = (groupName) => {
    if (!groupName) return 'secondary';
    const name = groupName.toLowerCase();
    if (name.includes('high')) return 'danger';
    if (name.includes('retail')) return 'info';
    if (name.includes('wholesale')) return 'warning';
    return 'primary';
  };

  // Stats
  const total = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const inactiveCustomers = total - activeCustomers;

  const StatCard = ({ title, value, color = "primary" }) => (
    <div className="col">
      <div className="card border-0 shadow-sm p-3 h-100">
        <h6 className="text-muted text-uppercase small mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{title}</h6>
        <h3 className={`mb-0 text-${color}`}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="container-fluid position-relative">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Customers</h2>
          <p className="text-muted">Manage your organization's relationships</p>
        </div>
        <div className="d-flex gap-2 position-relative">
          <div className="btn-group">
            <button
              className={`btn ${filterStatus === 'All' ? 'btn-outline-secondary' : 'btn-secondary'}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FaFilter /> {filterStatus === 'All' ? 'Filter' : filterStatus}
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu show position-absolute mt-5 shadow" style={{ zIndex: 1000 }}>
                <button className="dropdown-item" onClick={() => { setFilterStatus('All'); setShowFilterDropdown(false) }}>All Customers</button>
                <button className="dropdown-item" onClick={() => { setFilterStatus('Active'); setShowFilterDropdown(false) }}>Active Only</button>
                <button className="dropdown-item" onClick={() => { setFilterStatus('Inactive'); setShowFilterDropdown(false) }}>Inactive Only</button>
              </div>
            )}
          </div>

          <button className="btn btn-outline-secondary" onClick={() => navigate('/customers/import')}>
            <FaFileImport className="me-2" /> Import
          </button>
          <Link to="/customers/add" className="btn btn-primary"><FaPlus /> Add Customer</Link>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-5 g-3 mb-4">
        <StatCard title="Total Customers" value={total} color="dark" />
        <StatCard title="Active Customers" value={activeCustomers} color="success" />
        <StatCard title="Inactive Customers" value={inactiveCustomers} color="danger" />
        <StatCard title="Active Contacts" value={activeCustomers} color="info" />
        <StatCard title="Contacts Logged In" value="0" color="warning" />
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control border-start-0 bg-light"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-link text-muted text-decoration-none" onClick={handleExport}>
            <FaDownload className="me-1" /> Export CSV
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-uppercase text-muted small">

                {/* --- SORTABLE ID HEADER --- */}
                <th
                  className="ps-4"
                  style={{ width: '90px', cursor: 'pointer' }}
                  onClick={() => requestSort('id')}
                  title="Click to sort by ID"
                >
                  <div className="d-flex align-items-center gap-1">
                    #
                    {sortConfig.key === 'id' ? (
                      sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort className="text-muted opacity-50" />
                    )}
                  </div>
                </th>

                <th>Company</th>
                <th>Contact</th>
                <th>Group</th>
                <th>Date Created</th>
                <th>Status</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No customers found.</td></tr>
              ) : filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="ps-4 text-muted fw-bold">{c.id}</td>

                  <td className="fw-bold text-primary">{c.company || c.name}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{c.name}</span>
                      <small className="text-muted">{c.email}</small>
                    </div>
                  </td>

                  <td>
                    {c.group_name ? (
                      <span className={`badge bg-${getGroupBadgeColor(c.group_name)} text-white`}>
                        {c.group_name}
                      </span>
                    ) : (
                      <span className="text-muted small">-</span>
                    )}
                  </td>

                  <td>
                    <div className="d-flex flex-column">
                      <small className="fw-bold">{new Date(c.created_at).toLocaleDateString()}</small>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </td>

                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!c.is_active}
                        onChange={() => toggleStatus(c.id, c.is_active)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <button className="btn btn-sm btn-light text-primary me-2" onClick={() => handleViewContact(c)}><FaEye /></button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(c.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Modal */}
      {showContactModal && selectedCustomer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title text-primary fw-bold">Customer Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowContactModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-12 d-flex align-items-center mb-2">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="mb-0">{selectedCustomer.company || selectedCustomer.name}</h4>
                      <div className="mt-1">
                        {selectedCustomer.group_name && <span className="badge bg-secondary me-2">{selectedCustomer.group_name}</span>}
                        <small className="text-muted">ID: {selectedCustomer.id}</small>
                      </div>
                    </div>
                    <div className="ms-auto">
                      <span className={`badge bg-${selectedCustomer.is_active ? 'success' : 'secondary'} px-3 py-2`}>
                        {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <hr className="my-0" />

                  <div className="col-md-6">
                    <label className="text-muted small text-uppercase">Contact</label>
                    <p className="fw-bold">{selectedCustomer.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small text-uppercase">Email</label>
                    <p className="fw-bold">{selectedCustomer.email}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small text-uppercase">Phone</label>
                    <p className="fw-bold">{selectedCustomer.phone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small text-uppercase">Website</label>
                    <p className="fw-bold text-primary">{selectedCustomer.website || '-'}</p>
                  </div>

                  {/* Addresses */}
                  {selectedCustomer.billing_address && (
                    <div className="col-md-6">
                      <label className="text-muted small text-uppercase">Billing Address</label>
                      <p className="mb-0">{selectedCustomer.billing_address}</p>
                      <small className="text-muted">{selectedCustomer.billing_city}, {selectedCustomer.billing_country}</small>
                    </div>
                  )}
                  {selectedCustomer.shipping_address && (
                    <div className="col-md-6">
                      <label className="text-muted small text-uppercase">Shipping Address</label>
                      <p className="mb-0">{selectedCustomer.shipping_address}</p>
                      <small className="text-muted">{selectedCustomer.shipping_city}, {selectedCustomer.shipping_country}</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setShowContactModal(false)}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowContactModal(false); // Close modal
                    navigate(`/customers/edit/${selectedCustomer.id}`); // Go to Edit Page
                  }}
                >
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;