import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';

class CreateUser extends Component {

  constructor(props){
    super(props);
    this.state = { error: '',errorEmailExists:false };
  }

  handleSignupSubmit(){
    Accounts.createUser({
      email: this.refs.email.value,
      password: this.refs.password.value
    },(error)=> {
      if(error){
        this.setState({error: error.reason, errorEmailExists: true});
      }else {
        this.setState({error: '', errorEmailExists: false});
        browserHistory.push("/");
      }
    });
  }

  render() {
    return (
      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 col-sm-offset-3 col-md-offset-4 col-lg-offset-4">


        <p className="text-center"><b>Sign Up with an Email</b></p>

        <div className="form-group">
          <label htmlFor="signup-email-input">Email</label>
          <input ref="email" name="email" type="email" className="form-control" id="signup-email-input" placeholder="example@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="signup-password-input">Password</label>
          <input ref="password" type="password" name="password" className="form-control" id="signup-password-input" placeholder="password" />
        </div>
        <div className="text-danger">{this.state.error}</div>
        {(()=>{
          if(this.state.errorEmailExists){
          return (<div><Link to="login">Login instead</Link></div>);
          }
        })()}
        <button onClick={this.handleSignupSubmit.bind(this)} type="submit" className="btn btn-default">Sign Up</button>


      </div>
    );
  }
}

export default CreateUser;
