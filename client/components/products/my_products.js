import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import ProductCard from './product_card';
import Datetime from 'react-datetime';

class MyProducts extends Component {

  constructor(props) {
    super(props);
  }

  onProductRemove(event){
    Meteor.call('products.remove', event.target.value);
  }

  renderList(){
    return this.props.products.map(product => {

      return (
        <li key={product._id} className="list-group-item col-xs-12 col-sm-12 col-md-12 col-lg-12">
          {product.title} - <Link to={"/product/"+product._id}>View</Link>
          - <Link to={"/edit_product/"+product._id}>Edit</Link>
          - <Link to={"/add_product_pictures/"+product._id}>Add/Remove Pictures</Link>
          <span className="pull-right">

          <button
            value={product._id}
            className="delete-btn btn btn-danger"
            onClick={(product) => this.onProductRemove(product)}>
            delete
          </button>
          </span>
        </li>
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
