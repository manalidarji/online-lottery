import Header from "../components/Header";
import LotteryTickets from "../components/Tickets/LotteryTickets";
import Footer from "../components/Footer";

const LotteryPage = () => {
  return (
    <>
    <Header/>
    <div id="main">
        <LotteryTickets />
    </div>
    <Footer />
    </>
  )
}

export default LotteryPage