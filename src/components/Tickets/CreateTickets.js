import { useState } from "react";
import { addDoc } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST } from "../../constants";

const CreateTicket = () => {
	const perTicketCost = parseInt(PER_TICKET_COST);
	const [successMsg, setSuccessMsg] = useState('');

	// input fields
	const [firstNameInput, setFirstNameInput] = useState('');
	const [lastNameInput, setLastNameInput] = useState('');
	const [phoneInput, setPhoneInput] = useState('');
	const [unitInput, setUnitInput] = useState('');
	const [totalInput, setTotalInput] = useState('');

	const resetInputs = () => {
		setFirstNameInput('');
		setLastNameInput('');
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
					ticket_owner_name: `${firstNameInput} ${lastNameInput}`,
					ticket_owner_phone: phoneInput
				});

				setSuccessMsg(() => {
					const ticketMsg = (unitInput > 1) ? 'Tickets were' : 'Ticket was';
					return `${unitInput} ${ticketMsg} created successfully for ${firstNameInput} ${lastNameInput}`;
				}
				);
			} catch (error) {
				alert('Some problem occured while creating the ticket/s' + error);
			}
		}
		resetInputs();
	}

	return (
		<div className="uk-container">
			<div class="uk-card uk-card-body uk-card-default">
				<h2 className="uk-heading-small">Create Tickets</h2>
				<form onSubmit={createTicketHandler}>
					<div class="uk-margin">
						<label for="">First Name:</label>
						<input className="uk-input" type='text' value={firstNameInput} onChange={e => { setFirstNameInput(e.target.value) }} tabIndex="1" />
					</div>
					<div class="uk-margin">
						<label for="">Last Name:</label>
						<input className="uk-input" type='text' value={lastNameInput} onChange={e => { setLastNameInput(e.target.value) }} tabIndex="1" />
					</div>
					<div class="uk-margin">
						<label for="">Phone:</label>
						<input className="uk-input" type='number' value={phoneInput} onChange={e => { setPhoneInput(e.target.value) }} tabIndex="2" />
					</div>
					<div class="uk-margin">
						<label for="">Unit:</label>
						<input className="uk-input" type='number' min='1' value={unitInput} onChange={unitChangeHandler} tabIndex="3" />
					</div>
					<div class="uk-margin">
						<label for="">Total Amount:</label>
						<input className="uk-input" type='number' min='1' value={totalInput} readOnly />
					</div>
					<button className="uk-button uk-button-primary uk-width-1-1 uk-button-large" type="submit" tabIndex="4">Create Ticket</button>
				</form>
				<div> {successMsg} </div>
			</div>
		</div>
	)
}

export default CreateTicket