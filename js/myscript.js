function check123 (){
  var mode = getMode();
  if (mode === "") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }
  
  var inputs = getInputs(mode);
  /*******************************
  *     b / h / t
  * size 5 / 5 / 8
  * [0] myModelName
  * [1] relatoinInput
  * [2] fk (b / m / b)
  * [3] refModelName (b / m / b)
  * [4] pk (b / m / b)
  * [5] fk (- / - / b)
  * [6] refModelName (- / - / b)
  * [7] pk (- / - / m)
  *******************************/

  var codingPan = document.getElementById("coding-pan");

  // return if model name is not correct
  if (!chkMyModelName(inputs[0], codingPan) && true) return;
  /*
  var map = chkRelationInput(inputs[1], codingPan, mode);
  if (!map.get("chk")) {
    // alert("有錯喔");
    console.log("有錯喔");
    return;
  }*/
  var lines = relatoinInput.split("\n");
  if (!chkRelationLines(mode, lines, codingPan)) return;
  var relationArray = [];
  for (var i = 0; i < lines.length; i++) {
    relationArray.push(lines[0].split(","));
  } 
  var arrForMap = [];
  if (mode === "t") {
    arrForMap.push(chkRelationSymbol(relationArray[0], codingPan, "b"));
    arrForMap.push(chkRelationSymbol(relationArray[1], codingPan, "m"));
  } else {
    arrForMap.push(chkRelationSymbol(relationArray[0], codingPan, mode));
  }
  
  var relation = getRelationMap(map.get("relation"));
  var line2;  // only for mode === "t"
  mode = map.get("mode");
  resultInPan(codingPan, inputs[0], map.get("relation"), mode);
  switch (mode) {
    case "b":
      showRailsDefault(codingPan, inputs[0], relation.get("belongs_to"), mode);
      break;
    case "m":
      showRailsDefault(codingPan, inputs[0], relation.get("has_many"), mode);
      break;
    case "t":
      showRailsDefault(codingPan, inputs[0], relation.get("has_many"), mode);
      line2 = map.get("line2");
      break;
    default: // 可能不需要default，以後可以拿掉
      console.log("有錯喔");
      break;
  }
  if (chkDbSchemaInput(codingPan, inputs, relation, mode) && mode === "t") {
    chkSecondLineInput();
  }
}

function checkBase(mode, inputs, codingPan) {
  /**************************
  * inputs[0] myModelName
  * inputs[1] relatoinInput
  * inputs[2] fk
  * inputs[3] refModelName
  * inputs[4] pk
  **************************/

  
  var result = [false];
  // return if model name is not correct
  if (!chkMyModelName(inputs[0], codingPan) && true) return result;
  if (!chkRelationLines(mode, inputs[1].split("\n"), codingPan)) return result;
  var relationArray = inputs[1].split(",");
  var map = chkRelationSymbol(relationArray, codingPan, mode);
  if (!map.get("chk")) {
    // alert("有錯喔");
    console.log("有錯喔");
    return result;
  }
  var relationMap = getRelationMap(map.get("relation"));
  resultInPan(codingPan, inputs[0], map.get("relation"), mode);
  showRailsDefault(codingPan, inputs[0], relationMap.get(getTypeName(mode)), mode);
  chkDbSchemaInput(codingPan, inputs, relationMap, mode);
}

function chkBtHm() {
  var codingPan = document.getElementById("coding-pan");
  cleanPan(codingPan);
  var mode = getMode();
  if (mode === "") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }
  
  var inputs = getInputs(mode);
  checkBase(mode, inputs, codingPan);
}

function chkHmTh() {
  var codingPan = document.getElementById("coding-pan");
  cleanPan(codingPan);
  var mode = getMode();
  if (mode === "") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }

  /**************************
  * [0] myModelName
  * [1] relatoinInput
  * [2] fk
  * [3] refModelName
  * [4] pk
  **************************/
  var inputsBl = getInputs("b");
  checkBase("b", inputsBl, codingPan);
  var inputsHm = getInputs("m");
  checkBase("m", inputsHm, codingPan);
}

/*
* checking model name
* return false if model name didn't pass
* return true if passed 
*/
function chkMyModelName(myModelName, codingPan) {
  // console.log("Checking model name...");
  if (myModelName === "") {
    printMsgLine(codingPan, "錯誤：Model名稱必填","red");
    return false;
  }else {
    return chkCapitalize(myModelName, codingPan);
  }
}

/*
* checking model name's first letter
* return false if model name didn't pass
* return true if passed 
*/
function chkCapitalize(str, codingPan) {
  // console.log("Checking first letter...");

  if (!isNaN(str.charAt(0))) {   //first latter is a number
    printMsgLine(codingPan, "錯誤：Model名開頭不能為數字！","red");
    return false;
  }else if (upFirstLetter(str) === str) {
    return true;
  }else{
    printMsgLine(codingPan, "錯誤：Model名開頭需大寫！","red");    
    return false;
  }
}

/*
* checking relation input
* return map {("chk", false)} if not pass
* return map {("chk", true), ("relation", relation2), ("mode", mode = "b" or "m")} if pass ([has_many] or [belongs_to])
* return map {("chk", true), ("relation", relation2), ("mode", "t"), ("line2", twoLine[1])} if pass ([has_many :through])
*/ /*
function chkRelationInput(relatoinInput, codingPan, mode) {
  // console.log("Checking relatoin...");

  // set up map
  var map = new Map();
  var lines = relatoinInput.split("\n");
  // check input has belongs_to or not
  if (!chkRelationLines(mode, lines, codingPan)) {
    map.set("chk", false);
    return map;
  }
  var relation = lines[0].split(",");
 
  // check if input has right symbol
  var map2 = chkRelationSymbol(relation, codingPan, mode);
  if (!map2.get("chk")) {
    map.set("chk", false);
    return map;
  }

  // trim space of relation arguments
  var relation2 = map2.get("relation");
  for (var i = 0; i < relation2.length; i++) {
    relation2[i][0] = relation2[i][0].trim();
    relation2[i][1] = relation2[i][1].trim();
  }
  relation_log(relation2);
  map.set("chk", true);
  map.set("relation", relation2);
  map.set("mode", mode);
  if (mode === "t") {
    map.set("line2", lines[1]);
  }
  return map;
}*/ 

/*
* checking relation lines
*/
function chkRelationLines(mode, relatoinInput, codingPan) {
  console.log(" chkRelationLines...");

  if (mode === "b" || mode === "m") {
    if (relatoinInput.length == 1) {
      return true;
    }
    printMsgLine(codingPan, "錯誤：輸入超過一行","red");
    return false;
  }
  if (mode === "t") {
    if (relatoinInput.length == 1) {
      return true;
    }
    printMsgLine(codingPan, "錯誤：輸入超過一行","red");
    return false;
  }
  printMsgLine(codingPan, "錯誤：chkRelationType有奇怪的Bug啊啊啊啊！","red");
  return false;
  /*
  switch (mode) {
    case "b":
      if (relatoinInput[0].includes("belongs_to")) {
        if (relatoinInput.length == 1) {
          return true;
        }
        printMsgLine(codingPan, "錯誤：輸入超過一行","red");
        return false;
      }
      printMsgLine(codingPan, "錯誤：你的belongs_to咧?","red");
      return false;

    case "m":
      if (relatoinInput[0].includes("has_many")) {
        if (relatoinInput.length == 1) {
          return true;
        }
        printMsgLine(codingPan, "錯誤：輸入超過一行","red");
        return false;
      }
      printMsgLine(codingPan, "錯誤：你的has_many咧?","red");
      return false;

    case "t":
      if (relatoinInput.length !== 3) {
        printMsgLine(codingPan, "錯誤：has_many :through行數應為三行","red");
        return false;
      }
      if (relatoinInput[0].includes("belongs_to")) {
        if (relatoinInput[1].includes("has_many")) {
          if (relatoinInput.includes(":through")) {
            return true;
          }
          if (relatoinInput.includes("through")) { //symbol error, lack of ":"
            printMsgLine(codingPan, "錯誤：你第二行through前面的冒號咧?","red");
            return false;
          }
          return true;
        }
        printMsgLine(codingPan, "錯誤：你第二行的has_many咧?","red");
        return false;
      }
      printMsgLine(codingPan, "錯誤：你的belongs_to咧?","red");
      return false;

    default:
      printMsgLine(codingPan, "錯誤：chkRelationType有奇怪的Bug啊啊啊啊！","red");
      return false;
  }*/
}

/*
* checking relation symbol
* return map {("chk", true), ("relation", relation2)} if pass
* return map {("chk", false)} if not pass
*/
function chkRelationSymbol(relation, codingPan, mode) {
  // console.log("Checking symbol...");
  var relation2 = [];
  for (var i = 0; i <= relation.length-1; i++) {
    relation2.push(relation[i].split(":"));
  }
  var map = new Map();
  map.set("chk", false);
  if (!chkRelationKeyword(relation2[0][0].trim(), mode, codingPan)) return map;
  for (var i = 0; i <= relation2.length - 1; i++) {
      // console.log("=====\'"+relation2[i][1]+"\'");
    if (relation2[i].length < 2) {
      var place = relation2[i][0] === "" ? " [痾...這不好說] " : relation2[i][0];
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (relation2[i].length > 2) {
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+relation2[i][1]+"附近。","red");
      return map;
    }
    if (relation2[i][0] === "" || relation2[i][1] === "") {
      var place = relation2[i-1][0] === "" ? " [痾...這不好說] " : relation2[i-1][0];
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (i > 0) {
      if (!chkRelationArg(relation2[i][0].trim())) { 
        printMsgLine(codingPan, "錯誤：關鍵字應為\'class_name\', \'foreign_key\', \'primary_key\'其中之一。<br>位於"+relation2[i][0],"red");
        return map;
      }
      if (chkRightSpace(relation2[i][0])) {
        printMsgLine(codingPan, "錯誤：你的冒號要靠緊"+relation2[i][0],"red");
        return map;
      }
      if (!chkDoubleQuotes(relation2[i][1].trim())) {
        // var place = relation2[i-1][0] === "" ? " [痾...這不好說] " : relation2[i-1][0];
        printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的引號！<br>位於"+relation2[i][1]+"附近。","red");
        return map;
      }
    } else {
      if (chkLeftSpace(relation2[0][1])) {
        printMsgLine(codingPan, "錯誤：你的冒號要靠緊"+relation2[0][1],"red");
        return map;
      }
    }
  }
  map.set("relation", relation2);
  map.set("chk", true);
  return map;
}

/*
* check relation arguments
*/
function chkRelationArg(str) {
  if (str === "class_name" || str === "foreign_key" || str === "primary_key") {
    return true;
  }
  return false;
}

function chkRelationKeyword(keyword, mode, codingPan) {
  switch (mode) {
    case "b":
      if (keyword !== "belongs_to") {
        printMsgLine(codingPan, "錯誤：你的"+keyword+"應為belongs_to","red");
        return false;
      }
      return true;
    case "m":
      if (keyword !== "has_many") {
        printMsgLine(codingPan, "錯誤：你的"+keyword+"應為has_many","red");
        return false;
      }
      return true;
    default:
      printMsgLine(codingPan, "錯誤：chkRelationSymbol有奇怪的Bug啊啊啊啊！","red");
      return false;
  }
}

/*
* write Rails convention setup on code panel
*/
function showRailsDefault(codingPan, modelName, methodName, mode) {
  console.log("showRailsDefault");
  setResultElements(codingPan, "Rails convention", modelName, methodName, mode);
  printMsgSpan(codingPan, ", ", "code-white");
  printMsgSpan(codingPan, "class_name: ", "code-purple");
  printMsgSpan(codingPan, "\"" + upFirstLetter(methodName) + "\"", "code-yellow");
  printMsgSpan(codingPan, ", ", "code-white");
  printMsgSpan(codingPan, "foreign_key: ", "code-purple");
  printMsgSpan(codingPan, "\"" + methodName + "_id\"", "code-yellow");
  printMsgSpan(codingPan, ", ", "code-white");
  printMsgSpan(codingPan, "primary_key: ", "code-purple");
  printMsgSpan(codingPan, "\"id\"", "code-yellow");
  printMsgLine(codingPan, "end", "code-red");
}

/*
* check given DB schema follows Rails convention or not
* return null and skip checking if DB schema not been set.  
* return true if passed
* return false if not
*/
function chkDbSchemaInput(codingPan, inputs, relation, mode) {
  // inputs[0] myModelName
  // inputs[2] fk
  // inputs[3] refTableName
  // inputs[4] pk
  if (inputs[2] === "" && inputs[3] === "" && inputs[4] === "") {
    return null;
  }
  var result = true;
  printMsgLine(codingPan, "==== checking result ====<br>","code-white");

  if (mode === "m" || mode === "t") {
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        if (!chkHasManyConvention(codingPan, inputs[i], relation, i, inputs[0])) result = false;
      } else {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
        result = false;
      }
    }
  } else { // mode === "b"
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        if (!chkBelongsToConvention(codingPan, inputs[i], relation, i)) result = false;
      } else {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
        result = false;
      }
    }
  }

  return result;
}

