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

      <h4># of tickets Sold: {tickets.length}</h4>
      <h4>Total Sales : INR {tickets.length * perTicketCost}</h4>

      <br /><br />

      { !!tickets.length &&
      <div> 
        <ul>
          <li><strong>Ticket ID ------ Ticket Owner Name ------ Ticket Owner Phone</strong></li><br/>
          {tickets.map( ticket => {
            return <li key={ticket.id}>
                {ticket.id} ------ {ticket.ticket_owner_name} ------ {ticket.ticket_owner_phone}
              </li>
          })}
        </ul>    
      </div> 
      }
    </div>
  )
}

export default ReadTickets