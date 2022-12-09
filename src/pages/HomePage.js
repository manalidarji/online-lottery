import Header from "../components/Header";
import CreateTicket from "../components/Tickets/CreateTickets";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <>
    <Header/> 
    <div id="main">
        <CreateTicket />
    </div>
    <Footer />
    </>
  )
}

export default HomePage