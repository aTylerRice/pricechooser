import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import {Slingshot} from 'meteor/edgee:slingshot';
import '../../../imports/slingshot_file_restrictions';
import EditDownload from './edit_download';
import 'meteor/harrison:papa-parse';
class AddProductDownloads extends Component {

  constructor(props){
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.onDropSpreadsheet = this.onDropSpreadsheet.bind(this);
  }

  onDrop(files, quality) {


          //Amozon Path prefix for the file returns something like
             // 'artist/album/128 (or 320)/'
         //  const pathPrefix = getPathPrefix( this.props.album, quality);
         //  const metaContext = {prePath: pathPrefix};

          //Upload file using Slingshot Directive
         //  let uploader = new Slingshot.Upload( "uploadToAmazonS3", metaContext);
          let uploader = new Slingshot.Upload( "uploadDownloadToAmazonS3");

         console.log(uploader);

         var error = uploader.validate(files[0]);

          if (error) {
            console.error(error);
            return;
          }

          uploader.send( files[0], ( error, url ) => {

            computation.stop(); //Stop progress tracking on upload finish
            if ( error ) {
                this.setState({ progress: 0}); //reset progress state
                console.error('Error uploading', uploader);
            } else {
                Meteor.call('products.downloads.insert',this.props.product,url);
                this.setState({ progress: 0 });
                console.log(url);

               //  Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});

            }
          });

          //Track Progress
          let computation = Tracker.autorun(() => {
              if(!isNaN(uploader.progress())) {
                this.setState({ progress: uploader.progress() * 100 });
              }
          });
  }



  renderDownloads(){
    if(!this.props.product || !this.props.product.downloads){
      return ( <div>no downloads</div>);
    }
    return this.props.product.downloads.map(download => {
      return (
        <EditDownload key={download.key} product={this.props.product} download={download} />
      );
    });
  }

  render(){
    console.log(this.props.product);
    return (
      <div>
      <div className="container">
      <Link to={"/edit_product/"+this.props.params.productId}><button className="btn delete-btn btn-default">Edit</button></Link>
      <Link to={"/add_product_pictures/"+this.props.params.productId}><button className="btn delete-btn btn-default">Add/Remove Pictures</button></Link>
      <Link to={"/product/"+this.props.params.productId}><button className="btn delete-btn btn-default">View</button></Link>
      </div>
      <div className="container">

          <Dropzone className="picture-grid-image dropzone" onDrop={this.onDrop}>
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">Drop your files here or click to upload. Files will be uploaded and saved automatically. Any file type is supported, but each file must be under 16GB.</div>
          </Dropzone>

          <ul className="list-group col-xs-12 col-sm-12 col-md-12 col-lg-12">
            {this.renderDownloads()}
          </ul>
      </div>
      </div>
    )
  }
}

export default createContainer((props) => {
  const { productId } = props.params;
  Meteor.subscribe('edit_product',productId);
  return { product: Products.findOne({_id:productId}) };
}, AddProductDownloads);
