import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios'; // Or use your api instance
import { FaSave, FaTimes, FaPlus, FaTrash, FaCog } from 'react-icons/fa';

const CreateProposal = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lead ID
  const location = useLocation();
  const leadData = location.state?.lead || {}; // Pass lead data via navigation

  const [formData, setFormData] = useState({
    subject: '',
    assigned_to: 'Admin',
    lead_id: id,
    proposal_date: new Date().toISOString().split('T')[0],
    open_till: '',
    currency: 'USD',
    status: 'Draft',
    to_name: leadData.name || '',
    address: leadData.address || '',
    city: leadData.city || '',
    state: leadData.state || '',
    country: leadData.country || '',
    zip: leadData.zipcode || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    discount_val: 0,
    adjustment: 0
  });

  // Dynamic Items State
  const [items, setItems] = useState([
    { description: '', long_description: '', qty: 1, rate: 0, tax: 0, amount: 0 }
  ]);

  // Calculations
  const calculateTotal = () => {
    const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    const discount = parseFloat(formData.discount_val) || 0; // Assuming fixed discount for simplicity
    const adjustment = parseFloat(formData.adjustment) || 0;
    return { subTotal, total: subTotal - discount + adjustment };
  };

  const { subTotal, total } = calculateTotal();

  // Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-calc amount
    if (field === 'qty' || field === 'rate') {
        const q = parseFloat(newItems[index].qty) || 0;
        const r = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = q * r;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', long_description: '', qty: 1, rate: 0, tax: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        ...formData,
        items,
        sub_total: subTotal,
        total_amount: total
    };

    try {
        await axios.post('http://localhost:5000/api/proposal/create', payload);
        alert('Proposal Sent Successfully!');
        navigate('/leads');
    } catch (error) {
        console.error(error);
        alert('Failed to create proposal');
    }
  };

  return (
    <div className="container-fluid py-4 bg-light">
      <form onSubmit={handleSubmit} className="card shadow-sm mx-auto" style={{maxWidth: '1200px'}}>
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">New Proposal</h5>
            <button type="button" className="btn btn-close" onClick={() => navigate('/leads')}></button>
        </div>
        
        <div className="card-body">
            {/* TOP SECTION */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold text-danger">* Subject</label>
                    <input className="form-control" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Status</label>
                    <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option>Draft</option>
                        <option>Sent</option>
                        <option>Open</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Assigned</label>
                    <select className="form-select"><option>Admin</option></select>
                </div>
                
                {/* DATE & CURRENCY */}
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Date</label>
                    <input type="date" className="form-control" value={formData.proposal_date} onChange={e => setFormData({...formData, proposal_date: e.target.value})} />
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Open Till</label>
                    <input type="date" className="form-control" value={formData.open_till} onChange={e => setFormData({...formData, open_till: e.target.value})} />
                </div>
                <div className="col-md-3">
                    <label className="form-label small fw-bold">Currency</label>
                    <select className="form-select"><option>USD $</option><option>EUR €</option></select>
                </div>
            </div>

            <hr />

            {/* ADDRESS SECTION */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label small fw-bold">To</label>
                    <input className="form-control" value={formData.to_name} onChange={e => setFormData({...formData, to_name: e.target.value})} />
                    
                    <label className="form-label small fw-bold mt-2">Address</label>
                    <textarea className="form-control" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
                <div className="col-md-6">
                    <div className="row g-2">
                        <div className="col-6"><label className="small">City</label><input className="form-control form-control-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/></div>
                        <div className="col-6"><label className="small">State</label><input className="form-control form-control-sm" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}/></div>
                        <div className="col-6"><label className="small">Country</label><input className="form-control form-control-sm" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}/></div>
                        <div className="col-6"><label className="small">Zip</label><input className="form-control form-control-sm" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})}/></div>
                        <div className="col-6"><label className="small">Email</label><input className="form-control form-control-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/></div>
                        <div className="col-6"><label className="small">Phone</label><input className="form-control form-control-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
                    </div>
                </div>
            </div>

            {/* LINE ITEMS SECTION */}
            <div className="table-responsive mb-4" style={{backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px'}}>
                <table className="table table-borderless">
                    <thead>
                        <tr className="small text-muted">
                            <th style={{width:'30%'}}>Item Description</th>
                            <th style={{width:'10%'}}>Qty</th>
                            <th style={{width:'15%'}}>Rate</th>
                            <th style={{width:'10%'}}>Tax %</th>
                            <th style={{width:'15%'}} className="text-end">Amount</th>
                            <th style={{width:'5%'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input className="form-control form-control-sm mb-1" placeholder="Item Name" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                    <textarea className="form-control form-control-sm text-muted" placeholder="Long description" rows="1" value={item.long_description} onChange={e => handleItemChange(index, 'long_description', e.target.value)}></textarea>
                                </td>
                                <td><input type="number" className="form-control form-control-sm" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} /></td>
                                <td><input type="number" className="form-control form-control-sm" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} /></td>
                                <td>
                                    <select className="form-select form-select-sm">
                                        <option value="0">No Tax</option>
                                        <option value="18">18%</option>
                                    </select>
                                </td>
                                <td className="text-end align-middle fw-bold">${parseFloat(item.amount).toFixed(2)}</td>
                                <td className="align-middle"><button type="button" className="btn btn-sm text-danger" onClick={() => removeItem(index)}><FaTrash/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={addItem}><FaPlus/> Add Item</button>
            </div>

            {/* TOTALS SECTION */}
            <div className="row justify-content-end">
                <div className="col-md-4">
                    <table className="table table-sm">
                        <tbody>
                            <tr>
                                <td className="text-muted text-end">Sub Total :</td>
                                <td className="text-end">${subTotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="text-muted text-end align-middle">Discount :</td>
                                <td>
                                    <div className="input-group input-group-sm">
                                        <input type="number" className="form-control text-end" value={formData.discount_val} onChange={e => setFormData({...formData, discount_val: e.target.value})} />
                                        <span className="input-group-text">$</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="text-muted text-end align-middle">Adjustment :</td>
                                <td>
                                    <div className="input-group input-group-sm">
                                        <input type="number" className="form-control text-end" value={formData.adjustment} onChange={e => setFormData({...formData, adjustment: e.target.value})} />
                                        <span className="input-group-text">$</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="fw-bold fs-5">
                                <td className="text-end text-primary">Total :</td>
                                <td className="text-end text-primary">${total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white d-flex justify-content-end gap-2 py-3">
            <button type="button" className="btn btn-light" onClick={() => navigate('/leads')}>Cancel</button>
            <button type="submit" className="btn btn-primary px-4"><FaSave className="me-2"/> Save & Send</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProposal;