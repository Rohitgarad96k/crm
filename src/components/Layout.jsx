import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaUserTie, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const Sidebar = () => {
  const [customerMenuOpen, setCustomerMenuOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Container */}
      <div className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '250px', flexShrink: 0 }}>
        <h4 className="mb-4 text-center fw-bold text-primary">Nexus CRM</h4>
        
        <ul className="nav nav-pills flex-column mb-auto">
          {/* Dashboard (Placeholder) */}
          <li className="nav-item mb-2">
            <Link to="/dashboard" className={`nav-link text-white ${isActive('/dashboard') ? 'active' : ''}`}>
              <FaTachometerAlt className="me-2" /> Dashboard
            </Link>
          </li>

          {/* Customers Module Dropdown */}
          <li className="nav-item">
            <a 
              href="#" 
              className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={() => setCustomerMenuOpen(!customerMenuOpen)}
            >
              <span><FaUsers className="me-2" /> Customers</span>
              {customerMenuOpen ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
            </a>
            
            {/* Sub-menu */}
            {customerMenuOpen && (
              <ul className="nav flex-column ms-3 mt-1 border-start border-secondary ps-2">
                <li className="nav-item">
                  <Link to="/customers" className={`nav-link text-white py-1 ${location.pathname === '/customers' ? 'text-info fw-bold' : ''}`}>
                    All Customers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/leads" className={`nav-link text-white py-1 ${location.pathname.includes('/leads') ? 'text-info fw-bold' : ''}`}>
                    <FaUserTie className="me-2" /> Leads
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
        
        <div className="mt-auto pt-3 border-top border-secondary">
          <small className="text-muted">v1.0.0 Nexus Build</small>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 overflow-auto bg-light p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;