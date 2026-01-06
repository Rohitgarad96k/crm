import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { createLead } from '../../services/api';
import { FaCloudUploadAlt, FaFileCsv, FaCheckCircle, FaDownload, FaInfoCircle, FaSpinner, FaTimes } from 'react-icons/fa';

const ImportLeads = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, errors: 0 });
  const [isUploading, setIsUploading] = useState(false);

  // --- New Configuration State ---
  const [assignTo, setAssignTo] = useState('Me');
  const [targetGroup, setTargetGroup] = useState('');

  // --- 1. File Handling ---
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv') || selectedFile.type === "application/vnd.ms-excel")) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      alert("Invalid file format. Please upload a .csv file.");
    }
  };

  // --- 2. Parse CSV ---
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
            setParsedData(results.data);
            setStep(2);
        } else {
            alert("File appears empty or invalid.");
            setFile(null);
        }
      },
      error: (err) => alert("Error parsing CSV: " + err.message)
    });
  };

  // --- 3. Upload & Map Data ---
  const handleUpload = async () => {
    setIsUploading(true);
    setStep(3);
    let successCount = 0;
    let errorCount = 0;

    const total = parsedData.length;
    setUploadProgress({ current: 0, total, errors: 0 });

    for (let i = 0; i < total; i++) {
        const row = parsedData[i];
        
        // MAPPING LOGIC: Matches your requested fields exactly
        const leadData = {
            name: row['Name'] || 'Unknown Lead',
            position: row['Position'],
            company: row['Company'],
            description: row['Description'],
            address: row['Address'],
            city: row['City'],
            state: row['State'],
            zipcode: row['Zip'],
            country: row['Country'],
            status: row['Status'] || 'New',
            source: row['Source'],
            email: row['Email'],
            website: row['Website'],
            phone: row['Phonenumber'],
            value: parseFloat(row['Lead value']) || 0,
            tags: row['Tags'], 
            
            // --- UPDATED: Use Configuration Values ---
            owner: assignTo, // Uses the selected "Assign To" value
            // Note: If you implement Groups in the backend later, pass 'targetGroup' here
            
            currency: 'USD'
        };

        try {
            await createLead(leadData);
            successCount++;
        } catch (error) {
            console.error("Row import failed", row, error);
            errorCount++;
        }
        setUploadProgress({ current: i + 1, total, errors: errorCount });
    }

    setIsUploading(false);
    
    setTimeout(() => {
        alert(`Import Finished!\nSuccess: ${successCount}\nFailed: ${errorCount}`);
        navigate('/leads');
    }, 500);
  };

  const downloadTemplate = (e) => {
    e.preventDefault();
    const headers = [
        "Name", "Position", "Company", "Description", "Country", "Zip", "City", 
        "State", "Address", "Status", "Source", "Email", "Website", 
        "Phonenumber", "Lead value", "Tags"
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "lead_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2>Import Leads</h2><p className="text-muted">Bulk upload prospects via CSV</p></div>
      </div>

      <div className="card border-0 shadow-sm" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div className="card-body p-5">
            {/* Stepper */}
            <div className="d-flex justify-content-between mb-5 position-relative">
                <div className="position-absolute top-50 start-0 w-100 bg-light" style={{height: '2px', zIndex: 0}}></div>
                {['Upload File', 'Preview Data', 'Importing'].map((label, index) => (
                    <div key={index} className="text-center position-relative" style={{zIndex: 1}}>
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step > index + 1 ? 'bg-success text-white' : (step === index + 1 ? 'bg-primary text-white' : 'bg-secondary text-white')}`} style={{width: '30px', height: '30px'}}>
                            {step > index + 1 ? <FaCheckCircle /> : index + 1}
                        </div>
                        <small className={`fw-bold ${step === index + 1 ? 'text-primary' : 'text-muted'}`}>{label}</small>
                    </div>
                ))}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 1 && (
                <>
                    <div className="alert alert-light border d-flex mb-4 p-3 rounded">
                        <FaInfoCircle className="text-primary mt-1 me-3 flex-shrink-0" size={20} />
                        <div>
                            <h6 className="fw-bold mb-1">CSV Formatting Guidelines</h6>
                            <p className="mb-2 text-muted small">
                                Ensure your file uses the standard headers. Fields like <code>Name</code> and <code>Company</code> are recommended.
                            </p>
                            <a href="#" className="text-primary text-decoration-none small fw-bold" onClick={downloadTemplate}>
                                <FaDownload className="me-1"/> Download Sample CSV Template
                            </a>
                        </div>
                    </div>

                    <div 
                        className="border border-2 border-dashed rounded bg-light p-5 text-center mb-4"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{cursor: 'pointer'}}
                    >
                        <FaCloudUploadAlt className="text-primary mb-3" size={50} />
                        <h5>Drag & Drop CSV file</h5>
                        <input type="file" className="d-none" id="fileUpload" accept=".csv" onChange={handleFileSelect}/>
                        <label htmlFor="fileUpload" className="btn btn-outline-primary mt-2">Select CSV File</label>
                    </div>

                    {/* --- NEW: Configuration Section (Matches PDF) --- */}
                    <h6 className="fw-bold text-uppercase text-muted small mb-3">Default Values for New Records</h6>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Assign To</label>
                            <select 
                                className="form-select" 
                                value={assignTo}
                                onChange={(e) => setAssignTo(e.target.value)}
                            >
                                <option value="Me">Current User (Me)</option>
                                <option value="Admin">Admin</option>
                                <option value="Sales Team">Sales Team</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Add to Group</label>
                            <select 
                                className="form-select"
                                value={targetGroup}
                                onChange={(e) => setTargetGroup(e.target.value)}
                            >
                                <option value="">None</option>
                                <option value="High Priority">High Priority</option>
                                <option value="Wholesale">Wholesale</option>
                                <option value="Retail">Retail</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {/* STEP 2: PREVIEW */}
            {step === 2 && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between mb-3">
                        <h5 className="mb-0"><FaFileCsv className="me-2 text-success"/> {file.name} <span className="badge bg-info ms-2">{parsedData.length} Leads</span></h5>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => {setStep(1); setFile(null); setParsedData([])}}><FaTimes/> Cancel</button>
                    </div>
                    
                    <div className="table-responsive border rounded bg-white" style={{maxHeight: '500px', overflowY: 'auto'}}>
                        <table className="table table-bordered table-striped mb-0 small">
                            <thead className="bg-light sticky-top" style={{top: 0}}>
                                <tr>
                                    <th style={{width: 50}}>#</th>
                                    {parsedData.length > 0 && Object.keys(parsedData[0]).map((h, i) => <th key={i} className="text-nowrap">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="text-muted">{i+1}</td>
                                        {Object.values(row).map((val, j) => <td key={j} className="text-nowrap">{val}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="d-flex justify-content-end pt-3 mt-4 border-top gap-2">
                        <button className="btn btn-light" onClick={() => {setStep(1); setFile(null)}}>Back</button>
                        <button className="btn btn-primary px-4" onClick={handleUpload}>
                            <FaCheckCircle className="me-2"/> Import Leads
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: UPLOADING */}
            {step === 3 && (
                <div className="text-center py-5">
                    {isUploading ? (
                        <>
                            <FaSpinner className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} />
                            <h5>Importing...</h5>
                            <div className="progress mt-4 mx-auto" style={{maxWidth: '500px', height: '25px'}}>
                                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{width: `${(uploadProgress.current / uploadProgress.total) * 100}%`}}>
                                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                                </div>
                            </div>
                            <small className="text-muted mt-2 d-block">{uploadProgress.current} / {uploadProgress.total} records</small>
                        </>
                    ) : (
                        <div><FaCheckCircle className="text-success mb-3" size={50} /><h5>Done!</h5></div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImportLeads;