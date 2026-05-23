/**
 * Ghana Farmer Support Application - Dashboard Visualizations (Chart.js Configs)
 */

let weatherChartInstance = null;
let ndviChartInstance = null;
let benchmarkChartInstance = null;

// Premium dark-mode chart defaults
const chartGridColor = 'rgba(255, 255, 255, 0.05)';
const chartTextColor = '#8a8f98';
const chartFontFamily = "'Inter', sans-serif";

/**
 * Renders the weather forecast line/bar chart (temperature + rain probability).
 * @param {object} dailyData - Daily forecast object from Open-Meteo
 */
export function renderWeatherChart(dailyData) {
  const ctx = document.getElementById('weatherChart').getContext('2d');
  
  if (weatherChartInstance) {
    weatherChartInstance.destroy();
  }

  // Format dates into readable days (e.g. "May 20")
  const labels = dailyData.time.map(t => {
    const d = new Date(t);
    return d.toLocaleDateString(window.currentLanguage === 'ak' ? 'ak-GH' : 'en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  const maxTemps = dailyData.temperature_2m_max;
  const minTemps = dailyData.temperature_2m_min;
  const rainSums = dailyData.precipitation_sum;

  weatherChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: window.translate('lbl-soil-moisture') + ' / Rain (mm)',
          type: 'bar',
          data: rainSums,
          backgroundColor: 'rgba(94, 106, 210, 0.35)',
          borderColor: '#5e6ad2',
          borderWidth: 1,
          yAxisID: 'yRain',
          borderRadius: 4
        },
        {
          label: 'Max Temp (°C)',
          type: 'line',
          data: maxTemps,
          borderColor: '#828fff',
          backgroundColor: 'rgba(130, 143, 255, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'yTemp',
          borderWidth: 2
        },
        {
          label: 'Min Temp (°C)',
          type: 'line',
          data: minTemps,
          borderColor: '#a8b1ff',
          backgroundColor: 'rgba(168, 177, 255, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'yTemp',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: chartTextColor, font: { family: chartFontFamily, size: 11 } },
          position: 'top'
        }
      },
      scales: {
        x: {
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily } }
        },
        yTemp: {
          type: 'linear',
          position: 'left',
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily } },
          title: { display: true, text: 'Temperature (°C)', color: chartTextColor, font: { family: chartFontFamily } }
        },
        yRain: {
          type: 'linear',
          position: 'right',
          grid: { display: false }, // Avoid grid overlap
          ticks: { color: chartTextColor, font: { family: chartFontFamily } },
          title: { display: true, text: 'Rainfall (mm)', color: chartTextColor, font: { family: chartFontFamily } },
          min: 0
        }
      }
    }
  });
}

/**
 * Renders the 1-year historical NDVI vegetation health index line chart.
 * @param {array} ndviSeries - NDVI array: [{ date: "YYYY-MM-DD", ndvi: Float }]
 */
export function renderNdviChart(ndviSeries) {
  const ctx = document.getElementById('ndviChart').getContext('2d');

  if (ndviChartInstance) {
    ndviChartInstance.destroy();
  }

  const labels = ndviSeries.map(item => {
    const d = new Date(item.date);
    return d.toLocaleDateString(window.currentLanguage === 'ak' ? 'ak-GH' : 'en-US', { 
      month: 'short',
      year: '2-digit'
    });
  });
  
  const values = ndviSeries.map(item => item.ndvi);

  // Generate dynamic gradient underlay
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, 'rgba(94, 106, 210, 0.3)');
  gradient.addColorStop(1, 'rgba(94, 106, 210, 0.0)');

  ndviChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'NDVI Vegetation Health',
        data: values,
        borderColor: '#5e6ad2', // Brand Indigo
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: values.map(v => {
          if (v >= 0.6) return '#22c55e'; // Healthy Green
          if (v >= 0.4) return '#eab308'; // Warning Yellow
          return '#ef4444'; // Stressed Red
        }),
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily, size: 10 } }
        },
        y: {
          min: 0,
          max: 1.0,
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily } },
          title: { display: true, text: 'Health Index (NDVI)', color: chartTextColor, font: { family: chartFontFamily } }
        }
      }
    }
  });
}

/**
 * Renders the FAOSTAT historical yields comparison bar chart.
 * @param {array} yieldStats - Stats array: [{ Year: Int, Value: Float, Unit: String }]
 * @param {string} cropName - Label for the crop being displayed
 */
export function renderBenchmarkChart(yieldStats, cropName) {
  const ctx = document.getElementById('benchmarkChart').getContext('2d');

  if (benchmarkChartInstance) {
    benchmarkChartInstance.destroy();
  }

  const labels = yieldStats.map(item => item.Year);
  const values = yieldStats.map(item => item.Value);
  const unit = yieldStats[0]?.Unit || 'tonnes/ha';

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, 'rgba(94, 106, 210, 0.4)');
  gradient.addColorStop(1, 'rgba(130, 143, 255, 0.1)');

  benchmarkChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `${cropName} Yield (${unit})`,
        data: values,
        backgroundColor: gradient,
        borderColor: '#5e6ad2',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: chartTextColor, font: { family: chartFontFamily } }
        }
      },
      scales: {
        x: {
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily } }
        },
        y: {
          grid: { color: chartGridColor },
          ticks: { color: chartTextColor, font: { family: chartFontFamily } },
          title: { display: true, text: `Yield (${unit})`, color: chartTextColor, font: { family: chartFontFamily } }
        }
      }
    }
  });
}
