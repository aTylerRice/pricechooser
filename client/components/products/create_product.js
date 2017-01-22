import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products, AllowedProductCategories } from '../../../imports/collections/products';
import { Link, browserHistory } from 'react-router';
import Datetime from 'react-datetime';
import TransitiveNumber from 'react-transitive-number';
import RichTextEditor from 'react-rte';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css';
import CurrencyInput from 'react-currency-input';

export default class CreateProduct extends Component {

  constructor(props) {
    super(props);
    this.state = props.product? props.product:{body: '', title: '',description: '', body: '', price:0 ,earnings:"It's free!",error:''}; //startPrice: 10, minimumPrice: 3, currentPrice: 10, priceFunction: '', startDate: new Date(), endingDate: new Date()};

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    /*this.handlePriceFunctionChange = this.handlePriceFunctionChange.bind(this);
    this.handleStartPriceChange = this.handleStartPriceChange.bind(this);
    this.handleMinimumPriceChange = this.handleMinimumPriceChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndingDateChange = this.handleEndingDateChange.bind(this);*/
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*componentWillReceiveProps(nextProps) {
    console.log(nextProps.product.endingDate);
  // You don't have to do this check first, but it can help prevent an unneeded render
    this.setState(nextProps.product);
  }*/


  handleTitleChange(event){
    this.setState({title: event.target.value});
  }

  handleDescriptionChange(event){
    this.setState({description: event.target.value});
  }

  handleEditorBodyChange(body){
    this.setState({body});
  }

  handlePriceChange(priceChange){
    var earnings = '';
    if(priceChange == 0){
      earnings = "It's free!";
    }else {
      var earned = 0;
      if(priceChange < 10){
        earned = priceChange - priceChange*0.05 - priceChange * 0.2 - 0.05;
      }else {
        earned = priceChange - priceChange*0.20 - priceChange*0.029 - 0.3;
      }
      earned=Math.floor(earned*100)/100;
      earnings = "You would earn $"+earned+" when people pay the minimum price";
    }
    console.log("earnings");
    console.log(earnings);
    this.setState({price:priceChange,earnings:earnings});
  }
  /*
  handlePriceFunctionChange(event){
    this.setState({priceFunction: event.target.value});
  }

  handleStartPriceChange(event){
    this.setState({startPrice: event.target.value});
  }

  handleMinimumPriceChange(event){
    this.setState({minimumPrice: event.target.value});
  }

  handleStartDateChange(time){
    this.setState({startDate: time.format("MM-DD-YYYY HH:mm:ss")});
  }

  handleEndingDateChange(time){
    //console.log(time.format());
    this.setState({endingDate: time.format("MM-DD-YYYY HH:mm:ss")});
  }
*/
  handleSubmit(event){
    event.preventDefault();

    if(this.props.product){
      Meteor.call('products.update',this.props.product._id,this.state, (err, result)=>{
        if(!err){
        browserHistory.push('/add_product_pictures/'+result);
        }else {
          this.setState({error:err.reason})
        }
      });
    }else {
      Meteor.call('products.insert', this.state, (err, result)=>{
        if(!err){
        browserHistory.push('/add_product_pictures/'+result);
      }else {
        console.log("big error");
        this.setState({error:err.reason})
      }
      });
      this.setState({title: '',description: '', startPrice: 10, minimumPrice: 3, priceFunction: '', endingDate: new Date()});
    }
  }

  onProductRemove(product){
    Meteor.call('products.remove', product);
  }

  renderCategoryOptions(){
    return AllowedProductCategories.map(category=>{
      return (
        <option>
          {category}
        </option>
      );
    })
  }

  render(){
    var product = this.state;
    var alertInfoDiv = null;
    if(this.props.alertInfo && this.props.alertInfo != ''){
      alertInfoDiv = (
        <div className="alert alert-info" role="alert">
        {this.props.alertInfo}
        </div>
      )
    }
    var alertDangerDiv = null;
    if(this.state.error != ''){
      alertDangerDiv = (
        <div className="alert alert-danger" role="alert">
        {this.state.error}
        </div>
      );
    }
    return (
      <div className="container">
      <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      {alertInfoDiv}
      {alertDangerDiv}
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="product-category-input">Category</label>
        <div className="input-group">
          <select className="form-control">
            {this.renderCategoryOptions()}
          </select>
        </div>
        <label htmlFor="product-title-input">Title</label>
        <div className="input-group">
          <input className="form-control" id="product-title-input" type="text" value={this.state.title} onChange={this.handleTitleChange} />
        </div>
        <label htmlFor="product-desc-input">Description</label>
        <div className="input-group">
          <textarea className="form-control" id="product-desc-input" value={this.state.description} onChange={this.handleDescriptionChange} />
        </div>
        <label>Body</label>
        <ReactSummernote
        value={this.state.body}
        options={{
          lang: 'en-US',
          height: 350,
          dialogsInBody: true,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link']],
            ['view', ['fullscreen', 'codeview']]
          ]
        }}
        onChange={this.handleEditorBodyChange.bind(this)}
      />
      <label htmlFor="product-price-input">Minimum Price</label>
      <div className="alert alert-info">{this.state.earnings}</div>
      <div className="input-group">

        <span className="input-group-addon">$</span>
        <CurrencyInput className="form-control" value={this.state.price} onChange={this.handlePriceChange.bind(this)} />

      </div>

      {/*}
        <label htmlFor="product-price-function-input">Price Function</label>
        <div className="input-group">
          <textarea className="form-control" id="product-price-function-input" value={this.state.priceFunction} onChange={this.handlePriceFunctionChange} />
        </div>
        <label htmlFor="product-start-price-input">Starting Price</label>
        <div className="input-group">
          <input className="form-control" id="product-start-price-input" type="text" value={this.state.startPrice} onChange={this.handleStartPriceChange} />
        </div>
        <label htmlFor="product-minimum-price-input">Minimum Price</label>
        <div className="input-group">
          <input className="form-control" id="product-minimum-price-input" type="text" value={this.state.minimumPrice} onChange={this.handleMinimumPriceChange} />
        </div>
        <label>Starting Date</label>
        <div className="input-group">
        <Datetime value={this.state.startDate} onChange={this.handleStartDateChange} />
        </div>
        <label>Ending Date</label>
        <div className="input-group">
        <Datetime value={this.state.endingDate} onChange={this.handleEndingDateChange} />
        </div>
        */}
        <br/>
        <div className="input-group">
          <input className="btn btn-default" type="submit" value="Submit" />
        </div>
      </form>
      </div>
      </div>
    );
  }
}
