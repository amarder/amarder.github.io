---
title: Solar vs Stocks
publishDate: "2026-01-08"
updatedDate: "2026-01-14"
description: "A back-of-the-envelope calculator for comparing the financial returns of investing in solar panels versus the stock market."
tags:
  - observable-plot
posse:
  - "[Reddit 2026-01-14](https://www.reddit.com/r/solar/comments/1qco9uw/feedback_on_a_solar_investment_calculator/)"
  - "[Reddit 2026-01-09](https://www.reddit.com/r/solar/comments/1q8fosa/feedback_on_a_solar_investment_calculator/)"
---

This calculator helps you decide whether to invest in solar panels. It addresses two questions:

1. How much electricity will my system generate?

2. Is that electricity worth more than what I expect to make in the stock market (or some other investment)?

## Step 1: Calculate Expected Electricity Generation

This calculator estimates how much electricity your solar system will produce annually. Where you live matters - folks in Maine receive about two-thirds the sunshine of Southern Arizona, as shown in the map below.

<a href="/solar/solar-annual-ghi-2018-usa-scale-01.jpg" target="_blank">
  <img src="/solar/solar-annual-ghi-2018-usa-scale-01.jpg" alt="">
</a>

To estimate how much electricity your system will generate, we need three things:

1. How much sun do you get?
2. How big is your system?
3. How efficient is your system?

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

<div id="chart-container"></div>

Assuming the system runs perfectly, here is how things stand after thirty years:

| Metric | Value |
|--------|------:|
| Total Electricity Produced | <span id="electricity-produced">0 kWh</span> |
| Total Electricity Value | <span id="energy-savings">$0</span> |
| Solar Internal Rate of Return (IRR) | <span id="solar-irr">0%</span> |
| Solar Net Present Value (NPV) | <span id="solar-npv">$0</span> |
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-panel {
  background-color: white;
  border-radius: 4px;
}

.chart-panel figure {
  margin: 12px;
}

</style>

<script type="module">
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm";

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

