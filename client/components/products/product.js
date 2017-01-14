import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import TransitiveNumber from 'react-transitive-number';
import moment from 'moment';
import Slider from 'react-slick';


class Product extends Component {

  constructor(props) {
    super(props);
    const { productId } = props.params;
    this.state = {time:{d:"",h:"",m:"",s:""}};
    this.duration = 0;
    this.countDown = this.countDown.bind(this);
    this.timer = 0;
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


  handleBuyPriceChange(product, event){
    this.setState({price:event.target.value});
  }

  handleSubmitPrice(product, event){
    event.preventDefault();
    if(this.state.price<this.props.product.minimumPrice){
      return false;
    }
    var order = {price:this.state.price || this.props.product.currentPrice, productId: this.state.productId || this.props.product._id};
    Meteor.call('product_orders.insert',order);
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

  render() {
    if(!this.props.product){
      return (
        <div className="container">loading</div>
      );
    }

    var product = this.props.product;
      var userPrice = this.state.price || product.currentPrice;

      var progressBarPercent = 100*((product.startPrice - product.currentPrice)/(product.startPrice - product.minimumPrice));

      var timeCountdown = (
        <h2>loading</h2>
      );
      console.log(this.state.time);
      if(this.state.time.s!=''){
        timeCountdown = (
        <h2>
        <TransitiveNumber>{this.state.time.d}</TransitiveNumber> days <TransitiveNumber>{this.state.time.h}</TransitiveNumber> hrs <TransitiveNumber>{this.state.time.m}</TransitiveNumber> mins <TransitiveNumber>{this.state.time.s}</TransitiveNumber> secs<br/>to go
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
                <input className="form-control" type="text" value={userPrice} onChange={this.handleBuyPriceChange.bind(this, product)} />

              </div>
              <br/>
              <div className="input-group">
              <input className="btn btn-success" type="submit" value="Buy" />
              </div>
              </form>
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
