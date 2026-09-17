// Cloudflare Worker endpoint for revenue calculations.
const API_URL = "https://billowing-firefly-d0a3.ruben-joaquin.workers.dev/api/calculate";

const dataColor = "#5B7FA3";
const dataLabelBG = "transparent";
const legendBG = "#FFF";

const alternatingRowColorPlugin = {
  id: 'alternatingRowColorPlugin',
  beforeDraw(chart, args, options) {
    const ctx = chart.ctx;
    const yAxis = chart.scales['y'];
    const chartArea = chart.chartArea;

    if (!yAxis) return;

    const tickGap = yAxis.getPixelForTick(1) - yAxis.getPixelForTick(0);

    ctx.save();
    ctx.fillStyle = options.oddRowColor || 'rgba(235, 235, 235, 0.70)';

    yAxis.ticks.forEach((tick, index) => {
      if (index % 2 === 0) {
        const yStart = yAxis.getPixelForTick(index);
        ctx.fillRect(chartArea.left, yStart, chartArea.right - chartArea.left, -tickGap);
      }
    });

    ctx.restore();
  }
};

Chart.register(alternatingRowColorPlugin);


class RoiCalculator extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector("form");
    this.roiChart = this.roiChartInit;
    this.form.addEventListener("submit", this.showRoi.bind(this));
  }

    roiChartInit = new Chart(this.querySelector("form #roi-chart"), {
        type: "bar",
        data: {
          labels: ["", "", "", "", ""],
          datasets: [
            {
              label: "Revenue",
              data: [0, 0, 0, 0, 0],
              borderWidth: 1,
              backgroundColor: dataColor
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              backgroundColor: legendBG
          },
            y: {
              beginAtZero: true,
              ticks: {
                // Convert thousands to "k" and make font bold
                callback: function(value, index, values) {
                    if (value >= 1000) {
                        return value / 1000 + 'k';
                    }
                    return value;
                },
                font: {
                    weight: 'bold'
                }
            }
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Impact On Revenue",
              font: {
                  weight: "bold",
                  size: "20px"
              },
              padding: 20,
            },
            legend: {
              display: false,
            },
            datalabels: {
              anchor: "end",
              align: "top",
              backgroundColor: dataLabelBG,
              formatter: function (value) {
                  return value < 1000000 ? ((value < 1000) ? value : (value / 1000).toFixed(2) + "k") : (value / 1000000).toFixed(2) + "m";
              },
            },
            alternatingRowColorPlugin: {
              oddRowColor: 'rgba(235, 235, 235, 0.70)'
            }
          },
        },

        plugins: [ChartDataLabels],
      });
    
  async showRoi(event) {
    event.preventDefault();
    const inputs = Object.fromEntries(
      Array.from(new FormData(this.form), ([name, value]) => [name, Number(value)])
    );
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    const { labels, revenueDeltas } = await response.json();

    this.roiChart.data.labels = labels;
    this.roiChart.data.datasets[0].data = revenueDeltas;
    this.form.querySelector("#roi-chart").classList.remove("hidden");
    this.roiChart.update();
  }
}

customElements.define("roi-calculator", RoiCalculator);
