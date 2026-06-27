import React, { useEffect, useState } from 'react';
import { clientsAPI } from '../../utils/api';
import { Phone, Search } from 'lucide-react';
import { toast } from '../../components/Toast';


export default function AgentClients() {

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');


  useEffect(() => {
    loadClients();
  }, []);


  const loadClients = async () => {

    try {

      const res = await clientsAPI.list();

      setClients(res.data);

    } catch (e) {

      toast("Failed loading clients", "error");

    }

  };



  const callClient = (client) => {

    toast(
      `Calling ${client.name} : ${client.mobile}`,
      "success"
    );

    console.log("CALLING:", client.mobile);

  };



  const filtered = clients.filter(c => {

    const value = search.toLowerCase().trim();

    return (

      c.name?.toLowerCase().includes(value)

      ||

      c.mobile?.toString().includes(value)

      ||

      c.ucc_code?.toLowerCase().includes(value)

      ||

      c.email?.toLowerCase().includes(value)

    );

  });



  return (

    <div>


      <h2>
        My Clients
      </h2>



      <div className="card">



        <div
          style={{
            display:'flex',
            gap:'10px',
            marginBottom:'20px',
            alignItems:'center'
          }}
        >


          <div
            style={{
              position:'relative',
              flex:1
            }}
          >

            <Search

              size={18}

              style={{
                position:'absolute',
                left:'12px',
                top:'12px',
                color:'#777'
              }}

            />


            <input

              className="search-input"

              style={{

                width:'100%',
                padding:'12px 12px 12px 40px',
                borderRadius:'8px',
                border:'1px solid #ccc',
                fontSize:'15px'

              }}

              placeholder="Search name, mobile number, UCC, email..."

              value={search}

              onChange={
                e => setSearch(e.target.value)
              }

            />


          </div>



          {
            search &&

            <button

              className="btn"

              onClick={() => setSearch('')}

            >

              Clear

            </button>

          }



        </div>




        <div className="table-wrap">


        <table className="data-table">


          <thead>

            <tr>

              <th>Name</th>

              <th>Mobile</th>

              <th>UCC</th>

              <th>Email</th>

              <th>Branch</th>

              <th>Action</th>


            </tr>

          </thead>



          <tbody>



          {

          filtered.length === 0 ?


          <tr>

            <td colSpan="6"
            style={{
              textAlign:'center',
              padding:'25px'
            }}
            >

              No clients found

            </td>

          </tr>


          :


          filtered.map(c => (


            <tr key={c.id}>


              <td>
                {c.name}
              </td>


              <td>
                {c.mobile}
              </td>


              <td>
                {c.ucc_code || '-'}
              </td>


              <td>
                {c.email || '-'}
              </td>


              <td>
                {c.branch?.name || '-'}
              </td>


              <td>


                <button

                  className="btn btn-primary"

                  onClick={() => callClient(c)}

                >

                  <Phone size={13}/>

                  Call


                </button>


              </td>


            </tr>


          ))

          }



          </tbody>


        </table>


        </div>


      </div>


    </div>

  );

}
