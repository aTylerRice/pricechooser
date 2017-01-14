import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';

class ConnectStripe extends Component {

  constructor(props){
    super(props);
    //this.state = { error: '',errorEmailExists:false };
  }

  render() {
    return (
      <div className="text-center col-xs-12 col-sm-6 col-md-4 col-lg-4 col-sm-offset-3 col-md-offset-4 col-lg-offset-4">
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

export default ConnectStripe;
