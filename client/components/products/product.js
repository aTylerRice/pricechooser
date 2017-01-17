import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import TransitiveNumber from 'react-transitive-number';
import moment from 'moment';
import Slider from 'react-slick';
import Collapse from 'react-collapse';
import CurrencyInput from 'react-currency-input';
import PaymentDetails from './payment_details';


class Product extends Component {

  constructor(props) {
    super(props);
    const { productId } = props.params;
    this.state = {userPriceError:'',paymentFormOpened:false,time:{d:"",h:"",m:"",s:""},cardNumberClass:'',cardExpiryClass:'',cardCVCClass:''};
    this.duration = 0;
    this.countDown = this.countDown.bind(this);
    this.timer = 0;

  }

  componentDidMount(){
/*
/* Form validation using Stripe client-side validation helpers
$.validator.addMethod("cardNumber", function(value, element) {
    return this.optional(element) || );

jQuery.validator.addMethod("cardExpiry", function(value, element) {
    /* Parsing month/year uses jQuery.payment library
    value = $.payment.cardExpiryVal(value);
    return this.optional(element) || Stripe.card.validateExpiry(value.month, value.year);
}, "Invalid expiration date.");

jQuery.validator.addMethod("cardCVC", function(value, element) {
    return this.optional(element) || Stripe.card.validateCVC(value);
}, "Invalid CVC.");

validator = $form.validate({
    rules: {
        cardNumber: {
            required: true,
            cardNumber: true
        },
        cardExpiry: {
            required: true,
            cardExpiry: true
        },
        cardCVC: {
            required: true,
            cardCVC: true
        }
    },
    highlight: function(element) {
        $(element).closest('.form-control').removeClass('success').addClass('error');
    },
    unhighlight: function(element) {
        $(element).closest('.form-control').removeClass('error').addClass('success');
    },
    errorPlacement: function(error, element) {
        $(element).closest('.form-group').append(error);
    }
});

paymentFormReady = function() {
    if ($form.find('[name=cardNumber]').hasClass("success") &&
        $form.find('[name=cardExpiry]').hasClass("success") &&
        $form.find('[name=cardCVC]').val().length > 1) {
        return true;
    } else {
        return false;
    }
}

$form.find('[type=submit]').prop('disabled', true);
var readyInterval = setInterval(function() {
    if (paymentFormReady()) {
        $form.find('[type=submit]').prop('disabled', false);
        clearInterval(readyInterval);
    }
}, 250);
*/
  }

  componentWillReceiveProps(nextProps){

    if(this.timer == 0){
      this.timer = setInterval(this.countDown, 1000);
    }
    var currentTime = new Date();
    var eventTime = nextProps.product.endingDate;
    var diffTime = (new Date(eventTime)) - currentTime;
    this.duration = moment.duration(diffTime, 'milliseconds');

  }

  componentWillUnmount(){
    if(this.timer != 0){
      clearInterval(this.timer);
    }
  }

  countDown(){

    this.duration = moment.duration(this.duration - 1000, 'milliseconds');
    this.setState({time:{d:this.duration.days(),h:this.duration.hours(),m:this.duration.minutes(),s:this.duration.seconds()}});
  }


  handleBuyPriceChange(price){

    this.setState({price});
  }

  handleSubmitPrice(product, event){
    event.preventDefault();
    if(this.state.paymentFormOpened){
      this.setState({paymentFormOpened:false});
      return;
    }
    if(this.state.price && this.state.price<this.props.product.minimumPrice){
      this.setState({userPriceError:'Your price must be higher than $'+this.props.product.minimumPrice});
      return;
    }
    this.setState({paymentFormOpened:true});
    if(!this.state.price || this.state.price < this.props.product.currentPrice){
      this.setState({price:this.props.product.currentPrice});
    }
    /*var order = {price:this.state.price || this.props.product.currentPrice, productId: this.state.productId || this.props.product._id};
    Meteor.call('product_orders.insert',order);*/
  }

