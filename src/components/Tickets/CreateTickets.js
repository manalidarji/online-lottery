import { useEffect, useRef, useState } from "react";
import { addDoc, getDocs } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";
import { PER_TICKET_COST, TICKET_ID_DIGITS } from "../../constants";

const CreateTicket = () => {
	const totalDigits = TICKET_ID_DIGITS;
	const perTicketCost = PER_TICKET_COST;
	const canvasRef = useRef(null);
	const [finalMsg, setFinalMsg] = useState({
		class: '',
		msg: ''
	});
	const [couponImage, setCouponImage] = useState(null);

	useEffect(() => {
		// Creating placeholder coupon
		const canvas = canvasRef.current;
		canvas.width = 1500;
		canvas.height = 664;
		const ctx = canvas.getContext('2d');
		const img = new Image();
		img.src = require("../../assets/img/coupon.jpg");
		img.onload = () => ctx.drawImage(img, 0, 0);
	}, []);

	const updateCouponImage = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctx.font = '90px serif';
		ctx.fillText(`₹ ${totalInput}`, 50, 300);
		ctx.textAlign = 'center';
		ctx.fillText(firstNameInput, 750, 300);
		canvas.toBlob(blob => {
			setCouponImage(new File([blob], 'coupon'))
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
		return `Greetings of the season ${firstNameInput} ${lastNameInput},
		
Thank you for purchasing Christmas Coupons from us. Your tickets numbers are as follows:

${numbersToPrint.reduce((a, b) => `${a}
${addLeadingZeros(b, totalDigits)}`, '')}`;
	}

	// input fields
	const [firstNameInput, setFirstNameInput] = useState('');
	const [lastNameInput, setLastNameInput] = useState('');
	const [phoneInput, setPhoneInput] = useState('');
	const [unitInput, setUnitInput] = useState('');
	const [totalInput, setTotalInput] = useState('');
	const [sellerInput, setSellerInput] = useState('');

	const resetInputs = () => {
		setFirstNameInput('');
		setLastNameInput('');
		setPhoneInput('');
		setUnitInput('');
		setTotalInput('');
		setSellerInput('');
	}

	const unitChangeHandler = (e) => {
		const units = e.target.value;
		setUnitInput(units);
		setTotalInput(units * perTicketCost);
	}

	const addLeadingZeros = (num, totalLength) => String(num).padStart(totalLength, '0');

	const createTicketHandler = async (e) => {
		e.preventDefault();
		const commonAlertClass = 'uk-text-center uk-margin uk-padding-small ';

		// get existing number of tickets
		const allTicketsSnapshot = await getDocs(ticketsCollectionRef);
		let ticketsCount = allTicketsSnapshot.size;

		for (let i = 0; i < unitInput; i++) {
			try {
				await addDoc(ticketsCollectionRef, {
					ticket_id: addLeadingZeros(++ticketsCount, totalDigits),
					ticket_owner_name: `${firstNameInput} ${lastNameInput}`,
					ticket_owner_phone: phoneInput,
					ticket_seller: sellerInput,
				});

				const ticketMsg = (unitInput > 1) ? 'Tickets were' : 'Ticket was';
				setFinalMsg({
					class: `${commonAlertClass} uk-alert-success`,
					msg: `${unitInput} ${ticketMsg} created successfully for '${firstNameInput} ${lastNameInput}'`
				});

			} catch (error) {
				setFinalMsg({
					class: `${commonAlertClass} uk-alert-danger`,
					msg: `Some problem occured while creating the ticket/s ${error}`
				});
			}
		}
		window.open(`https://wa.me/91${phoneInput}?text=${encodeURIComponent(getWhatsappMessage(ticketsCount, unitInput))}`);
		updateCouponImage();
		resetInputs();
	}

	return (
		<div className="uk-container">
			<div className="uk-card uk-card-body uk-card-default">
				<h2 className="uk-heading-small">Create Tickets</h2>
				<form onSubmit={createTicketHandler}>
					<div className="uk-margin">
						<label>First Name:</label>
						<input placeholder="eg. John" className="uk-input" type='text' value={firstNameInput} onChange={e => { setFirstNameInput(e.target.value) }} tabIndex="1" required />
					</div>
					<div className="uk-margin">
						<label>Last Name:</label>
						<input placeholder="eg. Varghese" className="uk-input" type='text' value={lastNameInput} onChange={e => { setLastNameInput(e.target.value) }} tabIndex="2" required />
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
						<input placeholder="Seller's name" className="uk-input" type='text' min='1' value={sellerInput} onChange={e => { setSellerInput(e.target.value) }} tabIndex="5" />
					</div>
					<button className="uk-button uk-button-primary uk-width-1-1 uk-button-large" type="submit" tabIndex="5">Create Ticket</button>
				</form>
				<div className={finalMsg.class}> {finalMsg.msg} </div>
			</div>
			<div className="uk-margin">
				<canvas onClick={canvasClickHandler} ref={canvasRef} />
			</div>
		</div>
	)
}

export default CreateTicket