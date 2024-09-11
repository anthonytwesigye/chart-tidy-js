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

// function for preparing initial boxplot data
function createInitBoxplotData(loadeddata, grpoption) {
  // console.log(loadeddata);

  //  chart JS starts here
  const myData = loadeddata.map(function (item) {
    return item[grpoption];
  });
  const myLabs = [grpoption];

  // chart js setup
  const data = {
    labels: myLabs,
    datasets: [
      {
        label: grpoption,
        outlierColor: "#999999",
        itemRadius: 5,
        data: [myData],
        borderWidth: 1,
      },
    ],
  };

  // config
  const config = {
    type: "boxplot",
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

// function for preparing initial chart data
function createUpdatedBoxplotData(loadeddata, grpoption) {
  //  update chart JS
  let myDataUpdated = loadeddata.map(function (item) {
    return item[grpoption];
  });
  let myLabsUpdated = grpoption;

  const dataForChart = {
    updateLabels: myLabsUpdated,
    updateData: myDataUpdated,
  };

  return dataForChart;
}

// function for handling guage chart data
function createGuageChartData(loadeddata, grpoption) {
  const totalcount = loadeddata.length;

  //  tidy JS part
  const results = tidy(
    loadeddata,
    groupBy(grpoption, [summarize({ count: n() })])
  );
  const duplicates = [];
  const uniqueIds = [];
  // process the data
  results.forEach(function (item) {
    if (item["count"] > 1) {
      duplicates.push(item["count"]);
    }
    if (item["count"] < 2) {
      uniqueIds.push(item["count"]);
    }
  });

  // duplicate summary table data
  const duplicatesData = results.filter((item) => {
    return item["count"] > 1;
  });

  const percentDupls = (
    (duplicates.reduce((a, b) => a + b, 0) / totalcount) *
    100
  ).toFixed(1);
  const percentUnique = ((uniqueIds.length / totalcount) * 100).toFixed(1);

  // console.log(`percentDupls: ${percentDupls}`);
  // console.log(`percentUnique: ${percentUnique}`);

  //  chart JS starts here
  const myData = [percentUnique, percentDupls];
  const myLabs = ["% Unique", "% Non-Unique"];

  // chart js setup
  const data = {
    labels: myLabs,
    datasets: [
      {
        label: "",
        data: myData,
        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 26, 104, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 26, 104, 1)"],
        borderWidth: 1,
        hoverOffset: 35,
      },
    ],
  };

  // config
  const config = {
    type: "doughnut",
    data,
    options: {
      aspectRation: 0.5,
      circumference: 180,
      rotation: 270,
      radius: "100%",
      plugins: {
        legend: false,
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
        },
      },
    },
  };
  // console.log(duplicatesData);
  const dataForChart = { initConfig: config, duplicatesTData: duplicatesData };

  return dataForChart;
}

function createDuplicatesTable(tabledata) {
  const summary = `<p> Duplicates summary</p3>`;
  let tabHead = `<div id="duplicatestable"><table>
    <tr>
      <th>Property</th>
      <th>Count</th>
    </tr>`;
  const tableEnd = "</table></div>";

  for (let index = 0; index < tabledata.length; index++) {
    const currentObjVals = Object.values(tabledata[index]);

    tabHead += `<tr>
      <td>${currentObjVals[0]}</td>
      <td>${currentObjVals[1]}</td>
    </tr>`;
  }

  return summary + tabHead + tableEnd;
}

// function for adding data to map
function addDataToMap(inputData, attributecats, mapattribute) {
  //get layer type
  const layerGeomType = getLayerGeomTypes(inputData)[0];

  if (layerGeomType === "Point" || layerGeomType === "MultiPoint") {
    mapData = L.geoJSON(inputData, {
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
    mapData = L.geoJSON(inputData, {
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
      style: function (feature) {
        const currpolColor = getPropColor(
          attributecats,
          feature.properties[mapattribute]
        );
        // console.log(currpolColor);
        const currStyle = {
          fillColor: currpolColor,
          weight: 0.1,
          opacity: 1,
          color: "white",
          dashArray: "",
          fillOpacity: 0.7,
        };
        return currStyle;
      },
    }).addTo(map);
    map.fitBounds(mapData.getBounds());
  }
}
function updateDataOnMap(inputData, attributecats, mapattribute) {
  //get layer type
  const layerGeomType = getLayerGeomTypes(inputData)[0];

  if (layerGeomType === "Point" || layerGeomType === "MultiPoint") {
    // recreate the layer as other options did not work for markers
    mapData = L.geoJSON(inputData, {
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
  } else {
    mapData.setStyle(function (feature) {
      const currpolColor = getPropColor(
        attributecats,
        feature.properties[mapattribute]
      );
      // console.log(currpolColor);
      const currStyle = {
        fillColor: currpolColor,
        weight: 1,
        opacity: 1,
        color: currpolColor,
        dashArray: "",
        fillOpacity: 1,
      };
      return currStyle;
    });
  }
}

// function for getting unique values for a column of geojson data
function getUniqueAttributeValsGeojson(geojsondata, field) {
  const uniqueCategories = [
    ...new Set(
      geojsondata.features.map((feature) => feature.properties[field])
    ),
  ];

  return uniqueCategories;
}
// function for getting unique values for a column of json data
function getUniqueAttributeVals(jsondata, field) {
  const uniqueCategories = [...new Set(jsondata.map((item) => item[field]))];

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
        return { data: entry, color: colorRamp[colorRamp.length - 1] };
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

// get attribute data type from json
function getAttributeTypeJson(jsondata, attribute) {
  let uniqueTypes;
  const re = new RegExp(/^-?[0-9]{1,}$|^[0-9]{1,}\.[0-9]{1,}$/, "g");
  if ("features" in jsondata) {
    uniqueTypes = [
      ...new Set(
        jsondata.features.map((feature) => {
          const currPropGeojson = String(feature.properties[attribute]);
          const checkNumGeojson = currPropGeojson.match(re);
          // console.log(`Regex match: ${checkNumGeojson}`);
          if (checkNumGeojson) {
            return "number";
          } else {
            return typeof currPropGeojson;
          }
        })
      ),
    ];
  } else {
    uniqueTypes = [
      ...new Set(
        jsondata.map((feature) => {
          const currProp = String(feature[attribute]);
          const checkNum = currProp.match(re);
          // console.log(`Regex match: ${checkNum}`);
          // console.log(`Value for match: ${currProp}`);
          if (checkNum) {
            return "number";
          } else {
            return typeof currProp;
          }
        })
      ),
    ];
  }

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

// the function for filtering data based on properties of an attribute

function dynamicFilter(data, filterarray, attr) {
  let filteredData;
  if (filterarray.length > 0) {
    filteredData = data.filter((item) => {
      for (const element of filterarray) {
        if (item[attr].includes(element)) {
          return true;
        }
      }
    });
  } else {
    filteredData = data;
  }

  return filteredData;
}

// #endregion
