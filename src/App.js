import { useEffect, useState } from "react";
import { db } from './firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const App = () => {
  const perTicketCost = 50;
  const ticketsCollectionRef = collection(db, 'tickets');

  // for allTickets and lottery
  const [tickets, setTickets] = useState([]);
  const [finalLotteryTickets, setFinalLotteryTickets] = useState([]);
  const [lotteryCount, setLotteryCount] = useState(0);

  // input fields
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState(0);
  const [unitInput, setUnitInput] = useState(0);
  const [totalInput, setTotalInput] = useState(0);

  const resetInputs = () => {
    setNameInput('');
    setPhoneInput('');
    setUnitInput('');
    setTotalInput('');
  }

  const unitChangeHandler = (e) => {
    const units = e.target.value;
    setUnitInput(units);
    setTotalInput(units * perTicketCost);
  }

  const createTicketHandler = async () => {
    for (let i = 0; i < unitInput; i++) {
      await addDoc(ticketsCollectionRef, {
        ticket_owner_name: nameInput,
        ticket_owner_phone: phoneInput
      });
    }
    resetInputs();
    getTicketsHandler();
  }

  const getTicketsHandler = async () => {
    const data = await getDocs(ticketsCollectionRef);
    const allTickets = data.docs.map( doc => ({id: doc.id, ...doc.data()}));
    setTickets(allTickets);
  }
  
  const checkTicketUniqueness = (indexNumb) => {
    if(finalLotteryTickets.length){
      //check for unique ticket owner
      for (let i = 0; i < finalLotteryTickets.length; i++) {
        if(finalLotteryTickets[i].ticket_owner_name === tickets[indexNumb].ticket_owner_name){
          return false;
        }     
      }
      
      //check for unique ticket index numb
      for (let i = 0; i < finalLotteryTickets.length; i++) {
        if(finalLotteryTickets[i].ticket_index_numb === indexNumb){
          return false;
        }     
      }
    } 
    return true;
  }
  
  const generateRandom = (min = 0, max = 100) => Math.floor( Math.random() * max - min) + min;

  const pickLotteryHandler = () => {
    let ticketIndexNumb = 0;
    let isTicketUnique = false;
    
    do{
      ticketIndexNumb = generateRandom(0, tickets.length);
      isTicketUnique = checkTicketUniqueness(ticketIndexNumb);
      if(isTicketUnique){
        setLotteryCount(lotteryCount => lotteryCount + 1);
      }
    }while( !isTicketUnique );  

    const newLotteryTicket = {
      ...tickets[ticketIndexNumb],
      ticket_index_numb: ticketIndexNumb
    }
    setFinalLotteryTickets(prevState => [...prevState, newLotteryTicket]);
  }

  useEffect(() => {
    document.getElementById('get-tickets').click();
  }, []);


  return (
    <div>
      <h2>Create Tickets</h2>
      Name: <input value={nameInput} onChange={e => {setNameInput(e.target.value)}} type='text'/><br />
      Phone: <input value={phoneInput} onChange={e => {setPhoneInput(e.target.value)}} type='number'/><br />
      Unit: <input value={unitInput} onChange={unitChangeHandler} type='number' min='1'/><br />
      Total Amount: <input value={totalInput} type='number' min='1' readOnly /><br/>
      <button onClick={createTicketHandler}>Create Ticket</button>
      <hr />

      <h2>All Tickets</h2>
      <p><em>Tickets are been displayed from Firebase DB</em></p>
      <button id='get-tickets' onClick={getTicketsHandler}>Get all Tickets</button>
      { !!tickets.length &&
      <> 
        <ul>
          <li><strong>Ticket ID ------ Ticket Owner Name ------ Ticket Owner Phone</strong></li><br/>
          {tickets.map( ticket => {
            return <li key={ticket.id}>
                {ticket.id} ------ {ticket.ticket_owner_name} ------ {ticket.ticket_owner_phone}
              </li>
          })}
        </ul>

        <h4># of tickets Sold: {tickets.length}</h4>
        <h4>Total Sales : INR {tickets.length * perTicketCost}</h4>
      </>
      }
      <hr />

      <h2>Lottery Day</h2>
      <p><em>Pick our <strong>THREE</strong> lucky winners</em></p>
      <button 
        onClick={pickLotteryHandler}
        disabled={lotteryCount >= 3}
      >
          Pick Lottery
      </button>

      { !!finalLotteryTickets.length && 
        <ul>
          <li>Lottery Ticket ID ------ Lottery Ticket Owner Name ------ Lottery Ticket Owner Phone</li><br/>
          {finalLotteryTickets.map( (ticket, i) => {
            return <li key={ticket.id}>
                Winner #{i+1} ------ {ticket.id} ------ {ticket.ticket_owner_name} ------ {ticket.ticket_owner_phone}
              </li>
          })}
        </ul>
      }
    </div>
  )
}

export default App;