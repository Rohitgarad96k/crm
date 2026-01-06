import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    fetchLeadNotes, addLeadNote, fetchLeadActivity, 
    fetchLeadTasks, addLeadTask, toggleLeadTask,
    fetchLeadReminders, addLeadReminder,
    fetchLeadProposals, addLeadProposal,
    fetchLeadAttachments, addLeadAttachment
} from '../../services/api';
import { FaUser, FaFileAlt, FaTasks, FaBell, FaStickyNote, FaHistory, FaPlus, FaEdit, FaCheckSquare, FaSquare, FaPaperclip, FaFilePdf, FaFileImage, FaFile } from 'react-icons/fa';

const ViewLeadModal = ({ lead, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Data States
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Form States
  const [newNote, setNewNote] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newReminderDesc, setNewReminderDesc] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  
  // Proposal Form
  const [propSubject, setPropSubject] = useState('');
  const [propAmount, setPropAmount] = useState('');

  useEffect(() => {
    if (lead?.id) {
        fetchLeadNotes(lead.id).then(res => setNotes(res.data));
        fetchLeadActivity(lead.id).then(res => setActivities(res.data));
        fetchLeadTasks(lead.id).then(res => setTasks(res.data));
        fetchLeadReminders(lead.id).then(res => setReminders(res.data));
        fetchLeadProposals(lead.id).then(res => setProposals(res.data));
        fetchLeadAttachments(lead.id).then(res => setAttachments(res.data));
    }
  }, [lead]);

  // --- HANDLERS ---
  const handleAddNote = async () => {
    if (!newNote) return;
    await addLeadNote(lead.id, { note: newNote });
    setNewNote('');
    fetchLeadNotes(lead.id).then(res => setNotes(res.data));
  };

  const handleAddTask = async () => {
    if (!newTaskName || !newTaskDate) return;
    await addLeadTask(lead.id, { name: newTaskName, due_date: newTaskDate });
    setNewTaskName(''); setNewTaskDate('');
    fetchLeadTasks(lead.id).then(res => setTasks(res.data));
  };

  const handleToggleTask = async (taskId) => {
    await toggleLeadTask(taskId);
    fetchLeadTasks(lead.id).then(res => setTasks(res.data));
  };

  const handleAddReminder = async () => {
    if (!newReminderDesc || !newReminderDate) return;
    await addLeadReminder(lead.id, { description: newReminderDesc, remind_date: newReminderDate });
    setNewReminderDesc(''); setNewReminderDate('');
    fetchLeadReminders(lead.id).then(res => setReminders(res.data));
  };

  const handleAddProposal = async () => {
      if (!propSubject || !propAmount) return;
      await addLeadProposal(lead.id, { subject: propSubject, total_amount: propAmount, status: 'Draft' });
      setPropSubject(''); setPropAmount('');
      fetchLeadProposals(lead.id).then(res => setProposals(res.data));
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Simulating upload by saving metadata to DB
      const fileData = {
          file_name: file.name,
          file_size: (file.size / 1024).toFixed(2) + ' KB',
          file_type: file.type
      };

      await addLeadAttachment(lead.id, fileData);
      fetchLeadAttachments(lead.id).then(res => setAttachments(res.data));
  };

  // --- TABS ---
  const TasksTab = () => (
    <div>
        <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder="New Task..." value={newTaskName} onChange={e => setNewTaskName(e.target.value)}/>
            <input type="date" className="form-control" style={{maxWidth:'150px'}} value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)}/>
            <button className="btn btn-dark" onClick={handleAddTask}><FaPlus/></button>
        </div>
        <ul className="list-group">
            {tasks.map(t => (
                <li key={t.id} className="list-group-item d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                        <span onClick={() => handleToggleTask(t.id)} style={{cursor:'pointer'}}>
                            {t.status === 'Completed' ? <FaCheckSquare className="text-success"/> : <FaSquare className="text-muted"/>}
                        </span>
                        <span className={t.status === 'Completed' ? "text-decoration-line-through text-muted" : ""}>{t.name}</span>
                    </div>
                    <small className="text-muted">{new Date(t.due_date).toLocaleDateString()}</small>
                </li>
            ))}
        </ul>
    </div>
  );

