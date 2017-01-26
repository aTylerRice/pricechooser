import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Link, browserHistory } from 'react-router';
import { AllowedProductCategories } from '../../imports/collections/products';
import {TagsCount} from '../../imports/collections/tags_count';

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

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

  renderTopTags(){
    return this.props.popular_tags.map((tag)=>{
      return (
        <li key={tag._id} ><Link to={"/products/"+slugify(tag._id)}>{tag._id}</Link></li>
      );
    });
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
            {this.renderTopTags()}


            </ul>
            <ul className="nav navbar-nav navbar-right">
              {//this.props.currentUser ? this.listItemStartCampaign : null
              }
              {//this.props.currentUser ? this.listItemMyCampaigns : null
              }
              {this.props.currentUser ? this.listItemMyOrders : null}
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
  Meteor.subscribe('popular_tags');
  return { currentUser: Meteor.user(), popular_tags:TagsCount.find({},{sort:{total:-1},limit:10}).fetch() };
}, Header);
