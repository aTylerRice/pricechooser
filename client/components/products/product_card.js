import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import TransitiveNumber from 'react-transitive-number';
import moment from 'moment';
import Slider from 'react-slick';
import CountdownTimer from './countdown_timer';


class ProductCard extends Component {

  constructor(props) {
    super(props);
    this.state = {productId: props.product._id, price: props.product.currentPrice};
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

    var product_image = null;
    if(product.images && product.images.length>0){
      product_image = (
        <Link to={"/product/"+product._id}><img height="222" src={product.images[0].image_url} /></Link>
      );
    }
      return (
        <div className="product-card-container col-xs-12 col-sm-6 col-md-3 col-lg-3" key={product._id}>
          <div className="product-card col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div className="">
            <span className="pull-left product-card-price">
            ${product.price}
            </span>
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
          <div className="product-card-images col-xs-12 col-sm-12 col-md-12 col-lg-12">


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
