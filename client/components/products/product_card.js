import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import TransitiveNumber from 'react-transitive-number';
import moment from 'moment';
import Slider from 'react-slick';


class ProductCard extends Component {

  constructor(props) {
    super(props);
    this.state = {productId: props.product._id, price: props.product.currentPrice, time:{d:"",h:"",m:"",s:""}};
    this.duration = 0;
    this.countDown = this.countDown.bind(this);
    this.timer = 0;
    this.renderSlideshow = this.renderSlideshow.bind(this);
    /*
    var interval = 1000;
    setInterval(function(){

      this.setState({productCountdown: duration});
    }, interval);*/
  }

  componentDidMount(){

    if(this.timer == 0){
      this.timer = setInterval(this.countDown, 1000);
    }
    var currentTime = new Date();
    var eventTime = this.props.product.endingDate;
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


  handleBuyPriceChange(product, event){
    this.setState({price:event.target.value});
  }

  handleSubmitPrice(product, event){
    event.preventDefault();
    console.log("handleSubmitPrice");
    Meteor.call('product_orders.insert',this.state);
  }

  onProductRemove(product){
    console.log("onProductRemove");
    Meteor.call('products.remove', product);
    //clearInterval(this.timer);
  }

  renderSlideshow(){
    if(this.props.product.images){
    return this.props.product.images.map(picture => {
      return (
        <div><img src={picture.image_url} /></div>
      );
    });
  }
  return (<div></div>);
  }
/*
  renderOrderList(){
    return this.props.product_orders.map(order => {

      return (
        <div key={order._id}>
          {order.price}
        </div>
      );
    });
  }
//*/
  truncate(string, length){
   if (string.length > length)
      return string.substring(0,length)+'...';
   else
      return string;
  }

  render() {
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
    var product = this.props.product;
      var userPrice = this.state.price;

      var progressBarPercent = 100*((product.startPrice - product.currentPrice)/(product.startPrice - product.minimumPrice));

    var product_image = null;
    if(product.images && product.images.length>0){
      product_image = (
        <Link to={"/product/"+product._id}><img height="222" src={product.images[0].image_url} /></Link>
      );
    }
    var countdownTimer = (
      <span className="pull-left">

      <TransitiveNumber>{this.state.time.d}</TransitiveNumber> days <TransitiveNumber>{this.state.time.h}</TransitiveNumber> hrs <TransitiveNumber>{this.state.time.m}</TransitiveNumber> mins <TransitiveNumber>{this.state.time.s}</TransitiveNumber> secs
      </span>
    );
    if(this.state.time.s < 0 || this.state.time.d < 0 || this.state.time.h < 0 || this.state.time.m < 0){
      countdownTimer = (
        <span className="pull-left">
        ended
        </span>
      );
    }
      return (
        <div className="product-card-container col-xs-12 col-sm-6 col-md-4 col-lg-4" key={product._id}>
          <div className="product-card col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div className="">
          {countdownTimer}
            <span className="pull-right">
              <b><TransitiveNumber>{this.props.product.orderCount}</TransitiveNumber></b> bought this
            </span>
          </div>
          <div className="">
          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">


            <h2>
            <Link className="product-link" to={"/product/"+product._id}>
              {this.truncate(product.title,30)}
            </Link>
            </h2>

          </div>
          <div className="product-images col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <span className="progress-desc text-left">Started at ${product.startPrice}</span>
          <span className="progress-desc text-center">Current ${product.currentPrice}</span>
          <span className="progress-desc text-right">Minimum ${product.minimumPrice}</span>
          <div className="price-progress progress">



              <div className="progress-bar progress-bar-success" role="progressbar" aria-valuenow={Math.trunc(progressBarPercent)} aria-valuemin="0" aria-valuemax="100" style={{width: (Math.trunc(progressBarPercent))+'%'}}>
                <span>&nbsp;</span>
              </div>


          </div>

          {product_image}

          </div>
          <div className="product-card-desc col-xs-12 col-sm-12 col-md-12 col-lg-12">

            <p>
            {this.truncate(product.description,228)}
            </p>
            {/*}
            <p>
              Choose any price between ${product.currentPrice} and ${product.minimumPrice} USD
            </p>
              <form onSubmit={this.handleSubmitPrice.bind(this, product)}>
              Im willing to pay
              <div className="input-group">
                <input className="form-control" type="text" value={userPrice} onChange={this.handleBuyPriceChange.bind(this, product)} />
                <input className="btn btn-success" type="submit" value="Buy" />
              </div>
              </form>
              {this.renderOrderList()}
              */}
          </div>
          {/*}
          <span className="pull-right">
            <button
              className="btn btn-danger"
              onClick={(product) => this.onProductRemove(product)}>
              remove
            </button>
          </span>*/}
          </div>
          </div>
        </div>
    );
  }
}

export default createContainer((props) => {
  Meteor.subscribe('product_orders',props.product._id);
  return { product_orders: ProductOrders.find({productId:props.product._id},{sort: {createdAt: -1}, limit: 5}).fetch() };
}, ProductCard);
