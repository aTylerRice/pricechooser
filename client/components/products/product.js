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
import CountdownTimer from './countdown_timer';
import OrderDownload from './order_download';

class Product extends Component {

  constructor(props) {
    super(props);
    const { productId } = props.params;
    this.state = {userPriceError:'',paymentFormOpened:false,time:{d:"",h:"",m:"",s:""},cardNumberClass:'',cardExpiryClass:'',cardCVCClass:''};
    this.duration = 0;
    this.countDown = this.countDown.bind(this);
    this.timer = 0;
    this.payAmountAboveMinimumPrice = this.payAmountAboveMinimumPrice.bind(this);

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

    this.setState({price,displayPrice:price});
    if(this.props.product.price >=1 && (parseFloat(price)<this.props.product.price)){
      this.setState({userPriceError:'Your price must be higher than $'+this.props.product.price});
      return;
    }else if(parseFloat(price)<1){
      this.setState({userPriceError:'Your price must be higher than $1.00. Or download for free. Sorry our credit card transaction fees are too high for prices lower than $1.'});
      return;
    }
    this.setState({userPriceError:''});
  }

  handleSubmitPrice(product, event){
    event.preventDefault();
    if(this.state.paymentFormOpened){
      this.setState({paymentFormOpened:false});
      return;
    }
    if(this.props.product.price==0 && !this.state.price && !this.state.displayPrice){
      this.setState({price:1,displayPrice:100});
    }else if(this.state.price && this.props.product.price >=1 && (parseFloat(this.state.price)<this.props.product.price)){
      this.setState({userPriceError:'Your price must be higher than $'+this.props.product.price});
      return;
    }else if(!this.state.price &&this.props.product.price==0 || this.state.price<1){
      this.setState({userPriceError:'Your price must be higher than $1.00. Or download for free. Sorry our credit card transaction fees are too high for prices lower than $1.'});
      return;
    }

    this.setState({paymentFormOpened:true});
    if(!this.state.price){
      this.setState({price:this.props.product.price});
    }
    /*var order = {price:this.state.price || this.props.product.currentPrice, productId: this.state.productId || this.props.product._id};
    Meteor.call('product_orders.insert',order);*/
  }

  handlePaymentFormSubmit(cardDetails){
    console.log(cardDetails);
    if(parseFloat(this.state.price)<1){
      return false;
    }
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
          if(parseFloat(this.state.price)<1){
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

  payAmountAboveMinimumPrice(amountAbove){
    console.log("amountAbove");
    console.log(amountAbove);
    console.log(parseFloat(this.props.product.price));
    console.log(parseFloat(this.props.product.price)+amountAbove);
    this.setState({displayPrice:(parseFloat(this.props.product.price)+amountAbove)*100,price:(parseFloat(this.props.product.price)+amountAbove)});

  }


  render() {

    if(!this.props.product){
      return (
        <div className="container">loading</div>
      );
    }



    var product = this.props.product;
      var userPrice = this.state.price || product.price;
      if(userPrice==0){
        userPrice = "1.00";
      }

      var downloadButtons = product.downloads.map(download => {
        return (
          <OrderDownload key={download.key} product={product} download={download} />
        )
      });
      var downloads = (
        <div>
          <h5>Downloads</h5>
          {downloadButtons}
        </div>
      );


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
    var listItemNumberBought = null;
    if(product.price>0){
      listItemNumberBought = (
        <li className="list-group-item">
        <h2><TransitiveNumber>{this.props.product.orderCount}</TransitiveNumber> paid for this</h2>
        </li>
      );
    }

    var donationAmount = 0;
    if(product.price==0){
      donationAmount = Math.floor(((this.state.price - product.price-0.3-(this.state.price*0.029))*0.5)*100)/100;
    }else {
      donationAmount = Math.floor(((this.state.price - product.price)*0.5)*100)/100;
    }
    var donationAmountDiv = null;
    if(donationAmount>0&&this.state.price>=1&&this.state.userPriceError==''){
      donationAmountDiv = (
        <h4>${donationAmount} will be donated to charity</h4>
      );
    }
    var userPriceErrorDiv = null;
    if(this.state.userPriceError!=''){
      userPriceErrorDiv = (
        <div className="alert alert-danger">
        {this.state.userPriceError}
        </div>
      )
    }
    var submitPriceButtonValue = "Pay and Download";
    if(this.state.paymentFormOpened){
      submitPriceButtonValue = "Close Payment Details and Change Price";
    }
    var payDiv = (
      <h4>
        Pay a minimum price of ${product.price} USD
      </h4>
    );
    if(product.price==0){
      payDiv = (
        <h4>
          This product is free to download, but feel free to support the creator and donate some money to our monthly charity.
        </h4>
      )
    }
      return (
        <div className="container" key={product._id}>
          <div className="text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h1>
            {product.title}
          </h1>

          </div>
          <div className="product col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div className="row">
          <div className="product-images col-xs-12 col-sm-12 col-md-5 col-lg-5">
          <div className="product-slideshow">
          {this.renderSlideshow()}
          </div>
          {downloads}
          </div>
          <div className="col-xs-12 col-sm-12 col-md-7 col-lg-7">
            <ul className="list-group">
            {listItemNumberBought}
            {listItemLastOrder}
            <li className="list-group-item">
              {payDiv}
              <form onSubmit={this.handleSubmitPrice.bind(this, product)}>
              {userPriceErrorDiv}
              <h4 className="progress-desc">
              Im willing to pay
              </h4>
              <div className="input-group">
                  <span className="input-group-addon">$</span>
                  <CurrencyInput disabled={this.state.paymentFormOpened} className="form-control" value={this.state.displayPrice?this.state.displayPrice:userPrice*100} onChange={this.handleBuyPriceChange.bind(this)} />
              </div>
              {donationAmountDiv}
              <br/>
              <div className="input-group">
                <h4>Support the creator and this months charity by paying a set amount above the minimum. 50% of any amount above the minimum gets donated to charity.</h4>
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                <button onClick={(event)=>{
                  event.preventDefault();
                  this.payAmountAboveMinimumPrice(1);
                }} className="btn btn-success">
                + $1.00
                </button>
                </div>
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                <button onClick={(event)=>{
                  event.preventDefault();
                  this.payAmountAboveMinimumPrice(2);
                }} className="btn btn-success">
                + $2.00
                </button>
                </div>
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                <button onClick={(event)=>{
                  event.preventDefault();
                  this.payAmountAboveMinimumPrice(5);
                }} className="btn btn-success">
                + $5.00
                </button>
                </div>
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                <button onClick={(event)=>{
                  event.preventDefault();
                  this.payAmountAboveMinimumPrice(10);
                }} className="btn btn-success">
                + $10.00
                </button>
                </div>
              </div>
              <br/>
              <div className="input-group">
              <input className="btn btn-success" type="submit" value={submitPriceButtonValue} />
              </div>
              </form>
              <Collapse isOpened={this.state.paymentFormOpened}>

              <PaymentDetails userPrice={userPrice} productPrice={product.price} handleFormSubmit={this.handlePaymentFormSubmit.bind(this)} />
              </Collapse>
            </li>

            </ul>


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
