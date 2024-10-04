'use strict';

async function getData(url = "") {
  let result = {};
  const response = await fetch(url, {
    method: "GET"
  })
  .catch(error => {
      result.detail = error;
      result.message = error.message;
      result.status = 408;
   });

   if (result.detail) throw result;
   else {
       result = await response.json();
       if (!response.ok) {
           result.detail = new Error(`Fetch error: ${result.message}`);
           result.status = response.status;
           throw result;
       }
       return result;
   } 
}

function refTable(data = []) {
  let tblData = document.querySelector("#tableData > tbody");
  tblData.innerHTML = "";
  if (data.length) {
      data.forEach(function(record) {
          let row = document.createElement("TR");
          row.innerHTML = `
              <th scope="row">${record.id}</th>
              <td>${record.state}</td>
              <td>${record.code}</td>
              <td class="colDes">${record.description}</td>
          `;
          tblData.appendChild(row);
        });
  }
}

getData("/get").then(result => {
  refTable(result.result);
}).catch(error => {
toastr.error(error.message);
console.error(error.detail);
});

var searchBar = document.querySelector("#searchBar");
searchBar.addEventListener("keyup", function(e) {
let colDes = document.querySelectorAll(".colDes");
colDes.forEach(function(ele) {
    let inputString = e.target.value.toLowerCase();
    let eleStringLC = ele.innerText.toLowerCase();
    if (eleStringLC.includes(inputString)) {
        // error if else
    }
});
});
