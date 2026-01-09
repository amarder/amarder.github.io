---
title: Solar vs Stocks
publishDate: "2026-01-08"
description: "A back-of-the-envelope calculator for comparing the financial returns of investing in solar panels versus the stock market."
tags:
  - d3js
---

This calculator is designed to help readers decide whether to invest in solar panels. It aims to address two questions:

1. How much electricity will my system generate?

2. Is that electricity worth more than what I expect to make in the stock market (or some other investment)?

## Step 1: Calculate Expected Electricity Generation

The calculator in this section is designed to estimate how much electricity your solar system will produce annually. Where you live matters. Folks in Maine should expect about 2/3 the amount of sunshine folks in Southern Arizona receive over the year, as shown in the following map.

<a href="/solar/solar-annual-ghi-2018-usa-scale-01.jpg" target="_blank">
  <img src="/solar/solar-annual-ghi-2018-usa-scale-01.jpg" alt="">
</a>

To estimate how much electricity your system will generate we need three things:

1. How much sun you get?
2. How big your system will be?
3. How efficient is the system?

| Variable | Value | Unit | Typical Range |
|----------|-------|------|:-------------:|
| Solar Radiation | <input type="number" id="peak-sun-hours" value="5" min="0" max="8" step="0.1"> | kWh / m<sup>2</sup> / day | 4 - 6 |
| System Size | <input type="number" id="system-size" value="6" min="0" step="0.1"> | kW | 5 - 10 |
| System Losses | <input type="number" id="system-losses" value="20" min="0" max="100" step="1"> | % | 15 - 25 |
| System Output | <span id="electricity-output">0</span> | kWh / year | |

<button id="use-value-btn">Copy System Output from Step 1 to Step 2</button>

$$ \text{Output} = \text{Radiation} \times \frac{365 \text{ days}}{year} \times \text{Size} \times \frac{100 - \text{Losses}}{100} $$

For a more detailed estimate of electricity generation, check out [NREL's PVWatts Calculator](https://pvwatts.nrel.gov/index.php).

## Step 2: Compare Solar vs Stocks

**Solar Strategy**: You pay upfront for solar panels. Over time, you accumulate savings from not paying for electricity. The panels degrade slightly each year, producing less power, but electricity prices increase with inflation.

**Stock Strategy**: Instead of investing in solar panels, you invest the same amount in the stock market, earning average returns. However, you still need to pay for electricity each year, which comes out of your investment balance.

This [HomeGuide page](https://homeguide.com/costs/solar-panel-cost) has some useful ballpark numbers for how much solar systems cost by size.

| Variable | Value | Unit | Typical Range |
|----------|-------|------|:-------------:|
| Initial Investment | <input type="number" id="initial-investment" value="15000" min="0" step="1000"> | $ | 15,000 - 30,000 |
| Electricity Generated Year 1 | <input type="number" id="electricity-generated" value="8760" min="0" step="100"> | kWh | 8,000 - 12,000 |
| Solar Panel Degradation Rate | <input type="number" id="degradation-rate" value="0.5" min="0" max="5" step="0.1"> | % / year | 0.5 - 1.0 |
| Cost of Electricity Year 1 | <input type="number" id="electricity-cost" value="0.15" min="0" step="0.01"> | $ / kWh | 0.10 - 0.25 |
| Electricity Inflation Rate | <input type="number" id="inflation-rate" value="3" min="0" max="10" step="0.1"> | % / year | 2 - 5 |
| Expected Stock Market Return | <input type="number" id="stock-return" value="7" min="0" max="20" step="0.1"> | % / year | 7 - 10 |

<div id="chart-container">
  <svg id="solar-chart"></svg>
</div>

Assuming the system runs perfectly for thirty years, here are how the two strategies compare:

| Metric | Value |
|--------|------:|
| Total Electricity Produced | <span id="electricity-produced">0 kWh</span> |
| Total Electricity Value | <span id="energy-savings">$0</span> |
| Total Stock Returns | <span id="stock-returns">$0</span> |
| Stocks at Year 30 | <span id="stocks-final">$0</span> |


<style>
table input[type="number"] {
  width: 100%;
  border: 1px solid #777;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  box-sizing: border-box;
}

#use-value-btn {
  border: 1px solid #777;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

#chart-container {
  margin: 2rem 0;
  min-height: 400px;
}

#solar-chart {
  width: 100%;
  height: 500px;
  background-color: white;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
}

