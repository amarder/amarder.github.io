function Graph(params) {
    this.params = params;
    this._initialize();
}

function satterthwaite(s, n) {
    var v = s.map(function(x) { return Math.pow(x, 2)});
    var numerator = Math.pow(v[0] / n[0] + v[1] / n[1], 2);
    var denominator = (
        Math.pow(v[0] / n[0], 2) / (n[0] - 1) +
        Math.pow(s[1] / n[1], 2) / (n[1] - 1)
    );
    return numerator / denominator;
}

Graph.prototype.power = function(x) {
    var mean = this.params.mu1 - this.params.mu0;
    var variance = (
        Math.pow(this.params.sigma1, 2) / this.params.n1 +
        Math.pow(this.params.sigma0, 2) / this.params.n0
    );
    var alpha = this.params.alpha;
    // http://ageconsearch.umn.edu/bitstream/116234/2/sjart_st0062.pdf
    var n = this.params.n0 + this.params.n1
    var dof = satterthwaite([this.params.sigma0, this.params.sigma1], [this.params.n0, this.params.n1]);
    var ncp = mean / Math.sqrt(variance);
        
    null_h = jStat.studentt(dof=dof);
    alt_h = jStat.noncentralt(dof=dof, ncp=ncp);

    var result = {
        distributions: [
            {x: x, mu: mu0, f: null_h.pdf(x)[0], f_mu: null_h.pdf(mu0), label: "Control", color: "#000000", Y: null_h},
            {x: x, mu: mu1, f: alt_h.pdf(x)[0], f_mu: alt_h.pdf(mu1), label: "Treatment", color: "#ff0000", Y: alt_h}
        ],
        ncp: ncp,
        dof: dof
    };
    result.xcrit = [null_h.inv(alpha / 2), null_h.inv(1 - alpha/2)];
    result.power = alt_h.cdf(result.xcrit[0]) + (1 - alt_h.cdf(result.xcrit[1]));
    this.info = result;

    return result;
}

Graph.prototype.clean_power = function() {
    var points = 100;
    var xmin = -10;
    var xmax = 10;
    var xvalues = jStat.seq(xmin, xmax, points);
    
    var info = this.power(xvalues);
    var yvalues = info["distributions"][0]["f"].concat( info["distributions"][1]["f"] );
    var ymax = d3.max(yvalues);

    var fills = ["rgba(0, 0, 0, 0.25)", "rgba(255, 0, 0, 0.25)"];
    var regions = [];
    for (var j = 0; j <= 1; j++) {
        var xcrit = info.xcrit[0];
        var left = [
            {x: xcrit, y: info.distributions[j].Y.pdf(xcrit)},
            {x: xcrit, y: 0},
            {x: xvalues[0], y: 0}
        ]
        for (var i = 0; i < points; i++) {
            if (xvalues[i] <= xcrit) {
                left = left.concat({x: xvalues[i], y: info.distributions[j].f[i]});
            }
        }
        regions = regions.concat({points: left, fill: fills[j]});

        var xcrit = info.xcrit[1];
        var right = [
            {x: xvalues[points - 1], y: 0},
            {x: xcrit, y: 0},
            {x: xcrit, y: info.distributions[j].Y.pdf(xcrit)}
        ];
        for (var i = 0; i < points; i++) {
            if (xvalues[i] >= xcrit) {
                right = right.concat({x: xvalues[i], y: info.distributions[j].f[i]});
            }
        }
        regions = regions.concat({points: right, fill: fills[j]});
    }

    var indices = jStat.seq(0, points-1, points);
    info.distributions.forEach(function(d) {
        d.points = indices.map(function(j) { return {x: d.x[j], y: d.f[j]}; });
    });

    return {
        domains: {
            x: [xmin, xmax],
            y: [-0.1 * ymax, 1.1 * ymax]
        },
        regions: regions,
        distributions: info.distributions
    };
}

