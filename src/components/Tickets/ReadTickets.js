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
		setTickets(allTickets);
	}

	useEffect(() => {
		getTickets();
	}, []);

	return (
		<div className="uk-container">
			<h2 className="uk-heading-small">All Tickets</h2>
			{(!!tickets.length) ?
				<div>
					<div className="uk-grid">
						<div>
							<h4 className="uk-margin-remove">Total tickets Sold: </h4>
							<p className="uk-margin-remove uk-text-bold">{tickets.length}</p>
						</div>
						<div>
							<h4 className="uk-margin-remove">Total Sales : INR </h4>
							<p className="uk-margin-remove uk-text-bold">{tickets.length * perTicketCost}</p>
						</div>
					</div>
					<div className="uk-overflow-auto">
						<table className="uk-table uk-table-striped uk-table-small">
							<thead>
								<tr>
									<th>Ticket ID</th>
									<th>Ticket Owner Name</th>
									<th>Ticket Owner Phone</th>
								</tr>
							</thead>
							<tbody>
								{tickets.map(ticket => {
									return <tr key={ticket.id}>
										<td>{ticket.ticket_id}</td>
										<td>{ticket.ticket_owner_name}</td>
										<td>{ticket.ticket_owner_phone}</td>
									</tr>
								})}
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