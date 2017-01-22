import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Shops } from '../../../imports/collections/shops';
import { Link, browserHistory } from 'react-router';
import CreateShop from './create_shop';
import MyProducts from '../products/my_products';

class EditShop extends Component {

  constructor(props) {
    super(props);
    this.state = {activeTab:"my_products"}
  }
  render(){
    if(!this.props.shop){
      return (
        <div className="container">
        <div className="alert alert-info" role="alert">
        You are not selling anything yet!<br/>
        Start by creating your shop bellow!
        </div>
        <CreateShop shop={this.props.shop} />
        </div>
      );
    }else {
      var myProductsTab = (
        <div className="container">
        <br/>
        <Link to="create_product">
        <button className="btn btn-success">Create Product</button>
        </Link>
        <MyProducts />
        </div>
      );
    return (
      <div className="container">
      {/*<div className="container">
      }<Link to={"/add_product_pictures/"+this.props.product._id}><button className="btn delete-btn btn-default">Add/Remove Pictures</button></Link>
      <Link to={"/add_product_downloads/"+this.props.product._id}><button className="btn delete-btn btn-default">Add/Remove File Downloads</button></Link>
      <Link to={"/product/"+this.props.params.productId}><button className="btn delete-btn btn-default">View</button></Link>
      </div>*/}
      <ul className="nav nav-tabs">
        <li className={this.state.activeTab=="my_products"?"active":""} role="presentation">
          <a href="#" onClick={()=>{this.setState({activeTab:"my_products"})}}>
            My Products
          </a>
        </li>

      </ul>
      {this.state.activeTab == "my_products"?myProductsTab:null}
      </div>
    );
    }
  }
}

  export default createContainer((props) => {
    Meteor.subscribe('edit_shop');
    return { shop: Shops.findOne({ownerId:Meteor.userId()}) };
  }, EditShop);
