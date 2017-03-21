import { Mongo } from 'meteor/mongo';
import { ProductOrders } from './product_order';
import moment from 'moment';
import s3urls from 's3urls';
export const AllowedProductCategories = ["comics","creative","ebooks", "games", "movies", "other"];

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
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
    //var allowedCategories = ["ebooks", "games", "music", "developer", "movies", "photography", "art", "other"];
    var tags = [];
    product.tags.forEach((tag)=>{
      tags.push({id:tag.id,text:slugify(tag.text)});
    });
    return Products.insert({
      createdAt: new Date(),
      ownerId: Meteor.userId(),
      title: product.title,
      description: product.description,
      body: product.body,
      price: parseFloat(product.price),
      category:product.category,
      newCategory:products.newCategory,
      /*startPrice: parseFloat(product.startPrice),
      minimumPrice: parseFloat(product.minimumPrice),
      currentPrice: parseFloat(product.startPrice),
      priceFunction: product.priceFunction,
      startDate: new Date(product.startDate),
      endingDate: new Date(product.endingDate),*/
      tags: tags,
      downloads: [],
      orderCount: 0,
      images:[],
      published: false
    });
  },
  'products.update': function(productId,product) {
    var tags = [];
    product.tags.forEach((tag)=>{
      tags.push({id:tag.id,text:slugify(tag.text)});
    });
    Products.update(productId,
      { $set: {
        title: product.title,
        description: product.description,
        body: product.body,
        price: parseFloat(product.price),
        category: product.category,
        newCategory: product.newCategory,
        tags: tags
      } });
    return productId;
  },
  'products.remove': function(product) {
    //ProductOrders.remove({productId:product._id});
    return Products.remove(product);
  }
});

export const Products = new Mongo.Collection('products');