Graph.prototype._initialize = function() {
    var data = this.clean_power();

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 800 - margin.left - margin.right,
        height = 415 - margin.top - margin.bottom;

    // Initialize window
    var x = d3.scale.linear()
        .domain(data.domains.x)
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([-0.035, 0.4])
        .range([height, 0]);

    var line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

    var interpolated_line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .interpolate("basis");

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    ////////////////////////
    // Create svg element //
    ////////////////////////
    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //////////////
    // Add axes //
    //////////////
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("t-statistic");
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Probability Density");

    ////////////////
    // Add legend //
    ////////////////
    var line_sep = 0.025;
    var top_line = 0.38;
    var legend_left = 5.5;
    var line_width = 0.5
    var line_left = legend_left - line_width / 2;
    var legend_entries = [
        {x: legend_left, y: top_line, text: "Null Hypothesis", color: "#000000", points: [{x: line_left - line_width, y: top_line + line_sep / 4}, {x: line_left, y: top_line + line_sep / 4}]},
        {x: legend_left, y: top_line - line_sep, text: "Alternative Hypothesis", color: "#ff0000", points: [{x: line_left - line_width, y:top_line - line_sep + line_sep / 4}, {x: line_left, y: top_line - line_sep + line_sep / 4}]}
    ];
    var legend = svg.selectAll(".legend")
        .data(legend_entries)
        .enter()
        .append("g")
        .attr("class", "legend");
    legend.append("text")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .style("fill", function(d) { return d.color; })
        .text(function(d) { return d.text; });
    legend.append("path")
        .attr("class", "line")
        .style("stroke", function(d) { return d.color; })
        .attr("d", function(d) { return line(d.points); });

    ////////////////////////
    // Add shaded regions //
    ////////////////////////
    var regions = svg.selectAll(".region")
        .data(data.regions)
        .enter()
        .append("g")
        .attr("class", "region")
    regions.append("path")
        .attr("class", "line")
        .style("fill", function(d) { return d.fill; })
        .style("stroke", "none")
        .attr("d", function(d) { return line(d.points); });

    ///////////////////////////
    // Add the distributions //
    ///////////////////////////
    var pdfs = svg.selectAll(".pdf")
        .data(data.distributions)
        .enter()
        .append("g")
        .attr("class", "pdf")
    pdfs.append("path")
        .attr("class", "line")
        .style("stroke", function(d) { return d.color; })
        .attr("d", function(d) { return interpolated_line(d.points); });

    this.d3 = {x: x, y: y, line: line, interpolated_line: interpolated_line, xAxis: xAxis, yAxis: yAxis, svg: svg};
}

Graph.prototype.update = function() {
    var that = this;
    var data = this.clean_power();

    // update pdfs
    d3.selectAll(".pdf path")
        .data(data.distributions)
        .attr("d", function(d) { return that.d3.interpolated_line(d.points); });

    // update regions
    d3.selectAll(".region path")
        .data(data.regions)
        .attr("d", function(d) { return that.d3.line(d.points); });
}

// Set up AngularJS app
var myApp = angular.module('myapp', ['rzModule']);

myApp.controller('TestController', TestController);

function TestController() {
    var vm = this;

    var initial_parameters = {
        mu0: 0, mu1: 0.5, sigma0: 1, sigma1: 1, n0: 50, n1: 50, alpha: 0.05
    };

    vm.graph = new Graph(initial_parameters);
    vm.power = 0.75;
    
    var sliders = [
        {id: "mu", min: -1, max: 1, step: 0.01},
        {id: "sigma", min: 0.1, max: 5, step: 0.1},
        {id: "n", min: 2, max: 100, step: 1}
    ]

    var callback = function(key) {
        return function(sliderId, modelValue, highValue) {
            vm.graph.params[key] = modelValue;
            vm.graph.update();
        }
    }
    for (var i = 0; i <= 1; i++) {
        for (var j = 0; j < sliders.length; j++) {
            var d = sliders[j];
            var k = d.id + i;

            vm[k] = {
                value: initial_parameters[k],
                options: {
                    floor: d.min,
                    ceil: d.max,
                    step: d.step,
                    precision: -Math.log10(d.step),
                    onChange: callback(k)
                    // .on("slide", callback(d.id + i))
                }
            }
        }
    }
    vm.alpha = {
        value: 0.05,
        options: {
            floor: 0.001,
            ceil: 0.1,
            step: 0.001,
            precision: 3,
            onChange: callback("alpha")
        }
    };
}
