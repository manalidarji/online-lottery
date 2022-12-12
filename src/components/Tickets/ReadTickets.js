import { useEffect, useState } from "react";
import { getDocs } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST } from "../../constants";

const ReadTickets = () => {
	const perTicketCost = PER_TICKET_COST;

	const [tickets, setTickets] = useState([]);

	const getTickets = async () => {
		const data = await getDocs(ticketsCollectionRef);
		const allTickets = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
		setTickets(allTickets.sort((a, b) => b.ticket_id - a.ticket_id));
	}

	useEffect(() => {
		getTickets();
	}, []);

	const groupTickets = tickets => {
		return tickets.filter(ticket => ticket?.ticket_units)
			.map(ticket => (
				<tr key={ticket.ticket_id}>
					<td>
						<p className="uk-width-max-content uk-margin-remove">{ticket.ticket_id} - {parseInt(ticket.ticket_id) + parseInt(ticket.ticket_units) - 1}</p>
					</td>
					<td>{ticket.ticket_owner_name}</td>
					<td>{ticket.ticket_owner_phone}</td>
					<td>
						<button className="uk-button whatsapp-button uk-width-max-content">Send details on WhatsApp</button>
						<button className="uk-button uk-button-primary uk-width-max-content">Share Coupon Image</button>
					</td>
				</tr>
			))
	}

	return (
		<div className="uk-container">
			<h2 className="uk-heading-small">All Tickets</h2>
			{(!!tickets.length) ?
				<div>
					<div className="uk-grid uk-margin">
						<div className="uk-width-1-2">
							<div className="uk-card uk-card-default uk-card-body uk-card-small">
								<p className="uk-margin-remove">Total tickets Sold: </p>
								<h4 className="uk-margin-remove uk-text-bold">{tickets.length}</h4>
							</div>
						</div>
						<div className="uk-width-1-2">
							<div className="uk-card uk-card-default uk-card-body uk-card-small">
								<p className="uk-margin-remove">Total Sales : </p>
								<h4 className="uk-margin-remove uk-text-bold">₹{tickets.length * perTicketCost}</h4>
							</div>
						</div>
					</div>
					<div className="uk-overflow-auto">
						<table className="uk-table uk-table-striped uk-table-small uk-table-middle">
							<thead>
								<tr>
									<th>Ticket ID Range</th>
									<th>Ticket Owner Name</th>
									<th>Ticket Owner Phone</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{groupTickets(tickets)}
							</tbody>
						</table>
					</div>
				</div>
				: 'No Tickets Sold Yet! :('
			}
		</div>
	)
}

export default ReadTickets