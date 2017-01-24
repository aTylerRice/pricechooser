import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products, AllowedProductCategories } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import ProductCard from './product_card';
import Datetime from 'react-datetime';
import { ReactiveVar } from 'meteor/reactive-var';

const sorts = [
  {name:"Most Sold", field:"orderCount", direction:-1}


];

class ProductsList extends Component {

  constructor(props) {
    super(props);
    var category = this.props.params.category||'';
    this.state = {page:0,sort:sorts[0], categories:[category]};
    this.page = 0;
  }

  renderList(){
    console.log("renderList");
    console.log(this.props.products);
    return this.props.products.map(product => {

      return (
        <ProductCard product={product} key={product._id}>
        </ProductCard>
      );
    })
  }

  handleLoadMore(){
    this.page += 1;
    Meteor.subscribe('products',this.page,this.state.sort.field,this.state.sort.direction);
  }

  handleSortChange(field, event){
    event.preventDefault();
    sorts.every((sort)=>{
      if(sort.field == field){
        this.setState({sort});
        this.props.sort.set(sort);
        Meteor.subscribe('products',0,sort.field,sort.direction);
        return false;
      }
      return true;
    });
  }

  renderSortMenu(){
    return sorts.map(sort => {
      if(sort.field==this.props.sort.field){
        return;
      }
      return (
        <a key={sort.field} onClick={this.handleSortChange.bind(this, sort.field)}>
        <li>
          <h4>
            {sort.name}
          </h4>
        </li>
        </a>
      );
    })
  }

  render() {
    return (
      <div>
      {/*}<div className="jumbotron">
        <div className="container">
        <h2>Choose the price you&rsquo;re willing to pay on products you love.</h2>
        <h3><ol>
          <li><p>Choose a product you want.</p></li>
          <li><p>Pick a price you&rsquo;re willing to pay.</p></li>
          <li><p>When the countdown ends you&rsquo;ll get charged the price the product dropped to if its lower than your set price.</p></li>
          <li><p>Recieve an email with the product you purchased.</p></li>
        </ol></h3>
        </div>
      </div>*/}
      <div className="list-filter container">

      <h3>
      Sorted by
      </h3>
        <div className="btn-group">

        <button type="button" className="btn btn-lg btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {this.props.sort.name}&nbsp;&nbsp;<span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          {this.renderSortMenu()}
        </ul>
        </div>
      </div>
      <div className="row" >
        {this.renderList()}
      </div>
      <div className="row">
      <div className="container text-center">
        <button onClick={this.handleLoadMore.bind(this)}
            className="btn btn-default">
            Load More
          </button>
          </div>
      </div>
      </div>
    );
  }
}

const sort = new ReactiveVar(sorts[0]);

export default createContainer((props) => {
  var category = props.params.category||'';
  Meteor.subscribe('products',0,sort.get() ? sort.get().field : sorts[0].field,sort.get() ? sort.get().direction : 1,[category]);
  var sortParams = {};
  sortParams[sort.get() ? sort.get().field : sorts[0].field] = sort.get() ? sort.get().direction : 1;
  var startingDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")

  startingDate.setSeconds(0);
  startingDate.setHours(0);
  startingDate.setMinutes(0);
  return { sort: sort.get(), products: Products.find({},{sort: sortParams}).fetch()};
}, ProductsList);
