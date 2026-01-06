import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLeadById, updateLead } from '../../services/api';
import { FaSave, FaTimes, FaPlus, FaTag, FaSpinner } from 'react-icons/fa';

const EditLead = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    status: '',
    source: '',
    assigned_to: '',
    tags: '',
    name: '',
    position: '',
    email: '',
    website: '',
    phone: '',
    value: 0,
    company: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    default_language: '',
    is_public: false,
    contacted_today: false,
    currency: 'USD'
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    fetchLeadById(id)
      .then(({ data }) => {
        // Map database values to form state
        setFormData({
            ...data,
            // Ensure checkboxes are booleans (DB returns 1/0)
            is_public: !!data.is_public,
            contacted_today: !!data.contacted_today,
            // Handle potentially null fields
            tags: data.tags || '',
            description: data.description || '',
            assigned_to: data.assigned_to || 'Admin'
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Error loading lead data");
        navigate('/leads');
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // API expects 1/0 for booleans, let's map them back if needed, 
      // though typically the updateLead logic handles it or the DB driver does.
      // Explicitly mapping for safety:
      const payload = {
        ...formData,
        is_public: formData.is_public ? 1 : 0,
        contacted_today: formData.contacted_today ? 1 : 0
      };

      await updateLead(id, payload);
      alert('Lead Updated Successfully!');
      navigate('/leads');
    } catch (error) {
      console.error("Error updating lead", error);
      alert('Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
        <FaSpinner className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
    </div>
  );

  return (
    <div className="container-fluid py-4 bg-light" style={{minHeight: '100vh'}}>
      <div className="card border-0 shadow-sm mx-auto" style={{maxWidth: '1200px'}}>
        
        {/* Header */}
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Edit Lead #{id}</h5>
            <button className="btn btn-close" onClick={() => navigate('/leads')}></button>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* --- TOP ROW (Status, Source, Assigned) --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="form-label fw-bold small text-danger">* Status</label>
                    <div className="input-group">
                        <select className="form-select" name="status" value={formData.status} onChange={handleChange} required>
                            <option value="">Nothing selected</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                            <option value="Converted">Converted</option>
                        </select>
                        <button type="button" className="btn btn-outline-secondary"><FaPlus/></button>
                    </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold small text-danger">* Source</label>
                    <div className="input-group">
                        <select className="form-select" name="source" value={formData.source} onChange={handleChange} required>
                            <option value="">Nothing selected</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Google">Google</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Referral">Referral</option>
                            <option value="Website">Website</option>
                        </select>
                        <button type="button" className="btn btn-outline-secondary"><FaPlus/></button>
                    </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-bold small">Assigned</label>
                    <select className="form-select" name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                        <option value="Admin">Admin (Me)</option>
                        <option value="Sales Team">Sales Team</option>
                        <option value="Atharva Jahagirdar">Atharva Jahagirdar</option>
                    </select>
                </div>
                
                {/* Tags Row */}
                <div className="col-12">
                    <label className="form-label fw-bold small"><FaTag className="me-1"/> Tags</label>
                    <input type="text" className="form-control" name="tags" value={formData.tags} placeholder="Tag" onChange={handleChange} />
                </div>
            </div>

            <hr className="text-muted my-4" />

            {/* --- MAIN COLUMNS --- */}
            <div className="row g-4">
                
                {/* LEFT COLUMN */}
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-danger">* Name</label>
                        <input type="text" className="form-control" name="name" value={formData.name} required onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Position</label>
                        <input type="text" className="form-control" name="position" value={formData.position} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Email Address</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Website</label>
                        <input type="text" className="form-control" name="website" value={formData.website} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Phone</label>
                        <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Lead Value</label>
                        <div className="input-group">
                            <input type="number" className="form-control" name="value" value={formData.value} onChange={handleChange} />
                            <span className="input-group-text">$</span>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Company</label>
                        <input type="text" className="form-control" name="company" value={formData.company} onChange={handleChange} />
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Address</label>
                        <textarea className="form-control" name="address" rows="1" value={formData.address} onChange={handleChange}></textarea>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">City</label>
                        <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">State</label>
                        <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Country</label>
                        <select className="form-select" name="country" value={formData.country} onChange={handleChange}>
                            <option value="">Nothing selected</option>
                            <option value="United States">United States</option>
                            <option value="India">India</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Zip Code</label>
                        <input type="text" className="form-control" name="zipcode" value={formData.zipcode} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold small">Default Language</label>
                        <select className="form-select" name="default_language" value={formData.default_language} onChange={handleChange}>
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
                    <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
                </div>

                {/* CHECKBOXES */}
                <div className="col-12 d-flex gap-4">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="is_public" id="isPublic" checked={formData.is_public} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="isPublic">Public</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="contacted_today" id="contactedToday" checked={formData.contacted_today} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="contactedToday">Contacted Today</label>
                    </div>
                </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-light border" onClick={() => navigate('/leads')}>Close</button>
                <button type="submit" className="btn btn-dark px-4" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLead;