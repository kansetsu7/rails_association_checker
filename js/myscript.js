function check (){
  var modelName = document.getElementById("model-name").value
  var relatoinInput = document.getElementById("relatoin-input").value
  var myTableName = document.getElementById("my-table-name").value
  var fk = document.getElementById("fk").value
  var refTableName = document.getElementById("ref-table-name").value
  var pk = document.getElementById("pk").value

  var codingPan = document.getElementById("coding-pan");
  if (chkModelName(modelName, codingPan)) {
    var map = chkRelationInput(relatoinInput, codingPan);
    if (!map.get("chk")) {
      // alert("有錯喔");
      console.log("有錯喔");
    }
    if (fk === "" && pk === "" && refTableName === "") {
      console.log("all empty");
    }
  }

  console.log("yooo");
}

/*
* checking model name
* return false if model name didn't pass
* return true if passed 
*/
function chkModelName(modelName, codingPan) {
  cleanPan(codingPan);

  console.log("Checking model name...");
  var errMsg = document.createElement("p");
  errMsg.style.color = "red";

  if (modelName === "") {
    errMsg.innerHTML = "錯誤：Model名稱必填";
    codingPan.appendChild(errMsg);
    return false;
  }else {
    return chkCapitalize(modelName, codingPan);
  }
}

/*
* clean coding pan
* remove all child inside it
*/
function cleanPan(codingPan) {
  while (codingPan.lastChild != null) {
    codingPan.removeChild(codingPan.lastChild);
  }
  console.log("Cleared!");
}

/*
* checking model name's first letter
* return false if model name didn't pass
* return true if passed 
*/
function chkCapitalize(string, codingPan) {
  console.log("Checking first letter...");

  var errMsg = document.createElement("p");
  errMsg.style.color = "red";

  if (!isNaN(string.charAt(0))) {   //first latter is a number
    errMsg.innerHTML = "錯誤：Model名開頭不能為數字！";
    codingPan.appendChild(errMsg);
    return false;
  }else if (capFirstLetter(string) === string) {
    return true;
  }else{
    errMsg.innerHTML = "錯誤：Model名開頭需大寫！";
    codingPan.appendChild(errMsg);
    return false;
  }
}

/*
* checking relation input
* return map {("chk", true), ("relation2", relation2)} if pass
* return map {("chk", false)} if pass
*/
function chkRelationInput(relatoinInput, codingPan) {
  // cleanPan(codingPan); //這行以後要拿掉
  console.log("Checking relatoin...");
  // set up msg 
  var errMsg = document.createElement("p");
  errMsg.style.color = "red";
  // set up map
  var map = new Map();

  // check input has belongs_to or not
  if (relatoinInput == "" || !relatoinInput.includes("belongs_to")) {
    errMsg.innerHTML = "錯誤："+"你的belongs_to咧?";
    codingPan.appendChild(errMsg);
    map.set("chk", false);
    return map;
  }

  // check if input has right symbol
  var relation = relatoinInput.split(",");
  var relation2 = [];
  for (var i = 0; i <= relation.length-1; i++) {
    relation2.push(relation[i].split(":"));
  }
  relation_log(relation2);
  if (!chkRelationSymbol(relation2, codingPan)) {
    map.set("chk", false);
    return map;
  }
  map.set("chk", true);
  map.set("relation2", relation2);
  return map;
}

/*
* checking relation symbol
* return true if pass
* return false if not pass
*/
function chkRelationSymbol(relation2, codingPan) {
  console.log("Checking symbol...");
  var errMsg = document.createElement("p");
  errMsg.style.color = "red";

  console.log(relation2[0].length);
  for (var i = 0; i <= relation2.length - 1; i++) {
    if (relation2[i].length != 2) {
      errMsg.innerHTML = "錯誤："+"關聯設定符號有問題，可能少了或多了冒號！";
      codingPan.appendChild(errMsg);
      return false;
    }else if (relation2[i][0] === "" || relation2[i][1] === "") {
      errMsg.innerHTML = "錯誤："+"關聯設定符號有問題，冒號位置錯誤！";
      codingPan.appendChild(errMsg);
      return false;
    }else{
      return true;
    }
  }
}


/*
* capitalize first letter of the given string
*/
function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function relation_log(relation_array){
  console.log("[");
  relation_array.forEach(function(arg, index){
    console.log("[" + arg[0] + "," + arg[1] + "]");
  })

  console.log("]");
}

/*
* 
* 
* 
*/