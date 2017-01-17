import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import ReactDOM from 'react-dom';
import App from './components/app';
import ProductsList from './components/products/products_list';
import CreateProduct from './components/products/create_product';
import EditProduct from './components/products/edit_product';
import AddProductPictures from './components/products/add_product_pictures';
import AddProductDownloads from './components/products/add_product_downloads';
import CreateUser from './components/users/create_user';
import LoginUser from './components/users/login_user';
import MyCampaigns from './components/products/my_campaigns';
import MyOrders from './components/products/my_orders';
import Product from './components/products/product';
import ConnectStripe from './components/users/connect_stripe';

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={ProductsList} />
      <Route path="signup" component={CreateUser} />
      <Route path="login" component={LoginUser} />
      <Route path="start_campaign" component={CreateProduct} />
      <Route path="edit_product/:productId" component={EditProduct} />
      <Route path="add_product_pictures/:productId" component={AddProductPictures} />
      <Route path="add_product_downloads/:productId" component={AddProductDownloads} />
      <Route path="product/:productId" component={Product} />
      <Route path="my_campaigns" component={MyCampaigns} />
      <Route path="my_orders" component={MyOrders} />
      <Route path="connect_stripe_account" component={ConnectStripe} />
    </Route>
  </Router>
);

Meteor.startup(() => {
  Stripe.setPublishableKey('pk_test_rwWKks2MV5qcPwGPMziNVJeA');
  ReactDOM.render(routes,document.querySelector('.render-target'));
});
