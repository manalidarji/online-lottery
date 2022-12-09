import { Link } from "react-router-dom"

const Header = () => {
  return (
    <div className="uk-container uk-text-right uk-padding-small">
      <button className="uk-button-default uk-button" uk-icon="icon: menu" type="button">Menu</button>
      <div uk-dropdown="mode: click">
        <nav className="uk-nav uk-dropdown-nav">
          <ul>
            <li className="uk-margin">
              <Link to='/'>Create Ticket</Link>
            </li>
            <li className="uk-margin uk-margin-remove-bottom">
              <Link to='/tickets'>View All Tickets</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Header