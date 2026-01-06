import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchContactById, updateContact, fetchGroups, assignGroupToCustomer } from '../../services/api';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const EditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [copyBilling, setCopyBilling] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', GST: '', website: '',
    selectedGroupId: '', currency: 'USD', language: 'English',
    address: '', city: '', state: '', zipcode: '', country: 'United States',
    billing_address: '', billing_city: '', billing_state: '', billing_zip: '', billing_country: 'United States',
    shipping_address: '', shipping_city: '', shipping_state: '', shipping_zip: '', shipping_country: 'United States',
  });

  const countries = ["United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "France"];

  useEffect(() => {
    const loadData = async () => {
        try {
            const [groupRes, contactRes] = await Promise.all([fetchGroups(), fetchContactById(id)]);
            setGroups(groupRes.data);
            
            const data = contactRes.data;
            // Map DB fields to State fields
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                GST: data.gst_number, // Map gst_number -> GST
                website: data.website,
                selectedGroupId: data.group_id || '',
                currency: data.currency,
                language: data.language,
                
                address: data.address, city: data.city, state: data.state, zipcode: data.zipcode, country: data.country,
                
                billing_address: data.billing_address || '', 
                billing_city: data.billing_city || '', 
                billing_state: data.billing_state || '', 
                billing_zip: data.billing_zip || '', 
                billing_country: data.billing_country || 'United States',

                shipping_address: data.shipping_address || '', 
                shipping_city: data.shipping_city || '', 
                shipping_state: data.shipping_state || '', 
                shipping_zip: data.shipping_zip || '', 
                shipping_country: data.shipping_country || 'United States',
            });
        } catch (error) {
            console.error("Error loading customer", error);
            alert("Could not load customer data");
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Update Contact Details
      await updateContact(id, formData);
      
      // 2. Update Group (Re-assign logic)
      if (formData.selectedGroupId) {
        await assignGroupToCustomer(id, [formData.selectedGroupId]);
      }

      alert('Customer Updated Successfully!');
      navigate('/customers');
    } catch (error) {
      console.error(error);
      alert('Error updating customer');
    }
  };

  if (loading) return <div className="text-center py-5"><FaSpinner className="spinner-border text-primary" /></div>;

  return (
    <div className="container py-4" style={{maxWidth: '1000px'}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Edit Customer</h3>
        <button type="button" className="btn btn-light text-danger" onClick={() => navigate('/customers')}><FaTimes/> Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Profile Card */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light fw-bold">Organization Profile</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="col-md-4"><label className="form-label">Phone</label><input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} /></div>
              <div className="col-md-4"><label className="form-label">Tax ID</label><input type="text" className="form-control" name="GST" value={formData.GST} onChange={handleChange} /></div>
              <div className="col-md-4"><label className="form-label">Website</label><input type="text" className="form-control" name="website" value={formData.website} onChange={handleChange} /></div>
              <div className="col-md-12">
                <label className="form-label">Group</label>
                <select className="form-select" name="selectedGroupId" value={formData.selectedGroupId} onChange={handleChange}>
                  <option value="">Select Group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="row">
            {/* Primary Address */}
            <div className="col-12 mb-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-light fw-bold">Primary Address</div>
                    <div className="card-body">
                        <textarea className="form-control mb-2" name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
                        <div className="row g-2">
                            <div className="col-3"><input type="text" className="form-control form-control-sm" name="city" value={formData.city} onChange={handleChange} placeholder="City"/></div>
                            <div className="col-3"><input type="text" className="form-control form-control-sm" name="state" value={formData.state} onChange={handleChange} placeholder="State"/></div>
                            <div className="col-3"><input type="text" className="form-control form-control-sm" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zip"/></div>
                            <div className="col-3"><select className="form-select form-select-sm" name="country" value={formData.country} onChange={handleChange}>{countries.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Billing */}
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-light fw-bold">Billing Address</div>
                    <div className="card-body">
                        <textarea className="form-control mb-2" name="billing_address" rows="2" value={formData.billing_address} onChange={handleChange}></textarea>
                        <div className="row g-2">
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="billing_city" value={formData.billing_city} onChange={handleChange} placeholder="City"/></div>
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="billing_state" value={formData.billing_state} onChange={handleChange} placeholder="State"/></div>
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="billing_zip" value={formData.billing_zip} onChange={handleChange} placeholder="Zip"/></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping */}
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-light fw-bold">Shipping Address</div>
                    <div className="card-body">
                        <textarea className="form-control mb-2" name="shipping_address" rows="2" value={formData.shipping_address} onChange={handleChange}></textarea>
                        <div className="row g-2">
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="shipping_city" value={formData.shipping_city} onChange={handleChange} placeholder="City"/></div>
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="shipping_state" value={formData.shipping_state} onChange={handleChange} placeholder="State"/></div>
                            <div className="col-6"><input type="text" className="form-control form-control-sm" name="shipping_zip" value={formData.shipping_zip} onChange={handleChange} placeholder="Zip"/></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light" onClick={() => navigate('/customers')}>Cancel</button>
          <button type="submit" className="btn btn-primary px-4"><FaSave className="me-2"/> Update Customer</button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;