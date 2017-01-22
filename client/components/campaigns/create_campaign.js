import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link, browserHistory } from 'react-router';
import Datetime from 'react-datetime';
import TransitiveNumber from 'react-transitive-number';
import RichTextEditor from 'react-rte';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css';

export default class CreateCampaign extends Component {

  constructor(props) {
    super(props);
    this.state = props.product? props.product:{body: '', title: '',description: '', body: '', price:1 }; //startPrice: 10, minimumPrice: 3, currentPrice: 10, priceFunction: '', startDate: new Date(), endingDate: new Date()};

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

/*
  handleTitleChange(event){
    this.setState({title: event.target.value});
  }

  handleDescriptionChange(event){
    this.setState({description: event.target.value});
  }

  handleEditorBodyChange(body){
    this.setState({body});
  }

  handlePriceChange(event){
    this.setState({price:event.target.value});
  }*/

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

  handleSubmit(event){
    event.preventDefault();
    //console.log(this.state);
    console.log(this.props);
    if(this.props.product){
      Meteor.call('products.update',this.props.product._id,this.state, function(error, result){
        console.log(error);
        browserHistory.push('/add_product_pictures/'+result);
      });
    }else {
      Meteor.call('products.insert', this.state, function(error, result){
        browserHistory.push('/add_product_pictures/'+result);
      });
      this.setState({title: '',description: '', startPrice: 10, minimumPrice: 3, priceFunction: '', endingDate: new Date()});
    }
  }

  onProductRemove(product){
    Meteor.call('products.remove', product);
  }

  render(){
    var product = this.state;
    return (
      <div className="container">
      <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      <form onSubmit={this.handleSubmit}>
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
        
        <div className="input-group">
          <input className="btn btn-default" type="submit" value="Submit" />
        </div>
      </form>
      </div>
      </div>
    );
  }
}
