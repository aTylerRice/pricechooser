import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link } from 'react-router';
import ProductCard from './product_card';
import Datetime from 'react-datetime';

export default class OrderDownload extends Component {

  constructor(props) {
    super(props);
    this.state = {downloadUrl:'',error:''};
    this.showDownloadButtonClicked = this.showDownloadButtonClicked.bind(this);
  }

  showDownloadButtonClicked(){
    Meteor.call('generateDownloadUrl',this.props.product._id,this.props.download, (err, result) => {
      console.log(err);
      console.log(result);
      if(!err){
        this.setState({downloadUrl:result});
      }else {
        this.setState({error:err.reason});
      }
    });
  }

  render() {
    var product = this.props.product;
    var download = this.props.download;
    var showDownloadButton = (
      <button onClick={()=>{this.showDownloadButtonClicked()}}className="btn btn-default" type="button">Generate Download Link</button>
    );
    var downloadLink = (
      <a style={{"marginLeft":"20px"}} href={this.state.downloadUrl} download>
      <button className="btn btn-success">
      Download
      </button>
      </a>
    );
    var alertError = null;
    if(this.state.error!=''){
      alertError= (
        <div className="alert alert-danger">
        {this.state.error}
        </div>
      );
    }
    return (
      <li key={download.key} className="list-group-item">
      {download.title}
      {alertError}

      <span className="pull-right">
        {showDownloadButton}
        {this.state.downloadUrl==''?null:downloadLink}
      </span>
      <div className="clearfix" />
      </li>

    );
  }
}
