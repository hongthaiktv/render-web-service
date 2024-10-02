'use strict';

async function getData(url = "") {
    const response = await fetch(url, {
      method: "GET"
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

function refTable(data = {}) {
    let tblData = document.querySelector("#tableData > tbody");
    tblData.innerHTML = "";
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

getData("/get").then((result) => {
    if (result.ok) {
      refTable(result.result);
    } else {toastr.error(result.error);}
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