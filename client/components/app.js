import React from 'react';
import Header from './header';
export default (props) => {
  return (
    <div>
    <Header category={props.params.category} />
    <div className="container-fluid">

    {props.children}
    </div>
    </div>
  );
};