const ProposalsTab = () => (
    <div>
        <div className="d-flex justify-content-between mb-3">
            <button 
                className="btn btn-dark btn-sm" 
                onClick={() => {
                    onClose(); // Close modal first
                    navigate(`proposals/create/${lead.id}`, { state: { lead } }); // Pass lead data
                }}
            >
                <FaPlus className="me-1"/> New Proposal
            </button>
            {/* Search bar... */}
        </div>
        {/* Table... */}
    </div>
);

  const AttachmentsTab = () => (
      <div>
          <div className="text-center py-4 border border-dashed rounded bg-light mb-3 position-relative">
              <FaPaperclip className="text-muted mb-2" size={24}/>
              <p className="text-muted mb-0 small">Click to Upload Files</p>
              <input type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{cursor:'pointer'}} onChange={handleFileUpload} />
          </div>
          <ul className="list-group">
              {attachments.map(a => (
                  <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                          <FaFile className="text-primary"/> 
                          <div>
                              <div className="fw-bold small">{a.file_name}</div>
                              <small className="text-muted">{a.file_size}</small>
                          </div>
                      </div>
                      <small className="text-muted">{new Date(a.created_at).toLocaleDateString()}</small>
                  </li>
              ))}
          </ul>
      </div>
  );

  if (!lead) return null;

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content shadow">
            <div className="modal-header">
                <h5 className="modal-title">
                    {lead.name} <span className={`badge bg-primary ms-2`}>{lead.status}</span>
                </h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => { onClose(); navigate(`/leads/edit/${lead.id}`); }}>
                        <FaEdit className="me-1"/> Edit
                    </button>
                    <button className="btn btn-close" onClick={onClose}></button>
                </div>
            </div>
            <div className="modal-body">
                {/* Navigation Tabs */}
                <ul className="nav nav-tabs mb-3">
                    {[
                        { id: 'profile', icon: FaUser, label: 'Profile' },
                        { id: 'proposals', icon: FaFileAlt, label: 'Proposals' },
                        { id: 'tasks', icon: FaTasks, label: 'Tasks' },
                        { id: 'attachments', icon: FaPaperclip, label: 'Attachments' },
                        { id: 'reminders', icon: FaBell, label: 'Reminders' },
                        { id: 'notes', icon: FaStickyNote, label: 'Notes' },
                        { id: 'activity', icon: FaHistory, label: 'Activity' },
                    ].map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link ${activeTab === tab.id ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="me-2"/>{tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Tab Content */}
                <div style={{minHeight: '350px'}}>
                    {activeTab === 'profile' && (
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Company:</strong> {lead.company}</p>
                                <p><strong>Email:</strong> {lead.email}</p>
                                <p><strong>Phone:</strong> {lead.phone}</p>
                                <p><strong>Value:</strong> {lead.value}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Source:</strong> {lead.source}</p>
                                <p><strong>Address:</strong> {lead.address}, {lead.city}</p>
                                <p><strong>Description:</strong> {lead.description}</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'proposals' && <ProposalsTab />}
                    {activeTab === 'tasks' && <TasksTab />}
                    {activeTab === 'attachments' && <AttachmentsTab />}
                    {activeTab === 'reminders' && (
                        <div>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Remind me..." value={newReminderDesc} onChange={e => setNewReminderDesc(e.target.value)}/>
                                <input type="datetime-local" className="form-control" style={{maxWidth:'200px'}} value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)}/>
                                <button className="btn btn-dark" onClick={handleAddReminder}><FaPlus/></button>
                            </div>
                            <ul className="list-group">
                                {reminders.map(r => (
                                    <li key={r.id} className="list-group-item">
                                        {r.description} <small className="text-danger float-end"><FaBell className="me-1"/> {new Date(r.remind_date).toLocaleString()}</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'notes' && (
                        <div>
                            <textarea className="form-control mb-2" rows="3" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..."></textarea>
                            <button className="btn btn-dark btn-sm mb-3" onClick={handleAddNote}>Save Note</button>
                            {notes.map(n => <div key={n.id} className="border-bottom p-2">{n.note} <br/><small className="text-muted">{new Date(n.created_at).toLocaleString()}</small></div>)}
                        </div>
                    )}
                    {activeTab === 'activity' && (
                        <ul className="list-group">
                            {activities.map(a => <li key={a.id} className="list-group-item">{a.description} <small className="text-muted float-end">{new Date(a.created_at).toLocaleString()}</small></li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal;