import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead } from '../../services/api';
import { FaSave, FaTimes, FaPlus, FaTag } from 'react-icons/fa';

const AddLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Top Row
    status: '',
    source: '',
    assigned_to: 'Admin', // Default to admin or current user
    tags: '',

    // Left Col
    name: '',
    position: '',
    email: '',
    website: '',
    phone: '',
    lead_value: 0,
    company: '',
    description: '',

    // Right Col
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    default_language: 'System Default',

    // Bottom
    is_public: false,
    contacted_today: false,
    
    currency: 'USD'
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, value: formData.lead_value };
      await createLead(payload);
      alert('Lead Created Successfully!');
      navigate('/leads');
    } catch (error) {
      console.error("Error creating lead", error);
      alert('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light" style={{minHeight: '100vh'}}>
      <div className="card border-0 shadow-sm mx-auto" style={{maxWidth: '1200px'}}>
        
        {/* Header */}
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Add New Lead</h5>
            <button className="btn btn-close" onClick={() => navigate('/leads')}></button>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* --- TOP ROW (Status, Source, Assigned) --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label fw-bold small text-danger">* Status</label>
                    <div className="input-group">
                        <select className="form-select" name="status" onChange={handleChange} required>
                            <option value="">Nothing selected</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                        </select>
                        <button type="button" className="btn btn-outline-secondary"><FaPlus/></button>
                    </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold small text-danger">* Source</label>
                    <div className="input-group">
                        <select className="form-select" name="source" onChange={handleChange} required>
                            <option value="">Nothing selected</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Google">Google</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Referral">Referral</option>
                        </select>
                        <button type="button" className="btn btn-outline-secondary"><FaPlus/></button>
                    </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold small">Assigned</label>
                    <select className="form-select" name="assigned_to" onChange={handleChange}>
                        <option value="Admin">Admin (Me)</option>
                        <option value="Sales Team">Sales Team</option>
                    </select>
                </div>
                
                {/* Tags Row */}
                <div className="col-12">
                    <label className="form-label fw-bold small"><FaTag className="me-1"/> Tags</label>
                    <input type="text" className="form-control" name="tags" placeholder="Tag" onChange={handleChange} />
                </div>
            </div>

            <hr className="text-muted my-4" />

            {/* --- MAIN COLUMNS --- */}
            <div className="row g-4">
                
                {/* LEFT COLUMN */}
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-danger">* Name</label>
                        <input type="text" className="form-control" name="name" required onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Position</label>
                        <input type="text" className="form-control" name="position" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Email Address</label>
                        <input type="email" className="form-control" name="email" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Website</label>
                        <input type="text" className="form-control" name="website" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Phone</label>
                        <input type="text" className="form-control" name="phone" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Lead Value</label>
                        <div className="input-group">
                            <input type="number" className="form-control" name="lead_value" onChange={handleChange} />
                            <span className="input-group-text">$</span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Company</label>
                        <input type="text" className="form-control" name="company" onChange={handleChange} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Address</label>
                        <textarea className="form-control" name="address" rows="1" onChange={handleChange}></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">City</label>
                        <input type="text" className="form-control" name="city" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">State</label>
                        <input type="text" className="form-control" name="state" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Country</label>
                        <select className="form-select" name="country" onChange={handleChange}>
                            <option value="">Nothing selected</option>
                            <option value="United States">United States</option>
                            <option value="India">India</option>
                            <option value="United Kingdom">United Kingdom</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Zip Code</label>
                        <input type="text" className="form-control" name="zipcode" onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Default Language</label>
                        <select className="form-select" name="default_language" onChange={handleChange}>
                            <option value="System Default">System Default</option>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                    </div>
                </div>

                {/* DESCRIPTION (Full Width) */}
                <div className="col-12">
                    <label className="form-label fw-bold small">Description</label>
                    <textarea className="form-control" name="description" rows="4" onChange={handleChange}></textarea>
                </div>

                {/* CHECKBOXES */}
                <div className="col-12 d-flex gap-4">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="is_public" id="isPublic" onChange={handleChange} />
                        <label className="form-check-label" htmlFor="isPublic">Public</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="contacted_today" id="contactedToday" onChange={handleChange} />
                        <label className="form-check-label" htmlFor="contactedToday">Contacted Today</label>
                    </div>
                </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-light border" onClick={() => navigate('/leads')}>Close</button>
                <button type="submit" className="btn btn-dark px-4" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLead;