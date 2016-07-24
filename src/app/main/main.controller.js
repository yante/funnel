(function() {
  'use strict';

  angular
    .module('funnel')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController(d3, $timeout, $log) {
    var vm = this;
    var availableSources = ['facebook', 'email', 'search', 'source_1']
    vm.awesomeThings = 'TEST';
    vm.funnelData = [];
    var result = [];
    d3.csv("/assets/data/visits.csv",function(d) {
      var tmp = d.date.split('.');
      var date = '2016-' + tmp[1] + '-' + tmp [0];
      d.date = new Date(date);
      d.action = 'visit';
      d.source = availableSources[Math.floor(Math.random() * availableSources.length)];

      return d;
    }, function(data) {
      result = result.concat(data);
      d3.csv("/assets/data/downloads.csv",function(d) {
        var tmp = d.date.split('.');
        var date = '2016-' + tmp[1] + '-' + tmp [0];
        d.date = new Date(date);
        d.action = 'download';
        d.source = availableSources[Math.floor(Math.random() * availableSources.length)];
        return d;
      }, function(data) {
        result = result.concat(data);
          d3.csv("/assets/data/purchases.csv",function(d) {
            var tmp = d.date.split('.');
            var date = '2016-' + tmp[1] + '-' + tmp [0];
            d.date = new Date(date);
            d.action = 'purchase';
            d.source = availableSources[Math.floor(Math.random() * availableSources.length)];
            return d;
          }, function(data) {
            result = result.concat(data);
            // result = result.filter(function(d) { return d.country == 'United States' });
            var grouped = d3.nest()
                .key(function(d) { return d.action;})
                .key(function(d) { return d.source;})
                .rollup(function(d) {
                  return d3.sum(d, function(g) {
                    return Math.round(g.count);
                  });
                })
                .entries(result);

            grouped.forEach(function(d){
              d.count = d3.sum(d.values, function(g){
                return g.value
              });
            });

            $timeout(function(){
              $log.log(grouped);
              vm.funnelData = result;
              vm.grouped = grouped;


              var data = grouped;
              // STARTING THE DRAWING


              var width = 560,
                  height = 200;

              var y = d3.scaleLinear()
                  .range([height, 0]);

              var stack = d3.stack();


              var chart = d3.select(".chart")
                  .attr("width", width)
                  .attr("height", height);


              y.domain([0, d3.max(data, function(d) { return d.count; })]);

              chart.selectAll('rect')
                  .data(data)
                  .enter()
                  .append('rect')
                  .attr('x', function(d, i) {return i * 31})
                  .attr('width', 30)
                  .attr('height', 0)
                  .transition()
                  .duration(2000)
                  .attr('height', function(d, i) {return height - y(d.count)})


            });

          });
      });
    });

  }
})();
