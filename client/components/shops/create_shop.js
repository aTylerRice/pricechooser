import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Link, browserHistory } from 'react-router';

export default class CreateShop extends Component {
  constructor(props) {
    super(props);
    this.state = props.shop? props.shop:{title: '',tagline: '', slug: '', };
    this.state.saving = '';
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTaglineChange = this.handleTaglineChange.bind(this);
    this.handleSlugChange = this.handleSlugChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleTitleChange(event){
    this.setState({title:event.target.value});
  }

  handleTaglineChange(event){
    this.setState({tagline:event.target.value});
  }

  handleSlugChange(event){
    this.setState({slug:event.target.value});
  }

  handleSubmit(event){
    event.preventDefault();
    if(this.props.shop){
      Meteor.call('shops.update',this.props.shop._id,this.state, function(error, result){
        console.log(error);
        browserHistory.push('/manage_shop/');
      });
    }else {
      Meteor.call('shops.insert', this.state, function(error, result){
        browserHistory.push('/create_first_product');
      });
      this.setState({saving:'Saving'});
    }
  }

  render(){
    var savingDiv = null;
    if(this.state.saving != ''){
      savingDiv = (
        <div className="alert alert-info" role="alert">
        {this.state.saving}
        </div>
      );
    }
    return (
      <div className="container">
      <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6">
      {savingDiv}
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="shop-title-input">Title</label>
        <div className="input-group">
          <input className="form-control" id="shop-title-input" type="text" value={this.state.title} onChange={this.handleTitleChange} />
        </div>
        <label htmlFor="shop-tagline-input">Tagline</label>
        <div className="input-group">
          <input type="text" className="form-control" id="shop-tagline-input" value={this.state.tagline} onChange={this.handleTaglineChange} />
        </div>

      <label htmlFor="shop-slug-input">Shop Url</label>
      <div className="input-group">
        <input type="text" className="form-control" id="shop-slug-input" value={this.state.slug} onChange={this.handleSlugChange} />
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
