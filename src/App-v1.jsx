import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, Calendar, FileText, Plus, Search, ChevronRight, CheckCircle, Clock, 
  AlertCircle, Download, Printer, X, Edit, Trash2, GraduationCap, Mail, Settings, Save, Upload, 
  ExternalLink, Bell, Link, BarChart2, PieChart, Filter, UserCheck, Clock3, Archive, UserPlus, 
  ArrowLeft, AlertTriangle, Lock, LogOut, Key, Shield, Briefcase
} from 'lucide-react';

// --- CONFIGURATION ---
const PROGRAM_STRUCTURE = {
  PGD: { label: "Post Graduate Diploma (PGD)", stages: [{ id: 'final', label: 'Final Project Defense' }], color: 'bg-emerald-500', maxMonths: 18 },
  MSc: { label: "Master of Science (MSc)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-blue-500', maxMonths: 24 },
  MPhil: { label: "Master of Philosophy (MPhil)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-cyan-500', maxMonths: 24 },
  PhD: { label: "Doctor of Philosophy (PhD)", stages: [{ id: 'proposal', label: 'Proposal Defense' }, { id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }, { id: 'viva', label: 'Viva Voce' }], color: 'bg-purple-600', maxMonths: 48 }
};
const DEFAULT_STRUCTURE = { label: "Unknown", stages: [], color: 'bg-gray-500', maxMonths: 24 };

const INITIAL_STUDENTS = [
  { id: '1', name: 'John Doe', regNumber: 'PG/2023/001', email: 'john@mcu.edu.ng', program: 'PhD', supervisor: 'Dr. A. Smith', coSupervisor: 'Prof. K. Mensah', status: 'Active', joinedDate: '2023-01-15', progress: { proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent', docLink: '' }, predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' } } }
];
const INITIAL_STAFF = [
  { id: 's1', name: 'Dr. A. Smith', email: 'smith@mcu.edu.ng', department: 'Computer Science', password: 'staff' }
];

// --- HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (d) => { try { return d ? new Date(d).toLocaleDateString('en-GB') : '-'; } catch { return '-'; } };
const getDurationStats = (d, p) => {
  if (!d) return { text: '', status: 'neutral' };
  try {
    const diff = (new Date() - new Date(d)) / (1000 * 60 * 60 * 24 * 30.44); // months
    const limit = (PROGRAM_STRUCTURE[p] || DEFAULT_STRUCTURE).maxMonths;
    return { text: `${(diff/12).toFixed(1)} yrs`, status: diff > limit ? 'critical' : diff > limit-6 ? 'warning' : 'good' };
  } catch { return { text: '', status: 'neutral' }; }
};
const calculateProgress = (s) => {
  if(!s) return 0;
  const stages = (PROGRAM_STRUCTURE[s.program] || DEFAULT_STRUCTURE).stages;
  if(!stages.length) return 0;
  const completed = stages.filter(st => s.progress?.[st.id]?.status === 'completed').length;
  return Math.round((completed / stages.length) * 100);
};

// --- SUB-COMPONENTS (Defined outside to prevent ReferenceErrors) ---

const LoginView = ({ onLogin, verify }) => {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const handleReset = () => { if(confirm('Reset Admin password?')) { localStorage.removeItem('pg_auth_config'); window.location.reload(); }};
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center text-white">
          <GraduationCap size={40} className="mx-auto mb-2"/>
          <h1 className="text-2xl font-bold">McPherson University</h1><p>Postgraduate Portal</p>
        </div>
        <div className="p-8">
          <form onSubmit={(e) => { e.preventDefault(); const user = verify(u, p); user ? onLogin(user) : setErr('Invalid credentials'); }}>
            <div className="mb-4"><label className="block text-sm font-bold mb-1">Username/Email</label><input className="w-full p-2 border rounded" value={u} onChange={e=>setU(e.target.value)} required/></div>
            <div className="mb-6"><label className="block text-sm font-bold mb-1">Password</label><input type="password" className="w-full p-2 border rounded" value={p} onChange={e=>setP(e.target.value)} required/></div>
            {err && <p className="text-red-500 text-sm mb-4">{err}</p>}
            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Login</button>
          </form>
          <button onClick={handleReset} className="block w-full text-center text-xs text-indigo-500 mt-4 underline">Reset Admin Password</button>
        </div>
      </div>
    </div>
  );
};

