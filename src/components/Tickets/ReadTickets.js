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

	const sendWhatsapp = (name, phone, ticketId, units) => {
		let numbersToPrint = '';
		for (let i = 0; i < units; i++) {
			numbersToPrint += `
${parseInt(ticketId) + i}`
		}
		const message = `Greetings of the season ${name},
		
Thank you for purchasing Christmas Coupons from Osmosis Youth. Your tickets numbers are as follows:
${numbersToPrint}`;

		window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
	}

	const sendCouponImage = async (name, ticketRange, units) => {
		const sponsorImageBlob = await fetch(require('../../assets/img/sponsor.jpg')).then(res => res.blob());
		const sponsorImage = new File([sponsorImageBlob], 'sponsor.jpg', { type: sponsorImageBlob.type });
		const price = parseInt(units) * PER_TICKET_COST;
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();
		canvas.width = 1500;
		canvas.height = 600;
		img.src = require("../../assets/img/coupon.png");
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			ctx.font = '500 28px Open Sans';
			ctx.textAlign = 'center';
			ctx.fillStyle = 'black';
			ctx.fillText(name, 770, 485);
			ctx.font = '500 26px Open Sans';
			ctx.fillText(ticketRange, 770, 560);
			ctx.font = '700 25px Open Sans';
			ctx.fillStyle = 'white';
			ctx.fillText(`₹ ${price}`, 768, 427);
			canvas.toBlob(blob => {
				const couponImage = new File([blob], 'coupon.png', { type: blob.type });
				navigator.share({
					text: '',
					files: [couponImage, sponsorImage]
				})
			});
		}
	}

	const groupTickets = tickets => {
		return tickets.filter(ticket => ticket?.ticket_units)
			.map(ticket => {
				const ticketRange = `${ticket.ticket_id} - ${parseInt(ticket.ticket_id) + parseInt(ticket.ticket_units) - 1}`;
				return (
					<tr key={ticket.ticket_id}>
						<td>
							<p className="uk-width-max-content uk-margin-remove">{ticketRange}</p>
						</td>
						<td>{ticket.ticket_owner_name}</td>
						<td>{ticket.ticket_owner_phone}</td>
						<td>
							<button onClick={() => sendWhatsapp(ticket.ticket_owner_name, ticket.ticket_owner_phone, ticket.ticket_id, ticket.ticket_units)} className="uk-button whatsapp-button uk-width-max-content">Send details on WhatsApp</button>
							<button onClick={() => sendCouponImage(ticket.ticket_owner_name, ticketRange, ticket.ticket_units)} className="uk-button uk-button-primary uk-width-max-content">Share Coupon Image</button>
						</td>
					</tr>
				)
			})
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