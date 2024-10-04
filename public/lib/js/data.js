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

async function postData(url = "", data = {}) {
    let result = {};
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
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

var btnAdd = document.querySelector("#add");
btnAdd.addEventListener("click", function(e) {
    let state = document.querySelector("#state").value;
    let code = document.querySelector("#code").value;
    let description = document.querySelector("#description").value;
    let data = {
        state: state,
        code: code,
        description: description
    };

    postData("/add", data).then(result => {
        toastr.success(result.result);
        return getData("/get");
    })
    .then(result => refTable(result.result))
    .catch(error => {
        toastr.error(error.message);
        console.error(error.detail);
    });
});

var btnClear = document.querySelector("#clear");
btnClear.addEventListener("click", function(e) {
    let key = "123321";
    let data = {
        key: key,
        table: "plates"
    };

    postData("/clear", data).then(result => {
        toastr.success(result.result);
        refTable();
    })
    .catch(error => {
        toastr.error(error.message);
        console.error(error.detail);
    });  
});

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

// Edit mode
function editMode() {
    let tbody = document.querySelector("table > tbody");
    let oldValue = [];
    tbody.addEventListener("click", function(e) {
        if (e.target.tagName !== "INPUT") {

            function deactiveEditMode(activeRow, oldValue) {
                activeRow.removeAttribute("class");
                let cells = activeRow.children;
                cells.forEach(function(cell, index) {
                    if (index) {
                        let value = oldValue ? oldValue[index - 1] : cell.firstElementChild.firstElementChild.value;
                        cell.innerText = value;
                    }
                });
            }

            let activeRow = document.querySelector("table > tbody > tr[class='activeEdit']");
            if (activeRow) {
                deactiveEditMode(activeRow, oldValue);
                return;
            }

            let row = e.target.parentElement;
            row.className = "activeEdit";
            oldValue = [];
            let cells = row.children;
            cells.forEach(function(cell, index) {
                if (index) {
                    let value = cell.innerText;
                    oldValue.push(value);
                    let inputWidth = 8.5;
                    if (index === 2) inputWidth = 2;
                    cell.innerHTML = `<span><input type="text" value="${value}" style="max-width: ${inputWidth}rem; min-width: 100%;"></span>`;
                    let input = cell.firstElementChild.firstElementChild;
                    input.addEventListener("keyup", function(event) {
                        let key = event.which || event.keyCode;
                        if (key === 27) {
                            deactiveEditMode(row, oldValue);
                        } else if (key === 13) {
                            toastr.info("Sending data...");
                            deactiveEditMode(row);
                        }
                    });
                }
            });
            e.target.firstElementChild.firstElementChild.focus();
        }
    });
}

editMode();
