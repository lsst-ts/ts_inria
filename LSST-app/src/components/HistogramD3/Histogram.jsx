import React, { Component } from 'react'
import * as d3 from 'd3';
// import { scaleBand, scaleLinear } from 'd3-scale'
import ReactDOM from 'react-dom';
import './Histogram.css'



class Histogram extends Component {

  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  randomData(length, start, end) {
    var array = new Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = {
        date: this.randomDate(start, end),
        U: Math.floor(Math.random() * 6) + 1,
        G: Math.floor(Math.random() * 6) + 1,
        R: Math.floor(Math.random() * 6) + 1,
        I: Math.floor(Math.random() * 6) + 1,
        Z: Math.floor(Math.random() * 6) + 1,
        Y: Math.floor(Math.random() * 6) + 1
      };
    }
    return array;
  }

  roundMinutes(date){
   date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0);

    return date;
  }
  
  adaptData(){
    let data = this.props.data;
    let newData = [];
    let date = null;
    let item ={
      date: null,
      U: 0,
      G: 0,
      R: 0,
      I: 0,
      Z: 0,
      Y: 0
    };
    data.forEach((d)=>{
      let itemDate = d.expDate;
      if(date==null){
        console.log(d.expDate);
       item.date = d.expDate
       this.addValueToFilter(item, d.filter, d.expTime);
       date = d.expDate;
      }
      else if((itemDate.toDateString().localeCompare(date.toDateString()) == 0 && itemDate.getHours() == date.getHours())){
        this.addValueToFilter(item, d.filter, d.expTime);
      }
      else{
        let newItem ={
          date: item.date,
          U: item.U,
          G: item.G,
          R: item.R,
          I: item.I,
          Z: item.Z,
          Y: item.Y
        };
        newData.push(newItem);
        item ={
          date: d.expDate,
          U: 0,
          G: 0,
          R: 0,
          I: 0,
          Z: 0,
          Y: 0
        };
        date=d.expDate;
        this.addValueToFilter(item, d.filter, d.expTime);
      }
    });
    newData.push(item);
    console.log(newData[1]);
    return newData;
  }

  addValueToFilter(item,filter,value){
    switch(filter){
      case 1:
        item.U += value;
        break;
      case 2:
        item.G += value;
        break;
      case 3:
        item.R += value;
        break;
      case 4:
        item.I += value;
        break;
      case 5:
        item.Z += value;
        break;
      case 6:
        item.Y += value;
        break;
    }
  }

  createChart(dom, props) {
    var width = this.props.width;
    var height = this.props.height;
    var today = new Date();
    today.setDate(today.getDate() - 1);
    var data = this.randomData(1, today, new Date())

    var formatCount = d3.format(",.0f");

    var svg = d3.select(dom).append('svg').attr('class', 'd3').attr('width', width).attr('height', height),
      margin = { top: 30, right: 30, bottom: 30, left: 30 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleTime()
      .domain([today, new Date()])
      .rangeRound([0, width]);

    var bins = d3.histogram()
      .value(function (d) { return d.date; })
      .domain(x.domain())
      .thresholds(x.ticks(d3.utcHour))(data);

    var y = d3.scaleLinear().domain([0, d3.max(bins, (d) => { return d.length; })]).range([height, 0]);

    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", (d) => { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", (d) => { return height - y(d.length); });

    bar.append("text")
      .attr("dy", ".75em")
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      .text(function (d) { return formatCount(d.length); });

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  }


  createStackedHistogram(dom, props) {
    var self = this;
    var width = this.props.width;
    var height = this.props.height;
    var today = new Date();
    today.setDate(today.getDate() + 1);
    var data = this.adaptData();
    console.log(data);

    var svg = d3.select(dom).append('svg').attr('class', 'd3').attr('width', width).attr('height', height);
    var margin = { top: 0, right: 20, bottom: 20, left: 20 };
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var start = data[0].date;
    var endDate = new Date(data[data.length-1].date);
    var end = endDate.setHours(endDate.getHours()+1);
    var x = d3.scaleTime().domain([start, end]);

    var y = d3.scaleLinear().range([height, 0]);


    var z = d3.scaleOrdinal()
      .range(["#992f8f","#2f2fcc","#2cdd37","#fff704","#f19437","#c80f0f"]);

    var keys = ["U", "G", "R", "I","Z", "Y"];
    z.domain(keys);

    var stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    var series = stack(data);
    console.log(series);
    // console.log(series[series.length - 1]);
    y.domain([0, d3.max(series[series.length - 1], function (d) {
      console.log(d);return  d[1]; })]).nice();

    var layer = svg.selectAll(".layer")
      .data(series)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function (d, i) { return z(i); });

    // var barPadding = 5;
    var barWidth = (width)/data.length;
    console.log(barWidth);
    x.range([0,width]);
    layer.selectAll("rect")
      .data(function (d) { return d; })
      .enter().append("rect")
      .attr("x", function (d) {
        // console.log(d.data.date);
        return x(d.data.date)+margin.left;
      })
      .attr("y", function (d) { 
        // console.log(y(d[1]));
        // return 1;})
        return y(d[1]); })
      .attr("height", function (d) { return y(d[0]) - y(d[1]); })
      .attr("width", function(d){return (barWidth < 10) ? barWidth:10;});
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.utcHour));
      // g.append("g")
      // .attr("class", "axis axis--y")
      // .attr("transform", "translate(0," + w + ")")
      // .call(d3.axisLeft(y));

  }

  componentDidMount() {
    var dom = ReactDOM.findDOMNode(this);
    this.createStackedHistogram(dom, this.props);
        
  }

  shouldComponentUpdate() {
    var dom = ReactDOM.findDOMNode(this);
    this.createStackedHistogram(dom, this.props);
  }

  render() {
    let data = this.props.data;
    return (
      <div ref="container">
        <h4> {this.props.title} </h4>
      </div>
    );
  }
}

Histogram.defaultProps = {
  width: 865,
  height: 160,
  title: '',
  Legend: true,

};

export default Histogram;