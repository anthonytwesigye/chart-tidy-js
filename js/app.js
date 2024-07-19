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

          ////// end of chart //////
        } catch (e) {
          alert("Unable to read file as GeoJSON.");
        }
      };
    }
  });

//////////////////  Define dynamic functions for re-use  //////////////////

// function for preparing initial chart data
function createInitChartData(loadeddata, grpoption) {
  //////////////////  tidy JS part  //////////////////
  const results = tidy(
    loadeddata,
    groupBy(grpoption, [summarize({ count: n() })])
  );

  // console.log(results);

  //////////////////  chart JS starts here  //////////////////
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

  //////////////////  update chart JS  //////////////////
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
