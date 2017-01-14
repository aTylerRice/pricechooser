import { Mongo } from 'meteor/mongo';
import { Products } from './products';
import { Parser } from 'expr-eval';

Meteor.methods({
  'product_orders.insert': function(productOrder) {
    var insert;
    var product = Products.find(productOrder.productId).fetch()[0];
    if(productOrder.price < product.minimumPrice){
      return false;
    }
    var order = {
      createdAt: new Date(),
      productId: productOrder.productId,
      price: parseFloat(productOrder.price),
      ownerId: Meteor.userId()
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
    return insert;
  },
  'product_orders.update': function(productOrder, newPrice) {
    return ProductOrders.update(productOrder._id, { $set: { price: newPrice} });
  },
  'product_orders.remove': function(productOrder) {
    return ProductOrders.remove(productOrder);
  }
});

export const ProductOrders = new Mongo.Collection('product_orders');
