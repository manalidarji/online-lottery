import { useEffect, useRef, useState } from "react";
import { doc, getDocs, serverTimestamp, waitForPendingWrites, writeBatch } from 'firebase/firestore';
import { db, ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST, TICKET_ID_DIGITS, ALL_SELLERS } from "../../constants";

const CreateTicket = () => {
	const totalDigits = TICKET_ID_DIGITS;
	const perTicketCost = PER_TICKET_COST;
	const canvasRef = useRef(null);
	const whatsappButton = useRef(null);
	const [finalMsg, setFinalMsg] = useState({
		class: '',
		msg: ''
	});
	const [couponImage, setCouponImage] = useState(null);

	useEffect(() => {
		// Creating placeholder coupon
		const canvas = canvasRef.current;
		canvas.width = 1500;
		canvas.height = 600;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = require("../../assets/img/coupon.png");
		img.onload = () => ctx.drawImage(img, 0, 0);
	}, []);

	const updateCouponImage = ticketRangeText => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctx.font = '500 28px Open Sans';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.fillText(nameInput, 770, 485);
		ctx.font = '500 26px Open Sans';
		ctx.fillText(ticketRangeText, 770, 560);
		ctx.font = '700 23px Open Sans';
		ctx.fillStyle = 'white';
		ctx.fillText(`₹ ${totalInput}`, 768, 427);
		canvas.toBlob(blob => {
			setCouponImage(new File([blob], 'coupon.png', { type: blob.type }))
		});
	}

	const canvasClickHandler = () => {
		if (couponImage) {
			navigator.share({
				text: '',
				files: [couponImage]
			})
		}
	}

	const getWhatsappMessage = (ticketsCount, unitInput) => {
		let numbersToPrint = [];
		while (unitInput) {
			numbersToPrint.push(ticketsCount);
			ticketsCount--; unitInput--;
		}
		return `Greetings of the season ${nameInput},
		
Thank you for purchasing Christmas Coupons from us. Your tickets numbers are as follows:
${numbersToPrint.reduce((a, b) => `${a}
${addLeadingZeros(b, totalDigits)}`, '')}`;
	}

	// loader
	const [isLoading, setLoading] = useState(false);
	// input fields
	const [nameInput, setNameInput] = useState('');
	const [phoneInput, setPhoneInput] = useState('');
	const [unitInput, setUnitInput] = useState('');
	const [totalInput, setTotalInput] = useState('');
	const [sellerInput, setSellerInput] = useState({
		seller_id: '',
        seller_name: ''
	});

	const formatName = (name) => name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
	
	const resetInputs = () => {
		setNameInput('');
		setPhoneInput('');
		setUnitInput('');
		setTotalInput('');
		setSellerInput({
			seller_id: '',
        	seller_name: ''
		});
	}

	const unitChangeHandler = (e) => {
		const units = e.target.value;
		setUnitInput(units);
		setTotalInput(units * perTicketCost);
	}

	const addLeadingZeros = (num, totalLength) => String(num).padStart(totalLength, '0');

	const createTicketHandler = async (e) => {
		e.preventDefault();
		setLoading(true);
		const commonAlertClass = 'uk-text-center uk-margin uk-padding-small ';

		await waitForPendingWrites(db);

		// get existing number of tickets
		const allTicketsSnapshot = await getDocs(ticketsCollectionRef);
		let ticketsCount = allTicketsSnapshot.size;
		let startTicketCount = ticketsCount;
		// handle startTicketCount if it's the first ticket in DB
		startTicketCount = (startTicketCount) ? startTicketCount+1 : 1;

		try {
			const batch = writeBatch(db);
			for (let i = 0; i < unitInput; i++) {
				const newTicketID = sellerInput.seller_id + addLeadingZeros(++ticketsCount, totalDigits);
				batch.set(doc(db, 'tickets', newTicketID), {
					ticket_id: newTicketID,
					ticket_owner_name: nameInput,
					ticket_owner_phone: phoneInput,
					ticket_seller: sellerInput.seller_name,
					timestamp: serverTimestamp()
				})
			}
			await batch.commit();
			whatsappButton.current.href = `https://wa.me/91${phoneInput}?text=${encodeURIComponent(getWhatsappMessage(ticketsCount, unitInput))}`;
			whatsappButton.current.classList.remove('uk-hidden');
			// calculate ticket range text
			// eliminate lower range if it's only 1 ticket
			let ticketRangeValue = (unitInput > 1) ? `${sellerInput.seller_id}${addLeadingZeros(startTicketCount, totalDigits)} - ` : '';
			ticketRangeValue += `${sellerInput.seller_id}${addLeadingZeros(ticketsCount, totalDigits)}`;
	
			updateCouponImage(ticketRangeValue); // update coupon ticket range text
			setFinalMsg({
				class: `${commonAlertClass} uk-alert-success`,
				msg: `${unitInput} ${(unitInput > 1) ? 'Tickets were' : 'Ticket was'} created successfully for ${nameInput}`
			});
			resetInputs(); // reset inputs
		} catch (error) {
			setFinalMsg({
				class: `${commonAlertClass} uk-alert-danger`,
				msg: `Some problem occured while creating the ticket/s ${error}`
			});
		}
		setLoading(false); // hide loader
	}

	return (
		<div className="uk-container">
			<div className="uk-card uk-card-body uk-card-default">
				<h2 className="uk-heading-small">Create Tickets</h2>
				<form onSubmit={createTicketHandler}>
					<div className="uk-margin">
						<label>Full Name:</label>
						<input placeholder="eg. John Varghese" className="uk-input" type='text' value={nameInput} onChange={e => { setNameInput(formatName(e.target.value))}} tabIndex="1" required />
					</div>
					<div className="uk-margin">
						<label>Phone:</label>
						<input placeholder="9768XXXX83" className="uk-input" type='number' value={phoneInput} onChange={e => { setPhoneInput(e.target.value) }} min="1000000000" max="9999999999" tabIndex="3" required />
					</div>
					<div className="uk-margin">
						<label>Unit:</label>
						<input placeholder="Number of tickets" className="uk-input" type='number' min='1' value={unitInput} onChange={unitChangeHandler} tabIndex="4" required />
					</div>
					<div className="uk-margin">
						<label>Total Amount:</label>
						<input placeholder="₹" className="uk-input" type='text' value={'₹' + totalInput} readOnly disabled />
					</div>
					<div className="uk-margin">
						<label>Sold By:</label>
						<select
							required
							value={sellerInput.seller_name}
							className="uk-select" 
							tabIndex="5"
							onChange={e => { 
								setSellerInput({
									seller_id: e.target.selectedOptions[0].getAttribute('data-seller-id'),
        							seller_name: e.target.value
								});								
								}
							} >
							<option value=''>Select Seller by clicking here</option>
							{ALL_SELLERS.map(seller => (
							<option 
								key={seller.seller_id} 
								value={seller.seller_name} 
								data-seller-id={seller.seller_id}>
									{seller.seller_name}
							</option>
							))}
						</select>
					</div>
					<div className="uk-margin">
						<button className="uk-button uk-button-primary uk-width-1-1 uk-button-large" type="submit" tabIndex="6">Create Ticket</button>
					</div>
					<a ref={whatsappButton} href="/" target="_blank" className="uk-flex whatsapp-button uk-hidden" onClick={() => whatsappButton.current.classList.add('uk-hidden')} type="button" tabIndex="7">
						<svg width="100%" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="48" rx="12" fill="#25D366" />
							<g clipPath="url(#a)"><path fillRule="evenodd" clipRule="evenodd" d="M27.7462 12.4474c2.9024.014 5.7034 1.1536 7.7986 3.1621 2.1456 2.057 3.3822 4.8152 3.4903 7.7856.1056 2.9007-.9071 5.7501-2.8279 7.9262-2.1067 2.3867-5.0371 3.7574-8.2021 3.8483a11.3615 11.3615 0 0 1-.325.0046c-1.7054 0-3.3949-.3845-4.9252-1.1209l-5.9481 1.323a.0874.0874 0 0 1-.1033-.0974l1.0048-6.0144c-.8575-1.5668-1.3361-3.3321-1.3877-5.1278-.087-3.0341 1.0127-5.9203 3.0966-8.1273 2.1606-2.2882 5.1111-3.562 8.2727-3.562h.0563Zm-.0633 1.9717a9.576 9.576 0 0 0-.2728.0039c-5.1765.1485-9.2671 4.4807-9.1186 9.6572.0454 1.5806.4907 3.1322 1.2878 4.4869l.173.2936-.7445 4.0812 4.0387-.9533.305.1587c1.3307.6924 2.8218 1.0553 4.3283 1.0553.0895 0 .1792-.0013.2687-.0039 5.1766-.1484 9.2672-4.4806 9.1187-9.6571-.1459-5.0851-4.3294-9.1225-9.3843-9.1225Zm-3.9285 3.9024c.1899.0059.3802.0113.5462.0235.2029.0146.4275.031.6265.5128.2362.5721.747 2.0004.8139 2.1453.0669.1449.1093.313.0084.5007-.1009.1873-.1521.3049-.2995.467-.1477.1623-.3111.3628-.4431.4867-.1474.1379-.3006.2879-.143.5785.1575.2907.701 1.2424 1.5255 2.0249 1.0596 1.0056 1.9093 1.3374 2.2468 1.4948.1218.0569.223.0839.3114.0839.1214 0 .2185-.0509.3112-.1448.1776-.18.712-.8036.937-1.0905.1177-.1501.2243-.2033.34-.2033.0926 0 .1911.0341.3061.08.2584.1032 1.639.8366 1.9198.9881.2808.1514.4686.2287.5363.3497.0676.1216.05.6927-.2081 1.3517-.2581.6591-1.4419 1.2661-1.9662 1.2975-.1535.0093-.3045.0307-.501.0307-.4751 0-1.2159-.1251-2.8986-.8498-2.8631-1.2329-4.6017-4.2625-4.7385-4.4571-.1365-.1949-1.1167-1.5831-1.0736-2.9873.0431-1.404.801-2.0718 1.0712-2.3493.259-.2661.5558-.334.7474-.334l.0239.0003Z" fill="#fff" /></g>
							<defs><clipPath id="a"><path fill="#fff" transform="translate(16 11.5)" d="M0 0h24v24H0z" /></clipPath></defs>
						</svg>
						<span style={{ color: 'white' }}>Send Details on WhatsApp</span>
					</a>
					<p>Click on the below image to share it with the buyer after creating the ticket</p>
				</form>
				<div className={finalMsg.class}> {finalMsg.msg} </div>
			</div>
			<div className="uk-margin">
				<canvas onClick={canvasClickHandler} ref={canvasRef} />
			</div>
			<div className={`loader uk-flex uk-flex-center uk-flex-middle ${isLoading ? 'active' : 'uk-hidden'}`}>
				<img alt="loading..." src="https://cdn.dribbble.com/users/4241225/screenshots/14521747/media/d9d6f50e1443ecbdef32497685c0b5eb.gif" />
			</div>
		</div >
	)
}

export default CreateTicket