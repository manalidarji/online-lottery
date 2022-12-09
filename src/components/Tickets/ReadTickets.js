import { useEffect, useState } from "react";
import { getDocs } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST } from "../../constants";

const ReadTickets = () => {
	const perTicketCost = parseInt(PER_TICKET_COST);

  const [tickets, setTickets] = useState([]);

  const getTickets = async () => {
    const data = await getDocs(ticketsCollectionRef);
    const allTickets = data.docs.map( doc => ({id: doc.id, ...doc.data()}));
    setTickets(allTickets);
  }

  useEffect(() => {
    getTickets();
  }, []);

  return (
    <div>
      <h2>All Tickets</h2>
      <p><em>Tickets are been displayed from Firebase DB</em></p>

      <br /><br />

      { (!!tickets.length) ? 
        <div> 
          <p># of tickets Sold: <strong>{tickets.length}</strong> | Total Sales : INR <strong>{tickets.length * perTicketCost}</strong></p>

          <br /><br />
          <ul>
            <li><strong>Ticket ID ------ Ticket Owner Name ------ Ticket Owner Phone</strong></li><br/>
            {tickets.map( ticket => {
              return <li key={ticket.id}>
                  {ticket.id} ------ {ticket.ticket_owner_name} ------ {ticket.ticket_owner_phone}
                </li>
            })}
          </ul>    
        </div> 
        : 'No Tickets Sold Yet! :(' 
      }
    </div>
  )
}

export default ReadTickets