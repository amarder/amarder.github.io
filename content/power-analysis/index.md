---
title: Statistical Power Analysis
description: "An interactive visualization of how statistical power analyses are performed."
date: 2016-05-02
---

<link rel="stylesheet" type="text/css" href="./power.css">
<script src="./angular.min.js"></script>
<script src="./angularjs-slider/rzslider.min.js"></script>
<link rel="stylesheet" type="text/css" href="./angularjs-slider/rzslider.min.css">
<script src="./jstat.min.js"></script>
<script src="/js/d3.min.js"></script>
<script src="./power.js"></script>

<div ng-app="myapp">
<div ng-controller="TestController as vm">

<div id="plot"></div>

<table>
  <thead>
    <tr>
      <th></th>
      <th>Control Group $(Y_0)$</th>
      <th>Treatment Group $(Y_1)$</th>
    </tr>
  </thead>
  <tbody>
    <tr class="tall">
      <td style="width: 236px;">Mean $(\mu)$</td>
      <td><rzslider rz-slider-model="vm.mu0.value" rz-slider-options="vm.mu0.options" id="mu0" class="slider"></rzslider></td>
      <td><rzslider rz-slider-model="vm.mu1.value" rz-slider-options="vm.mu1.options" id="mu1" class="slider"></rzslider></td>
    </tr>
    <tr class="tall">
      <td>Standard Deviation $(\sigma)$</td>
      <td><rzslider rz-slider-model="vm.sigma0.value" rz-slider-options="vm.sigma0.options" id="sigma0" class="slider"></rzslider></td>
      <td><rzslider rz-slider-model="vm.sigma1.value" rz-slider-options="vm.sigma1.options" id="sigma1" class="slider"></rzslider></td>
    </tr>
    <tr class="tall">
      <td>Number of Observations $(n)$</td>
      <td><rzslider rz-slider-model="vm.n0.value" rz-slider-options="vm.n0.options" id="n0" class="slider"></rzslider></td>
      <td><rzslider rz-slider-model="vm.n1.value" rz-slider-options="vm.n1.options" id="n1" class="slider"></rzslider></td>
    </tr>
    <tr>
      <td>Significance Level $(\alpha)$</td>
      <td colspan="2">
        <rzslider rz-slider-model="vm.alpha.value" rz-slider-options="vm.alpha.options" id="alpha" class="slider"></rzslider>
      </td>
    </tr>
    <tr class="divider"><td colspan="3"></td></tr>
    <tr>
      <td>Critical t = {{ vm.graph.info.xcrit[1] | number : 3 }}</td>
      <td>Noncentrality Parameter = {{ vm.graph.info.ncp | number : 3 }}</td>
      <td>Degrees of Freedom = {{ vm.graph.info.dof | number : 3 }}</td>
    </tr>
    <tr>
      <td colspan="3">Power = {{ vm.graph.info.power | number : 3 }}</td>
    </tr>
  </tbody>
</table>

Imagine a scientist planning to run an experiment. A power analysis can help answer questions like:

*   Will this experiment work - how likely is it to detect a statistically significant effect?
*   How much data needs to be collected?
*   What is the smallest effect this experiment can measure?

This visualization illustrates how assumptions about the data generating process affect the likelihood of detecting a significant effect.

This power analysis assumes each outcome for the control group is distributed normally with mean {{ vm.graph.params.mu0 | number : 2 }} and standard deviation {{ vm.graph.params.sigma0 | number : 1 }}, and each outcome for the treatment group is distributed normally with mean {{ vm.graph.params.mu1 | number : 2 }} and standard deviation {{ vm.graph.params.sigma1 | number : 1 }}. If {{ vm.graph.params.n0 | number : 0 }} observations are collected from the control group and {{ vm.graph.params.n1 | number : 0 }} observations are collected from the treatment group, what is the probability of rejecting the null hypothesis, allowing for false rejections at a rate of {{ vm.graph.params.alpha | number : 3 }}? The probability of rejecting the null hypothesis that the expected outcomes for the two groups are equal is {{ vm.graph.info.power | number : 3 }}.

After running the experiment, the researcher would perform a t-test. The t-statistic is the difference in the mean outcomes for the two groups, divided by its standard error. Under the null hypothesis, the t-statistic follows the Student's t-distribution with {{ vm.graph.info.dof | number : 3 }} degrees of freedom, this is the black distribution above. Under the alternative hypothesis, the t-statistic follows a noncentral t-distribution with the same degrees of freedom and noncentrality parameter of {{ vm.graph.info.ncp | number : 3 }}, this is the red distribution above. The null hypothesis is rejected if the experiment generates a t-statistic with magnitude greater than {{ vm.graph.info.xcrit[1] | number : 3 }}. The power of this hypothesis test equals the area under the curve of the alternative hypothesis with t-values of magnitude greater than the critical value, this area is highlighted in red.

Interested in how to perform this power calculation? Check out [Harrison and Brady (2004)](http://ageconsearch.umn.edu/bitstream/116234/2/sjart_st0062.pdf). Note, I used Satterthwaite's formula to approximate the degrees of freedom for the t-distributions.

Interested in building a similar visualization? Check out [jStat](https://github.com/jstat/jstat), [D3.js](https://github.com/mbostock/d3), [AngularJS](https://github.com/angular/angular.js), and [AngularJS Slider](https://github.com/angular-slider/angularjs-slider).

</div>
</div>
