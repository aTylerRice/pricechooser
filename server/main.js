import { Meteor } from 'meteor/meteor';
import { Products } from '../imports/collections/products';
import { ProductOrders } from '../imports/collections/product_order';
import {Slingshot} from 'meteor/edgee:slingshot';
import '../imports/slingshot_file_restrictions';
import AWS from 'aws-sdk';
import {Random} from 'meteor/random';
import s3 from 's3policy';
import { WebApp } from 'meteor/webapp';
import ConnectRoute from 'connect-route';

Meteor.startup(() => {

  Meteor.methods({
    'generateDownloadUrlForOwner': function(productId,download){
      var product = Products.findOne({_id:productId,ownerId:Meteor.userId()});
      console.log(product);
      console.log(download);
      if(!product){
        return null;
      }
      var found = false;
      product.downloads.every(function(d){
        if(download.key == d.key && download.bucket == d.bucket ){
          found = true;
          return false;
        }
        return true;
      });

      if(!found){
        console.log("not found");
        return null;
      }
      var myS3Account = new s3('AKIAJNHPQ3KGZRGI7GCQ', 'V6XkF9wyukghNG/YoLv8MgGi6rCM3eEJ0A0XVGq/');
      var url = myS3Account.readPolicy(download.key, download.bucket, 60);
      console.log(url);
      return url;
    },
    'generateDownloadUrlForDownloadOwner': function(productId,download){
      var product = Products.findOne({_id:productId,orders:{$elemMatch:{ownerId:Meteor.userId()}}});
      console.log(product);
      console.log(download);
      if(!product){
        return null;
      }
      var found = false;
      product.downloads.every(function(d){
        if(download.key == d.key && download.bucket == d.bucket ){
          found = true;
          return false;
        }
        return true;
      });
      if(!found){
        return null;
      }
      var myS3Account = new s3('AKIAJNHPQ3KGZRGI7GCQ', 'V6XkF9wyukghNG/YoLv8MgGi6rCM3eEJ0A0XVGq/');
      var url = myS3Account.readPolicy(download.key, download.bucket, 60);
      return url;
    }
  });
  Meteor.publish('my_orders',function(){
    //check if any of the orders are not fulfilled
    var productsOrdered = Products.find({$where:"this.fulfillments.length > 1",orders:{$elemMatch:{ownerId:this.userId}}},{fields:{_id:1}}).fetch();

    productsOrdered.forEach((productId)=>{
      productId = productId._id;


      var needsFulfilled = Products.rawCollection().find({_id:productId,"fulfillments.ownerId":this.userId},{fields:{_id:1}}).count().then((numItems)=>{

      // 0 if it needs fulfilled
      if(numItems == 0){//numItems==0){
        Products.rawCollection().find({_id:productId,"fulfillments.ownerId":''},{fulfillments:{$slice:1}}).toArray(Meteor.bindEnvironment((err, productResult)=>{
          if(productResult.length > 0 && productResult[0].fulfillments.length > 0){//productResult>0 && productResult[0].fulfillments > 0){
            //console.log(productResult[0].fulfillments)
            Products.update({_id:productId,fulfillments:productResult[0].fulfillments[0]},{$set:{"fulfillments.$.ownerId":this.userId}});
          }
        }));
      }
      });
    });
    return Products.find({orders:{$elemMatch:{ownerId:this.userId}}},{fields:{title:1,description:1,downloads:1,fulfillments:{$elemMatch:{ownerId:this.userId}}}});
  });
  // code to run on server at startup
  Meteor.publish('products',function(page, sortField, sortDirection) {
    var limit = 12;
    var sortParams = {};
    sortParams[sortField] = sortDirection;
    var startingDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")

    startingDate.setSeconds(59);
    startingDate.setHours(23);
    startingDate.setMinutes(59);
    return Products.find({startDate:{$lte:startingDate}},{limit:limit, skip: page*limit,sort: sortParams});
  });

  Meteor.publish('product',function(productId){
    return Products.find({_id:productId});
  });

  Meteor.publish('my_products',function(){
    return Products.find({ownerId: this.userId});
  });

  Meteor.publish('edit_product',function(productId){
    return Products.find({_id:productId,ownerId: this.userId},{fields: {fulfillments:{$slice:1}}});
  });

  var sts = new AWS.STS(); // Using the AWS SDK to retrieve temporary credentials.

Slingshot.createDirective('uploadToAmazonS3', Slingshot.S3Storage, {
    bucket: 'pricechooser-dev',
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024,
    AWSAccessKeyId:"AKIAJNHPQ3KGZRGI7GCQ",
    AWSSecretAccessKey:"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",
    acl: "public-read",

    authorize: function () {
      //Deny uploads if user is not logged in.
      if (!this.userId) {
        var message = "Please login before posting files";
        throw new Meteor.Error("Login Required", message);
      }

      return true;
    },

    key: function (file) {
      //Store file into a directory by the user's username.

      return this.userId + "/"+ Random.id(5) + file.name;
    }
  });

  Slingshot.createDirective('uploadDownloadToAmazonS3', Slingshot.S3Storage, {
      bucket: 'pricechooser-dev',
      allowedFileTypes: null,
      maxSize: 16 * 8 * 1024 * 1024 * 1024,
      AWSAccessKeyId:"AKIAJNHPQ3KGZRGI7GCQ",
      AWSSecretAccessKey:"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",
      acl: "authenticated-read",

      authorize: function () {
        //Deny uploads if user is not logged in.
        if (!this.userId) {
          var message = "Please login before posting files";
          throw new Meteor.Error("Login Required", message);
        }

        return true;
      },

      key: function (file) {
        //Store file into a directory by the user's username.

        return this.userId + "/downloads/" + Random.id(5) + file.name;
      }
    });


});

function onStripeConnectRoute(req,res,next){
  //const link = Links.findOne({ token: req.params.token });
  console.log(req);
  if(false){
    /*Links.update(link,{$inc: { clicks: 1}});
    res.writeHead(307,{'Location':link.url});
    res.end();*/
  }else {
    next();
  }

}

const middleware = ConnectRoute(function(router){
  router.get('/connect_stripe_account',onStripeConnectRoute);
})

WebApp.connectHandlers.use(middleware);
