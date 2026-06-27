import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

import {
  LayoutDashboard,
  PhoneOutgoing,
  History,
  PhoneMissed,
  Smartphone,
  ArrowDownUp,
  Mic,
  Users,
  LogOut
} from 'lucide-react';


const navItems = [

  {
    to: '/agent',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true
  },

  {
    to: '/agent/dial',
    label: 'Dial Pad',
    icon: PhoneOutgoing
  },

  {
    to: '/agent/calls',
    label: 'My Calls',
    icon: History
  },

  {
    to: '/agent/missed',
    label: 'Missed Calls',
    icon: PhoneMissed,
    badge: true
  },

  {
    to: '/agent/numbers',
    label: 'My Numbers',
    icon: Smartphone
  },

  {
    to: '/agent/priority',
    label: 'Priority & Failover',
    icon: ArrowDownUp
  },

  {
    to: '/agent/recordings',
    label: 'Recordings',
    icon: Mic
  },


  // Added Client List
  {
    to: '/agent/clients',
    label: 'Clients',
    icon: Users
  }

];


export default function AgentSidebar({ missedCount = 0 }) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();


  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    || 'AG';



  return (

    <aside className="sidebar">


      <div className="sidebar-logo">

        <div className="sidebar-logo-mark">
          AL
        </div>


        <div className="sidebar-logo-text">

          <span className="sidebar-logo-name">
            AURO Limited
          </span>

          <span className="sidebar-logo-sub">
            Voice Logger
          </span>

        </div>

      </div>



      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 0'
        }}
      >


        {navItems.map(item => (

          <NavLink

            key={item.to}

            to={item.to}

            end={item.end}

            className={({isActive}) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }

          >

            <item.icon size={15}/>

            {item.label}


            {item.badge && missedCount > 0 && (

              <span className="sidebar-badge">

                {missedCount}

              </span>

            )}


          </NavLink>

        ))}


      </nav>




      <div className="sidebar-footer">


        <div className="sidebar-user">


          <div className="sidebar-avatar">

            {initials}

          </div>



          <div>

            <div className="sidebar-user-name">

              {user?.name}

            </div>


            <div className="sidebar-user-role">

              {user?.branch || 'Agent'}

            </div>


          </div>



          <button

            className="sidebar-logout"

            onClick={() => {

              logout();

              navigate('/login');

            }}

          >

            <LogOut size={15}/>

          </button>



        </div>


      </div>


    </aside>

  );

}