  handlePaymentFormSubmit(cardDetails){
    console.log(cardDetails);
    return;
    var number = cardDetails.number;
    var exp_year = cardDetails.exp_year;
    var exp_month = cardDetails.exp_month;
    var cvc = cardDetails.cvc;
    Stripe.card.createToken({
        number,
        cvc,
        exp_month,
        exp_year
      }, function(status,response){
        if(status==200){
          if(this.state.price<this.props.product.minimumPrice){
            return false;
          }
          var order = {stripe_token:response.id,price:this.state.price || this.props.product.currentPrice, productId: this.state.productId || this.props.product._id};
          Meteor.call('product_orders.insert',order);
          console.log(status);
          console.log("response");
          console.log(response);
        }
    });
  }

  onProductRemove(product){
    Meteor.call('products.remove', product);
    //clearInterval(this.timer);
  }

  renderSlideshow(){
    var settings = {
      customPaging: (i) => {
        return <a><img src={this.props.product.images[i].image_url}/></a>
      },
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    var slideshowPictures;
    if(this.props.product.images && this.props.product.images.length > 0){
    slideshowPictures = this.props.product.images.map(picture => {
      picture = picture.image_url;
      return (
        <div key={picture}><img loop="infinite" src={picture} /></div>
      );
    });
  }else {
    return null;
  }
  return (
    <Slider {...settings}>
      {slideshowPictures}
    </Slider>
  );
  }

  onChangeCardNumber(event){
    var value = this.refs.number.value;
    var v = this.refs.number.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    this.refs.number.value = v;
    var matches = v.match(/\d{4,16}/g);
    var match = matches && matches[0] || ''
    var parts = []

    for (i=0, len=match.length; i<len; i+=4) {
        parts.push(match.substring(i, i+4))
    }

    if (parts.length) {
        this.refs.number.value = parts.join(' ');
    }

  }

  onChangeCVC(){
    $('#cvc').payment('formatCardCVC');
  }



  render() {

    if(!this.props.product){
      return (
        <div className="container">loading</div>
      );
    }

    var product = this.props.product;
      var userPrice = this.state.price || product.currentPrice;
      if(product.currentPrice<this.state.price){
        userPrice=product.currentPrice;
      }
      var progressBarPercent = 100*((product.startPrice - product.currentPrice)/(product.startPrice - product.minimumPrice));

      var submitPriceButtonValue = "Commit to Paying $"+userPrice+" or less";
      if(this.state.paymentFormOpened){
        submitPriceButtonValue = "Change my price commitment";
      }

      var timeCountdown = (
        <h2>loading</h2>
      );
      /*var daysCountdown = null;
      if(this.state.time.d!= ''){
        daysCountdown = (
          <span>
          <TransitiveNumber>{this.state.time.d}</TransitiveNumber> days
          </span>
        );
      }
      var hoursCountdown = null;
      if(this.state.time.h!= ''||this.state.time.d!=''){
        daysCountdown = (
          <span>
          <TransitiveNumber>{this.state.time.d}</TransitiveNumber> days
          </span>
        );
      }
      var secondsCountdown = null;
      if(this.state.time.s!=''){
        secondsCountdown = (
          <span>
          <TransitiveNumber>{this.state.time.s}</TransitiveNumber> secs
          </span>
        );
      }*/
      if(this.state.time.h !=''||this.state.time.m!=''){
        timeCountdown = (
        <h2>
        <TransitiveNumber>{this.state.time.d}</TransitiveNumber> days <TransitiveNumber>{this.state.time.h}</TransitiveNumber> hrs <TransitiveNumber>{this.state.time.m}</TransitiveNumber> mins <br/>to go
        </h2>
      );
    }
    if(this.state.time.s < 0 || this.state.time.d < 0 || this.state.time.h < 0 || this.state.time.m < 0){
      timeCountdown = (
        <h2>
        ended
        </h2>
      );
    }
    var listItemLastOrder = (<span></span>);
    if(this.props.last_order){
      listItemLastOrder = (
        <li className="list-group-item">
        <h2>
        ${this.props.last_order.price}<br/>last price submitted
        </h2>
        </li>
      );
    }
      return (
        <div className="container" key={product._id}>
          <div className="text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h1>
            {product.title}
          </h1>

          </div>
          <div className="product-card col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            <div className="product-card-top">
            <h2 className="text-green progress-desc">${product.startPrice}</h2>
            <h2 className="text-green text-center progress-desc">${product.currentPrice}</h2>
            <h2 className="text-green text-right progress-desc">${product.minimumPrice}</h2>
            <div className="price-progress progress">



                <div className="progress-bar progress-bar-success" role="progressbar" aria-valuenow={Math.trunc(progressBarPercent)} aria-valuemin="0" aria-valuemax="100" style={{width: (Math.trunc(progressBarPercent))+'%'}}>
                  <span>&nbsp;</span>
                </div>


            </div>

            </div>


          </div>
          <div className="product-images col-xs-12 col-sm-6 col-md-6 col-lg-6">

          {this.renderSlideshow()}

          </div>
          <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
            <ul className="list-group">
            <li className="list-group-item">
            <h2><TransitiveNumber>{this.props.product.orderCount}</TransitiveNumber> bought this</h2>
            </li>
            <li className="list-group-item">
            {timeCountdown}
            </li>
            {listItemLastOrder}
            <li className="list-group-item">
            <h4>
              Choose any price between ${product.currentPrice} and ${product.minimumPrice} USD
            </h4>
              <form onSubmit={this.handleSubmitPrice.bind(this, product)}>
              <h4 className="progress-desc">
              Im willing to pay
              </h4>
              <div className="input-group">
                {/*}<input className="form-control" type="text" value={this.state.price?this.state.price:''} onChange={this.handleBuyPriceChange.bind(this, product)} />
                  */}
                  <span className="input-group-addon">$</span>
                  <CurrencyInput disabled={this.state.paymentFormOpened} className="form-control" value={this.state.price} onChange={this.handleBuyPriceChange.bind(this)} />
              </div>
              <br/>
              <div className="input-group">
              <input className="btn btn-success" type="submit" value={submitPriceButtonValue} />
              </div>
              </form>
              <Collapse isOpened={this.state.paymentFormOpened}>
              <br/>
              <PaymentDetails userPrice={userPrice} handleFormSubmit={this.handlePaymentFormSubmit.bind(this)} />
              </Collapse>
            </li>

            </ul>


          </div>
          <div id="buy-form-container" className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
            {/*}<form className="form-horizontal" role="form">
              <fieldset>
                <legend>Payment</legend>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlhtmlFor="card-number">Card Number</label>
                  <div className="col-sm-9">
                    <input ref="number" onChange={this.onChangeCardNumber.bind(this)} type="text" className="form-control" name="card-number" id="cardNumber" placeholder="Debit/Credit Card Number" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlhtmlFor="expiry-month">Expiration Date</label>
                  <div className="col-sm-9">
                    <div className="row">
                      <div className="col-xs-3">
                        <input ref="exp_month" type="text" className="form-control" name="exp-month" id="exp_month" placeholder="MM" />
                      </div>
                      <div className="col-xs-3">
                        <input ref="exp_year" type="text" className="form-control" name="exp-year" id="exp_year" placeholder="YYYY" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlhtmlFor="cvc">Card CVC</label>
                  <div className="col-sm-3">
                    <input ref="cvc" onChange={this.onChangeCVC.bind(this)} type="text" className="form-control" name="cvc" id="cvc" placeholder="Security Code" />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-sm-offset-3 col-sm-9">
                    <button type="button" className="btn btn-success">Pay Now</button>
                  </div>
                </div>
              </fieldset>
            </form>*/}


          </div>
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">

            <div dangerouslySetInnerHTML={{ __html: product.body }}>
            </div>
          </div>

          </div>
          </div>
        </div>
    );
  }
}

export default createContainer((props) => {
  const { productId } = props.params;
  Meteor.subscribe('product_orders',productId);
  Meteor.subscribe('product',productId);
  return { product: Products.findOne({_id:productId}), last_order: ProductOrders.findOne({productId:productId},{sort: {createdAt: -1}, limit: 1}) };
}, Product);
