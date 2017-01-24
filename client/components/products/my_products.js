import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import MyProduct from './my_product';
import { Link } from 'react-router';
import ProductCard from './product_card';
import Datetime from 'react-datetime';

class MyProducts extends Component {

  constructor(props) {
    super(props);
  }



  renderList(){

    return this.props.products.map(product => {
      return (
        <MyProduct key={product._id} product={product} />
      );
    })
  }

  render() {
    //console.log(this.props.products);
    return (
      <div>
      <div className="container">
      <ul className="list-group col-xs-12 col-sm-12 col-md-6 col-lg-6">
        {this.renderList()}
        </ul>
      </div>
      </div>
    );
  }
}

export default createContainer(() => {
  Meteor.subscribe('my_products');


  return { products: Products.find({ownerId:Meteor.userId()}).fetch()};
}, MyProducts);
