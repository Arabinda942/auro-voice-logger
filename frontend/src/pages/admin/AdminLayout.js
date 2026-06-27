import React, { useRef, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Toast, { setGlobalToast } from '../../components/Toast';

import Dashboard from './Dashboard';
import LiveMonitor from './LiveMonitor';
import Users from './Users';
import Branches from './Branches';
import Dealers from './Dealers';
import Clients from './Clients';
import SIPLines from './SIPLines';
import CallLogs from './CallLogs';
import Recordings from './Recordings';
import MissedCalls from './MissedCalls';
import ExcelUpload from './ExcelUpload';
import Reports from './Reports';
import { callsAPI } from '../../utils/api';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/live': 'Live Monitor',
  '/admin/users': 'User Accounts',
  '/admin/branches': 'Branch Management',
  '/admin/dealers': 'Agents & Dealers',
  '/admin/clients': 'Client Management',
  '/admin/sip': 'SIP Lines',
  '/admin/calls': 'Call Logs',
  '/admin/recordings': 'Recordings',
  '/admin/missed': 'Missed Calls',
  '/admin/upload': 'Excel Import',
  '/admin/reports': 'Reports & Analytics',
};

export default function AdminLayout() {
  const toastRef = useRef(null);
  const location = useLocation();
  const [missedCount, setMissedCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => { setGlobalToast(toastRef); }, []);

  useEffect(() => {
    callsAPI.list({ call_type: 'Missed' }).then(r => {
      setMissedCount(r.data.filter(c => c.status === 'Missed').length);
    }).catch(() => {});
  }, []);

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="app-shell">
      <AdminSidebar liveCalls={liveCount} missedCalls={missedCount} />
      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
          </div>
          {liveCount > 0 && (
            <div className="live-pill">
              <div className="live-dot" />
              {liveCount} live
            </div>
          )}
        </header>
        <main className="content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="live" element={<LiveMonitor onLiveCount={setLiveCount} />} />
            <Route path="users" element={<Users />} />
            <Route path="branches" element={<Branches />} />
            <Route path="dealers" element={<Dealers />} />
            <Route path="clients" element={<Clients />} />
            <Route path="sip" element={<SIPLines />} />
            <Route path="calls" element={<CallLogs />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="missed" element={<MissedCalls />} />
            <Route path="upload" element={<ExcelUpload />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
      <Toast ref={toastRef} />
    </div>
  );
}
