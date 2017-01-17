import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';


export default class PaymentDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {error:'',cardNumberClass:'',cardExpiryClass:'',cardCVCClass:''};

    this.onChangeCCForm = this.onChangeCCForm.bind(this);
  }

  onChangeCCForm(){
    $('input[name=cardNumber]').payment('formatCardNumber');
    $('input[name=cardCVC]').payment('formatCardCVC');
    $('input[name=cardExpiry').payment('formatCardExpiry');
    var expiryValueRaw = this.refs.cardExpiry.value.replace(/\s/g, '').split('/');
    var expiryValue = {month:expiryValueRaw[0],year:expiryValueRaw[1]}
    if(!Stripe.card.validateCardNumber(this.refs.cardNumber.value)){
      this.setState({cardNumberClass:'error',error:'Invalid credit card number.'});
      return;
    }else{
      this.setState({cardNumberClass:'success',error:''});
    }

    if(!Stripe.card.validateExpiry(expiryValue.month, expiryValue.year)){
      this.setState({cardExpiryClass:'error',error:'Invalid expiration date.'});
      return;
    }else{
      this.setState({cardExpiryClass:'success',error:''});
    }

    if(!Stripe.card.validateCVC(this.refs.cvc.value)){
      this.setState({cardCVCClass:'error',error:'Invalid CVC.'});
    }else {
      this.setState({cardCVCClass:'success',error:''});
      return;
    }
  }

  handlePaymentFormSubmit(event){
    event.preventDefault();
    console.log("paymentdetails handlePaymentFormSubmit");
    this.props.handleFormSubmit({hello:"hello"})
  }

  render(){
    return (
      <div className="payment-panel panel panel-default credit-card-box">
      <div className="panel-heading display-table" >
      <div className="row display-tr" >
        <h3 className="panel-title display-td" >Payment Details</h3>
        <div className="display-td" >

        </div>
      </div>
      </div>
      <div className="panel-body">
      <div className="row" style={{display:"none"}}>
      <div className="col-xs-12">
      <p className="payment-errors">{this.state.error}</p>
      </div>
      </div>
      <form onSubmit={this.handlePaymentFormSubmit.bind(this)} role="form" id="payment-form">
      <div className="row">
      <div className="col-xs-12">
      <div className="form-group">
      <label htmlFor="cardNumber">CARD NUMBER</label>
      <div className="input-group">
      <input
      onChange={this.onChangeCCForm}
      type="tel"
      ref="cardNumber"
      className={"form-control "+this.state.cardNumberClass}
      name="cardNumber"
      placeholder="Valid Card Number"
      autoComplete="cc-number"
      required autoFocus
      />
      <span className="input-group-addon"><i className="fa fa-credit-card"></i></span>
      </div>
      </div>
      </div>
      </div>
      <div className="row">
      <div className="col-xs-7 col-md-7">
      <div className="form-group">
      <label htmlFor="cardExpiry"><span className="hidden-xs">EXPIRATION</span><span className="visible-xs-inline">EXP</span> DATE</label>
      <input
      onChange={this.onChangeCCForm}
      type="tel"
      className={"form-control "+this.state.cardExpiryClass}
      name="cardExpiry"
      ref="cardExpiry"
      placeholder="MM / YY"
      autoComplete="cc-exp"
      required
      />
      </div>
      </div>
      <div className="col-xs-5 col-md-5 pull-right">
      <div className="form-group">
      <label htmlFor="cardCVC">CV CODE</label>
      <input
      onChange={this.onChangeCCForm}
      type="tel"
      ref="cvc"
      className={"form-control "+this.state.cardCVCClass}
      name="cardCVC"
      placeholder="CVC"
      autoComplete="cc-csc"
      required
      />
      </div>
      </div>
      </div>
      <div className="row">
      <div className="col-xs-12">
      <button className="btn btn-success btn-lg btn-block" type="submit">Charge me ${this.props.userPrice} or less when this campaign ends</button>
      </div>
      </div>

      </form>
      </div>
      </div>
    );
  }
}
