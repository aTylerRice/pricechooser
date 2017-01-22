import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import s3urls from 's3urls';

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
  'shops.insert': function(shop) {
    if(!Meteor.userId()){
      return null;
    }
    var urlFound = Shops.find({url:slugify(shop.slug)}).count();
    if(urlFound > 0){
      throw new Meteor.Error('',
      "Sorry that shop url is taken.");
    }
    return Shops.insert({
      createdAt: new Date(),
      ownerId: Meteor.userId(),
      title: shop.title,
      tagline: shop.description,
      slug: slugify(shop.slug),
      coverImage: ''
    });
  },
  'shops.update': function(shop){
    if(!Meteor.userId()){
      return null;
    }
    var urlFound = Shops.find({ownerId:{$ne:Meteor.userId()},url:slugify(shop.slug)}).count();
    if(urlFound > 0){
      throw new Meteor.Error('',
      "Sorry that shop url is taken.");
    }
    return Shops.update({ownerId:Meteor.userId()},{$set:{title:shop.title,tagline:shop.tagline,url:slugify(shop.slug), coverImage:shop.coverImage}})
  }
});

export const Shops = new Mongo.Collection('shops');
