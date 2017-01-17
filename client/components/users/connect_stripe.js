import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { createContainer } from 'meteor/react-meteor-data';
import {StripeCredentials} from '../../../imports/collections/stripe_credentials';

class ConnectStripe extends Component {

  constructor(props){
    super(props);
    this.state = {error:'', success:''}
    //this.state = { error: '',errorEmailExists:false };
    if(props.location && props.location.query && props.location.query.code){
      console.log(props.location.query);
      Meteor.call('connect_stripe',props.location.query,(err, response)=>{
        if(err){
          console.log(err);
          this.setState({error:err.message, success: ''});
        }else {
          console.log(response);
          this.setState({error:'', success:'Stripe is connected successfully. You will automatically receive payouts to your Stripe account when customers purchase your products.'});
        }
      });
    }
  }

  render() {
    console.log(this.props.stripe_credentials);
    console.log(this.props.location.query);
    var warningDiv = null;
    var successDiv = null;
    if(this.state.error != ''){
      warningDiv = (
        <div className="alert alert-danger" role="alert">
          {this.state.error}
        </div>
      );
    }
    if(this.state.success != ''){
      successDiv = (
        <div className="alert alert-success" role="alert">
          {this.state.success}
        </div>
      )
    }
    if(this.props.stripe_credentials.length > 0){
      successDiv = (
        <div className="alert alert-success" role="alert">
          Stripe is already connected successfully. You will automatically receive payouts to your Stripe account when customers purchase your products.
        </div>
      )
    }
    return (
      <div className="text-center col-xs-12 col-sm-6 col-md-4 col-lg-4 col-sm-offset-3 col-md-offset-4 col-lg-offset-4">
        {successDiv}
        {warningDiv}
        <a
          href="https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_9uJtFYU1SvOZql9g6XU3sU0VjlRdxThs&scope=read_write"
          className="stripe-connect"
        >
        <span>Connect with Stripe</span>
        </a>

      </div>
    );
  }
}

export default createContainer((props) => {
  Meteor.subscribe('my_stripe_credentials');
  return { stripe_credentials:StripeCredentials.find({ownerId:Meteor.userId()},{fields:{ownerId:1,_id:1}}).fetch()};
}, ConnectStripe);
