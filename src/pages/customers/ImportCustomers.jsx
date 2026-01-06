import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse'; // Import CSV parser
import { createContact } from '../../services/api';
import { FaCloudUploadAlt, FaFileCsv, FaCheckCircle, FaDownload, FaInfoCircle, FaSpinner, FaTimes } from 'react-icons/fa';

const ImportCustomers = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Uploading
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, errors: 0 });
  const [isUploading, setIsUploading] = useState(false);

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
    // Check for CSV extension or MIME type
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
            setStep(2); // Move to preview step
        } else {
            alert("The CSV file appears to be empty or invalid.");
            setFile(null);
        }
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
      }
    });
  };

  // --- 3. Map Data & Upload ---
  const handleUpload = async () => {
    setIsUploading(true);
    setStep(3);
    let successCount = 0;
    let errorCount = 0;

    const total = parsedData.length;
    setUploadProgress({ current: 0, total: total, errors: 0 });

    for (let i = 0; i < total; i++) {
        const row = parsedData[i];
        
        // MAPPING LOGIC: Matches the fields you requested
        const customerData = {
            // Combine Firstname + Lastname -> Name
            name: `${row['Firstname'] || ''} ${row['Lastname'] || ''}`.trim() || row['Company'] || 'Unknown',
            
            // Direct Mappings
            email: row['Email'],
            company: row['Company'],
            vat_number: row['Vat'], 
            website: row['Website'],
            
            // Phone Logic: Try Contact phone first, then general phone
            phone: row['Contact phonenumber'] || row['Phonenumber'],
            
            // Address Mappings (Prioritize Billing Address)
            address: row['Billing street'] || row['Address'],
            city: row['Billing city'] || row['City'],
            state: row['Billing state'] || row['State'],
            zipcode: row['Billing zip'] || row['Zip'],
            country: row['Billing country'] || row['Country'] || 'United States',
            
            // Defaults
            currency: 'USD',
            language: 'English',
            is_active: 1
        };

        try {
            await createContact(customerData);
            successCount++;
        } catch (error) {
            console.error("Row import failed", row, error);
            errorCount++;
        }

        setUploadProgress({ current: i + 1, total, errors: errorCount });
    }

    setIsUploading(false);
    
    // Finished
    setTimeout(() => {
        alert(`Import Finished!\nsuccessfully Imported: ${successCount}\nFailed: ${errorCount}`);
        navigate('/customers');
    }, 500);
  };

  // --- Template Download ---
  const downloadTemplate = (e) => {
    e.preventDefault();
    // Headers matching your requested fields
    const headers = [
        "Firstname", "Lastname", "Email", "Contact phonenumber", "Position", 
        "Company", "Vat", "Phonenumber", "Website", 
        "Address", "City", "State", "Zip", "Country",
        "Billing street", "Billing city", "Billing state", "Billing zip", "Billing country"
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Import Customers</h2>
          <p className="text-muted">Bulk upload records via CSV</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{maxWidth: '1200px', margin: '0 auto'}}>
        <div className="card-body p-5">
            {/* Stepper */}
            <div className="d-flex justify-content-between mb-5 position-relative">
                <div className="position-absolute top-50 start-0 w-100 bg-light" style={{height: '2px', zIndex: 0}}></div>
                {['Upload File', 'Preview & Validate', 'Importing'].map((label, index) => (
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
                                Ensure your file is strictly a <strong>.csv</strong>. The importer will automatically map specific columns like <code>Firstname</code>, <code>Lastname</code>, <code>Email</code>, etc.
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
                        <h5>Drag & Drop your CSV file here</h5>
                        <p className="text-muted">or click to browse</p>
                        <input 
                            type="file" 
                            className="d-none" 
                            id="fileUpload" 
                            accept=".csv"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="fileUpload" className="btn btn-outline-primary mt-2">Select CSV File</label>
                    </div>
                </>
            )}

            {/* STEP 2: PREVIEW (WHOLE DATA) */}
            {step === 2 && (
                <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                            <h5 className="mb-0 me-3"><FaFileCsv className="me-2 text-success"/> {file.name}</h5>
                            <span className="badge bg-info">{parsedData.length} Records Found</span>
                        </div>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => {setStep(1); setFile(null); setParsedData([])}}>
                            <FaTimes className="me-1"/> Cancel
                        </button>
                    </div>
                    
                    <p className="text-muted small">Please review the data below. This is exactly what will be imported into the system.</p>

                    {/* SCROLLABLE TABLE CONTAINER */}
                    <div className="table-responsive border rounded bg-white" style={{maxHeight: '500px', overflowY: 'auto'}}>
                        <table className="table table-bordered table-striped mb-0 small table-hover">
                            <thead className="bg-light sticky-top" style={{position: 'sticky', top: 0, zIndex: 10}}>
                                <tr>
                                    <th className="bg-light text-center" style={{width: '50px'}}>#</th>
                                    {parsedData.length > 0 && Object.keys(parsedData[0]).map((header, idx) => (
                                        <th key={idx} className="bg-light text-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, i) => (
                                    <tr key={i}>
                                        <td className="text-center text-muted">{i + 1}</td>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="text-nowrap" style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="d-flex justify-content-end pt-3 mt-4 border-top gap-2">
                        <button className="btn btn-light" onClick={() => {setStep(1); setFile(null); setParsedData([])}}>Back to Upload</button>
                        <button className="btn btn-primary px-4" onClick={handleUpload}>
                            <FaCheckCircle className="me-2"/> Import {parsedData.length} Customers
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
                            <h5>Importing Records...</h5>
                            <p className="text-muted">Please wait, do not close this window.</p>
                            <div className="progress mt-4 mx-auto" style={{height: '25px', maxWidth: '500px'}}>
                                <div 
                                    className="progress-bar progress-bar-striped progress-bar-animated" 
                                    style={{width: `${(uploadProgress.current / uploadProgress.total) * 100}%`}}
                                >
                                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                                </div>
                            </div>
                            <div className="mt-2 text-muted">
                                Processed {uploadProgress.current} of {uploadProgress.total} records (Errors: {uploadProgress.errors})
                            </div>
                        </>
                    ) : (
                        <div>
                            <FaCheckCircle className="text-success mb-3" size={50} />
                            <h5>Import Complete!</h5>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImportCustomers;