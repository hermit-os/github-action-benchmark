"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INDEX_HTML = void 0;
exports.DEFAULT_INDEX_HTML = String.raw`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benchmark Results</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.2/dist/Chart.min.js"></script>
  <script src="data.js"></script>
  <style>
    /* Add some basic styling for the tabs and content */
    html {
      font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #fff;
      font-size: 16px;
    }

    body {
      color: #4a4a4a;
      margin: 8px;
      font-size: 1em;
      font-weight: 400;
    }

    header {
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
    }

    main {
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    a {
      color: #3273dc;
      cursor: pointer;
      text-decoration: none;
    }

    a:hover {
      color: #000;
    }

    button {
      color: #fff;
      background-color: #3298dc;
      border-color: transparent;
      cursor: pointer;
      text-align: center;
    }

    button:hover {
      background-color: #2793da;
      flex: none;
    }

    .spacer {
      flex: auto;
    }

    .small {
      font-size: 0.75rem;
    }

    footer {
      margin-top: 16px;
      display: flex;
      align-items: center;
    }

    .header-label {
      margin-right: 4px;
    }

    .benchmark-set {
      margin: 8px 0;
      width: 100%;
      flex-direction: column;
      align-items: center;
    }

    .benchmark-title {
      font-size: 3rem;
      font-weight: 600;
      word-break: break-word;
      text-align: center;
      align-items: center;
    }

    .benchmark-graphs {
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
    }

    .benchmark-chart {
      max-width: 1000px;
      margin-left: auto;
      margin-right: auto;
    }

    .tab {
      display: none;
    }

    .tab.active {
      display: block;
    }

    .tab-buttons {
      display: flex;
      justify-content: center;
      margin-bottom: 5px;
    }

    .tab-button {
      cursor: pointer;
      padding: 10px 20px;
      background-color: #ddd;
      border: 1px solid #ccc;
      border-radius: 12px;
      margin: 10px;
    }

    .tab-button.active {
      background-color: #ff38388f;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div id="header">
    <div class="header-item">
      <strong class="header-label">Last Update:</strong>
      <span id="last-update"></span>
    </div>
    <div class="header-item">
      <strong class="header-label">Repository:</strong>
      <a id="repository-link" rel="noopener"></a>
    </div>
  </div>
  <div id="tab-container">
    <div class="tab-buttons" id="tab-buttons"></div>
    <div id="main"></div>
  </div>
  <footer>
    <button id="dl-button">Download data as JSON</button>
    <div class="spacer"></div>
    <div class="small">Powered by <a rel="noopener"
        href="https://github.com/marketplace/actions/continuous-benchmark">github-action-benchmark</a></div>
  </footer>

  <script id="main-script">
    'use strict';
    (function () {
      const toolColors = {
        cargo: '#dea584',
        go: '#00add8',
        benchmarkjs: '#f1e05a',
        benchmarkluau: '#000080',
        pytest: '#3572a5',
        googlecpp: '#f34b7d',
        catch2: '#f34b7d',
        julia: '#a270ba',
        jmh: '#b07219',
        benchmarkdotnet: '#178600',
        customBiggerIsBetter: '#38ff38',
        customSmallerIsBetter: '#ff3838',
        _: '#333333'
      };

      function init() {
        function collectBenchesPerTestCase(entries) {
          const map = new Map();
          for (const entry of entries) {
            const { commit, date, tool, benches } = entry;
            for (const bench of benches) {
              const result = { commit, date, tool, bench };
              const arr = map.get(bench.name);
              if (arr === undefined) {
                map.set(bench.name, [result]);
              } else {
                arr.push(result);
              }
            }
          }
          return map;
        }

        const data = window.BENCHMARK_DATA;

        // Render header
        document.getElementById('last-update').textContent = new Date(data.lastUpdate).toString();
        const repoLink = document.getElementById('repository-link');
        repoLink.href = data.repoUrl;
        repoLink.textContent = data.repoUrl;

        // Render footer
        document.getElementById('dl-button').onclick = () => {
          const dataUrl = 'data:,' + JSON.stringify(data, null, 2);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'benchmark_data.json';
          a.click();
        };

        // Prepare data points for charts
        return Object.keys(data.entries).map(name => ({
          name,
          dataSet: collectBenchesPerTestCase(data.entries[name]),
        }));
      }

      function renderAllCharts(dataSets) {
        const groups = new Map();

        // Group dataSets by 'group' key
        for (const { name, dataSet } of dataSets) {
          for (const [benchName, benches] of dataSet.entries()) {
            for (const bench of benches) {
              const group = bench.bench.group || 'default';
              if (!groups.has(group)) {
                groups.set(group, []);
              }
              groups.get(group).push({ name: benchName, benches });
            }
          }
        }

        const tabButtonsContainer = document.getElementById('tab-buttons');
        const mainContainer = document.getElementById('main');

        groups.forEach((groupData, groupName) => {
          // Create tab button
          const tabButton = document.createElement('div');
          tabButton.className = 'tab-button';
          tabButton.textContent = groupName;
          tabButtonsContainer.appendChild(tabButton);

          // Create tab content container
          const tabContent = document.createElement('div');
          tabContent.className = 'tab';
          mainContainer.appendChild(tabContent);

          tabButton.onclick = () => {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            tabContent.classList.add('active');
            tabButton.classList.add('active');
          };

          if (groups.size === 1) {
            tabButton.classList.add('active');
            tabContent.classList.add('active');
          }

          // Create a Set to keep track of rendered names
          const renderedNames = new Set();

          // Iterate over groupData array
          groupData.forEach(({ name, benches }) => {
            // Check if the name has already been rendered
            if (!renderedNames.has(name)) {
              // Render the graph for this name
              renderGraph(tabContent, name, benches);

              // Add the name to the set of rendered names
              renderedNames.add(name);
            }
          });
        });
      }

      function renderGraph(parent, name, dataset) {
        const canvas = document.createElement('canvas');
        canvas.className = 'benchmark-chart';
        parent.appendChild(canvas);

        const color = toolColors[dataset.length > 0 ? dataset[0].tool : '_'];
        const data = {
          labels: dataset.map(d => d.commit.id.slice(0, 7)),
          datasets: [
            {
              label: name,
              data: dataset.map(d => d.bench.value),
              borderColor: color,
              backgroundColor: color + '60',
            }
          ],
        };
        const options = {
          scales: {
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: 'commit',
                },
              }
            ],
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: dataset.length > 0 ? dataset[0].bench.unit : '',
                },
                ticks: {
                  beginAtZero: true,
                }
              }
            ],
          },
          tooltips: {
            callbacks: {
              afterTitle: items => {
                const { index } = items[0];
                const data = dataset[index];
                return '\n' + data.commit.message + '\n\n' + data.commit.timestamp + ' committed by @' + data.commit.committer.username + '\n';
              },
              label: item => {
                let label = item.value;
                const { range, unit } = dataset[item.index].bench;
                label += ' ' + unit;
                if (range) {
                  label += ' (' + range + ')';
                }
                return label;
              },
              afterLabel: item => {
                const { extra } = dataset[item.index].bench;
                return extra ? '\n' + extra : '';
              }
            }
          },
          onClick: (_mouseEvent, activeElems) => {
            if (activeElems.length === 0) {
              return;
            }
            const index = activeElems[0]._index;
            const url = dataset[index].commit.url;
            window.open(url, '_blank');
          },
        };

        new Chart(canvas, {
          type: 'line',
          data,
          options,
        });
      }

      renderAllCharts(init());
    })();
  </script>
</body>

</html>`;
