import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContact, fetchGroups, assignGroupToCustomer } from '../../services/api';
import { FaSave, FaTimes, FaCopy } from 'react-icons/fa';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [copyBilling, setCopyBilling] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', 
    email: '',
    phone: '',
    company: '',
    GST: '',
    website: '',
    selectedGroupId: '',
    currency: 'USD',
    language: 'English',
    
    // Primary Address
    address: '', city: '', state: '', zipcode: '', country: 'United States',

    // Billing Address
    billing_address: '', billing_city: '', billing_state: '', billing_zip: '', billing_country: 'United States',

    // Shipping Address
    shipping_address: '', shipping_city: '', shipping_state: '', shipping_zip: '', shipping_country: 'United States',
  });

  const countries = [
    "United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "France", 
    "Japan", "China", "Brazil", "Mexico", "Italy", "Spain", "Netherlands", 
    "Switzerland", "Sweden", "South Korea", "Singapore", "Russia", "South Africa", "United Arab Emirates"
  ];

  useEffect(() => {
    fetchGroups().then(res => setGroups(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyBilling = (e) => {
    const isChecked = e.target.checked;
    setCopyBilling(isChecked);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        shipping_address: prev.billing_address,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_zip: prev.billing_zip,
        shipping_country: prev.billing_country
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createContact(formData);
      if (formData.selectedGroupId && data.id) {
        await assignGroupToCustomer(data.id, [formData.selectedGroupId]);
      }
      alert('Customer Added Successfully!');
      navigate('/customers');
    } catch (error) {
      console.error(error);
      alert('Error adding customer');
    }
  };

  // Reusable Country Select Component
  const CountrySelect = ({ name, value, onChange, disabled = false }) => (
    <select className="form-select form-select-sm" name={name} value={value} onChange={onChange} disabled={disabled}>
      {countries.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  return (
    <div className="container py-4" style={{maxWidth: '1000px'}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Add New Customer</h3>
        <button type="button" className="btn btn-light text-danger" onClick={() => navigate('/customers')}><FaTimes/> Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* 1. Organization Profile */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light fw-bold">Organization Profile</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company / Contact Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="name" required onChange={handleChange} placeholder="e.g. Acme Corp" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Primary Email <span className="text-danger">*</span></label>
                <input type="email" className="form-control" name="email" required onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" name="phone" onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">VAT / Tax ID</label>
                <input type="text" className="form-control" name="GST" onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Website</label>
                <input type="text" className="form-control" name="website" onChange={handleChange} />
              </div>
              <div className="col-md-12">
                <label className="form-label">Group</label>
                <select className="form-select" name="selectedGroupId" onChange={handleChange}>
                  <option value="">Select Group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Primary Address */}
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-light fw-bold">Primary Address</div>
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label">Street Address</label>
                    <textarea className="form-control" name="address" rows="2" onChange={handleChange}></textarea>
                </div>
                <div className="row g-2">
                    <div className="col-md-3">
                        <label className="form-label small">City</label>
                        <input type="text" className="form-control" name="city" onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">State</label>
                        <input type="text" className="form-control" name="state" onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">Zip Code</label>
                        <input type="text" className="form-control" name="zipcode" onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small">Country</label>
                        <CountrySelect name="country" value={formData.country} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>

        <div className="row">
            {/* 3. Billing Address */}
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-light fw-bold">Billing Address</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Street Address</label>
                            <textarea className="form-control" name="billing_address" rows="2" onChange={handleChange}></textarea>
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label small">City</label>
                                <input type="text" className="form-control form-control-sm" name="billing_city" onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">State</label>
                                <input type="text" className="form-control form-control-sm" name="billing_state" onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">Zip Code</label>
                                <input type="text" className="form-control form-control-sm" name="billing_zip" onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">Country</label>
                                <CountrySelect name="billing_country" value={formData.billing_country} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Shipping Address */}
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-light fw-bold d-flex justify-content-between align-items-center">
                        <span>Shipping Address</span>
                        <div className="form-check form-switch mb-0">
                            <input className="form-check-input" type="checkbox" id="copyAddress" checked={copyBilling} onChange={handleCopyBilling} />
                            <label className="form-check-label small fw-normal" htmlFor="copyAddress" style={{cursor:'pointer'}}>Same as Billing</label>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label className="form-label">Street Address</label>
                            <textarea 
                                className="form-control" 
                                name="shipping_address" 
                                rows="2" 
                                value={formData.shipping_address}
                                onChange={handleChange}
                                disabled={copyBilling}
                            ></textarea>
                        </div>
                        <div className="row g-2">
                            <div className="col-6">
                                <label className="form-label small">City</label>
                                <input type="text" className="form-control form-control-sm" name="shipping_city" value={formData.shipping_city} onChange={handleChange} disabled={copyBilling} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">State</label>
                                <input type="text" className="form-control form-control-sm" name="shipping_state" value={formData.shipping_state} onChange={handleChange} disabled={copyBilling} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">Zip Code</label>
                                <input type="text" className="form-control form-control-sm" name="shipping_zip" value={formData.shipping_zip} onChange={handleChange} disabled={copyBilling} />
                            </div>
                            <div className="col-6">
                                <label className="form-label small">Country</label>
                                <CountrySelect name="shipping_country" value={formData.shipping_country} onChange={handleChange} disabled={copyBilling} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light" onClick={() => navigate('/customers')}>Cancel</button>
          <button type="submit" className="btn btn-primary px-4"><FaSave className="me-2"/> Save Customer</button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;