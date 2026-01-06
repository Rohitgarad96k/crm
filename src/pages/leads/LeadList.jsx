import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchLeads, deleteLead, updateLeadStatus } from '../../services/api';
import { FaPlus, FaList, FaThLarge, FaSearch, FaFilter, FaDownload, FaFileImport, FaTrash, FaEye } from 'react-icons/fa';
import ViewLeadModal from './ViewLeadModal';

const LeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'board'
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  // --- Filtering Logic ---
  useEffect(() => {
    let result = leads;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(l =>
        (l.name && l.name.toLowerCase().includes(lowerSearch)) ||
        (l.company && l.company.toLowerCase().includes(lowerSearch)) ||
        (l.source && l.source.toLowerCase().includes(lowerSearch))
      );
    }

    if (filterStatus !== 'All') {
      result = result.filter(l => l.status === filterStatus);
    }

    setFilteredLeads(result);
  }, [leads, searchTerm, filterStatus]);

  const loadLeads = async () => {
    try {
      const { data } = await fetchLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await deleteLead(id);
        setLeads(leads.filter(l => l.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete lead");
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic Update
    const oldLeads = [...leads];
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

    try {
      await updateLeadStatus(id, newStatus);
    } catch (error) {
      console.error("Status update failed", error);
      alert("Failed to update status");
      setLeads(oldLeads); // Revert on failure
    }
  };

  // --- DRAG AND DROP HANDLER ---
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId;
    const leadId = parseInt(draggableId);

    handleStatusChange(leadId, newStatus);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Company", "Status", "Value", "Currency", "Source", "Phone"];
    const csvRows = filteredLeads.map(l => [
      l.id, `"${l.name}"`, `"${l.company}"`, l.status, l.value, l.currency, l.source, l.phone
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export.csv`;
    a.click();
  };

  // --- UI COMPONENTS ---

  const StatusDropdown = ({ currentStatus, leadId }) => {
    const statusColors = {
      'New': 'bg-info text-dark',
      'Contacted': 'bg-primary text-white',
      'Qualified': 'bg-warning text-dark',
      'Lost': 'bg-danger text-white',
      'Converted': 'bg-success text-white'
    };

    return (
      <select
        className={`form-select form-select-sm border-0 fw-bold ${statusColors[currentStatus] || 'bg-secondary text-white'}`}
        style={{ width: '120px', cursor: 'pointer', fontSize: '0.85rem' }}
        value={currentStatus}
        onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking dropdown
        onChange={(e) => handleStatusChange(leadId, e.target.value)}
      >
        {['New', 'Contacted', 'Qualified', 'Lost', 'Converted'].map(s => (
          <option key={s} value={s} className="bg-white text-dark">{s}</option>
        ))}
      </select>
    );
  };

  const StatCard = ({ title, value, color = "primary", isMoney = false }) => (
    <div className="col">
      <div className="card border-0 shadow-sm p-3 h-100">
        <h6 className="text-muted text-uppercase small mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{title}</h6>
        <h3 className={`mb-0 text-${color}`}>
          {isMoney ? `$${value.toLocaleString()}` : value}
        </h3>
      </div>
    </div>
  );

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const totalValue = leads.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);

  return (
    <div className="container-fluid">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Leads</h2>
          <p className="text-muted">Manage potential customers and track conversion status</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/leads/import')}>
            <FaFileImport className="me-2" /> Import
          </button>
          <Link to="/leads/add" className="btn btn-primary"><FaPlus /> Add New Lead</Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="row row-cols-1 row-cols-md-4 g-3 mb-4">
        <StatCard title="Total Leads" value={totalLeads} color="dark" />
        <StatCard title="New Leads" value={newLeads} color="info" />
        <StatCard title="Qualified Opportunities" value={qualifiedLeads} color="warning" />
        <StatCard title="Total Pipeline Value" value={totalValue} color="success" isMoney={true} />
      </div>

      {/* Toolbar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2">
            <div className="btn-group">
              <button className={`btn ${view === 'list' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setView('list')}><FaList /> List</button>
              <button className={`btn ${view === 'board' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setView('board')}><FaThLarge /> Board</button>
            </div>

            <div className="btn-group position-relative">
              <button className={`btn ${filterStatus === 'All' ? 'btn-outline-secondary' : 'btn-secondary'}`} onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                <FaFilter /> {filterStatus === 'All' ? 'Filter Status' : filterStatus}
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu show position-absolute mt-5 shadow" style={{ zIndex: 1000 }}>
                  {['All', 'New', 'Contacted', 'Qualified', 'Lost', 'Converted'].map(status => (
                    <button key={status} className="dropdown-item" onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}>
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-light border" onClick={handleExport} title="Export CSV"><FaDownload /></button>
          </div>
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' ? (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr className="text-uppercase text-muted small">
                  <th className="ps-4">Name / Company</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Created</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No leads found.</td></tr>
                ) : filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="ps-4">
                      <div className="fw-bold">{lead.name}</div>
                      <div className="small text-muted">{lead.company}</div>
                    </td>
                    <td><StatusDropdown currentStatus={lead.status} leadId={lead.id} /></td>
                    <td>{lead.currency} {parseFloat(lead.value).toLocaleString()}</td>
                    <td>{lead.source}</td>
                    <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-light text-primary me-2" onClick={() => { setSelectedLead(lead); setShowViewModal(true); }}><FaEye /></button>
                      <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(lead.id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- KANBAN BOARD VIEW (DRAG & DROP) --- */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="row flex-nowrap overflow-auto pb-4">
            {['New', 'Contacted', 'Qualified', 'Lost', 'Converted'].map(status => {
              const statusLeads = filteredLeads.filter(l => l.status === status);
              const statusTotal = statusLeads.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

              return (
                <div className="col-md-3" key={status} style={{ minWidth: '300px' }}>
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        className={`card h-100 border-0 ${snapshot.isDraggingOver ? 'bg-info bg-opacity-10' : 'bg-light'}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-uppercase small text-muted">{status}</span>
                          <span className="badge bg-white text-dark border">{statusLeads.length}</span>
                        </div>
                        <div className="px-3 pb-2">
                          <small className="text-muted fw-bold">Total: ${statusTotal.toLocaleString()}</small>
                        </div>

                        <div className="card-body p-2 d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                          {statusLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={String(lead.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  className="card shadow-sm border-0 p-3"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1 }}
                                  onClick={() => { setSelectedLead(lead); setShowViewModal(true); }}
                                >
                                  <div className="d-flex justify-content-between mb-2">
                                    <h6 className="mb-0 text-truncate">{lead.name}</h6>
                                    <button className="btn btn-sm text-danger p-0" onClick={() => handleDelete(lead.id)}><FaTrash size={12} /></button>
                                    <button className="btn btn-sm btn-light text-primary me-2" onClick={() => { setSelectedLead(lead); setShowViewModal(true); }}>
                                      <FaEye />
                                    </button>
                                  </div>
                                  <small className="text-muted d-block mb-2 text-truncate">{lead.company}</small>

                                  {/* Keep Status Dropdown even in Kanban */}
                                  <div className="mb-2">
                                    <StatusDropdown currentStatus={lead.status} leadId={lead.id} />
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="badge bg-light text-dark border">{lead.currency} {parseFloat(lead.value).toLocaleString()}</span>
                                    <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                      {lead.owner ? lead.owner.charAt(0) : 'U'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      {showViewModal && selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

export default LeadList;