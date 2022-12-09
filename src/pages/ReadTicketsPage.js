import Header from "../components/Header";
import ReadTickets from "../components/Tickets/ReadTickets";
import Footer from "../components/Footer";

const AllTickets = () => {
  return (
    <>
    <Header/>
    <div id="main">
        <ReadTickets />
    </div>
    <Footer />
    </>
  )
}

export default AllTickets