const FiltersBar = ({ selectedSupervisor, setSelectedSupervisor, selectedProgram, setSelectedProgram, supervisors }) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border"><Filter size={16}/><select value={selectedSupervisor} onChange={e=>setSelectedSupervisor(e.target.value)} className="bg-transparent text-sm outline-none">{supervisors.map(s=><option key={s}>{s}</option>)}</select></div>
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border"><GraduationCap size={16}/><select value={selectedProgram} onChange={e=>setSelectedProgram(e.target.value)} className="bg-transparent text-sm outline-none"><option>All Programs</option>{Object.keys(PROGRAM_STRUCTURE).map(p=><option key={p}>{p}</option>)}</select></div>
  </div>
);

const DashboardView = ({ stats, analytics, setActiveTab, setSelectedProgram, filtersProps }) => (
  <div className="space-y-6 animate-in fade-in">
    <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Overview</h2><FiltersBar {...filtersProps}/></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { l:'Active', v:stats.total, i:Users, c:'bg-indigo-600', fn:()=>setActiveTab('students') },
        { l:'PhD', v:stats.phd, i:GraduationCap, c:'bg-purple-600', fn:()=>{setSelectedProgram('PhD'); setActiveTab('students')} },
        { l:'Alumni', v:stats.alumni, i:Archive, c:'bg-gray-600', fn:()=>setActiveTab('alumni') },
        { l:'At Risk', v:stats.delayed, i:AlertTriangle, c:'bg-red-500', fn:()=>setActiveTab('students') }
      ].map((x,i)=>(<div key={i} onClick={x.fn} className="bg-white p-6 rounded-xl border flex justify-between cursor-pointer hover:shadow-md"><div><p className="text-gray-500">{x.l}</p><h3 className="text-3xl font-bold">{x.v}</h3></div><div className={`p-3 rounded-lg text-white ${x.c}`}><x.i/></div></div>))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border"><h3 className="font-bold mb-4 flex gap-2"><PieChart size={18}/> Distribution</h3>
        <div className="flex items-end h-32 gap-2 justify-center">{analytics.donutData.map((d,i)=>(<div key={i} className="w-8 bg-indigo-200 rounded-t" style={{height:`${d.value*10}px`, background:d.color}}></div>))}</div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">{analytics.donutData.map((d,i)=>(<div key={i} className="text-xs flex items-center"><span className="w-2 h-2 rounded mr-1" style={{background:d.color}}></span>{d.label}</div>))}</div>
      </div>
      <div className="bg-white p-6 rounded-xl border md:col-span-2"><h3 className="font-bold mb-4 flex gap-2"><BarChart2 size={18}/> Pipeline</h3>
        <div className="flex items-end h-32 gap-2">{analytics.pipelineData.map((d,i)=>(<div key={i} className="flex-1 bg-indigo-500 rounded-t hover:opacity-80 relative group" style={{height:`${d.value*20}px`}}><span className="absolute -top-5 w-full text-center text-xs opacity-0 group-hover:opacity-100">{d.value}</span></div>))}</div>
        <div className="flex justify-between mt-2">{analytics.pipelineData.map((d,i)=><span key={i} className="text-xs text-gray-500">{d.label}</span>)}</div>
      </div>
    </div>
  </div>
);

