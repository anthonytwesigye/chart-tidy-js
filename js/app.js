// load tidy JS
const { tidy, mutate, arrange, desc, groupBy, summarize, n } = Tidy;
// global objects and variables

let filterOpts;
let initData;
let analysisData;
let initMapData;
let selectedOption;
let selectedFilterOpts = [];

let dataAttributeProps;
let updateUniqAttributeCat;

// init chart variable
let myChart;
let duplicatesChart;

var mapData;
let chartStatus = Chart.getChart("myChart"); // <canvas> id
let guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id

// on file input change reset the selection dropdown

document.getElementById("UploadFile").addEventListener("input", () => {
  const selectionDrop = document.getElementById("aggregateid");

  if (selectionDrop) {
    selectionDrop.innerHTML = null;
  }
});

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

    if (
      fileExtension === "csv" ||
      fileExtension === "xlsx" ||
      fileExtension === "xls"
    ) {
      // csv workflow
      const data_file = document.getElementById("UploadFile").files[0];

      // get data from files
      (async () => {
        let jsonData;

        if (fileExtension == "csv") {
          const csvData = await readCSVFile(data_file);
          jsonData = csvData;
          console.log("async csv");
        }
        if (fileExtension == "xlsx" || fileExtension == "xls") {
          const excelData = await readExcelFile(data_file);
          jsonData = excelData;
          console.log("async xls");
        }
        console.log(jsonData);

        // data analysis and visualization

        ////////////////// create dropdown for aggregation //////////////////
        const sel = document.getElementById("aggregateid");

        dataAttributeProps = Object.keys(jsonData[0]);

        for (let j = 0; j < dataAttributeProps.length; j++) {
          const opt = document.createElement("option");
          opt.value = dataAttributeProps[j];
          opt.text = dataAttributeProps[j];

          sel.add(opt);
        }

        // initial selection
        selectedOption = dataAttributeProps[0];
        // set initial data
        initData = jsonData;
        analysisData = initData;

        filterOpts = getUniqueAttributeVals(analysisData, selectedOption).map(
          (item) => {
            return {
              value: item,
              text: item,
            };
          }
        );

        // add options to the filter
        new MultiSelect("#filter1id", {
          data: filterOpts,
          placeholder: "Select option",
          search: true,
          selectAll: true,
          listAll: true,
          max: null,
          onSelect: function (value, text, element) {
            // console.log("select:", value);
            selectedFilterOpts.push(value);

            // updated analysis data
            analysisData = dynamicFilter(
              initData,
              selectedFilterOpts,
              sel.value
            );
            // console.log(`Current data num: ${analysisData.length}`);
            attributeType = getAttributeTypeJson(analysisData, selectedOption);
            console.log(`Attribute: ${selectedOption}, Type: ${attributeType}`);
            // remove old chart before creating a new one
            chartStatus = Chart.getChart("myChart"); // <canvas> id
            if (chartStatus != undefined) {
              chartStatus.destroy();
            }

            if (attributeType[0] === "number") {
              // get updated data
              const boxplotUpdatedtData = createUpdatedBoxplotData(
                analysisData,
                selectedOption
              );

              boxplotInitData = createInitBoxplotData(
                analysisData,
                selectedOption
              );
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                boxplotInitData.initConfig
              );
            } else {
              // get updated data
              const chartUpdatedtData = createUpdatedChartData(
                analysisData,
                selectedOption
              );
              chartInitData = createInitChartData(analysisData, selectedOption);
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                chartInitData.initConfig
              );
            }
            // guage
            guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
            if (guageChartStatus != undefined) {
              guageChartStatus.destroy();
            }
            let guageData = createGuageChartData(analysisData, selectedOption);
            duplicatesChart = new Chart(
              document.getElementById("duplicatesChart"),
              guageData.initConfig
            );
            // add duplicates summary table
            document.getElementById("duplicatesData").innerHTML =
              createDuplicatesTable(guageData.duplicatesTData);
          },
          onUnselect: function (value, text, element) {
            // console.log("un select:", value);
            selectedFilterOpts.splice(selectedFilterOpts.indexOf(value), 1);

            // updated analysis data
            analysisData = dynamicFilter(
              initData,
              selectedFilterOpts,
              sel.value
            );
            // console.log(`Current data num: ${analysisData.length}`);
            attributeType = getAttributeTypeJson(analysisData, selectedOption);
            console.log(`Attribute: ${selectedOption}, Type: ${attributeType}`);
            // remove old chart before creating a new one
            chartStatus = Chart.getChart("myChart"); // <canvas> id
            if (chartStatus != undefined) {
              chartStatus.destroy();
            }

            if (attributeType[0] === "number") {
              // get updated data
              const boxplotUpdatedtData = createUpdatedBoxplotData(
                analysisData,
                selectedOption
              );

              boxplotInitData = createInitBoxplotData(
                analysisData,
                selectedOption
              );
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                boxplotInitData.initConfig
              );
            } else {
              // get updated data
              const chartUpdatedtData = createUpdatedChartData(
                analysisData,
                selectedOption
              );
              chartInitData = createInitChartData(analysisData, selectedOption);
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                chartInitData.initConfig
              );
            }
            // guage
            guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
            if (guageChartStatus != undefined) {
              guageChartStatus.destroy();
            }
            let guageData = createGuageChartData(analysisData, selectedOption);
            duplicatesChart = new Chart(
              document.getElementById("duplicatesChart"),
              guageData.initConfig
            );
            // add duplicates summary table
            document.getElementById("duplicatesData").innerHTML =
              createDuplicatesTable(guageData.duplicatesTData);
          },
        });

        // console.log(`Selected option: ${selectedOption}`);
        let attributeType = getAttributeTypeJson(analysisData, selectedOption);

        chartStatus = Chart.getChart("myChart"); // <canvas> id
        if (chartStatus != undefined) {
          chartStatus.destroy();
        }

        if (attributeType[0] === "number") {
          let boxplotInitData = createInitBoxplotData(
            analysisData,
            selectedOption
          );
          // init renderer
          myChart = new Chart(
            document.getElementById("myChart"),
            boxplotInitData.initConfig
          );
        } else {
          let chartInitData = createInitChartData(analysisData, selectedOption);
          // init renderer
          myChart = new Chart(
            document.getElementById("myChart"),
            chartInitData.initConfig
          );
        }

        // guage
        guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
        if (guageChartStatus != undefined) {
          guageChartStatus.destroy();
        }
        let guageData = createGuageChartData(analysisData, selectedOption);
        duplicatesChart = new Chart(
          document.getElementById("duplicatesChart"),
          guageData.initConfig
        );
        // add duplicates summary table
        document.getElementById("duplicatesData").innerHTML =
          createDuplicatesTable(guageData.duplicatesTData);

        // event listener on the dropdown
        sel.addEventListener("change", function (optiondata) {
          selectedOption = sel.value;
          // console.log(selectedOption);
          analysisData = initData;
          // update filter
          filterOpts = getUniqueAttributeVals(analysisData, selectedOption).map(
            (item) => {
              return {
                value: item,
                text: item,
              };
            }
          );

          // add options to the filter
          new MultiSelect("#filter1id", {
            data: filterOpts,
            placeholder: "Select option",
            search: true,
            selectAll: true,
            listAll: true,
            max: null,
            onSelect: function (value, text, element) {
              // console.log("select:", value);
              selectedFilterOpts.push(value);

              // updated analysis data
              analysisData = dynamicFilter(
                initData,
                selectedFilterOpts,
                sel.value
              );
              // console.log(`Current data num: ${analysisData.length}`);
              attributeType = getAttributeTypeJson(
                analysisData,
                selectedOption
              );
              console.log(
                `Attribute: ${selectedOption}, Type: ${attributeType}`
              );
              // remove old chart before creating a new one
              chartStatus = Chart.getChart("myChart"); // <canvas> id
              if (chartStatus != undefined) {
                chartStatus.destroy();
              }

              if (attributeType[0] === "number") {
                // get updated data
                const boxplotUpdatedtData = createUpdatedBoxplotData(
                  analysisData,
                  selectedOption
                );

                boxplotInitData = createInitBoxplotData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  boxplotInitData.initConfig
                );
              } else {
                // get updated data
                const chartUpdatedtData = createUpdatedChartData(
                  analysisData,
                  selectedOption
                );
                chartInitData = createInitChartData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  chartInitData.initConfig
                );
              }
              // guage
              guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
              if (guageChartStatus != undefined) {
                guageChartStatus.destroy();
              }
              let guageData = createGuageChartData(
                analysisData,
                selectedOption
              );
              duplicatesChart = new Chart(
                document.getElementById("duplicatesChart"),
                guageData.initConfig
              );
              // add duplicates summary table
              document.getElementById("duplicatesData").innerHTML =
                createDuplicatesTable(guageData.duplicatesTData);
            },
            onUnselect: function (value, text, element) {
              // console.log("un select:", value);
              selectedFilterOpts.splice(selectedFilterOpts.indexOf(value), 1);

              // updated analysis data
              analysisData = dynamicFilter(
                initData,
                selectedFilterOpts,
                sel.value
              );
              // console.log(`Current data num: ${analysisData.length}`);
              attributeType = getAttributeTypeJson(
                analysisData,
                selectedOption
              );
              console.log(
                `Attribute: ${selectedOption}, Type: ${attributeType}`
              );
              // remove old chart before creating a new one
              chartStatus = Chart.getChart("myChart"); // <canvas> id
              if (chartStatus != undefined) {
                chartStatus.destroy();
              }

              if (attributeType[0] === "number") {
                // get updated data
                const boxplotUpdatedtData = createUpdatedBoxplotData(
                  analysisData,
                  selectedOption
                );

                boxplotInitData = createInitBoxplotData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  boxplotInitData.initConfig
                );
              } else {
                // get updated data
                const chartUpdatedtData = createUpdatedChartData(
                  analysisData,
                  selectedOption
                );
                chartInitData = createInitChartData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  chartInitData.initConfig
                );
              }
              // guage
              guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
              if (guageChartStatus != undefined) {
                guageChartStatus.destroy();
              }
              let guageData = createGuageChartData(
                analysisData,
                selectedOption
              );
              duplicatesChart = new Chart(
                document.getElementById("duplicatesChart"),
                guageData.initConfig
              );
              // add duplicates summary table
              document.getElementById("duplicatesData").innerHTML =
                createDuplicatesTable(guageData.duplicatesTData);
            },
          });

          attributeType = getAttributeTypeJson(analysisData, selectedOption);
          console.log(`Attribute: ${selectedOption}, Type: ${attributeType}`);
          // remove old chart before creating a new one
          chartStatus = Chart.getChart("myChart"); // <canvas> id
          if (chartStatus != undefined) {
            chartStatus.destroy();
          }

          if (attributeType[0] === "number") {
            // get updated data
            const boxplotUpdatedtData = createUpdatedBoxplotData(
              analysisData,
              selectedOption
            );

            boxplotInitData = createInitBoxplotData(
              analysisData,
              selectedOption
            );
            // update renderer
            myChart = new Chart(
              document.getElementById("myChart"),
              boxplotInitData.initConfig
            );
          } else {
            // get updated data
            const chartUpdatedtData = createUpdatedChartData(
              analysisData,
              selectedOption
            );
            chartInitData = createInitChartData(analysisData, selectedOption);
            // update renderer
            myChart = new Chart(
              document.getElementById("myChart"),
              chartInitData.initConfig
            );
          }
          // guage
          guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
          if (guageChartStatus != undefined) {
            guageChartStatus.destroy();
          }
          let guageData = createGuageChartData(analysisData, selectedOption);
          duplicatesChart = new Chart(
            document.getElementById("duplicatesChart"),
            guageData.initConfig
          );
          // add duplicates summary table
          document.getElementById("duplicatesData").innerHTML =
            createDuplicatesTable(guageData.duplicatesTData);
        });
      })();
      document.getElementById("UploadFile").value = "";
      // remove chart
      if (chartStatus != undefined) {
        chartStatus.destroy();
      }
    }

    // Handle geojson
    if (fileExtension === "geojson" || fileExtension == "zip") {
      // console.log(fileExtension);
      // get the file
      const selected_file = document.getElementById("UploadFile").files[0];
      // // create a file reader and pass the file to it
      (async () => {
        let geojsonData;
        if (fileExtension == "geojson") {
          let textData = await readFileData(selected_file);
          geojsonData = JSON.parse(textData);
          console.log("async geojson");
          // console.log(geojsonData);
        }
        if (fileExtension == "zip") {
          const data = await selected_file.arrayBuffer();
          geojsonData = await shp(data);
          console.log("shapefile");
        }
        // console.log(geojsonData);

        // data analysis and visualization

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

        dataAttributeProps = Object.keys(jsonObjects[0]);

        for (let j = 0; j < dataAttributeProps.length; j++) {
          const opt = document.createElement("option");
          opt.value = dataAttributeProps[j];
          opt.text = dataAttributeProps[j];

          sel.add(opt);
        }

        // initial selection
        selectedOption = dataAttributeProps[0];

        // set initial data
        initMapData = geojsonData;
        initData = jsonObjects;
        analysisData = initData;

        filterOpts = getUniqueAttributeVals(analysisData, selectedOption).map(
          (item) => {
            return {
              value: item,
              text: item,
            };
          }
        );

        // add options to the filter
        new MultiSelect("#filter1id", {
          data: filterOpts,
          placeholder: "Select option",
          search: true,
          selectAll: true,
          listAll: true,
          max: null,
          onSelect: function (value, text, element) {
            // console.log("select:", value);
            selectedFilterOpts.push(value);

            // updated analysis data
            analysisData = dynamicFilter(
              initData,
              selectedFilterOpts,
              sel.value
            );
            // console.log(`Current data num: ${analysisData.length}`);
            attributeType = getAttributeTypeJson(analysisData, selectedOption);
            console.log(`Attribute: ${selectedOption}, Type: ${attributeType}`);
            // remove old chart before creating a new one
            chartStatus = Chart.getChart("myChart"); // <canvas> id
            if (chartStatus != undefined) {
              chartStatus.destroy();
            }

            if (attributeType[0] === "number") {
              // get updated data
              const boxplotUpdatedtData = createUpdatedBoxplotData(
                analysisData,
                selectedOption
              );

              boxplotInitData = createInitBoxplotData(
                analysisData,
                selectedOption
              );
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                boxplotInitData.initConfig
              );
            } else {
              // get updated data
              const chartUpdatedtData = createUpdatedChartData(
                analysisData,
                selectedOption
              );
              chartInitData = createInitChartData(analysisData, selectedOption);
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                chartInitData.initConfig
              );
            }
            // guage
            guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
            if (guageChartStatus != undefined) {
              guageChartStatus.destroy();
            }
            let guageData = createGuageChartData(analysisData, selectedOption);
            duplicatesChart = new Chart(
              document.getElementById("duplicatesChart"),
              guageData.initConfig
            );
            // add duplicates summary table
            document.getElementById("duplicatesData").innerHTML =
              createDuplicatesTable(guageData.duplicatesTData);

            // update map data
            updateUniqAttributeCat = getUniqueAttributeValsGeojson(
              initMapData,
              selectedOption
            );
            updateDataOnMap(
              initMapData,
              updateUniqAttributeCat,
              selectedOption,
              selectedFilterOpts
            );
          },
          onUnselect: function (value, text, element) {
            // console.log("un select:", value);
            selectedFilterOpts.splice(selectedFilterOpts.indexOf(value), 1);

            // updated analysis data
            analysisData = dynamicFilter(
              initData,
              selectedFilterOpts,
              sel.value
            );
            // console.log(`Current data num: ${analysisData.length}`);
            attributeType = getAttributeTypeJson(analysisData, selectedOption);
            console.log(`Attribute: ${selectedOption}, Type: ${attributeType}`);
            // remove old chart before creating a new one
            chartStatus = Chart.getChart("myChart"); // <canvas> id
            if (chartStatus != undefined) {
              chartStatus.destroy();
            }

            if (attributeType[0] === "number") {
              // get updated data
              const boxplotUpdatedtData = createUpdatedBoxplotData(
                analysisData,
                selectedOption
              );

              boxplotInitData = createInitBoxplotData(
                analysisData,
                selectedOption
              );
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                boxplotInitData.initConfig
              );
            } else {
              // get updated data
              const chartUpdatedtData = createUpdatedChartData(
                analysisData,
                selectedOption
              );
              chartInitData = createInitChartData(analysisData, selectedOption);
              // update renderer
              myChart = new Chart(
                document.getElementById("myChart"),
                chartInitData.initConfig
              );
            }
            // guage
            guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
            if (guageChartStatus != undefined) {
              guageChartStatus.destroy();
            }
            let guageData = createGuageChartData(analysisData, selectedOption);
            duplicatesChart = new Chart(
              document.getElementById("duplicatesChart"),
              guageData.initConfig
            );
            // add duplicates summary table
            document.getElementById("duplicatesData").innerHTML =
              createDuplicatesTable(guageData.duplicatesTData);

            // update map data
            updateUniqAttributeCat = getUniqueAttributeValsGeojson(
              initMapData,
              selectedOption
            );
            updateDataOnMap(
              initMapData,
              updateUniqAttributeCat,
              selectedOption,
              selectedFilterOpts
            );
          },
        });
        // console.log(`Selected option: ${selectedOption}`);
        let attributeType = getAttributeTypeJson(analysisData, selectedOption);

        chartStatus = Chart.getChart("myChart"); // <canvas> id
        if (chartStatus != undefined) {
          chartStatus.destroy();
        }

        if (attributeType[0] === "number") {
          let boxplotInitData = createInitBoxplotData(
            analysisData,
            selectedOption
          );
          // init renderer
          myChart = new Chart(
            document.getElementById("myChart"),
            boxplotInitData.initConfig
          );
        } else {
          let chartInitData = createInitChartData(analysisData, selectedOption);
          // init renderer
          myChart = new Chart(
            document.getElementById("myChart"),
            chartInitData.initConfig
          );
        }

        // guage
        guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
        if (guageChartStatus != undefined) {
          guageChartStatus.destroy();
        }
        let guageData = createGuageChartData(analysisData, selectedOption);
        duplicatesChart = new Chart(
          document.getElementById("duplicatesChart"),
          guageData.initConfig
        );
        // add duplicates summary table
        document.getElementById("duplicatesData").innerHTML =
          createDuplicatesTable(guageData.duplicatesTData);

        // event listener on the dropdown
        sel.addEventListener("change", function (optiondata) {
          selectedOption = sel.value;
          // console.log(selectedOption);

          analysisData = initData;
          // update filter
          filterOpts = getUniqueAttributeVals(analysisData, selectedOption).map(
            (item) => {
              return {
                value: item,
                text: item,
              };
            }
          );

          // add options to the filter
          new MultiSelect("#filter1id", {
            data: filterOpts,
            placeholder: "Select option",
            search: true,
            selectAll: true,
            listAll: true,
            max: null,
            onSelect: function (value, text, element) {
              // console.log("select:", value);
              selectedFilterOpts.push(value);

              // updated analysis data
              analysisData = dynamicFilter(
                initData,
                selectedFilterOpts,
                sel.value
              );
              // console.log(`Current data num: ${analysisData.length}`);
              attributeType = getAttributeTypeJson(
                analysisData,
                selectedOption
              );
              console.log(
                `Attribute: ${selectedOption}, Type: ${attributeType}`
              );
              // remove old chart before creating a new one
              chartStatus = Chart.getChart("myChart"); // <canvas> id
              if (chartStatus != undefined) {
                chartStatus.destroy();
              }

              if (attributeType[0] === "number") {
                // get updated data
                const boxplotUpdatedtData = createUpdatedBoxplotData(
                  analysisData,
                  selectedOption
                );

                boxplotInitData = createInitBoxplotData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  boxplotInitData.initConfig
                );
              } else {
                // get updated data
                const chartUpdatedtData = createUpdatedChartData(
                  analysisData,
                  selectedOption
                );
                chartInitData = createInitChartData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  chartInitData.initConfig
                );
              }
              // guage
              guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
              if (guageChartStatus != undefined) {
                guageChartStatus.destroy();
              }
              let guageData = createGuageChartData(
                analysisData,
                selectedOption
              );
              duplicatesChart = new Chart(
                document.getElementById("duplicatesChart"),
                guageData.initConfig
              );
              // add duplicates summary table
              document.getElementById("duplicatesData").innerHTML =
                createDuplicatesTable(guageData.duplicatesTData);

              // update map data
              updateUniqAttributeCat = getUniqueAttributeValsGeojson(
                initMapData,
                selectedOption
              );
              updateDataOnMap(
                initMapData,
                updateUniqAttributeCat,
                selectedOption,
                selectedFilterOpts
              );
            },
            onUnselect: function (value, text, element) {
              // console.log("un select:", value);
              selectedFilterOpts.splice(selectedFilterOpts.indexOf(value), 1);

              // updated analysis data
              analysisData = dynamicFilter(
                initData,
                selectedFilterOpts,
                sel.value
              );
              // console.log(`Current data num: ${analysisData.length}`);
              attributeType = getAttributeTypeJson(
                analysisData,
                selectedOption
              );
              console.log(
                `Attribute: ${selectedOption}, Type: ${attributeType}`
              );
              // remove old chart before creating a new one
              chartStatus = Chart.getChart("myChart"); // <canvas> id
              if (chartStatus != undefined) {
                chartStatus.destroy();
              }

              if (attributeType[0] === "number") {
                // get updated data
                const boxplotUpdatedtData = createUpdatedBoxplotData(
                  analysisData,
                  selectedOption
                );

                boxplotInitData = createInitBoxplotData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  boxplotInitData.initConfig
                );
              } else {
                // get updated data
                const chartUpdatedtData = createUpdatedChartData(
                  analysisData,
                  selectedOption
                );
                chartInitData = createInitChartData(
                  analysisData,
                  selectedOption
                );
                // update renderer
                myChart = new Chart(
                  document.getElementById("myChart"),
                  chartInitData.initConfig
                );
              }
              // guage
              guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
              if (guageChartStatus != undefined) {
                guageChartStatus.destroy();
              }
              let guageData = createGuageChartData(
                analysisData,
                selectedOption
              );
              duplicatesChart = new Chart(
                document.getElementById("duplicatesChart"),
                guageData.initConfig
              );
              // add duplicates summary table
              document.getElementById("duplicatesData").innerHTML =
                createDuplicatesTable(guageData.duplicatesTData);

              // update map data
              updateUniqAttributeCat = getUniqueAttributeValsGeojson(
                initMapData,
                selectedOption
              );
              updateDataOnMap(
                initMapData,
                updateUniqAttributeCat,
                selectedOption,
                selectedFilterOpts
              );
            },
          });

          attributeType = getAttributeTypeJson(analysisData, selectedOption);
          console.log(attributeType);

          chartStatus = Chart.getChart("myChart"); // <canvas> id
          if (chartStatus != undefined) {
            chartStatus.destroy();
          }

          if (attributeType[0] === "number") {
            // get updated data
            const boxplotUpdatedtData = createUpdatedBoxplotData(
              analysisData,
              selectedOption
            );

            // myChart.data.labels = boxplotUpdatedtData.updateLabels;
            // myChart.data.datasets[0].data = boxplotUpdatedtData.updateData;
            // myChart.update();

            boxplotInitData = createInitBoxplotData(
              analysisData,
              selectedOption
            );
            // update renderer
            myChart = new Chart(
              document.getElementById("myChart"),
              boxplotInitData.initConfig
            );
          } else {
            // get updated data
            const chartUpdatedtData = createUpdatedChartData(
              analysisData,
              selectedOption
            );

            //   myChart.data.labels = chartUpdatedtData.updateLabels;
            //   myChart.data.datasets[0].data = chartUpdatedtData.updateData;
            //   myChart.update();

            chartInitData = createInitChartData(analysisData, selectedOption);
            // update renderer
            myChart = new Chart(
              document.getElementById("myChart"),
              chartInitData.initConfig
            );
          }

          // guage
          guageChartStatus = Chart.getChart("duplicatesChart"); // <canvas> id
          if (guageChartStatus != undefined) {
            guageChartStatus.destroy();
          }
          let guageData = createGuageChartData(analysisData, selectedOption);
          duplicatesChart = new Chart(
            document.getElementById("duplicatesChart"),
            guageData.initConfig
          );
          // add duplicates summary table
          document.getElementById("duplicatesData").innerHTML =
            createDuplicatesTable(guageData.duplicatesTData);

          // update map data
          updateUniqAttributeCat = getUniqueAttributeValsGeojson(
            initMapData,
            selectedOption
          );
          updateDataOnMap(
            initMapData,
            updateUniqAttributeCat,
            selectedOption,
            selectedFilterOpts
          );
        });
        // end of chart
        ////// leaflet map //////

        const uniqAttributeCat = getUniqueAttributeValsGeojson(
          initMapData,
          selectedOption
        );
        const addLayerToMap = addDataToMap(
          initMapData,
          uniqAttributeCat,
          selectedOption
        );
      })();
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
