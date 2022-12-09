import { Link } from "react-router-dom"

const Header = () => {
  return (
    <div>
      <br /><br />

      <h1>Welcome to Lottery - Dec 2022</h1>

      <br />

      <nav>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/tickets'>View All Tickets</Link>
          </li>
          <li>
            <Link to='/lottery'>Pick Lottery</Link>
          </li>
        </ul>
      </nav>

      <br /><br />
      <hr/>
      <br />
    </div>
  )
}

export default Header