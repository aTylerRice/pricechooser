import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import s3urls from 's3urls';
import { Products } from './products';

Meteor.methods({
  'campaigns.insert': function(campaign) {
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to create campaigns.");
    }
    return Campaigns.insert({
      createdAt: new Date(),
      ownerId: Meteor.userId(),
      products: [],
      title: campaign.title,
      //tagline: campaign.tagline,
      desc: campaign.desc,
      body: campaign.body,
      type: "pricechooser",
      startPrice: parseFloat(campaign.startPrice),
      minimumPrice: parseFloat(campaign.minimumPrice),
      currentPrice: parseFloat(campaign.startPrice),
      startDate: new Date(campaign.startDate),
      endingDate: new Date(campaign.endingDate),

    });
  },
  'campaigns.products.add': function(campaignId,productId){
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to add products to this campaign.");
    }
    return Campaigns.update({_id:campaignId,ownerId:Meteor.userId()},{$push: {products:{productId}}});
  },
  'campaigns.products.remove': function(campaignId,productId){
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to remove products from this campaign.");
    }
    return Campaigns.update({_id:campaignId,ownerId:Meteor.userId()},{$pull: {products:{productId}}});
  },
  'campaigns.update': function(campaign){
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to update this campaign.");
    }
    var allowedCampaignTypes = ["groupbuy","pricechooser","bundle"]
    Campaigns.update({_id:campaign._id,ownerId:Meteor.userId()},
    {$set:{
      title:campaign.title,
      desc: campaign.desc,
      body: campaign.body,
      //tagline:campaign.tagline,
      type:"pricechooser",
      startPrice: parseFloat(campaign.startPrice),
      minimumPrice: parseFloat(campaign.minimumPrice),
      currentPrice: parseFloat(campaign.startPrice)
      startDate: new Date(campaign.startDate),
      endingDate: new Date(campaign.endingDate)//,
      //tags: campaign.tags
      }
    }})
  }
});

export const Campaigns = new Mongo.Collection('campaigns');
