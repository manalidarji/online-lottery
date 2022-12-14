import { useEffect, useRef, useState } from "react";
import { addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ticketsCollectionRef, winnerCollectionRef } from "../../firebase/config";
import UIkit from "uikit";

const LotteryTickets = () => {
    // for allTickets and lottery
    const [tickets, setTickets] = useState([]);
    const [finalLotteryTickets, setFinalLotteryTickets] = useState([]);
    const [lotteryCount, setLotteryCount] = useState(0);
    const canvasRef = useRef(null);
    console.log(lotteryCount);

    const getTickets = async () => {
        const data = await getDocs(ticketsCollectionRef);
        const allTickets = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(allTickets);
    }

    const loadCanvas = (text = '01234', firstLetter = 30, delay = 30) => {
        new Audio(require('../../assets/audio/drumroll.mp3')).play();
        let flag = true;
        let chars = '0123456789';  // All possible Charactrers
        let scale = 150;  // Font size and overall scale
        let breaks = 0.003;  // Speed loss per frame
        let endSpeed = 0.01;  // Speed at which the letter stops
        // let firstLetter = 240;  // Number of frames untill the first letter stopps (60 frames per second)
        // let delay = 120;  // Number of frames between letters stopping

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        text = text.split('');
        chars = chars.split('');
        let charMap = [];
        let offset = [];
        let offsetV = [];

        for (let i = 0; i < chars.length; i++) {
            charMap[chars[i]] = i;
        }

        for (let i = 0; i < text.length; i++) {
            let f = firstLetter + delay * i;
            offsetV[i] = endSpeed + breaks * f;
            offset[i] = -(1 + f) * (breaks * f + 2 * endSpeed) / 2;
        }

        (window.onresize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        })();

        let loop = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#622622';
            ctx.fillRect(0, (canvas.height - scale - 30) / 2, canvas.width, scale);
            for (var i = 0; i < text.length; i++) {
                ctx.fillStyle = '#cccccc';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.setTransform(1, 0, 0, 1, Math.floor((canvas.width - scale * (text.length - 1)) / 2), Math.floor(canvas.height / 2));
                var o = offset[i];
                while (o < 0) o++;
                o %= 1;
                var h = Math.ceil(canvas.height / 2 / scale)
                for (var j = -h; j < h; j++) {
                    var c = charMap[text[i]] + j - Math.floor(offset[i]);
                    while (c < 0) c += chars.length;
                    c %= chars.length;
                    var s = 1 - Math.abs(j + o) / (canvas.height / 2 / scale + 1)
                    ctx.globalAlpha = s
                    ctx.font = scale * s + 'px Helvetica'
                    ctx.fillText(chars[c], scale * i, (j + o) * scale);
                }
                offset[i] += offsetV[i];
                offsetV[i] -= breaks;
                if (offsetV[i] < endSpeed) {
                    offset[i] = 0;
                    offsetV[i] = 0;
                    if (offset.every(v => v === 0) && flag && text.join('') !== '01234') {
                        setTimeout(() => {
                            UIkit.modal(document.querySelector('#winner-modal')).show()
                        }, 3000);
                        flag = false;
                    }
                }
            }

            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    useEffect(() => {
        getTickets();
        loadCanvas();
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
        addDoc(winnerCollectionRef, { ...newLotteryTicket, timestamp: serverTimestamp() });
        setFinalLotteryTickets(prevState => [...prevState, newLotteryTicket]);
        loadCanvas(newLotteryTicket.ticket_id, 240, 120);
    }

    return (
        <div>
            <canvas ref={canvasRef} onClick={pickLotteryHandler} />
            <div id="winner-modal" className="uk-flex-top" uk-modal="true">
                <div className="uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-text-center">
                    <p className="uk-text-large">The winner is...</p>
                    <h1 className="uk-heading uk-heading-large uk-margin-remove">{finalLotteryTickets[finalLotteryTickets.length - 1]?.ticket_owner_name}</h1>
                </div>
            </div>
        </div>
    )
}

export default LotteryTickets