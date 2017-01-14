import { Mongo } from 'meteor/mongo';
import { ProductOrders } from './product_order';
import moment from 'moment';
import s3urls from 's3urls';
Meteor.methods({
  'products.downloads.insert': function(product,download_url){
    var result = s3urls.fromUrl(download_url);
    var download = {key:result.Key,bucket:result.Bucket,title:result.Key};
    return Products.update(product._id,{$push: {downloads:download}});
  },
  'products.downloads.update': function(product, download, newTitle){
    var updated = Products.update({_id:product._id,downloads:download},{$set:{"downloads.$.title":newTitle}});
    return updated;
  },

  'products.downloads.remove': function(productId, download){
    return Products.update(productId,{$pull: {downloads:download}});
  },
  'products.images.insert': function(product,image_url){
    return Products.update(product._id,{$push: {images:{image_url}}});
  },
  'products.images.remove': function(product, image_url){
    return Products.update(product._id,{$pull: {images:{image_url}}});
  },
  'products.fulfillments.insert': function(productId, fulfillment){
    return Products.update({_id:productId, ownerId:Meteor.userId(),'fulfillments.data':{$ne:fulfillment}},{$push:{fulfillments:{ownerId:'',data:fulfillment}}});
  },
  'products.insert': function(product) {
    if(!Meteor.userId()){
      return null;
    }
    return Products.insert({
      createdAt: new Date(),
      ownerId: Meteor.userId(),
      title: product.title,
      description: product.description,
      body: product.body,
      startPrice: parseFloat(product.startPrice),
      minimumPrice: parseFloat(product.minimumPrice),
      currentPrice: parseFloat(product.startPrice),
      priceFunction: product.priceFunction,
      startDate: new Date(product.startDate),
      endingDate: new Date(product.endingDate),
      downloads: [],
      fulfillments: [],
      orders: [],
      orderCount: 0,
      images:[]
    });
  },
  'products.update': function(productId,newProduct) {
    console.log(newProduct.startDate);
    Products.update(productId, { $set: { title: newProduct.title,description: newProduct.description, body: newProduct.body, startPrice: newProduct.startPrice, minimumPrice: newProduct.minimumPrice, priceFunction: newProduct.priceFunction, startDate: new Date(newProduct.startDate),endingDate: new Date(newProduct.endingDate) } });
    return productId;
  },
  'products.remove': function(product) {
    //ProductOrders.remove({productId:product._id});
    return Products.remove(product);
  }
});

export const Products = new Mongo.Collection('products');
