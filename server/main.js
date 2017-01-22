import { Meteor } from 'meteor/meteor';
import { Products } from '../imports/collections/products';
import { ProductOrders } from '../imports/collections/product_order';
import { Shops } from '../imports/collections/shops';
import {StripeCredentials} from '../imports/collections/stripe_credentials';
import {Slingshot} from 'meteor/edgee:slingshot';
import '../imports/slingshot_file_restrictions';
import AWS from 'aws-sdk';
import {Random} from 'meteor/random';
import s3 from 's3policy';
import { WebApp } from 'meteor/webapp';
import ConnectRoute from 'connect-route';
import { HTTP } from 'meteor/http';
var stripe = require('stripe')('sk_test_jrgxkq6t5HPGsIoLmfUwtcmM');

Meteor.startup(() => {

  Meteor.methods({
    'product_orders.insert': function(productOrder) {
      if(!Meteor.userId()){
        throw new Meteor.Error('',
        "You must be logged in to purchase products.");
      }
      var insert;
      var product = Products.find(productOrder.productId).fetch()[0];
      if(productOrder.price < product.minimumPrice){
        throw new Meteor.Error('',
        "Your price $"+productOrder.price+" can not be lower than the minimum price $"+product.minimumPrice);
      }
      stripe.customers.create({
        email: Meteor.user().emails[0].address,
        source: productOrder.stripe_token,
      },(err, customer) => {
      var order = {
        createdAt: new Date(),
        productId: productOrder.productId,
        price: parseFloat(productOrder.price),
        ownerId: Meteor.userId(),
        stripe_customer: customer
      };
      insert = Products.update(productOrder.productId,{$push:{orders:order}});


      var orderCount = product.orderCount+1;
      Products.update(product._id,{$set:{orderCount}})
      var parser = new Parser();
      var expr = parser.parse(product.priceFunction);
      oldPrice = parseFloat(productOrder.price);
      if(oldPrice > product.currentPrice){
        oldPrice = product.currentPrice;
      }
      var priceCount = Products.find({_id:product._id,orders:{$elemMatch:{price: {$gte:oldPrice}}}}).count();
      var newPrice = expr.evaluate({x:priceCount});
      newPrice = Math.round(newPrice * 100) / 100;
      if(newPrice <= productOrder.price){
        Products.update(product._id, { $set: { currentPrice:newPrice} });
      }
      });
      return true;
    },
    'connect_stripe': function(query){
      if(!Meteor.userId()){
        throw new Meteor.Error(500,
        "You must be signed in to connect Stripe.");

      }
      var responseContent;

      try {
          // Request an access token
          responseContent = HTTP.call("POST",
              "https://connect.stripe.com/oauth/token", {
                  params: {
                      client_secret: "sk_test_jrgxkq6t5HPGsIoLmfUwtcmM",
                      code:          query.code,
                      grant_type:    'authorization_code'
                  }
              }).content;

      } catch (err) {
        throw new Meteor.Error(500,
        "Failed to complete OAuth handshake with stripe. Please try again. If error continues please contact us by emailing atylerrice[at]pricechooser[dot]com");

      }
      //console.log(responseContent);
      if(responseContent.error){
        console.log("error");
        throw new Meteor.Error(responseContent.error,
        responseContent.error_description);
        //return {error: responseContent.error_description};
      }else {
        //Success
        console.log("success");
        var access_token = responseContent.access_token;
        var refresh_token = responseContent.refresh_token;
        var token_type = responseContent.token_type;
        var stripe_publishable_key = responseContent.stripe_publishable_key;
        var stripe_user_id = responseContent.stripe_user_id;
        var scope = responseContent.scope;
        var existingStripeCredentials = StripeCredentials.findOne({
          ownerId: Meteor.userId()
        });
        if(existingStripeCredentials){
          StripeCredentials.update(existingStripeCredentials._id,{
             $set: {  access_token,
                      refresh_token,
                      token_type,
                      stripe_publishable_key,
                      stripe_user_id,
                      scope
                    }
                  }
                );
        }else {
          StripeCredentials.insert({
            createdAt: new Date(),
            ownerId: Meteor.userId(),
            access_token,
            refresh_token,
            token_type,
            stripe_publishable_key,
            stripe_user_id,
            scope
          });
        }
      }
    },
    'generateDownloadUrlForOwner': function(productId,download){
      if(!Meteor.userId()){
        throw new Meteor.Error(500,
        "You must be signed in to do this.");

      }
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
      if(!Meteor.userId()){
        throw new Meteor.Error(500,
        "You must be signed in to do this.");

      }
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
  Meteor.publish('my_stripe_credentials',function(){
    if(!this.userId){
      return
    }
    return StripeCredentials.find({ownerId:this.userId},{fields:{ownerId:1,_id:1}})
  });
  Meteor.publish('my_orders',function(){
    if(!this.userId){
      return
    }
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
    if(!this.userId){
      return
    }
    return Products.find({ownerId: this.userId});
  });

  Meteor.publish('edit_product',function(productId){
    if(!this.userId){
      return
    }
    return Products.find({_id:productId,ownerId: this.userId},{fields: {fulfillments:{$slice:1}}});
  });

  Meteor.publish('edit_shop',function(){
    if(!this.userId){
      return
    }
    return Shops.find({ownerId:this.userId}, {limit:1});
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
  console.log(req.query.code);
  var responseContent;

  try {
      // Request an access token
      responseContent = HTTP.call("POST",
          "https://connect.stripe.com/oauth/token", {
              params: {
                  client_secret: "sk_test_jrgxkq6t5HPGsIoLmfUwtcmM",
                  code:          req.query.code,
                  grant_type:    'authorization_code'
              }
          }).content;

  } catch (err) {
      throw _.extend(new Error("Failed to complete OAuth handshake with stripe. " + err.message),
          {response: err.response});
  }
  console.log(responseContent);
  if(responseContent.error){

  }else {
    //Success
    var access_token = responseContent.access_token;
    var refresh_token = responseContent.refresh_token;
    var token_type = responseContent.token_type;
    var stripe_publishable_key = responseContent.stripe_publishable_key;
    var stripe_user_id = responseContent.stripe_user_id;
    var scope = responseContent.scope;

  }
  if(false){
    /*Links.update(link,{$inc: { clicks: 1}});
    res.writeHead(307,{'Location':link.url});
    res.end();*/
  }else {
    next();
  }

}

const middleware = ConnectRoute(function(router){
  //router.get('/connect_stripe_account',onStripeConnectRoute);
})

WebApp.connectHandlers.use(middleware);
