import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Link, browserHistory } from 'react-router';

class AddShopCoverImage extends Component {
  constructor(props) {
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
                Meteor.call('shops.cover.insert',this.props.params.shopId,url);
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
    Meteor.call('shops.cover.remove',this.props.params.shopId,event.target.value);
  }

  render(){
    return (
      <div className="container">

          <Dropzone className="picture-grid-image dropzone" onDrop={this.onDrop}>
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">Drop your images here or click to upload. Images will be uploaded and saved automatically.</div>
          </Dropzone>

          <div className="thumbnail picture-grid-image">
            <button value={this.props.shop.coverImage} onClick={() => {this.handleRemovePicture()}} type="button" className="close pull-right">&times;</button>
            <img className="picture-grid-image" src={this.props.shop.coverImage} />
          </div>

      </div>
    );
  }
}

export default createContainer((props) => {
  const { shopId } = props.params;
  Meteor.subscribe('edit_shop',shopId);
  return { shop: Shops.findOne({_id:shopId}) };
}, AddShopCoverImage);
