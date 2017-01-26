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
import { WithContext as ReactTags } from 'react-tag-input';

export default class CreateProduct extends Component {

  constructor(props) {
    super(props);
    this.state = props.product? props.product:{category:AllowedProductCategories[0],newCategory:'',body: '', title: '',description: '', price:0 ,earnings:"It's free!",error:'',tags: []}; //startPrice: 10, minimumPrice: 3, currentPrice: 10, priceFunction: '', startDate: new Date(), endingDate: new Date()};
    this.state.error='';
    if(!this.state.tags){
      this.state.tags = [];
    }
    if(props.product){
      var priceChange=props.product.price;
      if(priceChange == 0){
        earnings = "It's free!";
      }else {
        var earned = 0;

        earned = priceChange - priceChange*0.20 - priceChange*0.029 - 0.3;
        earned=Math.floor(earned*100)/100;
        earnings = "You would earn $"+earned+" when people pay the minimum price";
      }
      this.state.earnings = earnings;
    }
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleNewCategoryChange = this.handleNewCategoryChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    /*this.handlePriceFunctionChange = this.handlePriceFunctionChange.bind(this);
    this.handleStartPriceChange = this.handleStartPriceChange.bind(this);
    this.handleMinimumPriceChange = this.handleMinimumPriceChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndingDateChange = this.handleEndingDateChange.bind(this);*/
    this.handleTagAddition = this.handleTagAddition.bind(this);
    this.handleTagDelete = this.handleTagDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*componentWillReceiveProps(nextProps) {
    console.log(nextProps.product.endingDate);
  // You don't have to do this check first, but it can help prevent an unneeded render
    this.setState(nextProps.product);
  }*/

  handleCategoryChange(event){
    this.setState({category:event.target.value});
  }

  handleNewCategoryChange(event){
    this.setState({newCategory:event.target.value});
  }

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

      earned = priceChange - priceChange*0.20 - priceChange*0.029 - 0.3;
      earned=Math.floor(earned*100)/100;
      earnings = "You would earn $"+earned+" when people pay the minimum price";
    }
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
    if(this.state.category == "other"){
      if(!this.state.newCategory || this.state.newCategory==''){
        this.setState({error:"You must enter a custom category if you chose other."})
        return;
      }
    }
    if(this.state.body==''||this.state.title==''||this.state.description==''){
      this.setState({error:"All fields are required."});
      return;
    }

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

  /*renderCategoryOptions(){
    return AllowedProductCategories.map(category=>{
      return (
        <option key={category}>
          {category}
        </option>
      );
    })
  }*/

  handleTagDelete(i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    }
  handleTagAddition(tag) {
    tag = tag.toLowerCase();
    let tags = this.state.tags;
    if(tags.length >=10){
      return;
    }
    var notFound = true;
    tags.forEach((tagIter)=>{
      if(tagIter.text == tag){
        notFound = false;
      }
    })
    if(notFound){
    tags.push({
            id: tags.length + 1,
            text: tag
        });
    this.setState({tags: tags});
  }
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
    var customCategoryInput = null;
    if(this.state.category == "other"){
      customCategoryInput = (
        <div>
        <label htmlFor="product-custom-category-input">Custom Category</label>
        <div className="input-group">
          <input type="text" value={this.state.newCategory} onChange={this.handleNewCategoryChange} className="form-control" />
        </div>
        </div>
      );
    }
    return (
      <div className="container">
      <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      {alertInfoDiv}
      {alertDangerDiv}
      <form onSubmit={this.handleSubmit}>
        {/*}<label htmlFor="product-category-input">Category - Your product will be listed under this category when users click on those links at the top of the page. If your product does not fit any of these then select other and create a new category.</label>
        <div className="input-group">
          <select value={this.state.category} onChange={this.handleCategoryChange} className="form-control">
            {this.renderCategoryOptions()}
          </select>
        </div>
        {customCategoryInput}*/
/*suggestions={suggestions}*/
      }

        <label htmlFor="product-title-input">Title - What is your product called? What is the name of your product?</label>
        <div className="input-group">
          <input className="form-control" id="product-title-input" type="text" value={this.state.title} onChange={this.handleTitleChange} />
        </div>
        <br/>
        <label htmlFor="product-desc-input">Description - This is below your image that you upload in the next step on all search result pages and main category pages, but not on your main product page.</label>
        <div className="input-group">
          <textarea className="form-control" id="product-desc-input" value={this.state.description} onChange={this.handleDescriptionChange} />
        </div>
        <br/>
        <label>Body - This is a long version of your description and will be shown on your products page but not in search results.</label>
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
      <label htmlFor="product-price-input">Minimum Price - What is the minimum price you want people to pay for your product? Can be free.</label>
      <div className="alert alert-info">{this.state.earnings}</div>
      <div className="input-group">

        <span className="input-group-addon">$</span>
        <CurrencyInput className="form-control" value={this.state.price*100} onChange={this.handlePriceChange.bind(this)} />

      </div>
      <br/>
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
        <label>Add Tags - Add any keyword someone might search to find your product. Max of 10. Avoid tagging supported platforms since that is handled separately</label>
        <ReactTags tags={this.state.tags}
                    handleDelete={this.handleTagDelete}
                    handleAddition={this.handleTagAddition} />
        <br/>
        <div className="input-group">
          <input className="btn btn-default" type="submit" value={this.props.product?"Publish Changes":"Submit Draft and Add Images"} />
        </div>
      </form>
      </div>
      </div>
    );
  }
}
