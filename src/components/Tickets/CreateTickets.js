import { useState } from "react";
import { addDoc } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST } from "../../constants";

const CreateTicket = () => {
	const perTicketCost = parseInt(PER_TICKET_COST);
	const [successMsg, setSuccessMsg] = useState('');

	// input fields
	const [nameInput, setNameInput] = useState('');
	const [phoneInput, setPhoneInput] = useState('');
	const [unitInput, setUnitInput] = useState('');
	const [totalInput, setTotalInput] = useState('');

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

	const createTicketHandler = async (e) => {
		e.preventDefault();
		for (let i = 0; i < unitInput; i++) {
			try {
				await addDoc(ticketsCollectionRef, {
					ticket_owner_name: nameInput,
					ticket_owner_phone: phoneInput
				});
				
				setSuccessMsg( () => {
					const ticketMsg = (unitInput > 1) ? 'Tickets were' : 'Ticket was';
					return `${unitInput} ${ticketMsg} created successfully for ${nameInput}`;
				}
				);
			} catch (error) {
				alert('Some problem occured while creating the ticket/s' + error);
			}
		}
		resetInputs();
	}
  
	return (
	<div>
		<h2>Create Tickets</h2>

		<br /><br />

		<form onSubmit={createTicketHandler}>
			Name: <input type='text' value={nameInput} onChange={e => {setNameInput(e.target.value)}} tabIndex="1" /><br />
			Phone: <input type='number' value={phoneInput} onChange={e => {setPhoneInput(e.target.value)}} tabIndex="2" /><br />
			Unit: <input type='number' min='1' value={unitInput} onChange={unitChangeHandler} tabIndex="3" /><br />
			Total Amount: <input type='number' min='1' value={totalInput} readOnly /><br/>
			<button type="submit" tabIndex="4">Create Ticket</button>
		</form>

		<br /><br />

		<div> {successMsg} </div>
	</div>
	)
}

export default CreateTicket