// Calculate Internal Rate of Return using bisection method
function calculateIRR(initialInvestment, cashFlows, tolerance = 0.0001, maxIterations = 100) {
  // NPV function: sum of cash flows discounted at rate r
  function npv(rate) {
    let total = -initialInvestment;
    for (let t = 0; t < cashFlows.length; t++) {
      total += cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    return total;
  }
  
  // Bisection method to find rate where NPV = 0
  let low = -0.99;
  let high = 10.0;
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);
    
    if (Math.abs(npvMid) < tolerance) {
      return mid;
    }
    
    if (npv(low) * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  return (low + high) / 2;
}

function drawChart(data) {
  const container = document.getElementById('chart-container');
  container.innerHTML = '';
  
  // Transform data for plotting annual returns
  const returnsData = data.filter(d => d.year > 0).flatMap(d => [
    { year: d.year, value: d.energyCost, strategy: "Solar", electricityProduced: d.electricityProduced },
    { year: d.year, value: d.stockReturns, strategy: "Stocks", stocks: d.stocks }
  ]);
  
  // Transform data for plotting liquid assets
  const assetsData = data.flatMap(d => [
    { year: d.year, value: d.solar, strategy: "Solar", energyCost: d.energyCost, electricityProduced: d.electricityProduced },
    { year: d.year, value: d.stocks, strategy: "Stocks", stockReturns: d.stockReturns }
  ]);
  
  // Top chart: Annual Returns
  const returnsChart = Plot.plot({
    width: container.clientWidth,
    height: 300,
    marginLeft: 60,
    marginRight: 20,
    marginBottom: 40,
    style: { background: "white", color: "black" },
    color: {
      domain: ["Solar", "Stocks"],
      range: ["#4CAF50", "#000000"]
    },
    symbol: {
      domain: ["Solar", "Stocks"],
      range: ["circle", "circle"],
      legend: true
    },
    x: {
      label: null,
      domain: [0, 30],
      ticks: [0, 5, 10, 15, 20, 25, 30]
    },
    y: {
      label: "Annual Returns ($)",
      tickFormat: d => `$${(d/1000).toFixed(1)}k`
    },
    marks: [
      Plot.gridX({ stroke: "#ccc" }),
      Plot.gridY({ stroke: "#ccc" }),
      Plot.ruleY([0], { stroke: "#ccc" }),
      Plot.dot(returnsData, {
        x: "year",
        y: "value",
        fill: "strategy",
        symbol: "strategy",
        r: 3,
        tip: true,
        title: d => d.strategy === "Solar" 
          ? `Year ${d.year}\nSolar Return: ${formatCurrency(d.value)}\nElectricity: ${Math.round(d.electricityProduced).toLocaleString()} kWh`
          : `Year ${d.year}\nStock Return: ${formatCurrency(d.value)}`
      })
    ]
  });
  
  // Bottom chart: Liquid Assets
  const minValue = Math.min(...assetsData.map(d => d.value));
  const maxValue = Math.max(...assetsData.map(d => d.value));
  
  const assetsChart = Plot.plot({
    width: container.clientWidth,
    height: 300,
    marginLeft: 60,
    marginRight: 20,
    marginBottom: 40,
    style: { background: "white", color: "black" },
    color: {
      domain: ["Solar", "Stocks"],
      range: ["#4CAF50", "#000000"]
    },
    symbol: {
      domain: ["Solar", "Stocks"],
      range: ["circle", "circle"],
      legend: false,
      caption: "asdf"
    },
    x: {
      label: "Year",
      domain: [0, 30],
      ticks: [0, 5, 10, 15, 20, 25, 30]
    },
    y: {
      label: "Liquid Value ($)",
      domain: [Math.min(0, minValue * 1.1), maxValue * 1.1],
      tickFormat: d => `$${(d/1000).toFixed(0)}k`
    },
    marks: [
      Plot.gridX({ stroke: "#ccc" }),
      Plot.gridY({ stroke: "#ccc" }),
      Plot.ruleY([0], { stroke: "#ccc" }),
      Plot.dot(assetsData, {
        x: "year",
        y: "value",
        fill: "strategy",
        symbol: "strategy",
        r: 3,
        tip: true,
        title: d => d.strategy === "Solar"
          ? `Year ${d.year}\nSolar Liquid Value: ${formatCurrency(d.value)}\nElectricity: ${Math.round(d.electricityProduced).toLocaleString()} kWh\nEnergy Cost Saved: ${formatCurrency(d.energyCost)}`
          : `Year ${d.year}\nStock Value: ${formatCurrency(d.value)}\nStock Returns: ${formatCurrency(d.stockReturns)}`
      })
    ]
  });
  
  // Create single panel container with both charts
  const chartPanel = document.createElement('div');
  chartPanel.className = 'chart-panel';
  chartPanel.appendChild(returnsChart);
  const fig = document.createElement('figure');
  fig.appendChild(assetsChart);
  chartPanel.appendChild(fig);
  container.appendChild(chartPanel);
  
  // Update summary statistics
  updateSummary(data);
}

function updateSummary(data) {
  const finalYear = data[data.length - 1];
  const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
  
  // Calculate total energy savings from solar over 30 years
  const totalEnergySavings = data.reduce((sum, d) => sum + d.energyCost, 0);
  
  // Calculate total stock returns over 30 years
  const totalStockReturns = data.reduce((sum, d) => sum + d.stockReturns, 0);
  
  // Calculate total electricity produced
  const totalElectricity = data.reduce((sum, d) => sum + d.electricityProduced, 0);
  
  // Calculate IRR for solar investment
  // Cash flows are the annual electricity savings (years 1-30)
  const cashFlows = data.filter(d => d.year > 0).map(d => d.energyCost);
  const solarIRR = calculateIRR(initialInvestment, cashFlows);
  
  // Calculate NPV using expected stock market return as discount rate
  const stockReturn = parseFloat(document.getElementById('stock-return').value) / 100;
  let solarNPV = -initialInvestment;
  for (let t = 0; t < cashFlows.length; t++) {
    solarNPV += cashFlows[t] / Math.pow(1 + stockReturn, t + 1);
  }
  
  // Update table cells
  document.getElementById('stocks-final').textContent = formatCurrency(finalYear.stocks);
  document.getElementById('energy-savings').textContent = formatCurrency(totalEnergySavings);
  document.getElementById('electricity-produced').textContent = 
    Math.round(totalElectricity).toLocaleString() + ' kWh';
  document.getElementById('stock-returns').textContent = formatCurrency(totalStockReturns);
  document.getElementById('solar-irr').textContent = (solarIRR * 100).toFixed(1) + '%';
  document.getElementById('solar-npv').textContent = formatCurrency(solarNPV);
}

// Initialize immediately - ES modules are deferred so DOM is already ready
function init() {
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
  
  // Recalculate on window resize (width changes only)
  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const currentWidth = window.innerWidth;
      // Only redraw if width changed (ignore height changes from mobile browser chrome)
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        const data = calculateStrategies();
        drawChart(data);
      }
    }, 250);
  });
}

// Run initialization - DOM is ready since ES modules are deferred
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
</script>
