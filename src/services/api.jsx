import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your backend port
});

// --- Contacts (Customers) ---
export const fetchContacts = () => API.get('/contact');
export const fetchContactById = (id) => API.get(`/contact/${id}`);
export const createContact = (data) => API.post('/contact', data);
export const deleteContact = (id) => API.delete(`/contact/${id}`);
export const updateContact = (id, data) => API.put(`/contact/${id}`, data);
// --- Groups ---
export const fetchGroups = () => API.get('/group');
export const assignGroupToCustomer = (customerId, groupIds) => 
  API.post('/group/assign', { customer_id: customerId, group_ids: groupIds });

// --- Leads ---
export const fetchLeads = () => API.get('/lead');
export const fetchLeadById = (id) => API.get(`/lead/${id}`);
export const fetchLeadTasks = (id) => API.get(`/lead/${id}/tasks`);
export const addLeadTask = (id, data) => API.post(`/lead/${id}/tasks`, data);
export const toggleLeadTask = (taskId) => API.put(`/lead/tasks/${taskId}/toggle`);
export const fetchLeadReminders = (id) => API.get(`/lead/${id}/reminders`);
export const addLeadReminder = (id, data) => API.post(`/lead/${id}/reminders`, data);
export const createLead = (data) => API.post('/lead', data);
export const updateLead = (id, data) => API.put(`/lead/${id}`, data);
export const updateLeadStatus = (id, status) => API.put(`/lead/${id}/status`, { status });
export const deleteLead = (id) => API.delete(`/lead/${id}`);
// Add to your existing API export
export const fetchLeadNotes = (id) => API.get(`/lead/${id}/notes`);
export const addLeadNote = (id, data) => API.post(`/lead/${id}/notes`, data);
export const fetchLeadActivity = (id) => API.get(`/lead/${id}/activity`);

// Proposals
export const fetchLeadProposals = (id) => API.get(`/lead/${id}/proposals`);
export const addLeadProposal = (id, data) => API.post(`/lead/${id}/proposals`, data);

// Attachments
export const fetchLeadAttachments = (id) => API.get(`/lead/${id}/attachments`);
export const addLeadAttachment = (id, data) => API.post(`/lead/${id}/attachments`, data);


export default API;