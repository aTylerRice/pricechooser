import { Mongo } from 'meteor/mongo';
import { Products } from './products';
import { Parser } from 'expr-eval';


Meteor.methods({

  'product_orders.update': function(productOrder, newPrice) {
    return ProductOrders.update(productOrder._id, { $set: { price: newPrice} });
  },
  'product_orders.remove': function(productOrder) {
    return ProductOrders.remove(productOrder);
  }
});

export const ProductOrders = new Mongo.Collection('product_orders');
