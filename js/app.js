// load tidy JS
const { tidy, mutate, arrange, desc, groupBy, summarize, n } = Tidy;
// global objects and variables

let filterOpts;
let initData;
let analysisData;
let selectedOption;
let selectedFilterOpts = [];

let dataAttributeProps;

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

          dataAttributeProps = Object.keys(answer.data[0]);

          for (let j = 0; j < dataAttributeProps.length; j++) {
            const opt = document.createElement("option");
            opt.value = dataAttributeProps[j];
            opt.text = dataAttributeProps[j];

            sel.add(opt);
          }

          // initial selection
          selectedOption = dataAttributeProps[0];
          // set initial data
          initData = answer.data;
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

          // console.log(`Selected option: ${selectedOption}`);
          let attributeType = getAttributeTypeJson(
            analysisData,
            selectedOption
          );

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
            let chartInitData = createInitChartData(
              analysisData,
              selectedOption
            );
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
            filterOpts = getUniqueAttributeVals(
              analysisData,
              selectedOption
            ).map((item) => {
              return {
                value: item,
                text: item,
              };
            });

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
        },
      });

      document.getElementById("UploadFile").value = "";
      // remove chart
      if (chartStatus != undefined) {
        chartStatus.destroy();
      }
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
          // console.log(`Selected option: ${selectedOption}`);
          let attributeType = getAttributeTypeJson(
            analysisData,
            selectedOption
          );

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
            let chartInitData = createInitChartData(
              analysisData,
              selectedOption
            );
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
            filterOpts = getUniqueAttributeVals(
              analysisData,
              selectedOption
            ).map((item) => {
              return {
                value: item,
                text: item,
              };
            });

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
            const updateUniqAttributeCat = getUniqueAttributeValsGeojson(
              geojsonData,
              selectedOption
            );
            updateDataOnMap(
              geojsonData,
              updateUniqAttributeCat,
              selectedOption
            );
          });
          // end of chart
          ////// leaflet map //////
          const uniqAttributeCat = getUniqueAttributeValsGeojson(
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
