import React, {
  useRef,
  useEffect,
  useState,
  createContext
} from 'react';

import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';


import AgentSidebar from '../../components/AgentSidebar';
import Toast, { setGlobalToast } from '../../components/Toast';


import AgentDashboard from './AgentDashboard';
import DialPad from './DialPad';
import MyCalls from './MyCalls';
import AgentMissed from './AgentMissed';
import MyNumbers from './MyNumbers';
import PriorityFailover from './PriorityFailover';
import AgentRecordings from './AgentRecordings';
import AgentClients from './AgentClients';



export const CallContext = createContext(null);



const titles = {

  '/agent':
    'Dashboard',

  '/agent/dial':
    'Dial Pad',

  '/agent/clients':
    'Clients',

  '/agent/calls':
    'My Calls',

  '/agent/missed':
    'Missed Calls',

  '/agent/numbers':
    'My Numbers',

  '/agent/priority':
    'Priority & Failover',

  '/agent/recordings':
    'Recordings',

};



export default function AgentLayout() {


  const toastRef = useRef(null);

  const location = useLocation();


  const [callState,setCallState] = useState({

    status:'idle',

    caller:null

  });



  useEffect(()=>{

    setGlobalToast(toastRef);

  },[]);




  return (


    <CallContext.Provider

      value={{

        callState,

        setCallState

      }}

    >



      <div className="app-shell">



        <AgentSidebar missedCount={0}/>




        <div className="main-area">



          <header className="topbar">



            <div className="topbar-title">

              {
                titles[location.pathname]
                ||
                'Agent Portal'
              }

            </div>




            <div className="live-pill">


              <div className="live-dot"/>


              Online


            </div>




            <select

              className="btn btn-sm"

              style={{
                cursor:'pointer'
              }}

            >

              <option>
                Available
              </option>

              <option>
                On Break
              </option>

              <option>
                DND
              </option>


            </select>



          </header>





          <main className="content">


            <Routes>



              <Route

                index

                element={<AgentDashboard/>}

              />



              <Route

                path="dial"

                element={<DialPad/>}

              />



              <Route

                path="clients"

                element={<AgentClients/>}

              />



              <Route

                path="calls"

                element={<MyCalls/>}

              />



              <Route

                path="missed"

                element={<AgentMissed/>}

              />



              <Route

                path="numbers"

                element={<MyNumbers/>}

              />



              <Route

                path="priority"

                element={<PriorityFailover/>}

              />



              <Route

                path="recordings"

                element={<AgentRecordings/>}

              />



            </Routes>



          </main>



        </div>



        <Toast ref={toastRef}/>



      </div>



    </CallContext.Provider>


  );

}
