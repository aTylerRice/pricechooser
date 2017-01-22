import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Link, browserHistory } from 'react-router';

class Header extends Component {

  constructor(props) {
    super(props);
    this.listItemLogin = (
      <li><Link to="/login">Login</Link></li>
    );

    this.listItemSignup = (
      <li><Link to={"/signup"}>Sign Up</Link></li>
    );
    this.listItemLogout = (
      <li><a href="#" onClick={(event)=> {
        event.preventDefault();
        Meteor.logout();
        browserHistory.push('/');
      }}>Logout</a></li>
    );
    this.listItemManageShop = (
      <li><Link to="/manage_shop">Manage Shop</Link></li>
    );
    this.listItemStartCampaign = (
      <li><Link to="/start_campaign">Start Campaign</Link></li>
    );
    this.listItemMyCampaigns = (
      <li><Link to="/my_campaigns">My Campaigns</Link></li>
    );
    this.listItemMyOrders = (
      <li><Link to="/my_orders">My Orders</Link></li>
    );
  }

  render(){
    return (
      <div>
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to="/"><span id="navbar-brand-green">Price</span>Chooser</Link>
          </div>
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className=" nav navbar-nav">
            {this.props.currentUser ? this.listItemMyOrders : null}
            </ul>
            <ul className="nav navbar-nav navbar-right">
              {//this.props.currentUser ? this.listItemStartCampaign : null
              }
              {//this.props.currentUser ? this.listItemMyCampaigns : null
              }
              {this.props.currentUser ? this.listItemManageShop : null}
              {!this.props.currentUser ? this.listItemLogin : null}
              {!this.props.currentUser ? this.listItemSignup : null}
              {this.props.currentUser ? this.listItemLogout : null}
            </ul>
          </div>
        </div>
      </nav>
      </div>
    );
  }

}

export default createContainer(() => {

  return { currentUser: Meteor.user() };
}, Header);
