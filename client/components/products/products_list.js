require('rc-slider/assets/index.css');
import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products, AllowedProductCategories } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import ProductCard from './product_card';
import Datetime from 'react-datetime';
import { ReactiveVar } from 'meteor/reactive-var';
import Slider from 'rc-slider';

const sorts = [
  {name:"Most Sold", field:"orderCount", direction:-1},
  {name:"Price: Highest to Lowest", field:"price", direction:-1},
  {name:"Price: Lowest to Highest", field:"price", direction:1}
];

const defaultPriceRange = [0,20];

const sort = new ReactiveVar(sorts[0]);

const handleStyle = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  padding: '2px',
  border: '2px solid #abe2fb',
  borderRadius: '3px',
  background: '#fff',
  fontSize: '14px',
  textAlign: 'center',
};

const CustomPriceFilterHandle = React.createClass({
  propTypes: {
    value: React.PropTypes.any,
    offset: React.PropTypes.number,
  },
  render() {
    const props = this.props;
    const style = Object.assign({ left: `${props.offset}%` }, handleStyle);
    var displayPrice = props.value!=0?"$"+props.value:"Free";
    if(props.value>=100){
      displayPrice = "$100+";
    }
    return (
        <div style={style}>{displayPrice}</div>
    );
  },
});

class ProductsList extends Component {

  constructor(props) {
    super(props);
    var category = this.props.params.category||'';
    this.state = {page:0,sort:sorts[0], categories:[category], priceRangeFilter:defaultPriceRange};
    this.page = 0;
    this.onPriceRangeSliderChange = this.onPriceRangeSliderChange.bind(this);
  }

  renderList(){
    return this.props.products.map(product => {

      return (
        <ProductCard product={product} key={product._id}>
        </ProductCard>
      );
    })
  }

  handleLoadMore(){
    this.page += 1;
    Meteor.subscribe('products',this.page,this.state.sort.field,this.state.sort.direction,this.state.priceRangeFilter);
  }

  handleSortChange(name, event){
    event.preventDefault();
    sorts.every((sortIter)=>{
      if(sortIter.name == name){
        this.setState({sort:sortIter});
        console.log(this.props);
        console.log(this.state);
        sort.set(sortIter);
        Meteor.subscribe('products',0,sortIter.field,sortIter.direction,this.state.priceRangeFilter);
        return false;
      }
      return true;
    });
  }

  onPriceRangeSliderChange(value){
    this.setState({priceRangeFilter:value});
    Meteor.subscribe('products',this.page,this.state.sort.field,this.state.sort.direction,value);
  }

  renderSortMenu(){
    return sorts.map(sort => {
      if(sort.name==this.props.sort.name){
        return;
      }
      return (
        <a key={sort.name} onClick={this.handleSortChange.bind(this, sort.name)}>
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

      <div className="row">
        <div className="col-xs-12 col-sm-12 col-md-3 col-lg-3">
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
        <h3>Select Price Range</h3>
        <Slider onChange={this.onPriceRangeSliderChange} range allowCross={false} defaultValue={this.state.priceRangeFilter} handle={<CustomPriceFilterHandle />} />
        </div>
        <div className="col-xs-12 col-sm-12 col-md-9 col-lg-9">
        {this.renderList()}
        </div>
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



export default createContainer((props) => {
  var category = props.params.category||'';
  Meteor.subscribe('products',0,sort.get() ? sort.get().field : sorts[0].field,sort.get() ? sort.get().direction : 1,[category],defaultPriceRange);
  var sortParams = {};
  sortParams[sort.get() ? sort.get().field : sorts[0].field] = sort.get() ? sort.get().direction : 1;
  var startingDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")

  startingDate.setSeconds(0);
  startingDate.setHours(0);
  startingDate.setMinutes(0);
  return { sort: sort.get(), products: Products.find({},{sort: sortParams}).fetch()};
}, ProductsList);
