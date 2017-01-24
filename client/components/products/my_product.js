import React, { Component } from 'react';
import { Link } from 'react-router';

export default class MyProduct extends Component {

  constructor(props){
    super(props);
    this.state = {showAreYouSure:false};
  }

  onProductRemove(){
    Meteor.call('products.remove', this.props.product);
  }

  render(){
    var areYouSureRemoveProduct = null;
    var product = this.props.product;
    if(this.state.showAreYouSure){
      areYouSureRemoveProduct = (
        <div>
        <h4>Are you sure you want to totally delete this product?</h4>
        <button className="btn btn-default" onClick={()=>this.removeProduct()}>
        no</button>
        <button className="btn btn-default" onClick={()=> this.onProductRemove()}>
        yes
        </button>
        </div>
      )
    }
    return (
      <li key={product._id} className="list-group-item col-xs-12 col-sm-12 col-md-12 col-lg-12">
        {product.title} - <Link to={"/product/"+product._id}>View</Link>
        - <Link to={"/edit_product/"+product._id}>Edit</Link>
        <br/><br/><Link to={"/add_product_pictures/"+product._id}><button className="btn btn-default">Add/Remove Pictures</button></Link>
          &nbsp;&nbsp; <Link to={"/add_product_downloads/"+product._id}><button className="btn btn-default">Add/Remove Downloads</button></Link>
        <span className="pull-right">
        {areYouSureRemoveProduct}
        <button
          value={product._id}
          className="delete-btn btn btn-danger"
          onClick={(product) => this.removeProduct()}>
          delete
        </button>
        </span>
      </li>
    );
  }
}
