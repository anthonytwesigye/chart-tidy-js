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
    console.log(fileExtension);

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

          // event listener on the dropdown
          sel.addEventListener("change", function (optiondata) {
            selectedOption = sel.value;
            console.log(selectedOption);
            // update data
            const resultsUpdated = tidy(
              answer.data,
              groupBy(selectedOption, [summarize({ count: n() })])
            );

            //////////////////  update chart JS  //////////////////
            let myDataUpdated = resultsUpdated.map(function (item) {
              return item["count"];
            });
            let myLabsUpdated = resultsUpdated.map(function (item) {
              return item[selectedOption];
            });

            myChart.data.labels = myLabsUpdated;
            myChart.data.datasets[0].data = myDataUpdated;
            myChart.update();
          });

          //////////////////  tidy JS part  //////////////////
          const results = tidy(
            answer.data,
            groupBy(selectedOption, [summarize({ count: n() })])
          );

          // console.log(results);

          //////////////////  chart JS starts here  //////////////////
          const myData = results.map(function (item) {
            return item["count"];
          });
          const myLabs = results.map(function (item) {
            return item[selectedOption];
          });

          // setup
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

          // init renderer
          const myChart = new Chart(document.getElementById("myChart"), config);
        },
      });
    }
    if (fileExtension === "xlsx" || fileExtension === "xls") {
      //
    }
    if (fileExtension === "geojson") {
      //
    }
  });
