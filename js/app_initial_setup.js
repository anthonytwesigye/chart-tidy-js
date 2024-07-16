const levelTypeData = [];
const codeData = [];
const catalogTypeData = [];
const nameData = [];
const descriptionData = [];
//
const uploadsuccess = document
  .getElementById("uploadsuccess")
  .addEventListener("click", () => {
    Papa.parse(document.getElementById("UploadFile").files[0], {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (answer) {
        console.log("reached here:");
        for (i = 0; i < answer.data.length; i++) {
          levelTypeData.push(answer.data[i].levelType);
          codeData.push(answer.data[i].code);
          catalogTypeData.push(answer.data[i].catalogType);
          nameData.push(answer.data[i].name);
          descriptionData.push(answer.data[i].description);
        }
        console.log(answer.data);
        console.log(levelTypeData);
      },
    });
  });

// chart JS adapt

// setup
const data = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19, 3, 5, 2, 3],
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
