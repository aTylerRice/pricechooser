import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link, browserHistory } from 'react-router';
import CreateProduct from './create_product';

export default class EditDownload extends Component {

  constructor(props) {
    super(props);
    this.state = {downloadUrl:'',title:this.props.download.title,savingTitle:'', downloadUrl:''};
    this.handleRemoveDownload = this.handleRemoveDownload.bind(this);
    this.generateUrl = this.generateUrl.bind(this);
  }

  handleDownloadTitleChange(event){
    this.setState({title:event.target.value, savingTitle:'<span class="text-danger">not saved</span>'})
  }

  handleSubmit(event){
    event.preventDefault();
    this.setState({savingTitle:'<span class="text-success">saving</span>'});
    Meteor.call('products.downloads.update',this.props.product,this.props.download,this.state.title, (error, result) => {
      this.setState({savingTitle:'<span class="text-success">saved</span>'});
    });

  }

  handleRemoveDownload(event){
    console.log("removeDownload");
    console.log(event.target.value);
    Meteor.call('products.downloads.remove',this.props.product._id,this.props.download, function(error, result){
      console.log(error);
    });
  }

  generateUrl(){
    Meteor.call('generateDownloadUrlForOwner',this.props.product._id,this.props.download, (error, result) => {
      console.log(error);
      console.log(result);
      if(!error){
        this.setState({downloadUrl:result});
      }
    });
  }

  render(){
    console.log(this.props.download);
    return (
      <li key={this.props.download.key} className="list-group-item col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <div className="pull-left" dangerouslySetInnerHTML={{ __html: this.state.savingTitle }}>

        </div>
        <button onClick={(event) => {this.handleRemoveDownload(event)}} type="button" className="close pull-right">&times;</button>
        <div className="clearfix" />


        <div className="input-group clearfix">
        <form onSubmit={this.handleSubmit.bind(this)}>
        <input value={this.state.title} onChange={this.handleDownloadTitleChange.bind(this)} className="form-control" />
        <div className="input-group">
          <input className="btn btn-default" type="submit" value="Submit" />
        </div>
        </form>
        </div>
        <div className="input-group">
          Download URL: <a target="_blank" href={this.state.downloadUrl}>{this.state.downloadUrl}</a>
        </div>
        <div className="input-group">
        <button type="button" onClick={() => {this.generateUrl()}} className="btn btn-success">Generate Url (lasts 60 seconds)</button>
        </div>
      </li>
    );
    }

}
