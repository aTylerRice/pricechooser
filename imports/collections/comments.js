import { Mongo } from 'meteor/mongo';
import { Parser } from 'expr-eval';


Meteor.methods({
  'comments.insert': function(comment){
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to create comments.");
    }
    Comments.insert({
      createdAt: new Date(),
      ownerId: Meteor.userId(),
      text: comment.text,
      replyToCommentId:comment.replyToCommentId,
      productId:comment.productId
    })
  },
  'comments.update': function(comment) {
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to edit comments.");
    }
    var commentToUpdate = Comments.findOne(comment._id);
    if(commentToUpdate.ownerId!=Meteor.userId()){
      throw new Meteor.Error('',
      "You must have created this comment in order to edit it.");
    }
    return Comments.update(comment._id, { $set: { text: comment.text} });
  },
  'comments.remove': function(comment) {
    if(!Meteor.userId()){
      throw new Meteor.Error('',
      "You must be logged in to delete comments.");
    }
    var commentToRemove = Comments.findOne(comment._id);
    if(commentToRemove.ownerId==Meteor.userId()){
      return Comments.update(comment._id,{$set:{text:"deleted",ownerId:''}});
    }
    throw new Meteor.Error('',
    "You must be the owner of this comment in order to delete it.");
  }
});

export const Comments = new Mongo.Collection('comments');
