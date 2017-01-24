import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import {Slingshot} from 'meteor/edgee:slingshot';
import '../../../imports/slingshot_file_restrictions';

class AddProductPictures extends Component {

  constructor(props){
    super(props);
    this.onDrop = this.onDrop.bind(this);
    this.handleRemovePicture = this.handleRemovePicture.bind(this);
  }

  onDrop(files, quality) {

          console.log(quality);
          console.log("files");
          console.log(files[0]);
          //Amozon Path prefix for the file returns something like
             // 'artist/album/128 (or 320)/'
         //  const pathPrefix = getPathPrefix( this.props.album, quality);
         //  const metaContext = {prePath: pathPrefix};

          //Upload file using Slingshot Directive
         //  let uploader = new Slingshot.Upload( "uploadToAmazonS3", metaContext);
          let uploader = new Slingshot.Upload( "uploadToAmazonS3");

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
                Meteor.call('products.images.insert',this.props.product,url);
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

  handleRemovePicture(event){
    Meteor.call('products.images.remove',this.props.product,event.target.value);
  }

  renderPictures(){
    if(!this.props.product || !this.props.product.images){
      return ( <div></div>);
    }
    console.log(this.props.product.images);
    return this.props.product.images.map(picture => {
      picture = picture.image_url;
      return (
        <div key={picture} className="thumbnail picture-grid-image">
          <button value={picture} onClick={(picture) => {this.handleRemovePicture(picture)}} type="button" className="close pull-right">&times;</button>
          <img className="picture-grid-image" src={picture} />
        </div>
      );
    });
  }

  render(){
    return (
      <div>
      <div className="container">
      <Link to={"/edit_product/"+this.props.params.productId}><button className="btn delete-btn btn-default">Edit</button></Link>
      <Link to={"/add_product_downloads/"+this.props.params.productId}><button className="btn delete-btn btn-default">Add/Remove File Downloads</button></Link>
      <Link to={"/product/"+this.props.params.productId}><button className="btn delete-btn btn-default">View</button></Link>
      </div>
      <div className="container">
      <h3>Add Pictures of the Project</h3>
          <Dropzone className="picture-grid-image dropzone" onDrop={this.onDrop}>
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">Drop your images here or click to upload. Images will be uploaded and saved automatically.</div>
          </Dropzone>


        {this.renderPictures()}
      </div>
      </div>
    )
  }
}

export default createContainer((props) => {
  const { productId } = props.params;
  Meteor.subscribe('edit_product',productId);
  return { product: Products.findOne({_id:productId}) };
}, AddProductPictures);
