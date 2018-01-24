/**
 * Basic function for checking [belongs_to] and [has_many] relation
 * Called by chkBtHm() and chkHmTh()
 * 
 * @param  {Number}     mode        |for indentifing checking mode
 * @param  {Array}      inputs      |user inputs from panel
 * @param  {Object}     resultPanel |result panel(HTML) for printing result
 * 
 * @return {Map}        relationMap |if passed
 * @return {undefined}  undefined   |if error
 * @return {null}       null        |if DB Schema field is not filled
 */
function checkBase(mode, inputs, resultPanel) {
  /**************************
  * inputs[0] myModelName
  * inputs[1] relatoinInput
  * inputs[2] fk
  * inputs[3] refModelName
  * inputs[4] pk
  **************************/

  printMsgH(resultPanel, 2, "************* " + getTypeName(mode) + " *************<br>","aqua");
  // check if model name or input lines is correct
  if (!chkMyModelName(inputs[0], resultPanel)) return;
  if (!chkRelationLines(mode, inputs[1].split("\n"), resultPanel)) return;

  // check if relation symbol is correct
  var relationArray = inputs[1].split(",");
  var map = chkRelationSymbol(relationArray, resultPanel, mode);
  if (!map.get("chk")) return;

  // turn relation Array into Map. Print user inputs and Rails convention
  var relationMap = getRelationMap(map.get("relation"));
  showUserInputs(resultPanel, inputs[0], map.get("relation"), mode); 
  showRailsConvention(resultPanel, inputs[0], relationMap.get(getTypeName(mode)), mode);

  // check if relation follows rails convention
  var result = chkDbSchemaInput(resultPanel, inputs, relationMap, mode);
  if (result === null) return null; // if DB Schema field is not filled 
  if (result) return relationMap;   // if passed
  return undefined;                 // if error
}

/**
 * Function for checking [belongs_to] and [has_many] 
 * It gather params for checkBase(), and then call checkBase() 
 * Called by input button
 * 
 * @return {undefine} |it don't return 
 */
function chkBtHm() {
  var resultPanel = document.getElementById("coding-pan");
  cleanPan(resultPanel);
  var mode = getMode();
  if (mode === "") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }
  var inputs = getInputs(mode);
  checkBase(mode, inputs, resultPanel);
}

/**
 * Function for checking "whole" [has_many :through]
 * It gather params for checkBase(), and then call checkBase() for checking
 *    [belongs_to] and [has_many] first, then call chkThrough() and chkThroughRelation()
 *    for checking "only" [has_many :through]
 * Called by input button
 * 
 * @return {undefine} |it don't return 
 */
function chkHmTh() {
  var resultPanel = document.getElementById("coding-pan");
  cleanPan(resultPanel);
  var mode = getMode();
  if (mode === "") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }

  /**************************
  * inputsBl / inputsHm
  * [0] myModelName
  * [1] relatoinInput
  * [2] fk
  * [3] refModelName
  * [4] pk
  **************************/

  // check [belongs_to] and [has_many] by checkBase()
  var inputsBl = getInputs("b");
  var blMap = checkBase("b", inputsBl, resultPanel);
  var inputsHm = getInputs("m");
  var hmMap = checkBase("m", inputsHm, resultPanel);

  // if DB Schema field is not filled, show error message and return
  if (blMap === null || hmMap === null) {
    printMsgH(resultPanel, 3, "大俠您把DB Schema的欄位填好再來吧....<br>","orange");
    return;
  }

  // if both [belongs_to] and [has_many] relation setup are correct
  // then check "only" [has_many :through], otherwise show error and return
  if (typeof blMap === 'object' && typeof hmMap === 'object') {
    // check "only" [has_many :through]
    var hmthMap = chkThrough(resultPanel, inputsHm[0]);
    if (typeof hmthMap !== 'object') return;
    chkThroughRelation(blMap, hmMap, hmthMap, inputsBl[0], resultPanel);
  } else {
    printMsgH(resultPanel, 3, "大俠您把上面的東西修好再來吧....<br>","orange");
  }
}

/**
 * Function for checking "only" [has_many :through]
 * Called by chkHmTh()
 * 
 * @param  {Object} resultPanel |result panel(HTML) for printing result
 * @param  {String} hmModelName |model name of [has_many] relation
 * @return {Map}    relationMap |map of user input relations 
 */
function chkThrough(resultPanel, hmModelName) {
  printMsgH(resultPanel, 2, "************* has_many :through *************<br>","aqua");
  var inputsTh = getThroughTextArea();

  // check if model name or input lines is correct
  if (!chkRelationLines("t", inputsTh.split("\n"), resultPanel)) return;
  var relationArray = inputsTh.split(",");
  var map = chkThroughSymbol(relationArray, resultPanel);
  if (!map.get("chk")) return;

  showUserInputs2(resultPanel, hmModelName, map.get("relation"));
  printMsgLine(resultPanel, "==== checking result ====<br>","code-white");
  return getRelationMap(map.get("relation"));
}

/**
 * Check if model name follows Rails convention
 * Called by checkBase()
 * 
 * @param  {String} myModelName |model name of
 * @param  {Object} resultPanel |result panel(HTML) for printing result
 * @return {Boolean} ----       |model name follows Rails convention or not
 */
function chkMyModelName(myModelName, resultPanel) {
  // check if model name is empty
  // if not empty then call chkCapitalize() for checking first letter
  if (myModelName === "") {
    printMsgLine(resultPanel, "錯誤：Model名稱必填","red");
    return false;
  }
  if (!isNaN(myModelName.charAt(0))) {   //first latter is a number
    printMsgLine(resultPanel, "錯誤：Model名開頭不能為數字！","red");
    return false;
  }
  if (upFirstLetter(myModelName) !== myModelName) {
    printMsgLine(resultPanel, "錯誤：Model名開頭需大寫！","red");    
    return false;
  }

  // check if model name is singular
  // DON'T USE TRIPLE EQUAL!!!
  // plural string .plural() will return an array not a string
  if (myModelName == myModelName.plural()) {
    printMsgLine(resultPanel, "錯誤：Model名須為單數！","red");    
    return false;
  }
  return true;
}

/**
 * Check if relation input is only one line
 * Called by checkBase() and chkThrough()
 * 
 * @param  {{Number}  mode            |for indentifing checking mode
 * @param  {Array}    relatoinInput   |user input relation from panel, split by \n
 * @param  {Object}   resultPanel     |result panel(HTML) for printing result
 * @return {Boolean}
 */
function chkRelationLines(mode, relatoinInput, resultPanel) {
  console.log(" chkRelationLines...");
  if (mode === "b" || mode === "m" || mode === "t") {
    if (relatoinInput.length == 1) {
      return true;
    }
    printMsgLine(resultPanel, "錯誤：輸入超過一行","red");
    return false;
  }
  printMsgLine(resultPanel, "錯誤：chkRelationLines有奇怪的Bug啊啊啊啊！","red");
  return false;
}

/**
 * Checking relation symbol for [belongs_to] and [has_many]
 * return map {("chk", false)} if not pass
 * return map {("chk", true), ("relation", relation2)} if pass
 * relation2 is user input relation split by colon :
 * Called by checkBase()
 * 
 * @param  {Array}    relation      |user input relation from panel, split by comma ,
 * @param  {Object}   resultPanel   |result panel(HTML) for printing result
 * @param  {{Number}  mode          |for indentifing checking mode
 * @return {Map}      map           |pass or ont
 */
function chkRelationSymbol(relation, resultPanel, mode) {
  var relation2 = [];
  for (var i = 0; i <= relation.length-1; i++) {
    relation2.push(relation[i].split(":"));
  }
  var map = new Map();
  map.set("chk", false);

  if (!chkRelationKeyword(relation2[0][0].trim(), mode, resultPanel)) return map;
  if (!chkRelationMethodName(relation2[0][1].trim(), mode, resultPanel)) return map;

  // check arguments of relation. 
  // if not pass, show location that might cause error and return
  for (var i = 0; i < relation2.length; i++) {
    if (relation2[i].length < 2) {
      var place = relation2[i][0] === "" ? " [痾...這不好說] " : relation2[i][0];
      printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (relation2[i].length > 2) {
      printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+relation2[i][1]+"附近。","red");
      return map;
    }
    if (relation2[i][0] === "" || relation2[i][1] === "") {
      var place = relation2[i-1][0] === "" ? " [痾...這不好說] " : relation2[i-1][0];
      printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (i > 0) {
      if (!chkRelationArg(relation2[i][0].trim())) { 
        printMsgLine(resultPanel, "錯誤：關鍵字應為\'class_name\', \'foreign_key\', \'primary_key\'其中之一。<br>位於"+relation2[i][0],"red");
        return map;
      }
      if (chkRightSpace(relation2[i][0])) {
        printMsgLine(resultPanel, "錯誤：你的冒號要靠緊"+relation2[i][0],"red");
        return map;
      }
      if (!chkDoubleQuotes(relation2[i][1].trim())) {
        printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的引號！<br>位於"+relation2[i][1]+"附近。","red");
        return map;
      }
    } else {
      if (chkLeftSpace(relation2[0][1])) {
        printMsgLine(resultPanel, "錯誤：你的冒號要靠緊"+relation2[0][1],"red");
        return map;
      }
    }
  }
  map.set("relation", relation2);
  map.set("chk", true);
  return map;
}

/**
 * Checking relation symbol for [has_many :through]
 * return map {("chk", false)} if not pass
 * return map {("chk", true), ("relation", relation2)} if pass
 * relation2 is user input relation split by colon :
 * Called by checkBase()
 * 
 * @param  {Array}    relation      |user input relation from panel, split by comma ,
 * @param  {Object}   resultPanel   |result panel(HTML) for printing result
 * @return {Map}      map           |pass or ont
 */
function chkThroughSymbol(relation, resultPanel) {
  var relation2 = [];
  for (var i = 0; i <= relation.length-1; i++) {
    relation2.push(relation[i].split(":"));
  }
  var map = new Map();
  map.set("chk", false);

  // check keyword = has_many
  if (!chkRelationKeyword(relation2[0][0].trim(), "m", resultPanel)) return map;

  // check arguments of relation. 
  // if not pass, show location that might cause error and return
  if (relation2[0].length < 2) {
    var place = relation2[0][0] === "" ? " [痾...這不好說] " : relation2[0][0];
    printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
    return map;
  }
  if (relation2[0].length > 2) {
    printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+relation2[0][1]+"附近。","red");
    return map;
  }
  if (relation2[0][0] === "" || relation2[0][1] === "") {
    printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位置嘛...痾...這不好說。","red");
    return map;
  }
  // through & source
  if (relation2.length < 2) {
    printMsgLine(resultPanel, "錯誤：你的through咧？","red");
    return map;
  }
  for (var i = 1; i < relation2.length; i++) {
    if (relation2[i].length !== 3) {
      printMsgLine(resultPanel, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+relation2[i-1][relation2[i-1].length-1]+"的逗號以後。","red");
      return map;
    }
    if (!chkHmThArg(relation2[i][0].trim())) {
      printMsgLine(resultPanel, "錯誤：關鍵字應為\'through\', \'source\'其中之一。<br>位於"+relation2[i][0],"red");
      return map;
    }
    if (chkRightSpace(relation2[i][0])) {
      printMsgLine(resultPanel, "錯誤：你的冒號要靠緊"+relation2[i][0],"red");
      return map;
    }
    if (relation2[i][1].trim() !== "") {
      printMsgLine(resultPanel, "錯誤："+relation2[i][0]+"的兩個冒號中間有怪東西！","red");
      return map;
    }
    if (chkLeftSpace(relation2[i][2])) {
      printMsgLine(resultPanel, "錯誤：你的冒號要靠緊"+relation2[1][2],"red");
      return map;
    } else {
      // copy to [i][1] to fit getRelationMap() rule, it only read array[0] and array[1].
      relation2[i][1] = relation2[i][2];  
    }
  }
  map.set("relation", relation2);
  map.set("chk", true);
  return map;
}

/**
 * check [has_many :through] relation, print result on result panel
 * Called by chkHmTh()
 * 
 * @param  {Map}      bMap          |map of [belongs_to] relation
 * @param  {Map}      mMap          |map of [has_many] relation
 * @param  {Map}      tMap          |map of [has_many :through] relation
 * @param  {String}   bModelName    |model name of [belongs_to] relation
 * @param  {Object}   resultPanel   |result panel(HTML) for printing result
 * @return {}         ----          |it don't return
 */
function chkThroughRelation(bMap, mMap, tMap, bModelName, resultPanel) {
  if (tMap.get("through") === mMap.get("has_many")) {
    printMsgLine(resultPanel, "(OK) [has_many :through]的"+tMap.get("through")+"跟[has_many]的"+mMap.get("has_many")+"對得上。","white");
    if (upFirstLetter(mMap.get("has_many").plural(true)) === bModelName) {
      printMsgLine(resultPanel, "(OK) [belongs_to]的"+bModelName+"跟[has_many]的"+mMap.get("has_many")+"對得上。","white");
      if (tMap.get("source") === undefined) {
        if (tMap.get("has_many") === bMap.get("belongs_to")) {
          printMsgLine(resultPanel, "(OK) [has_many :through]的"+tMap.get("has_many")+"跟[belongs_to]的"+bMap.get("belongs_to")+"對得上。","white");
          return;
        }
        printMsgLine(resultPanel, "錯誤：[has_many :through]的"+tMap.get("has_many")+"跟[belongs_to]的"+bMap.get("belongs_to")+"對不上，兩者應要相同，或者[has_many :through]要設定source。","red");
        return;
      } else {  // have [source] arg
        if (tMap.get("source") === bMap.get("belongs_to")) {
          printMsgLine(resultPanel, "(OK) [has_many :through]的"+tMap.get("source")+"跟[belongs_to]的"+bMap.get("belongs_to")+"對得上。","white");
          return;
        }
        printMsgLine(resultPanel, "錯誤：[has_many :through]的"+tMap.get("source")+"跟[belongs_to]的"+bMap.get("belongs_to")+"對不上，兩者應要相同。","red");
        return;
      }
    }
    printMsgLine(resultPanel, "錯誤：[belongs_to]的"+bModelName+"跟[has_many]的"+mMap.get("has_many")+"對不上。<br>兩者關係為"+bModelName+" -> 字首小寫x複數 = "+mMap.get("has_many"),"red");
    return;
  }
  printMsgLine(resultPanel, "錯誤：[has_many :through]的"+tMap.get("through")+"跟[has_many]的"+mMap.get("has_many")+"對不上，兩者應要相同。","red");
  return;
}

/**
 * check [belongs_to] [has_many] relation arguments equals to following words
 *    class_name, foreign_key, primary_key
 *
 * Called by chkRelationSymbol() 
 * @param  {String}   str   |relation argument
 * @return {Boolean}  --    |equals or not
 */
function chkRelationArg(str) {
  legalArguments = ["class_name", "foreign_key", "primary_key"]
  for (var i = 0; i < legalArguments.length; i++) {
    str === legalArguments[i];
    return true;
  }
  return false;
}

/**
 * check [has_many :through] relation arguments equals to following words
 *    through, source
 *
 * Called by chkRelationSymbol() 
 * @param  {String}   str   |relation argument
 * @return {Boolean}  --    |equals or not
 */
function chkHmThArg(str) {
  if (str === "through" || str === "source") {
    return true;
  }
  return false;
}

/**
 * check if target keyword equals Rails relation type [belongs_to] or [has_many]
 * Called by chkRelationSymbol() and chkThroughSymbol()
 * @param  {String}   keyword       |target
 * @param  {Object}   resultPanel   |result panel(HTML) for printing result
 * @param  {{Number}  mode          |for indentifing checking mode
 * @return {Boolean}  ---           |equals or ont
 */
function chkRelationKeyword(keyword, mode, resultPanel) {
  switch (mode) {
    case "b":
      if (keyword !== "belongs_to") {
        printMsgLine(resultPanel, "錯誤：你的"+keyword+"應為belongs_to","red");
        return false;
      }
      return true;

    case "m":
      if (keyword !== "has_many") {
        printMsgLine(resultPanel, "錯誤：你的"+keyword+"應為has_many","red");
        return false;
      }
      return true;

    case "t": // bypass, check later if no [source] argument.
      return true;

    default:
      printMsgLine(resultPanel, "錯誤：chkRelationKeyword有奇怪的Bug啊啊啊啊！","red");
      return false;
  }
}
/**
 * check if relation method follows Rails convention
 * Called by chkRelationSymbol()
 * @param  {[type]}
 * @param  {Object}   resultPanel   |result panel(HTML) for printing result
 * @param  {{Number}  mode          |for indentifing checking mode
 * @return {Boolean}  ---           |follows or ont
 */
function chkRelationMethodName(methodName, mode, resultPanel) {
  switch (mode) {
    case "b":
      if (methodName == methodName.plural()) {  // don't use === . plural_string.plural() return an object, not string
        printMsgLine(resultPanel, "錯誤：你的"+methodName+"應為單數"+methodName.plural(true),"red");
        return false;
      }
      return true;
    case "m":
      if (methodName == methodName.plural(true)) {
        printMsgLine(resultPanel, "錯誤：你的"+methodName+"應為複數"+methodName.plural(),"red");
        return false;
      }
      return true;
    default:
      printMsgLine(resultPanel, "錯誤：chkRelationMethodName有奇怪的Bug啊啊啊啊！","red");
      return false;
  }
}

/*
* write Rails convention setup on code panel
*/
function showRailsConvention(resultPanel, modelName, methodName, mode) {
  console.log("showRailsConvention");
  setResultElements(resultPanel, "Rails convention", modelName, methodName, mode);
  printMsgSpan(resultPanel, ", ", "code-white");
  printMsgSpan(resultPanel, "class_name: ", "code-purple");
  printMsgSpan(resultPanel, "\"" + upFirstLetter(methodName) + "\"", "code-yellow");
  printMsgSpan(resultPanel, ", ", "code-white");
  printMsgSpan(resultPanel, "foreign_key: ", "code-purple");
  printMsgSpan(resultPanel, "\"" + methodName + "_id\"", "code-yellow");
  printMsgSpan(resultPanel, ", ", "code-white");
  printMsgSpan(resultPanel, "primary_key: ", "code-purple");
  printMsgSpan(resultPanel, "\"id\"", "code-yellow");
  printMsgLine(resultPanel, "end", "code-red");
}

/*
* check given DB schema follows Rails convention or not
* return null and skip checking if DB schema not been set.  
* return true if passed
* return false if not
*/
function chkDbSchemaInput(resultPanel, inputs, relation, mode) {
  // inputs[0] myModelName
  // inputs[2] fk
  // inputs[3] refTableName
  // inputs[4] pk
  if (inputs[2] === "" && inputs[3] === "" && inputs[4] === "") {
    return null;
  }
  var result = true;
  printMsgLine(resultPanel, "==== checking result ====<br>","code-white");

  if (mode === "m" || mode === "t") {
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        if (!chkHasManyConvention(resultPanel, inputs[i], relation, i, inputs[0])) result = false;
      } else {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
        result = false;
      }
    }
  } else { // mode === "b"
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        if (!chkBelongsToConvention(resultPanel, inputs[i], relation, i)) result = false;
      } else {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
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
function chkHasManyConvention(resultPanel, chkVal, relation, inputIndex, myModelName) {
  console.log("chkHasManyConvention:"+inputIndex+" => "+chkVal);
  var has_many = relation.get("has_many");

  switch (inputIndex) {
    case 2:
      console.log(relation.get("foreign_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var foreign_key = relation.get("foreign_key");
      var convention = lowFirstLetter(myModelName) + "_id"; //different
      if (foreign_key === chkVal) {
        if (foreign_key === convention) {
          printMsgLine(resultPanel, "(OK) foreign_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) foreign_key: 不符慣例，不可省略!","white");
        }
      } else if (foreign_key === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) foreign_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)foreign_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 3:
      console.log(relation.get("class_name")+", "+chkVal);
      if (upFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var class_name = relation.get("class_name");
      var convention = upFirstLetter(has_many.plural(true)); //different
      if (class_name === chkVal) {
        if (class_name === convention) {
          console.log("[\'"+class_name+"\', \'"+chkVal+"\', \'"+convention+"\']");
          printMsgLine(resultPanel, "(OK) class_name: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) class_name: 不符慣例，不可省略!","white");
        }
      } else if (class_name === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) class_name: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)class_name: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 4:
      console.log(relation.get("primary_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var primary_key = relation.get("primary_key");
      var convention = "id";
      if (primary_key === chkVal) {
        console.log(primary_key+" === "+chkVal);
        if (primary_key === convention) {
          console.log(primary_key+" === "+convention);
          printMsgLine(resultPanel, "(OK) primary_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) primary_key: 不符慣例，不可省略!","white");
        }
      } else if (primary_key === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) primary_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)primary_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    default:
      printMsgLine(resultPanel, "錯誤：chkHasManyConvention有奇怪的Bug啊啊啊啊！","red");
      return false;
  }

  return true;
  

}

/*
* ONLY FOR [belongs_to]
* check if given input follows Rails convention or not
*/
function chkBelongsToConvention(resultPanel, chkVal, relation, inputIndex) {
  var belongs_to = relation.get("belongs_to");

  switch (inputIndex) {
    case 2:
      console.log(relation.get("foreign_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var foreign_key = relation.get("foreign_key");
      var convention = belongs_to + "_id";
      if (foreign_key === chkVal) {
        if (foreign_key === convention) {
          printMsgLine(resultPanel, "(OK) foreign_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) foreign_key: 不符慣例，不可省略!","white");
        }
      } else if (foreign_key === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) foreign_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)foreign_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 3:
      console.log(relation.get("class_name")+", "+chkVal);
      if (upFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var class_name = relation.get("class_name");
      var convention = upFirstLetter(belongs_to);
      if (class_name === chkVal) {
        if (class_name === convention) {
          printMsgLine(resultPanel, "(OK) class_name: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) class_name: 不符慣例，不可省略!","white");
        }
      } else if (class_name === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) class_name: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)class_name: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    case 4:
      console.log(relation.get("primary_key")+", "+chkVal);
      if (lowFirstLetter(chkVal) !== chkVal) {
        printMsgLine(resultPanel, "錯誤：DB schema" + getInputName(inputIndex) + "欄位大小寫有誤。","red");
        return false;
      }
      var primary_key = relation.get("primary_key");
      var convention = "id";
      if (primary_key === chkVal) {
        if (primary_key === convention) {
          printMsgLine(resultPanel, "(OK) primary_key: 符合慣例，可省略!","white");
        } else {
          printMsgLine(resultPanel, "(OK) primary_key: 不符慣例，不可省略!","white");
        }
      } else if (primary_key === undefined && chkVal === convention) {
          printMsgLine(resultPanel, "(OK) primary_key: 符合慣例，可省略!","white");
      } else {
        printMsgLine(resultPanel, "(NG)primary_key: 關聯設定錯誤，應為\"" + chkVal + "\"","red");
        return false;
      }
      break;
    default:
      printMsgLine(resultPanel, "錯誤：chkBelongsToConvention有奇怪的Bug啊啊啊啊！","red");
      return false;
  }

  return true;
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

function getThroughTextArea() {
  return document.getElementById("hmth-relatoin-input").value.trim();
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
      return "has_many :through";
    default:
      return "getTypeName有奇怪的Bug啊啊啊啊！";
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
  var hmth_relatoin_input = document.getElementById("hmth-relatoin-input");
  var disabled;
  var display;
  var color;
  switch (mode) {
    case "b":
      disabled = [false, true];
      color = ["white", "gray"];
      display = ["block", "none", "none"];
      chk_btn.onclick = function() {chkBtHm();};
      break;
    case "m":
      disabled = [true, false];
      color = ["gray", "white"];
      display = ["none", "block", "none"];
      chk_btn.onclick = function() {chkBtHm();};
      break;
    case "t":
      disabled = [false, false];
      color = ["white", "white"];
      display = ["block", "block", "block"];
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
  hmth_relatoin_input.style.display = display[2];
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

/**
 * check if given string's first letter is lower case
 * @param  {String}   str
 * @return {Boolean}
 */
function firstLetterIsLowerCase(str) {
  return str.charAt(0).toLowerCase() === str.charAt(0);
}

/**
 * check if given string's first letter is upper case
 * @param  {String}   str
 * @return {Boolean}
 */
function firstLetterIsUpperCase(str) {
  return str.charAt(0).toUpperCase() === str.charAt(0);
}

function relation_log(relation_array){
  console.log("[");
  relation_array.forEach(function(arg, index){
    console.log("[" + arg[0] + "," + arg[1] + "]");
  })

  console.log("]");
}

/**
 * turn a string into singular and make it's first letter into uppercase
 * @param  {String}   str   target string
 * @return {String}
 */
function getUpperSingular(str) {
  return upFirstLetter(str).plural(true);
}

/*
* trim the double quotes on both side in string 
*/
function trimDQ(str) {
  return str.replace(/\"/gm, "");
}

function setResultElements(resultPanel, title, modelName, methodName, mode) {
  printMsgLine(resultPanel, "==== " + title + " ====<br>", "code-white");
  printMsgSpan(resultPanel, "Class ", "code-red");
  printMsgSpan(resultPanel, modelName, "code-green");
  printMsgSpan(resultPanel, " < ", "code-white");
  printMsgSpan(resultPanel, "ApplicationRecord<br>", "code-green");
  printMsgSpan(resultPanel, "&nbsp;&nbsp;" + getTypeName(mode) + " ", "code-white");
  printMsgSpan(resultPanel, ":" + methodName, "code-purple");
}

/*
* write user input relation setup in code panel
*/
function showUserInputs(resultPanel, myModelName, relation, mode) {
  setResultElements(resultPanel, "your setup", myModelName, relation[0][1], mode);
  for (var i = 1; i < relation.length; i++) {
    printMsgSpan(resultPanel, ", ", "code-white")
    printMsgSpan(resultPanel, relation[i][0]+ ": ", "code-purple")
    printMsgSpan(resultPanel, relation[i][1], "code-yellow")
  }
  printMsgLine(resultPanel, "end", "code-red");
}

/*
* write user input relation setup in code panel
*/
function showUserInputs2(resultPanel, myModelName, relation) {
  setResultElements(resultPanel, "your setup", myModelName, relation[0][1], "m");
  for (var i = 1; i < relation.length; i++) {
    printMsgSpan(resultPanel, ", ", "code-white")
    printMsgSpan(resultPanel, relation[i][0]+ ": :", "code-purple")
    printMsgSpan(resultPanel, relation[i][1], "code-purple")
  }
  printMsgLine(resultPanel, "end", "code-red");
}

/*
* clean coding pan
* remove all child inside it
*/
function cleanPan(resultPanel) {
  while (resultPanel.lastChild != null) {
    resultPanel.removeChild(resultPanel.lastChild);
  }
  // console.log("Cleared!");
}

/*
* print message <p> in particular color on coding panel
*/
function printMsgLine(resultPanel, str, color) {
  var msg = document.createElement("p");
  if (color.includes("code")) {
    msg.classList.add(color);
  } else {
    msg.style.color = color;
  }
  msg.innerHTML = str;
  resultPanel.appendChild(msg);
}

/*
* print message <hx> in particular color on coding panel
*/
function printMsgH(resultPanel, size, str, color) {
  var msg = document.createElement("h" + size);
  if (color.includes("code")) {
    msg.classList.add(color);
  } else {
    msg.style.color = color;
  }
  msg.innerHTML = str;
  resultPanel.appendChild(msg);
}

/*
* print messages <span> in particular color on coding panel
*/
function printMsgSpan(resultPanel, str, color) {
  var msg = document.createElement("span");
  msg.classList.add(color);
  msg.innerHTML = str;
  resultPanel.appendChild(msg);
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
        'gas'    : 'gases',
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