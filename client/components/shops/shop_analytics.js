import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { DownloadAnalytics } from '../../../imports/collections/download_analytics';
import { ProductOrders } from '../../../imports/collections/product_order';
import { Link, browserHistory } from 'react-router';
var dateFormat = require('dateformat');
import { svg,g,VictoryAxis, VictoryLine } from 'victory';

class ShopAnalytics extends Component {

  constructor(props) {
    super(props);
  }
  render(){
    if(!this.props.download_analytics || !this.props.product_orders){
      return (
        <div className="container">
        <h2>Sorry there does not seem to be any data here yet.</h2>
        </div>
      );
    }
    //console.log(this.props.download_analytics);
    var ONE_HOUR = 60 * 60 * 1000;
    var downloadChartDataPoints = [];
    var chartDateTicks = [];
    var mostDownloadedDay=0;
    for (var i = 7;i>=0;i--) {
      //console.log("hello");
      var numberDownloadsForDay = 0;
      var currentDate = (new Date()).getTime()-(60 * 60 * 24 * 1000*i);
      this.props.download_analytics.forEach((download)=>{
        var createdAtDate = new Date(download.createdAt);

        //console.log(dateFormat(currentDate,"m-d-yyyy"));
        if(dateFormat(createdAtDate,"m-d-yyyy")==dateFormat(currentDate,"m-d-yyyy")){
          numberDownloadsForDay += 1;
        }
      });
      if(numberDownloadsForDay>mostDownloadedDay){
        mostDownloadedDay = numberDownloadsForDay;
      }
      chartDateTicks.push(dateFormat(currentDate,"m-d"));
      downloadChartDataPoints.push({x:currentDate,y:numberDownloadsForDay});
    }
    console.log(downloadChartDataPoints);
    /*var downloadChartData = {type:"area", datasets:[{label:"my chart",data:downloadChartDataPoints}]};
    var downloadChart = null;
    if(downloadChartDataPoints.length > 0){
      downloadChart = (
        <Line data={downloadChartData} />
      );
    }
    console.log("linechart");
    console.log(Line);*//*
    var chartSeries = [
      {
        field: 'y',
        name: 'Number of Downloads For Day',
        color: '#ff7f0e'
      }
    ]
    var dateFormatter = d3.time.format("%d-%m-%Y");
    tickFormatter = function(d) {
     return new Date(d.x);
   }
   tickDateFormatter = function(d) {
     console.log(d);
    return dateFormatter(new Date(d.x));
  }*/
    return (
      <div>
      <svg width="600" height="300">
        <g>
        <VictoryAxis
            scale="time"
            standalone={false}
            tickValues={chartDateTicks}

            />
            <VictoryAxis dependentAxis
            domain={[0, mostDownloadedDay]}
            offsetX={50}
            orientation="left"
            standalone={false}
          />
            <VictoryLine
            data={downloadChartDataPoints}
            domain={{
              x: [(new Date()).getTime()-(60 * 60 * 24 * 1000*7), new Date()],
              y: [0, mostDownloadedDay]
            }}
            interpolation="monotoneX"
            scale={{x: "time", y: "linear"}}
            standalone={false}
          />
        </g>
      </svg>
      </div>
    );
  }

}

export default createContainer((props) => {
  Meteor.subscribe('download_analytics');
  Meteor.subscribe('product_order_analytics');
  return {
    download_analytics: DownloadAnalytics.find({productOwnerId:Meteor.userId()}).fetch(),
    product_orders: ProductOrders.find({productOwnerId:Meteor.userId()}).fetch()
   };
}, ShopAnalytics);