/*
* ONLY FOR [has_many]
* check if given input follows Rails convention or not
*/
function chkHasManyConvention(codingPan, chkVal, relation, inputIndex, myModelName) {
  console.log("chkHasManyConvention:"+inputIndex+" => "+chkVal);
  var has_many = relation.get("has_many");

  switch (inputIndex) {
    case 2:
      console.log(relation.get("foreign_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var foreign_key = relation.get("foreign_key");
      var convention = lowFirstLetter(myModelName) + "_id"; //different
      if (foreign_key === chkVal) {
        if (foreign_key === convention) {
          printMsgLine(codingPan, "(OK)foreign_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(Ok)foreign_key: 不符慣例，不可省略!","white");
        }
      } else if (chkVal === undefined && chkVal === convention) {
          printMsgLine(codingPan, "(OK)foreign_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)foreign_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 3:
      console.log(relation.get("class_name")+", "+chkVal);
      if (upFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var class_name = relation.get("class_name");
      var convention = upFirstLetter(has_many.plural(true)); //different
      if (class_name === chkVal) {
        if (class_name === convention) {
          console.log("[\'"+class_name+"\', \'"+chkVal+"\', \'"+convention+"\']");
          printMsgLine(codingPan, "(OK)class_name: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(OK)class_name: 不符慣例，不可省略!","white");
        }
      } else if (class_name === undefined && chkVal === convention) {
          printMsgLine(codingPan, "(OK)class_name: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)class_name: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 4:
      console.log(relation.get("primary_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var primary_key = relation.get("primary_key");
      var convention = "id";
      if (primary_key === chkVal) {
        console.log(primary_key+" === "+chkVal);
        if (primary_key === convention) {
          console.log(primary_key+" === "+convention);
          printMsgLine(codingPan, "(OK)primary_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(OK)primary_key: 不符慣例，不可省略!","white");
        }
      } else if (primary_key === undefined && chkVal === convention) {
          printMsgLine(codingPan, "(OK)primary_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)primary_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    default:
      printMsgLine(codingPan, "錯誤：chkHasManyConvention有奇怪的Bug啊啊啊啊！","red");
      return false;
  }

  return true;
  

}

/*
* ONLY FOR [belongs_to]
* check if given input follows Rails convention or not
*/
function chkBelongsToConvention(codingPan, chkVal, relation, inputIndex) {
  var belongs_to = relation.get("belongs_to");

  switch (inputIndex) {
    case 2:
      console.log(relation.get("foreign_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var foreign_key = relation.get("foreign_key");
      var convention = belongs_to + "_id";
      if (foreign_key === chkVal) {
        if (foreign_key === convention) {
          printMsgLine(codingPan, "(OK)foreign_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(Ok)foreign_key: 不符慣例，不可省略!","white");
        }
      } else if (chkVal === undefined && chkVal === convention) {
          printMsgLine(codingPan, "(OK)foreign_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)foreign_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 3:
      console.log(relation.get("class_name")+", "+chkVal);
      if (upFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var class_name = relation.get("class_name");
      var convention = upFirstLetter(belongs_to);
      if (class_name === chkVal) {
        if (class_name === convention) {
          printMsgLine(codingPan, "(OK)class_name: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(OK)class_name: 不符慣例，不可省略!","white");
        }
      } else if (class_name === undefined && chkVal === convention) {
          printMsgLine(codingPan, "(OK)class_name: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)class_name: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 4:
      console.log(relation.get("primary_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var primary_key = relation.get("primary_key");
      var convention = "id";
      if (primary_key === chkVal) {
        if (primary_key === convention) {
          printMsgLine(codingPan, "(OK)primary_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(codingPan, "(OK)primary_key: 不符慣例，不可省略!","white");
        }
      } else if (chkVal === convention) {
          printMsgLine(codingPan, "(OK)primary_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(codingPan, "(NG)primary_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    default:
      printMsgLine(codingPan, "錯誤：chkBelongsToConvention有奇怪的Bug啊啊啊啊！","red");
      return false;
  }

  return true;
}

function chkSecondLineInput(relation, codingPan) {
  var relation2 = relation.split(",");
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
* check if the string have white space on right side
*/
function chkRightSpace(str) {
  return str.charAt(str.length - 1) === " " ? true : false;
}

/*
* check if the string have white space on left side
*/
function chkLeftSpace(str) {
  return str.charAt(0) === " " ? true : false;
}

/*
* check if the string have double quotes on both side and not just double quotes only
*/
function chkDoubleQuotes(str) {
  return (trimDQ(str) !== "" && (str === "\"" + trimDQ(str) + "\"")) ? true : false;
}

function getMode() {
  for (var i = 1; i < 4; i++) {
    if (document.getElementById("radio" + i).checked) {
      switch (i) {
        case 1:
          return "b";
        case 2:
          return "m";
        case 3:
          return "t";
        default:
          return "";
      }
    }
  }
}

function getInputs(mode) {
  var prefixStr;
  switch (mode) {
    case "b":
      prefixStr = ["bl"]
      break;

    case "m":
      prefixStr = ["hm"]
      break;

    default:
      alert("getInputs ERROR!");
      return;
  } 
  var inputs = [];
  inputs.push(document.getElementById(prefixStr + "-my-model-name").value.trim());  // [0] myModelName
  inputs.push(document.getElementById(prefixStr + "-relatoin-input").value.trim());  // [1] relatoinInput
  inputs.push(document.getElementById(prefixStr + "-fk").value.trim());  // [2] fk
  inputs.push(document.getElementById(prefixStr + "-ref-model-name").value.trim());  // [3] refModelName
  inputs.push(document.getElementById(prefixStr + "-pk").value.trim()); // [4] pk

  return inputs;
}

/*
* turn array into map
*/
function getRelationMap(relation) {
  var map = new Map();
  for (var i = 0; i < relation.length; i++) {
    map.set(relation[i][0].trim(), trimDQ(relation[i][1].trim()));
  }

  return map;
}

/*
* get DB schema input column name
*/
function getInputName(index) {
  switch (index) {
    case 2:
      return "外鍵";
    case 3:
      return "model name";
    case 4:
      return "主鍵";
  }
}

function getTypeName(mode) {
  switch (mode) {
    case "b":
      return "belongs_to";
    case "m":
      return "has_many";
    case "t":
      return "has_many";
    default:
      return "getTypeName有奇怪的Bug啊啊啊啊！";
  }
}


function getTypeForErrMsg(mode) {
  switch (mode) {
    case "b":
      return "belongs_to";
      break;
    case "m":
      return "has_many";
      break;
    case "t":
      return "through前面的冒號";
      break;
    default:
      return "getTypeForErrMsg有奇怪的Bug啊啊啊啊！";
      break;
  }
}

function setDbPanel(mode) {
  var bl_pk = document.getElementById("bl-pk");
  var bl_ref_model_name = document.getElementById("bl-ref-model-name");
  var bl_fk = document.getElementById("bl-fk");
  var bl_row = document.getElementById("bl-row");
  var hm_pk = document.getElementById("hm-pk");
  var hm_ref_model_name = document.getElementById("hm-ref-model-name");
  var hm_fk = document.getElementById("hm-fk");
  var hm_row = document.getElementById("hm-row");
  var chk_btn = document.getElementById("chk-btn");
  var disabled;
  var display;
  var color;
  switch (mode) {
    case "b":
      disabled = [false, true];
      color = ["white", "gray"];
      display = ["block", "none"];
      chk_btn.onclick = function() {chkBtHm();};
      break;
    case "m":
      disabled = [true, false];
      color = ["gray", "white"];
      display = ["none", "block"];
      chk_btn.onclick = function() {chkBtHm();};
      break;
    case "t":
      disabled = [false, false];
      color = ["white", "white"];
      display = ["block", "block"];
      chk_btn.onclick = function() {chkHmTh();};
      break;
    default:
      alert("BUG!!!!!");
      return;
  }

  bl_pk.disabled = disabled[0];
  bl_pk.style.backgroundColor = color[0];
  bl_ref_model_name.disabled = disabled[0];
  bl_ref_model_name.style.backgroundColor = color[0];
  bl_fk.disabled = disabled[0];
  bl_fk.style.backgroundColor = color[0];
  bl_row.style.display = display[0];
  hm_pk.disabled = disabled[1];
  hm_pk.style.backgroundColor = color[1];
  hm_ref_model_name.disabled = disabled[1];
  hm_ref_model_name.style.backgroundColor = color[1];
  hm_fk.disabled = disabled[1];
  hm_fk.style.backgroundColor = color[1];
  hm_row.style.display = display[1];
}

/*
* capitalize first letter of the given string
*/
function upFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/*
* turn first letter of the given string to lowercase
*/
function lowFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function relation_log(relation_array){
  console.log("[");
  relation_array.forEach(function(arg, index){
    console.log("[" + arg[0] + "," + arg[1] + "]");
  })

  console.log("]");
}

/*
* trim the double quotes on both side in string 
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

function setResultElements(codingPan, title, modelName, methodName, mode) {
  printMsgLine(codingPan, "==== " + title + " ====<br>", "code-white");
  printMsgSpan(codingPan, "Class ", "code-red");
  printMsgSpan(codingPan, modelName, "code-green");
  printMsgSpan(codingPan, " < ", "code-white");
  printMsgSpan(codingPan, "ApplicationRecord<br>", "code-green");
  printMsgSpan(codingPan, "&nbsp;&nbsp;" + getTypeName(mode) + " ", "code-white");
  printMsgSpan(codingPan, ":" + methodName, "code-purple");
}

/*
* write user input relation setup in code panel
*/
function resultInPan(codingPan, myModelName, relation, mode) {
  setResultElements(codingPan, "your setup", myModelName, relation[0][1], mode);
  for (var i = 1; i < relation.length; i++) {
    printMsgSpan(codingPan, ", ", "code-white")
    printMsgSpan(codingPan, relation[i][0]+ ": ", "code-purple")
    printMsgSpan(codingPan, relation[i][1], "code-yellow")
  }
  printMsgLine(codingPan, "end", "code-red");
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
* print message <p> in particular color on coding panel
*/
function printMsgLine(codingPan, str, color) {
  var msg = document.createElement("p");
  if (color.includes("code")) {
    msg.classList.add(color);
  } else {
    msg.style.color = color;
  }
  msg.innerHTML = str;
  codingPan.appendChild(msg);
}

/*
* print messages <span> in particular color on coding panel
*/
function printMsgSpan(codingPan, str, color) {
  var msg = document.createElement("span");
  msg.classList.add(color);
  msg.innerHTML = str;
  codingPan.appendChild(msg);
}


/*
* pluralize a string
* usage: pluralize => singularString.plural();
*        singularize => pluralString.plural(true);
* reference: https://stackoverflow.com/questions/27194359/javascript-pluralize-a-string
*/
String.prototype.plural = function(revert){

    var plural = {
        '(quiz)$'               : "$1zes",
        '^(ox)$'                : "$1en",
        '([m|l])ouse$'          : "$1ice",
        '(matr|vert|ind)ix|ex$' : "$1ices",
        '(x|ch|ss|sh)$'         : "$1es",
        '([^aeiouy]|qu)y$'      : "$1ies",
        '(hive)$'               : "$1s",
        '(?:([^f])fe|([lr])f)$' : "$1$2ves",
        '(shea|lea|loa|thie)f$' : "$1ves",
        'sis$'                  : "ses",
        '([ti])um$'             : "$1a",
        '(tomat|potat|ech|her|vet)o$': "$1oes",
        '(bu)s$'                : "$1ses",
        '(alias)$'              : "$1es",
        '(octop)us$'            : "$1i",
        '(ax|test)is$'          : "$1es",
        '(us)$'                 : "$1es",
        '([^s]+)$'              : "$1s"
    };

    var singular = {
        '(quiz)zes$'             : "$1",
        '(matr)ices$'            : "$1ix",
        '(vert|ind)ices$'        : "$1ex",
        '^(ox)en$'               : "$1",
        '(alias)es$'             : "$1",
        '(octop|vir)i$'          : "$1us",
        '(cris|ax|test)es$'      : "$1is",
        '(shoe)s$'               : "$1",
        '(o)es$'                 : "$1",
        '(bus)es$'               : "$1",
        '([m|l])ice$'            : "$1ouse",
        '(x|ch|ss|sh)es$'        : "$1",
        '(m)ovies$'              : "$1ovie",
        '(s)eries$'              : "$1eries",
        '([^aeiouy]|qu)ies$'     : "$1y",
        '([lr])ves$'             : "$1f",
        '(tive)s$'               : "$1",
        '(hive)s$'               : "$1",
        '(li|wi|kni)ves$'        : "$1fe",
        '(shea|loa|lea|thie)ves$': "$1f",
        '(^analy)ses$'           : "$1sis",
        '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",        
        '([ti])a$'               : "$1um",
        '(n)ews$'                : "$1ews",
        '(h|bl)ouses$'           : "$1ouse",
        '(corpse)s$'             : "$1",
        '(us)es$'                : "$1",
        's$'                     : ""
    };

    var irregular = {
        'move'   : 'moves',
        'foot'   : 'feet',
        'goose'  : 'geese',
        'sex'    : 'sexes',
        'child'  : 'children',
        'man'    : 'men',
        'tooth'  : 'teeth',
        'person' : 'people'
    };

    var uncountable = [
        'sheep', 
        'fish',
        'deer',
        'moose',
        'series',
        'species',
        'money',
        'rice',
        'information',
        'equipment'
    ];

    // save some time in the case that singular and plural are the same
    if(uncountable.indexOf(this.toLowerCase()) >= 0)
      return this;

    // check for irregular forms
    for(word in irregular){

      if(revert){
              var pattern = new RegExp(irregular[word]+'$', 'i');
              var replace = word;
      } else{ var pattern = new RegExp(word+'$', 'i');
              var replace = irregular[word];
      }
      if(pattern.test(this))
        return this.replace(pattern, replace);
    }

    if(revert) var array = singular;
         else  var array = plural;

    // check for matches using regular expressions
    for(reg in array){

      var pattern = new RegExp(reg, 'i');

      if(pattern.test(this))
        return this.replace(pattern, array[reg]);
    }

    return this;
}

/*
* 
* 
* 
*/