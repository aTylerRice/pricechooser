import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import ReactDOM from 'react-dom';
import App from './components/app';
import ProductsList from './components/products/products_list';
import ManageShop from './components/shops/manage_shop';
import CreateShop from './components/shops/create_shop';
import EditShop from './components/shops/edit_shop';
import AddShopCoverImage from './components/shops/add_shop_cover_image';
import CreateProduct from './components/products/create_product';
import EditProduct from './components/products/edit_product';
import CreateFirstProduct from './components/products/create_first_product';
import AddProductPictures from './components/products/add_product_pictures';
import AddProductDownloads from './components/products/add_product_downloads';
import CreateUser from './components/users/create_user';
import LoginUser from './components/users/login_user';

import MyOrders from './components/products/my_orders';
import Product from './components/products/product';
import ConnectStripe from './components/users/connect_stripe';

function requireAuth(nextState, replace) {
  if (!Meteor.userId()){
  replace({
    pathname: '/login',
    state: { nextPathname: nextState.location.pathname }
  });
}
}

const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={ProductsList} />
      <Route path="products/:category" component={ProductsList} />
      <Route path="signup" component={CreateUser} />
      <Route path="login" component={LoginUser} />
      <Route path="create_first_product" component={CreateFirstProduct} onEnter={requireAuth} />
      <Route path="create_product" component={CreateProduct} onEnter={requireAuth} />
      <Route path="edit_product/:productId" component={EditProduct} onEnter={requireAuth} />
      <Route path="add_product_pictures/:productId" component={AddProductPictures} onEnter={requireAuth} />
      <Route path="add_product_downloads/:productId" component={AddProductDownloads} onEnter={requireAuth} />
      <Route path="create_shop" component={CreateShop} onEnter={requireAuth} />
      <Route path="manage_shop" component={ManageShop} onEnter={requireAuth} />
      <Route path="edit_shop/:shopId" component={EditShop} onEnter={requireAuth} />
      <Route path="add_shop_cover_image" component={AddShopCoverImage} onEnter={requireAuth} />
      <Route path="product/:productId" component={Product} />
      <Route path="my_orders" component={MyOrders} onEnter={requireAuth} />
      <Route path="connect_stripe_account" component={ConnectStripe} onEnter={requireAuth} />
    </Route>
  </Router>
);

Meteor.startup(() => {
  Stripe.setPublishableKey('pk_test_rwWKks2MV5qcPwGPMziNVJeA');
  ReactDOM.render(routes,document.querySelector('.render-target'));
});