const ReportView = ({ students, exportFn, printFn, filtersProps }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center bg-white p-4 rounded-xl border no-print">
      <div><h2 className="font-bold">Generate Reports</h2><div className="mt-2"><FiltersBar {...filtersProps}/></div></div>
      <div className="flex gap-2">
        <button onClick={exportFn} className="px-4 py-2 bg-green-600 text-white rounded flex items-center"><Download size={16} className="mr-2"/> CSV</button>
        <button onClick={printFn} className="px-4 py-2 bg-gray-800 text-white rounded flex items-center"><Printer size={16} className="mr-2"/> PDF</button>
      </div>
    </div>
    <div id="printable-area" className="bg-white p-8 rounded-xl border">
      <div className="text-center mb-6 border-b pb-6">
        <h1 className="text-3xl font-bold uppercase">McPherson University</h1><h2 className="text-xl font-bold text-indigo-900">College of Computing</h2>
        <h3 className="text-lg font-bold text-gray-600 mt-2">Postgraduate Progress Report</h3>
        <p className="text-sm text-gray-400">{new Date().toLocaleDateString()}</p>
      </div>
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b-2 border-gray-800"><th>Reg. No</th><th>Name</th><th>Program</th><th>Supervisors</th><th>Progress</th></tr></thead>
        <tbody>
          {students.map(s => (
            <React.Fragment key={s.id}>
              <tr className="border-b bg-gray-50"><td className="p-2">{s.regNumber}</td><td className="p-2 font-bold">{s.name}</td><td className="p-2">{s.program}</td><td className="p-2">{s.supervisor}</td><td className="p-2 font-bold">{calculateProgress(s)}%</td></tr>
              <tr className="print:table-row hidden"><td colSpan="5" className="p-2 pb-4"><div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                {(PROGRAM_STRUCTURE[s.program] || DEFAULT_STRUCTURE).stages.map(st => { const p = s.progress?.[st.id]; return <div key={st.id} className="border p-1 rounded"><strong>{st.label}:</strong> {p ? p.status.toUpperCase() : 'Pending'}</div>})}
              </div></td></tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsView = ({ onBackup, onRestoreClick, onImportClick, fileRef, csvRef, onFileChange, onCsvChange, onUpdatePassword, newPass, setNewPass, username }) => (
  <div className="grid gap-6 md:grid-cols-3 animate-in fade-in">
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="font-bold mb-4 flex items-center gap-2"><Save size={20}/> Backup</h3>
      <button onClick={onBackup} className="w-full py-2 bg-indigo-600 text-white rounded mb-4">Download Data</button>
      <button onClick={onRestoreClick} className="w-full py-2 border rounded text-gray-600">Restore Data</button>
      <input type="file" ref={fileRef} onChange={onFileChange} className="hidden"/>
    </div>
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={20}/> Bulk Import</h3>
      <button onClick={onImportClick} className="w-full py-2 border border-emerald-600 text-emerald-600 rounded">Import CSV</button>
      <input type="file" ref={csvRef} onChange={onCsvChange} className="hidden"/>
    </div>
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={20}/> Security</h3>
      <form onSubmit={onUpdatePassword}>
        <p className="text-xs text-gray-500 mb-2">User: {username}</p>
        <input type="password" placeholder="New Password" className="w-full p-2 border rounded mb-2" value={newPass} onChange={e=>setNewPass(e.target.value)}/>
        <button className="w-full py-2 bg-gray-800 text-white rounded">Update</button>
      </form>
    </div>
  </div>
);

/**
 * MAIN COMPONENT
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(sessionStorage.getItem('pg_current_user')));
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('pg_students')) || INITIAL_STUDENTS);
  const [staff, setStaff] = useState(() => JSON.parse(localStorage.getItem('pg_staff')) || INITIAL_STAFF);
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('pg_auth_config')) || { username: 'admin', password: 'password123' });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSupervisor, setSelectedSupervisor] = useState('All Supervisors');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  
  // Modals & State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [reportStudent, setReportStudent] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  
  const [studentForm, setStudentForm] = useState({});
  const [staffForm, setStaffForm] = useState({});
  const [scheduleForm, setScheduleForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Effects
  useEffect(() => { localStorage.setItem('pg_students', JSON.stringify(students)) }, [students]);
  useEffect(() => { localStorage.setItem('pg_staff', JSON.stringify(staff)) }, [staff]);
  useEffect(() => { sessionStorage.setItem('pg_current_user', JSON.stringify(currentUser)) }, [currentUser]);

  // Logic
  const uniqueSupervisors = useMemo(() => {
    const sups = new Set(staff.map(s => s.name));
    students.forEach(s => { if(s.supervisor) sups.add(s.supervisor); });
    return ['All Supervisors', ...Array.from(sups).sort()];
  }, [staff, students]);

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchesSearch = (s.name+s.regNumber).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = currentUser?.role === 'staff' ? (s.supervisor === currentUser.name || s.coSupervisor === currentUser.name) : (selectedSupervisor === 'All Supervisors' || s.supervisor === selectedSupervisor || s.coSupervisor === selectedSupervisor);
    const matchesProgram = selectedProgram === 'All Programs' || s.program === selectedProgram;
    return matchesSearch && matchesRole && matchesProgram;
  }), [students, searchTerm, selectedSupervisor, selectedProgram, currentUser]);

  const activeStudents = filteredStudents.filter(s => s.status !== 'Alumni');
  const alumniStudents = filteredStudents.filter(s => s.status === 'Alumni');

  const stats = {
    total: activeStudents.length,
    phd: activeStudents.filter(s => s.program === 'PhD').length,
    alumni: students.filter(s => s.status === 'Alumni').length,
    delayed: activeStudents.filter(s => getDurationStats(s.joinedDate, s.program).status === 'critical').length
  };

  const analytics = {
    donutData: ['PhD','MSc','MPhil','PGD'].map(p => ({ label: p, value: activeStudents.filter(s => s.program === p).length, color: PROGRAM_STRUCTURE[p].color.replace('bg-','') })),
    pipelineData: [{id:'proposal',label:'Proposal'},{id:'viva',label:'Viva'}].map(st => ({ label: st.label, value: activeStudents.filter(s => s.progress?.[st.id]?.status === 'completed').length, color: 'bg-indigo-500' }))
  };

  const verifyCredentials = (u, p) => {
    if (u === adminConfig.username && p === adminConfig.password) return { name: 'Administrator', role: 'admin' };
    const s = staff.find(st => st.email === u && st.password === p);
    return s ? { name: s.name, role: 'staff' } : null;
  };

  // Handlers
  const handleUpdatePassword = (e) => { e.preventDefault(); setAdminConfig(prev => ({...prev, password: newPassword})); alert('Password Updated'); localStorage.setItem('pg_auth_config', JSON.stringify({...adminConfig, password: newPassword})); };
  const handleBackup = () => { const a = document.createElement('a'); a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({students, staff})); a.download = 'backup.json'; a.click(); };
  const handleRestore = (e) => { const r = new FileReader(); r.onload = (ev) => { const d = JSON.parse(ev.target.result); if(confirm('Restore?')) { setStudents(d.students || []); setStaff(d.staff || []); }}; r.readAsText(e.target.files[0]); };
  
  if (!currentUser) return <LoginView onLogin={setCurrentUser} verify={verifyCredentials} />;

  // Render Views based on Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView stats={stats} analytics={analytics} setActiveTab={setActiveTab} setSelectedProgram={setSelectedProgram} filtersProps={{selectedSupervisor, setSelectedSupervisor, selectedProgram, setSelectedProgram, supervisors: uniqueSupervisors}} />;
      case 'reports': return <ReportView students={filteredStudents} exportFn={() => { /* Reuse existing logic */ }} printFn={() => window.print()} filtersProps={{selectedSupervisor, setSelectedSupervisor, selectedProgram, setSelectedProgram, supervisors: uniqueSupervisors}} />;
      case 'settings': return <SettingsView onBackup={handleBackup} onRestoreClick={() => fileInputRef.current.click()} onImportClick={() => csvInputRef.current.click()} fileRef={fileInputRef} csvRef={csvInputRef} onFileChange={handleRestore} onCsvChange={(e) => { /* Reuse CSV logic */ }} onUpdatePassword={handleUpdatePassword} newPass={newPassword} setNewPass={setNewPassword} username={adminConfig.username} />;
      // ... Add other cases (Students, Staff, Alumni) similarly, or keep them inline if simple
      default: return null;
    }
  };

  // For brevity in this fix block, I'm returning the main structure. 
  // You should copy the full implementation from the previous blocks for Students/Staff/Alumni views, 
  // but ensure ReportView and SettingsView use the definitions above.
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <style>{`@media print { .no-print, aside, nav, .sidebar { display: none !important; } body, main { margin: 0 !important; width: 100% !important; } #printable-area { display: block !important; visibility: visible !important; } body * { visibility: hidden; } #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; } }`}</style>
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r no-print">
        <div className="p-6 border-b font-bold text-xl flex items-center gap-2"><GraduationCap className="text-indigo-600"/> McU Postgrad</div>
        <nav className="p-4 space-y-2">
          {['dashboard', 'students', 'staff', 'alumni', 'reports', 'settings'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left p-3 rounded capitalize ${activeTab === t ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}>{t}</button>
          ))}
        </nav>
        <div className="p-4 border-t"><button onClick={() => setCurrentUser(null)} className="flex items-center text-red-600"><LogOut size={16} className="mr-2"/> Sign Out</button></div>
      </div>
      <main className="md:ml-64 p-8 min-h-screen">
        {/* Render the specific view based on activeTab */}
        {activeTab === 'reports' ? <ReportView students={filteredStudents} printFn={() => window.print()} filtersProps={{selectedSupervisor, setSelectedSupervisor, selectedProgram, setSelectedProgram, supervisors: uniqueSupervisors}} /> : 
         activeTab === 'settings' ? <SettingsView onBackup={handleBackup} onRestoreClick={()=>fileInputRef.current.click()} onImportClick={()=>csvInputRef.current.click()} fileRef={fileInputRef} csvRef={csvInputRef} onFileChange={handleRestore} onUpdatePassword={handleUpdatePassword} newPass={newPassword} setNewPass={setNewPassword} username={adminConfig.username} /> :
         /* Placeholder for other tabs to save space in this specific response block, in real app put full switch/case */
         activeTab === 'dashboard' ? <DashboardView stats={stats} analytics={analytics} setActiveTab={setActiveTab} setSelectedProgram={setSelectedProgram} filtersProps={{selectedSupervisor, setSelectedSupervisor, selectedProgram, setSelectedProgram, supervisors: uniqueSupervisors}} /> :
         <div className="text-center mt-20 text-gray-500">Select a tab (Full code in previous response has all views)</div>
        }
      </main>
      {/* Modals go here */}
    </div>
  );
}