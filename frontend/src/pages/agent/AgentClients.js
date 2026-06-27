import React, { useEffect, useState } from 'react';
import { clientsAPI } from '../../utils/api';
import { Phone } from 'lucide-react';
import { toast } from '../../components/Toast';


export default function AgentClients() {

  const [clients,setClients] = useState([]);
  const [search,setSearch] = useState('');

  useEffect(()=>{
    loadClients();
  },[]);


  const loadClients = async()=>{
    try{
      const res = await clientsAPI.list();
      setClients(res.data);
    }
    catch(e){
      toast("Failed loading clients","error");
    }
  };


  const callClient = (client)=>{

    // future SIP integration
    toast(
      `Calling ${client.name} : ${client.mobile}`,
      "success"
    );

    console.log("CALL",client.mobile);

  };


  const filtered = clients.filter(c =>
    c.name?.toLowerCase()
    .includes(search.toLowerCase())
    ||
    c.mobile?.includes(search)
    ||
    c.ucc_code?.toLowerCase()
    .includes(search.toLowerCase())
  );


return (

<div>

<h2>My Clients</h2>


<div className="card">

<input
className="search-input"
placeholder="Search client / mobile / UCC"
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<table className="data-table">

<thead>

<tr>
<th>Name</th>
<th>Mobile</th>
<th>UCC</th>
<th>Branch</th>
<th>Action</th>
</tr>

</thead>


<tbody>

{
filtered.map(c=>(

<tr key={c.id}>

<td>{c.name}</td>

<td>{c.mobile}</td>

<td>{c.ucc_code}</td>

<td>
{c.branch?.name || "-"}
</td>


<td>

<button
className="btn btn-primary"
onClick={()=>callClient(c)}
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

)

}
