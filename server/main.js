import { Meteor } from 'meteor/meteor';
import { Products } from '../imports/collections/products';
import {TagsCount} from '../imports/collections/tags_count';
import { ProductOrders } from '../imports/collections/product_order';
import { Shops } from '../imports/collections/shops';
import { DownloadAnalytics } from '../imports/collections/download_analytics';
import {StripeCredentials} from '../imports/collections/stripe_credentials';
import {Categories, StartingCategories} from '../imports/collections/categories';
import {Slingshot} from 'meteor/edgee:slingshot';
import '../imports/slingshot_file_restrictions';
import AWS from 'aws-sdk';
import {Random} from 'meteor/random';
import s3 from 's3policy';
import { WebApp } from 'meteor/webapp';
import ConnectRoute from 'connect-route';
import { HTTP } from 'meteor/http';
import {Cron} from 'meteor/chfritz:easycron';
var stripe = require('stripe')('secrete key here');
Meteor.startup(() => {

    if(Categories.find({}).count()==0){
    StartingCategories.forEach((category)=>{
      Categories.insert({
        createdAt:new Date(),
        name:category.name,
        parentSlug:null,
        slug:category.slug,
        numberOfProducts:0
      });
      category.children.forEach((category2)=>{
        Categories.insert({
          createdAt:new Date(),
          name:category2.name,
          parentSlug:category.slug,
          slug:category2.slug,
          numberOfProducts:0
        });
        category2.children.forEach((category3)=>{
          Categories.insert({
            createdAt:new Date(),
            name:category3.name,
            parentSlug:category2.slug,
            slug:category3.slug,
            numberOfProducts:0
          });
          category3.children.forEach((category4)=>{
            Categories.insert({
              createdAt:new Date(),
              name:category4.name,
              parentSlug:category3.slug,
              slug:category4.slug,
              numberOfProducts:0
            });
          })
        })
      })
    })}
});
Meteor.startup(() => {

  var everyMinuteAggregateTagCounts = new Cron(()=> {
      var tagTotals = Products.aggregate([{$project:{text:"$tags.text"}},{$unwind:"$text"},{$group:{_id:"$text",total:{"$sum":1}}}]);
      TagsCount.remove({});
      TagsCount.rawCollection().insert(tagTotals);
}, {});

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
        productOwnerId: product.ownerId,
        stripe_customer: customer
      };
      insert = ProductOrders.insert(order);


      var orderCount = product.orderCount+1;
      Products.update(product._id,{$set:{orderCount}})

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
    'generateDownloadUrl': function(productId,download){

      var product = Products.findOne({_id:productId},{fields:{price:1,downloads:1,ownerId:1}});
      if(product.price>0&&!Meteor.userId()){
        throw new Meteor.Error(500,
        "You must be signed in to do this.");

      }
      if(product.price>0 && product.ownerId != Meteor.userId()){
        var productOrder = ProductOrders.findOne({productId:productId,ownerId:Meteor.userId()});
        if(!productOrder){
          throw new Meteor.Error(500,
          "You must purchase this product before downloading it.");
        }
      }
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
      DownloadAnalytics.insert({createdAt:new Date(),productId:productId, productOwnerId: product.ownerId})
      return url;
    }
  });
  Meteor.publish('sub_categories',function(categorySlug){
    return Categories.find({parentSlug:categorySlug});
  });
  Meteor.publish('popular_tags',function(){
    return TagsCount.find({},{sort:{total:-1},limit:50})
  });
  Meteor.publish('product_order_analytics',function(){
    return ProductOrders.find({productOwnerId:this.userId},{fields:{createdAt:1,productId:1}});
  });
  Meteor.publish('download_analytics',function(){
    return DownloadAnalytics.find({productOwnerId:this.userId});
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
  Meteor.publish('products',function(page, sortField, sortDirection, tags, priceRange,category) {
    var limit = 12;
    var sortParams = {};
    sortParams[sortField] = sortDirection;
    if(priceRange[1]>=100){
      priceRange[1]=20000;
    }
    if(tags.length>0 && tags[0]!=''){
      var findJson = {price:{$gte:priceRange[0]},price:{$lte:priceRange[1]},"tags.text":{$all:tags}};
      if(category!=''){
        findJson.category = category;
      }
      return Products.find(findJson,{limit:limit, skip: page*limit,sort: sortParams});
    }
    var findJson = {price:{$gte:priceRange[0]},price:{$lte:priceRange[1]}};
    if(category!=''){
      findJson.category = category;
    }
    return Products.find(findJson,{limit:limit, skip: page*limit,sort: sortParams});
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
