import React from 'react';

const Dashboard = () => {
  return (
    <div className="container-fluid">
      <h2 className="mb-4">Dashboard</h2>
      <div className="alert alert-info">
        Dashboard Module is currently under development. Please use the sidebar to navigate to the <strong>Customers</strong> module.
      </div>
      
      {/* Visual Placeholder based on PDF */}
      <div className="row g-3">
        <div className="col-md-3"><div className="card p-4 text-center"><h5>Total Leads</h5><h3>1,240</h3></div></div>
        <div className="col-md-3"><div className="card p-4 text-center"><h5>Active Customers</h5><h3>843</h3></div></div>
        <div className="col-md-3"><div className="card p-4 text-center"><h5>Pending Tasks</h5><h3>2</h3></div></div>
        <div className="col-md-3"><div className="card p-4 text-center"><h5>Overdue</h5><h3>24</h3></div></div>
      </div>
    </div>
  );
};

export default Dashboard;