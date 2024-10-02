'use strict';

async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
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

    postData("/add", data).then((result) => {
        toastr.success(result.result);
    });
});

var btnClear = document.querySelector("#clear");
btnClear.addEventListener("click", function(e) {
    let key = "123321";
    let data = {
        key: key,
        table: "plates"
    };

    postData("/clear", data).then((result) => {
        if (result.ok) toastr.success(result.result);
        else toastr.error(result.error);
    });  
});
