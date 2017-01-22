import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Products } from '../../../imports/collections/products';
import { Link, browserHistory } from 'react-router';
import CreateProduct from './create_product';

export default class CreateFirstProduct extends Component {

  constructor(props) {
    super(props);
  }
  render(){
    return (
      <div>
      <CreateProduct alertInfo="Let's create your first product." />
      </div>
    );
  }
}
