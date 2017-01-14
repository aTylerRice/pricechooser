import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import OrderDownload from './order_download';
import ProductCard from './product_card';
import Datetime from 'react-datetime';

class MyOrders extends Component {

  constructor(props) {
    super(props);
  }

  renderList(){
    return this.props.products.map(product => {

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
      var fulfillments = null;
      if(product.fulfillments && product.fulfillments.length > 0){
          fulfillments = Object.keys(product.fulfillments[0].data).map((key, index)=>{
            return (
              <div>
              <h4>{key}</h4>
              <p>
              {product.fulfillments[0].data[key]}
              </p>
              </div>
            );
          })
      }
      return (
        <li key={product._id} className="list-group-item col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <h4><Link to={"/product/"+product._id}>{product.title}</Link></h4>

          <p>
            {product.description}
          </p>
          {fulfillments}
          <ul className="list-group">

            {product.downloads.length>0?downloads:null}
          </ul>
        </li>
      );
    })
  }

  render() {
    return (
      <div>

      <div className="container">
      <h2>My Orders</h2>
        <ul className="download-list list-group col-xs-12 col-sm-12 col-md-6 col-lg-6">
          {this.renderList()}
        </ul>
      </div>
      </div>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('my_orders');


  return { products: Products.find({}).fetch()};
}, MyOrders);
