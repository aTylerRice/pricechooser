import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link, browserHistory } from 'react-router';
import CreateShop from './create_shop';

class EditShop extends Component {

  constructor(props) {
    super(props);
  }
  render(){
    if(!this.props.shop){
      return (
        <div className="container">Loading</div>
      );
    }else {
    return (
      <div>
      {/*<div className="container">
      }<Link to={"/add_product_pictures/"+this.props.product._id}><button className="btn delete-btn btn-default">Add/Remove Pictures</button></Link>
      <Link to={"/add_product_downloads/"+this.props.product._id}><button className="btn delete-btn btn-default">Add/Remove File Downloads</button></Link>
      <Link to={"/product/"+this.props.params.productId}><button className="btn delete-btn btn-default">View</button></Link>
      </div>*/}
      <CreateShop shop={this.props.shop} />
      </div>
    );
    }
  }
}

  export default createContainer((props) => {
    const { shopId } = props.params;
    Meteor.subscribe('edit_shop');
    return { product: Shops.findOne({ownerId:Meteor.userId()}) };
  }, EditShop);