.point-solar {
  fill: #FF9800;
}

.point-stocks {
  fill: #2196F3;
}

.axis-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.grid line {
  stroke: #e0e0e0;
  stroke-opacity: 0.7;
  shape-rendering: crispEdges;
}

.grid path {
  stroke-width: 0;
}
</style>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
// Electricity Generation Calculator
function calculateElectricityGeneration() {
  const systemSize = parseFloat(document.getElementById('system-size').value);
  const peakSunHours = parseFloat(document.getElementById('peak-sun-hours').value);
  const losses = parseFloat(document.getElementById('system-losses').value) / 100;
  const efficiency = 1 - losses;
  
  // Annual kWh = System Size (kW) × Peak Sun Hours × 365 days × (1 - System Losses)
  const annualKwh = systemSize * peakSunHours * 365 * efficiency;
  
  return annualKwh;
}

function updateElectricityOutput() {
  const kwh = calculateElectricityGeneration();
  document.getElementById('electricity-output').textContent = 
    Math.round(kwh).toLocaleString() + ' kWh';
}

function calculateStrategies() {
  // Get input values
  const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
  const electricityGenerated = parseFloat(document.getElementById('electricity-generated').value);
  const degradationRate = parseFloat(document.getElementById('degradation-rate').value) / 100;
  const electricityCost = parseFloat(document.getElementById('electricity-cost').value);
  const inflationRate = parseFloat(document.getElementById('inflation-rate').value) / 100;
  const stockReturn = parseFloat(document.getElementById('stock-return').value) / 100;
  
  const years = 30;
  const data = [];
  
  // Calculate both strategies year by year
  let stockCash = initialInvestment;
  
  data.push({ 
    year: 0, 
    solar: 0, 
    stocks: stockCash,
    stockReturns: 0,
    energyCost: 0,
    electricityProduced: 0
  });
  
  for (let year = 1; year <= years; year++) {
    // Calculate electricity production and cost for this year
    const generationFactor = Math.pow(1 - degradationRate, year - 1);
    const costFactor = Math.pow(1 + inflationRate, year - 1);
    const electricityProducedThisYear = electricityGenerated * generationFactor;
    const electricityCostThisYear = electricityProducedThisYear * electricityCost * costFactor;
    
    // Stock strategy: grow with returns, then pay for electricity
    const returnsThisYear = Math.max(0, stockCash * stockReturn);
    stockCash = stockCash + returnsThisYear - electricityCostThisYear;
    
    // Solar strategy: always zero cash on hand (you spent it on panels)
    data.push({ 
      year, 
      solar: 0, 
      stocks: stockCash,
      stockReturns: returnsThisYear,
      energyCost: electricityCostThisYear,
      electricityProduced: electricityProducedThisYear
    });
  }
  
  return data;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function drawChart(data) {
  // Clear previous chart
  d3.select('#solar-chart').selectAll('*').remove();
  
  // Set up dimensions
  const margin = { top: 20, right: 120, bottom: 50, left: 80 };
  const container = document.getElementById('chart-container');
  const width = container.clientWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select('#solar-chart')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Set up scales
  const x = d3.scaleLinear()
    .domain([0, 30])
    .range([0, width]);
  
  const maxStocks = d3.max(data, d => d.stocks);
  const minStocks = d3.min(data, d => d.stocks);
  const yMin = minStocks < 0 ? minStocks * 1.1 : 0;
  const yMax = maxStocks * 1.1;
  
  const y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);
  
  // Add grid lines
  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickFormat('')
    );
  
  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10));
  
  svg.append('g')
    .call(d3.axisLeft(y).tickFormat(d => formatCurrency(d)));
  
  // Add axis labels
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .text('Year');
  
  svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .text('Liquid Assets ($)');
  
  // Draw points for solar
  svg.selectAll('.point-solar')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point-solar')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.solar))
    .attr('r', 4);
  
  // Draw points for stocks
  svg.selectAll('.point-stocks')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'point-stocks')
    .attr('cx', d => x(d.year))
    .attr('cy', d => y(d.stocks))
    .attr('r', 4);
  
  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width + 10}, 20)`);
  
  legend.append('circle')
    .attr('cx', 15)
    .attr('cy', 0)
    .attr('r', 6)
    .attr('fill', '#FF9800');
  
  legend.append('text')
    .attr('x', 30)
    .attr('y', 5)
    .text('Solar');
  
  legend.append('circle')
    .attr('cx', 15)
    .attr('cy', 25)
    .attr('r', 6)
    .attr('fill', '#2196F3');
  
  legend.append('text')
    .attr('x', 30)
    .attr('y', 30)
    .text('Stocks');
  
  // Add tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');
  
  // Add invisible overlay for hover
  const bisect = d3.bisector(d => d.year).left;
  
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mousemove', function(event) {
      const [xPos] = d3.pointer(event);
      const year = Math.round(x.invert(xPos));
      const dataPoint = data[year];
      
      if (dataPoint) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>Year ${dataPoint.year}</strong><br/>
            Electricity Produced: ${Math.round(dataPoint.electricityProduced).toLocaleString()} kWh<br/>
            Electricity Cost: ${formatCurrency(dataPoint.energyCost)}<br/>
            Stock Returns: ${formatCurrency(dataPoint.stockReturns)}<br/>
            Stock Value: ${formatCurrency(dataPoint.stocks)}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      }
    })
    .on('mouseout', function() {
      tooltip.style('opacity', 0);
    });
  
  // Update summary statistics
  updateSummary(data);
}

function updateSummary(data) {
  const finalYear = data[data.length - 1];
  
  // Calculate total energy savings from solar over 30 years
  const totalEnergySavings = data.reduce((sum, d) => sum + d.energyCost, 0);
  
  // Calculate total stock returns over 30 years
  const totalStockReturns = data.reduce((sum, d) => sum + d.stockReturns, 0);
  
  // Calculate total electricity produced
  const totalElectricity = data.reduce((sum, d) => sum + d.electricityProduced, 0);
  
  // Update table cells
  document.getElementById('stocks-final').textContent = formatCurrency(finalYear.stocks);
  document.getElementById('energy-savings').textContent = formatCurrency(totalEnergySavings);
  document.getElementById('electricity-produced').textContent = 
    Math.round(totalElectricity).toLocaleString() + ' kWh';
  document.getElementById('stock-returns').textContent = formatCurrency(totalStockReturns);
}

// Calculate and draw on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize electricity calculator
  updateElectricityOutput();
  
  // Add event listeners for electricity calculator
  const electricityInputs = ['system-size', 'peak-sun-hours', 'system-losses'];
  electricityInputs.forEach(function(inputId) {
    document.getElementById(inputId).addEventListener('input', updateElectricityOutput);
  });
  
  // Handle "Use This Value" button
  document.getElementById('use-value-btn').addEventListener('click', function() {
    const kwh = calculateElectricityGeneration();
    document.getElementById('electricity-generated').value = Math.round(kwh);
    
    // Update the main calculator
    const data = calculateStrategies();
    drawChart(data);
    
    // Scroll to the main calculator
    document.getElementById('initial-investment').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  });
  
  // Initialize main calculator
  const data = calculateStrategies();
  drawChart(data);
  
  // Add event listeners to all input fields in main calculator
  const inputs = [
    'initial-investment',
    'electricity-generated',
    'degradation-rate',
    'electricity-cost',
    'inflation-rate',
    'stock-return'
  ];
  
  inputs.forEach(function(inputId) {
    document.getElementById(inputId).addEventListener('input', function() {
      const data = calculateStrategies();
      drawChart(data);
    });
  });
  
  // Recalculate on window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const data = calculateStrategies();
      drawChart(data);
    }, 250);
  });
});
</script>
