import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import TransitiveNumber from 'react-transitive-number';
import moment from 'moment';

export default class CountdownTimer extends Component {

  constructor(props) {
    super(props);
    this.state = {time:{d:"",h:"",m:"",s:""}};
    this.duration = 0;
    this.countDown = this.countDown.bind(this);
    this.timer = 0;
  }

  componentWillReceiveProps(nextProps){

    if(this.timer == 0){
      this.timer = setInterval(this.countDown, 1000);
    }
    var currentTime = new Date();
    var eventTime = nextProps.endingDate;
    var diffTime = (new Date(eventTime)) - currentTime;
    this.duration = moment.duration(diffTime, 'milliseconds');

  }

  componentWillUnmount(){
    if(this.timer != 0){
      clearInterval(this.timer);
    }
  }

  countDown(){

    this.duration = moment.duration(this.duration - 1000, 'milliseconds');
    this.setState({time:{d:this.duration.days()+this.duration.months()*30,h:this.duration.hours(),m:this.duration.minutes(),s:this.duration.seconds()}});
  }

  render(){
    var countdownTimer = (
      <div></div>
    )

    if(this.state.time.s < 0 || this.state.time.d < 0 || this.state.time.h < 0 || this.state.time.m < 0){
      countdownTimer = (
        <div className="text-danger text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
        ended
        </div>
      );
    }else {
      countdownTimer = (
        <div className="text-danger text-center col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <h4 style={{display:this.props.displayCampaignsEndsIn?this.props.displayCampaignsEndsIn:"block"}}>Campaign ends in</h4>
        <div>
          <TransitiveNumber>
            {this.state.time.d == ''?"0":this.state.time.d}
          </TransitiveNumber> days
        </div>
        <div>
        <TransitiveNumber>{this.state.time.h == ''?"00":this.state.time.h}</TransitiveNumber> : <TransitiveNumber>{this.state.time.m == ''?"00":this.state.time.m}</TransitiveNumber> : <TransitiveNumber>{this.state.time.s == ''?"00":this.state.time.s}</TransitiveNumber>
        </div>
        </div>
      )
    }
    return (
      <div>{countdownTimer}<div className="clearfix" /></div>
    );
  }
}
