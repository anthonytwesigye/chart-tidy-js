// load tidy JS
const { tidy, mutate, arrange, desc, groupBy, summarize, n } = Tidy;

// pushing the data outside: challenge it cannot feed the chart as it is a promise from tidy js aggregation

// const allData = [];

// event listener on the button to get the data
const uploadsuccess = document
  .getElementById("uploadsuccess")
  .addEventListener("click", () => {
    // check file extension
    const fileExtension = document
      .getElementById("UploadFile")
      .files[0].name.split(".")
      .pop()
      .toLowerCase();
    // console.log(fileExtension);

    if (fileExtension === "csv") {
      // csv workflow
      Papa.parse(document.getElementById("UploadFile").files[0], {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (answer) {
          // allData.push(answer.data);

          ////////////////// create dropdown for aggregation //////////////////
          const sel = document.getElementById("aggregateid");

          const dropdownData = Object.keys(answer.data[0]);

          for (let j = 0; j < dropdownData.length; j++) {
            const opt = document.createElement("option");
            opt.value = dropdownData[j];
            opt.text = dropdownData[j];

            sel.add(opt);
          }

          // initial selection
          let selectedOption = dropdownData[0];

          let chartInitData = createInitChartData(answer.data, selectedOption);

          // init renderer
          const myChart = new Chart(
            document.getElementById("myChart"),
            chartInitData.initConfig
          );

          // event listener on the dropdown
          sel.addEventListener("change", function (optiondata) {
            selectedOption = sel.value;
            // console.log(selectedOption);

            // get updated data
            const chartUpdatedtData = createUpdatedChartData(
              answer.data,
              selectedOption
            );

            myChart.data.labels = chartUpdatedtData.updateLabels;
            myChart.data.datasets[0].data = chartUpdatedtData.updateData;
            myChart.update();
          });
        },
      });
    }

    // Handle excel file
    if (fileExtension === "xlsx" || fileExtension === "xls") {
      //
      const excel_file = document.getElementById("UploadFile");
      var reader = new FileReader();

      reader.readAsArrayBuffer(excel_file.files[0]);

      reader.onload = function (event) {
        var data = new Uint8Array(reader.result);

        var work_book = XLSX.read(data, { type: "array", raw: true });

        var sheet_names = work_book.SheetNames;

        var sheet_data = XLSX.utils.sheet_to_json(
          work_book.Sheets[sheet_names[0]],
          {
            header: 1,
          }
        );
        // console.log(sheet_data);
        const dataHeaders = sheet_data[0];
        const dataRows = sheet_data;
        dataRows.shift();
        // console.log(dataHeaders);
        const jsonObjects = [];

        dataRows.forEach((row) => {
          const dataForObject = {};

          dataHeaders.forEach((field, i) => {
            const key = field;
            dataForObject[key] = row[i];
          });

          jsonObjects.push(dataForObject);
        });

        // console.log(jsonObjects);

        ////////////////// create dropdown for aggregation //////////////////
        const sel = document.getElementById("aggregateid");

        const dropdownData = Object.keys(jsonObjects[0]);

        for (let j = 0; j < dropdownData.length; j++) {
          const opt = document.createElement("option");
          opt.value = dropdownData[j];
          opt.text = dropdownData[j];

          sel.add(opt);
        }

        // initial selection
        let selectedOption = dropdownData[0];

        let chartInitData = createInitChartData(jsonObjects, selectedOption);

        // init renderer
        const myChart = new Chart(
          document.getElementById("myChart"),
          chartInitData.initConfig
        );

        // event listener on the dropdown
        sel.addEventListener("change", function (optiondata) {
          selectedOption = sel.value;
          // console.log(selectedOption);

          // get updated data
          const chartUpdatedtData = createUpdatedChartData(
            jsonObjects,
            selectedOption
          );

          myChart.data.labels = chartUpdatedtData.updateLabels;
          myChart.data.datasets[0].data = chartUpdatedtData.updateData;
          myChart.update();
        });

        ////// end of chart //////
      };
    }

    // Handle geojson
    if (fileExtension === "geojson") {
      // console.log(fileExtension);
      // get the file
      const geojson_file = document.getElementById("UploadFile").files[0];
      // create a file reader and pass the file to it
      var reader = new FileReader();
      reader.readAsText(geojson_file);
      reader.onload = function (e) {
        try {
          const fileText = e.target.result;
          const geojsonData = JSON.parse(fileText);
          // console.log(geojsonData);
          // data to chart
          const featuresData = geojsonData.features;
          // console.log(featuresData);
          const jsonObjects = [];
          featuresData.forEach((feature) => {
            jsonObjects.push(feature.properties);
          });
          // console.log(jsonObjects);

          // create dropdown for aggregation
          const sel = document.getElementById("aggregateid");

          const dropdownData = Object.keys(jsonObjects[0]);

          for (let j = 0; j < dropdownData.length; j++) {
            const opt = document.createElement("option");
            opt.value = dropdownData[j];
            opt.text = dropdownData[j];

            sel.add(opt);
          }

          // initial selection
          let selectedOption = dropdownData[0];
          console.log(selectedOption);

          let chartInitData = createInitChartData(jsonObjects, selectedOption);

          // init renderer
          const myChart = new Chart(
            document.getElementById("myChart"),
            chartInitData.initConfig
          );

          // event listener on the dropdown
          sel.addEventListener("change", function (optiondata) {
            selectedOption = sel.value;
            // console.log(selectedOption);

            // get updated data
            const chartUpdatedtData = createUpdatedChartData(
              jsonObjects,
              selectedOption
            );

            myChart.data.labels = chartUpdatedtData.updateLabels;
            myChart.data.datasets[0].data = chartUpdatedtData.updateData;
            myChart.update();
          });
          // end of chart
          ////// leaflet map //////
          const uniqAttributeCat = getUniqueCatValues(
            geojsonData,
            selectedOption
          );
          const addLayerToMap = addDataToMap(
            geojsonData,
            uniqAttributeCat,
            selectedOption
          );
        } catch (e) {
          alert("Unable to read file as GeoJSON.");
        }
      };
    }
  });

