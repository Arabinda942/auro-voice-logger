import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  LayoutDashboard, Radio, UsersRound, Building2, Headphones,
  BookUser, PhoneCall, History, Mic, PhoneMissed, Upload,
  FileBarChart, LogOut
} from 'lucide-react';

const sections = [
  { label: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/live', label: 'Live Monitor', icon: Radio, badge: 'live' },
  ]},
  { label: 'Management', items: [
    { to: '/admin/users', label: 'User Accounts', icon: UsersRound },
    { to: '/admin/branches', label: 'Branches', icon: Building2 },
    { to: '/admin/dealers', label: 'Agents / Dealers', icon: Headphones },
    { to: '/admin/clients', label: 'Clients', icon: BookUser },
    { to: '/admin/sip', label: 'SIP Lines', icon: PhoneCall },
  ]},
  { label: 'Records', items: [
    { to: '/admin/calls', label: 'Call Logs', icon: History },
    { to: '/admin/recordings', label: 'Recordings', icon: Mic },
    { to: '/admin/missed', label: 'Missed Calls', icon: PhoneMissed, badge: 'missed' },
  ]},
  { label: 'Data', items: [
    { to: '/admin/upload', label: 'Excel Import', icon: Upload },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  ]},
];

export default function AdminSidebar({ liveCalls = 0, missedCalls = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SA';

  const getBadge = (key) => {
    if (key === 'live' && liveCalls > 0) return liveCalls;
    if (key === 'missed' && missedCalls > 0) return missedCalls;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">AL</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">AURO Limited</span>
          <span className="sidebar-logo-sub">Voice Logger</span>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map(sec => (
          <div className="sidebar-section" key={sec.label}>
            <div className="sidebar-section-label">{sec.label}</div>
            {sec.items.map(item => {
              const badge = item.badge ? getBadge(item.badge) : null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                >
                  <item.icon size={15} />
                  {item.label}
                  {badge ? <span className="sidebar-badge">{badge}</span> : null}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
