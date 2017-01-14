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
    this.state = {downloadUrl:''};
    this.showDownloadButtonClicked = this.showDownloadButtonClicked.bind(this);
  }

  showDownloadButtonClicked(){
    Meteor.call('generateDownloadUrlForDownloadOwner',this.props.product._id,this.props.download, (error, result) => {
      console.log(error);
      console.log(result);
      if(!error){
        this.setState({downloadUrl:result});
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
    return (
      <li key={download.key} className="list-group-item">
      {download.title}
      <span className="pull-right">
        {showDownloadButton}
        {this.state.downloadUrl==''?null:downloadLink}
      </span>
      <div className="clearfix" />
      </li>

    );
  }
}
