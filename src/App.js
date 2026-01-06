import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import AddCustomer from './pages/customers/AddCustomer';
import ImportCustomers from './pages/customers/ImportCustomers'; // <--- Import this
import LeadList from './pages/leads/LeadList';
import AddLead from './pages/leads/AddLead';
import ImportLeads from './pages/leads/ImportLeads';
import EditCustomer from './pages/customers/EditCustomer';
import EditLead from './pages/leads/EditLead';
import CreateProposal from './pages/leads/CreateProposal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Sidebar />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="customers">
            <Route index element={<CustomerList />} />
            <Route path="add" element={<AddCustomer />} />
            <Route path="import" element={<ImportCustomers />} />
            <Route path="edit/:id" element={<EditCustomer />} /> 
          </Route>

          <Route path="leads">
            <Route index element={<LeadList />} />
            <Route path="add" element={<AddLead />} />
            <Route path="import" element={<ImportLeads />} />
            <Route path="edit/:id" element={<EditLead />} />
            <Route path="proposals/create/:id" element={<CreateProposal />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;