function check (){
  var inputs = [];
  inputs.push(document.getElementById("my-model-name").value.trim());  // [0] myModelName
  inputs.push(document.getElementById("relatoin-input").value.trim());  // [1] relatoinInput
  inputs.push(document.getElementById("fk").value.trim());  // [2] fk
  inputs.push(document.getElementById("ref-model-name").value.trim());  // [3] refModelName
  inputs.push(document.getElementById("pk").value.trim());  // [4] pk

  var codingPan = document.getElementById("coding-pan");
  // console.log("fk: "+chkLetterBoth(inputs[2]));

  if (chkMyModelName(inputs[0], codingPan) && true) {
    var map = chkRelationInput(inputs[1], codingPan);
    if (!map.get("chk")) {
      // alert("有錯喔");
      console.log("有錯喔");
      return;
    }

    var relation = getRelationMap(map.get("relation"));
    resultInPan(codingPan, inputs[0], map.get("relation"));
    showRailsDefault(codingPan, inputs[0], relation.get("belongs_to"));
    chkDbSchemaInput(codingPan, inputs, relation);

  }

  // console.log("yooo");
}

/*
* checking model name
* return false if model name didn't pass
* return true if passed 
*/
function chkMyModelName(myModelName, codingPan) {
  cleanPan(codingPan);

  // console.log("Checking model name...");
  var errMsg = document.createElement("p");
  errMsg.style.color = "red";

  if (myModelName === "") {
    errMsg.innerHTML = "錯誤：Model名稱必填";
    codingPan.appendChild(errMsg);
    return false;
  }else {
    return chkCapitalize(myModelName, codingPan);
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
  // console.log("Cleared!");
}

/*
* checking model name's first letter
* return false if model name didn't pass
* return true if passed 
*/
function chkCapitalize(string, codingPan) {
  // console.log("Checking first letter...");

  var errMsg = document.createElement("p");
  errMsg.style.color = "red";

  if (!isNaN(string.charAt(0))) {   //first latter is a number
    errMsg.innerHTML = "錯誤：Model名開頭不能為數字！";
    codingPan.appendChild(errMsg);
    return false;
  }else if (upFirstLetter(string) === string) {
    return true;
  }else{
    errMsg.innerHTML = "錯誤：Model名開頭需大寫！";
    codingPan.appendChild(errMsg);
    return false;
  }
}

/*
* checking relation input
* return map {("chk", true), ("relation", relation2)} if pass
* return map {("chk", false)} if pass
*/
function chkRelationInput(relatoinInput, codingPan) {
  // console.log("Checking relatoin...");
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
  if (!chkRelationSymbol(relation2, codingPan)) {
    map.set("chk", false);
    relation_log(relation2);
    return map;
  }

  // trim space of relation arguments
  for (var i = 0; i < relation2.length; i++) {
    relation2[i][0] = relation2[i][0].trim();
    relation2[i][1] = relation2[i][1].trim();
  }
  relation_log(relation2);
  map.set("chk", true);
  map.set("relation", relation2);
  return map;
}

/*
* checking relation symbol
* return true if pass
* return false if not pass
*/
function chkRelationSymbol(relation2, codingPan) {
  // console.log("Checking symbol...");
  var errMsg = document.createElement("p");
  errMsg.style.color = "red";
  var result = false;
  // console.log(relation2[0].length);
  for (var i = 0; i <= relation2.length - 1; i++) {
    if (relation2[i].length != 2) {
      var place = relation2[i][0] === "" ? " [痾...這不好說] " : relation2[i][0];
      console.log("=====\'"+relation2[i][0]+"\'");
      errMsg.innerHTML = "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。";
      codingPan.appendChild(errMsg);
      return false;
    }else if (relation2[i][0] === "" || relation2[i][1] === "") {
      var place = relation2[i-1][0] === "" ? " [痾...這不好說] " : "relation2[i-1][0]";
      errMsg.innerHTML = "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。";
      codingPan.appendChild(errMsg);
      return false;
    }else{
      result = true;
    }
  }
  return result;
}

/*
* write Rails convention setup on code panel
*/
function showRailsDefault(codingPan, modelName, methodName) {
  console.log("showRailsDefault");
  var resultElements = setResultElements("Rails convention", modelName, methodName);
  resultElements.push(document.createElement("span"));
  resultElements[7].innerHTML = ", ";
  resultElements[7].classList.add("code-white");
  resultElements.push(document.createElement("span"));  //class_name
  resultElements[8].innerHTML = "class_name: ";
  resultElements[8].classList.add("code-purple");
  resultElements.push(document.createElement("span"));
  resultElements[9].innerHTML = "\"" + upFirstLetter(methodName) + "\"";
  resultElements[9].classList.add("code-yellow");
  resultElements.push(document.createElement("span"));
  resultElements[10].innerHTML = ", ";
  resultElements[10].classList.add("code-white");
  resultElements.push(document.createElement("span"));  //foreign_key
  resultElements[11].innerHTML = "foreign_key: ";
  resultElements[11].classList.add("code-purple");
  resultElements.push(document.createElement("span"));
  resultElements[12].innerHTML = "\"" + methodName + "_id\"";
  resultElements[12].classList.add("code-yellow");
  resultElements.push(document.createElement("span"));
  resultElements[13].innerHTML = ", ";
  resultElements[13].classList.add("code-white");
  resultElements.push(document.createElement("span"));  //primary_key
  resultElements[14].innerHTML = "foreign_key: ";
  resultElements[14].classList.add("code-purple");
  resultElements.push(document.createElement("span"));
  resultElements[15].innerHTML = "\"id\"";
  resultElements[15].classList.add("code-yellow");
  for (var i = 0; i < resultElements.length; i++) {
    codingPan.appendChild(resultElements[i]);
  }
}

/*
* check given DB schema follows Rails convention or not
* return null and skip checking if DB schema not been set.  
* return true if passed
*/
function chkDbSchemaInput(codingPan, inputs, relation) {
  // inputs[2] fk
  // inputs[3] refTableName
  // inputs[4] pk
  if (inputs[2] === "" && inputs[3] === "" && inputs[4] === "") {
    return null;
  }

  var title = document.createElement("p");
  title.classList.add("code-white");
  title.innerHTML = "<br>==== your setup ====<br>";
  codingPan.appendChild(title);

  var errMsgs = [];
  var index = 0;
  for (var i = 2; i < inputs.length; i++) {
    if (chkLetterBoth(inputs[i])) {
      chkConvention(codingPan, inputs[i], relation, i);
    } else {
      errMsgs.push(document.createElement("p"));
      errMsgsIndex = errMsgs.length - 1;
      errMsgs[errMsgsIndex].style.color = "red";
      errMsgs[errMsgsIndex].innerHTML = "錯誤：DB schema欄位" + (i-1) + "輸入有誤。";
    }
  }

  // append error messages
  for (var i = 0; i < errMsgs.length; i++) {
    codingPan.appendChild(errMsgs[i]);
  }
}

/*
* check if given input follows Rails convention or not
*/
function chkConvention(codingPan, chkVal, relation, inputIndex) {
  console.log("chkConvention:"+inputIndex+" => "+chkVal);
  var hasError = false;
  var msg;
  var belongs_to = relation.get("belongs_to");

  switch (inputIndex) {
    case 2:
      console.log(relation.get("foreign_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        hasError = true;
        break;
      }
      var foreign_key = relation.get("foreign_key");
      var convention = belongs_to + "_id";
      if (foreign_key === chkVal) {
        if (foreign_key === convention) {
          msg = "(OK)foreign_key: 符合慣例，可省略!";
        } else {
          msg = "(Ok)foreign_key: 不符慣例，不可省略!";
        }
      } else if (chkVal === convention) {
        msg = "(OK)foreign_key: 符合慣例，可省略!";
      } else {
        hasError = true;
        msg = "(NG)foreign_key: 關聯設定錯誤，應為\"" + chkVal + "\"";
      }
      break;
    case 3:
      console.log(relation.get("class_name")+", "+chkVal);
      if (upFirstLetter(chkVal) !== chkVal) {
        hasError = true;
        break;
      }
      var class_name = relation.get("class_name");
      var convention = upFirstLetter(belongs_to);
      if (class_name === chkVal) {
        if (class_name === convention) {
          msg = "(OK)class_name: 符合慣例，可省略!";
        } else {
          msg = "(OK)class_name: 不符慣例，不可省略!";
        }
      } else if (chkVal === convention) {
        msg = "(OK)class_name: 符合慣例，可省略!";
      } else {
        hasError = true;
        msg = "(NG)class_name: 關聯設定錯誤，應為\"" + chkVal + "\"";
      }
      break;
    case 4:
      console.log(relation.get("primary_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        hasError = true;
        break;
      }
      var primary_key = relation.get("primary_key");
      var convention = "id";
      if (primary_key === chkVal) {
        if (primary_key === convention) {
          msg = "(OK)primary_key: 符合慣例，可省略!";
        } else {
          msg = "(OK)primary_key: 不符慣例，不可省略!";
        }
      } else if (chkVal === convention) {
        msg = "(OK)primary_key: 符合慣例，可省略!";
      } else {
        hasError = true;
        msg = "(NG)primary_key: 關聯設定錯誤，應為\"" + chkVal + "\"";
      }
      break;
    default:
      hasError = true;
      break;
  }

  if (hasError) {
    if (msg === undefined) msg = "錯誤：DB schema欄位" + (inputIndex-1) + "大小寫有誤。"; 
    errMsg = document.createElement("p");
    errMsg.style.color = "red";
    errMsg.innerHTML = msg;
    codingPan.appendChild(errMsg);
  }else{
    var judgement =  document.createElement("p");
    judgement.classList.add("code-white");
    judgement.innerHTML = msg;
    codingPan.appendChild(judgement);
  }
  
}

/*
* check given string start/end with letters
*/
function chkLetterBoth(str) {
  // console.log("checking \'"+str+"\'");
  var letters = /^[A-Za-z](.*[A-Za-z])?$/;
  return str.match(letters) ? true : false;
}

/*
* check if the string have double quotes on both side
*/
function chkDoubleQuotes(str) {
  return str === ("\"" + trimDQ(str) + "\"") ? true : false;
}

/*
* turn array into map
*/
function getRelationMap(relation) {
  var map = new Map();
  for (var i = 0; i < relation.length; i++) {
    map.set(relation[i][0], trimDQ(relation[i][1]));
  }

  return map;
}

function getConventions(relation) {
  // body...
}


/*
* capitalize first letter of the given string
*/
function upFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
* turn first letter of the given string to lowercase
*/
function lowFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function relation_log(relation_array){
  console.log("[");
  relation_array.forEach(function(arg, index){
    console.log("[" + arg[0] + "," + arg[1] + "]");
  })

  console.log("]");
}

/*
* trim the double quotes in string  
*/
function trimDQ(str) {
  return str.replace(/\"/gm, "");
}
/*
* trim the symbols in string  
*/
function trimSymbol(str) {
  return str.replace(/\"/gm, "");
}

function setResultElements(title, modelName, methodName) {
  var resultElements = [];
  resultElements.push(document.createElement("p"));
  resultElements[0].classList.add("code-white");
  resultElements[0].innerHTML = "==== " + title + " ====<br>";
  resultElements.push(document.createElement("span"));
  resultElements[1].classList.add("code-red");
  resultElements[1].innerHTML = "Class ";
  resultElements.push(document.createElement("span"));
  resultElements[2].classList.add("code-green");
  resultElements[2].innerHTML = modelName;
  resultElements.push(document.createElement("span"));
  resultElements[3].classList.add("code-white");
  resultElements[3].innerHTML = " < ";
  resultElements.push(document.createElement("span"));
  resultElements[4].classList.add("code-green");
  resultElements[4].innerHTML = "ApplicationRecord<br>";
  resultElements.push(document.createElement("span"));
  resultElements[5].classList.add("code-white");
  resultElements[5].innerHTML = "&nbsp;&nbsp;belongs_to ";
  resultElements.push(document.createElement("span"));
  resultElements[6].classList.add("code-purple");
  resultElements[6].innerHTML = ":" + methodName;
  return resultElements;
}

/*
* write user input relation setup in code panel
*/
function resultInPan(codingPan, myModelName, relation) {
  var index = 6;
  var index2;
  var resultElements = setResultElements("your setup", myModelName, relation[0][1]);

  for (var i = 1; i < relation.length; i++) {
    index2 = index + 3 * ( i - 1 );
    resultElements.push(document.createElement("span"));
    resultElements[index2+1].innerHTML = ", ";
    resultElements[index2+1].classList.add("code-white");

    resultElements.push(document.createElement("span"));
    resultElements[index2+2].innerHTML = relation[i][0]+ ": ";
    resultElements[index2+2].classList.add("code-purple");

    resultElements.push(document.createElement("span"));
    resultElements[index2+3].innerHTML = relation[i][1];
    resultElements[index2+3].classList.add("code-yellow");
  }
  index2 = index + 3 * ( relation.length - 1 );
  // console.log(index2);
  resultElements.push(document.createElement("span"));
  resultElements[index2+1].classList.add("code-red");
  resultElements[index2+1].innerHTML = "<br>end";
  for (var i = 0; i < resultElements.length; i++) {
    codingPan.appendChild(resultElements[i]);
  }
}

/*
* 
* 
* 
*/