// #region ////////////////  Leaflet  //////////////////

// map initialisation
var map = L.map("map").setView([-17.926409198529797, 19.777738998189392], 13);
// osm layer
var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});
osm.addTo(map);

// tile layers
// water color
var watercolor = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}",
  {
    minZoom: 1,
    maxZoom: 16,
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "jpg",
  }
);

// dark matter
var darkMatter = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }
);

// google street
googleStreets = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

// layer controller
var baseLayers = {
  OpenStreetMap: osm,
  WaterColor: watercolor,
  "Dark Matter": darkMatter,
  "Google Streets": googleStreets,
};

var overlays = {};

L.control
  .layers(baseLayers, overlays, {
    collapsed: false,
  })
  .addTo(map);

// #endregion

// #region ////////////  FUNCTIONS  //////////////////

// Function to create a popup with feature properties
function createPopupContent(properties) {
  let content = '<div class="popup-content"><table>';
  for (const key in properties) {
    content += `<tr><th>${key}</th><td>${properties[key]}</td></tr>`;
  }
  content += "</table></div>";
  return content;
}

// function for preparing initial chart data
function createInitChartData(loadeddata, grpoption) {
  //  tidy JS part
  const results = tidy(
    loadeddata,
    groupBy(grpoption, [summarize({ count: n() })])
  );

  // console.log(results);

  //  chart JS starts here
  const myData = results.map(function (item) {
    return item["count"];
  });
  const myLabs = results.map(function (item) {
    return item[grpoption];
  });

  // chart js setup
  const data = {
    labels: myLabs,
    datasets: [
      {
        label: "# count",
        data: myData,
        borderWidth: 1,
      },
    ],
  };

  // config
  const config = {
    type: "bar",
    data,
    options: {
      scales: {
        x: {
          grid: {
            drawOnChartArea: false,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              //   console.log(tooltipItem.datasetIndex);
              //   console.log(tooltipItem.dataIndex);
              //   console.log(tooltipItem.chart.data.datasets[0]);
              //   reducing
              const arrData = tooltipItem.chart.data.datasets[0].data;
              const dataSum = arrData.reduce((a, b) => a + b, 0);
              const dataLab = (
                (tooltipItem.chart.data.datasets[0].data[
                  tooltipItem.dataIndex
                ] /
                  dataSum) *
                100
              ).toFixed(1);
              return ` ${dataLab} %, Count: ${
                tooltipItem.chart.data.datasets[0].data[tooltipItem.dataIndex]
              }`;
            },
            // afterTitle: (context) => {
            //   return "--------";
            // },
          },
        },
      },
    },
  };

  const dataForChart = { initConfig: config };

  return dataForChart;
}

// function for preparing initial chart data
function createUpdatedChartData(loadeddata, grpoption) {
  // update data
  const resultsUpdated = tidy(
    loadeddata,
    groupBy(grpoption, [summarize({ count: n() })])
  );

  //  update chart JS
  let myDataUpdated = resultsUpdated.map(function (item) {
    return item["count"];
  });
  let myLabsUpdated = resultsUpdated.map(function (item) {
    return item[grpoption];
  });

  const dataForChart = {
    updateLabels: myLabsUpdated,
    updateData: myDataUpdated,
  };

  return dataForChart;
}

