import { useEffect, useState } from "react";
import { getDocs } from 'firebase/firestore';
import { ticketsCollectionRef } from "../../firebase/config";

const LotteryTickets = () => {
    // for allTickets and lottery
    const [tickets, setTickets] = useState([]);
    const [finalLotteryTickets, setFinalLotteryTickets] = useState([]);
    const [lotteryCount, setLotteryCount] = useState(0);

    const getTickets = async () => {
        const data = await getDocs(ticketsCollectionRef);
        const allTickets = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(allTickets);
    }

    useEffect(() => {
        getTickets();
    }, []);

    const checkTicketUniqueness = (indexNumb) => {
        if (finalLotteryTickets.length) {
            // check for unique ticket index numb
            for (let i = 0; i < finalLotteryTickets.length; i++) {
                if (finalLotteryTickets[i].ticket_index_numb === indexNumb) {
                    return false;
                }
            }
        }
        return true;
    }

    const generateRandom = (min = 0, max = 100) => Math.floor(Math.random() * max - min) + min;

    const pickLotteryHandler = () => {
        let ticketIndexNumb = 0;
        let isTicketUnique = false;

        do {
            ticketIndexNumb = generateRandom(0, tickets.length);
            isTicketUnique = checkTicketUniqueness(ticketIndexNumb);
            if (isTicketUnique) {
                setLotteryCount(lotteryCount => lotteryCount + 1);
            }
        } while (!isTicketUnique);

        const newLotteryTicket = {
            ...tickets[ticketIndexNumb],
            ticket_index_numb: ticketIndexNumb
        }
        setFinalLotteryTickets(prevState => [...prevState, newLotteryTicket]);
    }

    return (
        <div>
            <h2>Lottery Day</h2>
            <p><em>Pick our <strong>THREE</strong> lucky winners</em></p>

            <br /><br />

            <button
                onClick={pickLotteryHandler}
                disabled={lotteryCount >= 3}
            >
                Pick Lottery
            </button>

            <br /><br />

            {!!finalLotteryTickets.length &&
                <ul>
                    <li>Lottery Ticket ID ------ Lottery Ticket Owner Name ------ Lottery Ticket Owner Phone</li><br />
                    {finalLotteryTickets.map((ticket, i) => {
                        return <li key={ticket.id}>
                            Winner #{i + 1} ------ {ticket.id} ------ {ticket.ticket_owner_name} ------ {ticket.ticket_owner_phone}
                        </li>
                    })}
                </ul>
            }
        </div>
    )
}

export default LotteryTickets