// function for adding data to map
function addDataToMap(inputData, attributecats, mapattribute) {
  //get layer type
  const layerGeomType = getLayerGeomTypes(inputData)[0];

  if ((layerGeomType === "Point") | (layerGeomType === "MultiPoint")) {
    const mapData = L.geoJSON(inputData, {
      pointToLayer: function (feature, latlng) {
        const currColor = getPropColor(
          attributecats,
          feature.properties[mapattribute]
        );
        return L.marker(latlng, {
          icon: colorMarker(currColor),
        });
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          layer.bindPopup(createPopupContent(feature.properties), {
            autoPan: true,
            maxHeight: 300, // Set max height for the popup
          });
          layer.on("click", function () {
            this.openPopup();
          });
        }
      },
    }).addTo(map);
    map.fitBounds(mapData.getBounds());
  } else {
    const mapData = L.geoJSON(inputData, {
      onEachFeature: function (feature, layer) {
        if (feature.properties) {
          layer.bindPopup(createPopupContent(feature.properties), {
            autoPan: true,
            maxHeight: 300, // Set max height for the popup
          });
          layer.on("click", function () {
            this.openPopup();
          });
        }
      },
      sytle: function (feature) {
        const currColor = getPropColor(
          attributecats,
          feature.properties[mapattribute]
        );
        const myStyle = {
          color: currColor,
          // weight: 5,
          // opacity: 0.65,
        };
        return myStyle;
      },
    }).addTo(map);
    map.fitBounds(mapData.getBounds());
  }
}

// function for getting unique values for a column of geojson data
function getUniqueCatValues(geojsondata, field) {
  const uniqueCategories = [
    ...new Set(
      geojsondata.features.map((feature) => feature.properties[field])
    ),
  ];

  return uniqueCategories;
}

// function for returning color based on a unique array
function getPropColor(uniqarray, prop) {
  const colorsForProperties = uniqarray.map((entry, i) => {
    const colorRamp = [
      "#a6cee3",
      "#1f78b4",
      "#b2df8a",
      "#33a02c",
      "#fb9a99",
      "#e31a1c",
      "#fdbf6f",
      "#ff7f00",
      "#cab2d6",
      "#6a3d9a",
      "#ffff99",
      "#b15928",
      "#999999",
    ];
    switch (i) {
      case 0:
        //   return { index: i, data: entry, color: colorRamp[i] };
        return { data: entry, color: colorRamp[i] };
        break;
      case 1:
        return { data: entry, color: colorRamp[i] };
        break;
      case 2:
        return { data: entry, color: colorRamp[i] };
        break;
      case 3:
        return { data: entry, color: colorRamp[i] };
        break;
      case 4:
        return { data: entry, color: colorRamp[i] };
        break;
      case 5:
        return { data: entry, color: colorRamp[i] };
        break;
      case 6:
        return { data: entry, color: colorRamp[i] };
        break;
      case 7:
        return { data: entry, color: colorRamp[i] };
        break;
      case 8:
        return { data: entry, color: colorRamp[i] };
        break;
      case 9:
        return { data: entry, color: colorRamp[i] };
        break;
      case 10:
        return { data: entry, color: colorRamp[i] };
        break;
      case 11:
        return { data: entry, color: colorRamp[i] };
        break;
      default:
        return { data: entry, color: colorRamp[colorRamp.length] };
    }
  });

  return colorsForProperties[uniqarray.indexOf(prop)].color;
}

// function get layer geometry types

function getLayerGeomTypes(geojsondata) {
  const uniqueTypes = [
    ...new Set(geojsondata.features.map((feature) => feature.geometry.type)),
  ];

  return uniqueTypes;
}

// the function creates colorful svg
function colorMarker(color) {
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker">
      <path fill-opacity=".25" d="M16 32s1.427-9.585 3.761-12.025c4.595-4.805 8.685-.99 8.685-.99s4.044 3.964-.526 8.743C25.514 30.245 16 32 16 32z"/>
      <path stroke="#fff" fill="${color}" d="M15.938 32S6 17.938 6 11.938C6 .125 15.938 0 15.938 0S26 .125 26 11.875C26 18.062 15.938 32 15.938 32zM16 6a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>`;

  const icon = L.divIcon({
    className: "marker",
    html: svgTemplate,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });

  return icon;
}

// #endregion
