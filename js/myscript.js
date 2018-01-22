function check (){
  var mode = document.getElementById("mode").innerHTML;
  if (mode !== "b" && mode !== "m") {
    console.log("WTF have you done?");
    alert("WTF have you done?");
    return;
  }
  
  var inputs = [];
  inputs.push(document.getElementById("my-model-name").value.trim());  // [0] myModelName
  inputs.push(document.getElementById("relatoin-input").value.trim());  // [1] relatoinInput
  inputs.push(document.getElementById("fk").value.trim());  // [2] fk
  inputs.push(document.getElementById("ref-model-name").value.trim());  // [3] refModelName
  inputs.push(document.getElementById("pk").value.trim());  // [4] pk

  var codingPan = document.getElementById("coding-pan");

  // return if model name is not correct
  if (!chkMyModelName(inputs[0], codingPan) && true) return;

  var map = chkRelationInput(inputs[1], codingPan, mode);
  if (!map.get("chk")) {
    // alert("有錯喔");
    console.log("有錯喔");
    return;
  }
  
  var relation = getRelationMap(map.get("relation"));
  var line2;  // only for mode === "t"
  mode = map.get("mode");
  resultInPan(codingPan, inputs[0], map.get("relation"));
  switch (mode) {
    case "b":
      showRailsDefault(codingPan, inputs[0], relation.get("belongs_to"));
      break;
    case "m":
      showRailsDefault(codingPan, inputs[0], relation.get("has_many"));
      break;
    case "t":
      showRailsDefault(codingPan, inputs[0], relation.get("has_many"));
      line2 = map.get("line2");
      break;
    default: // 可能不需要default，以後可以拿掉
      console.log("有錯喔");
      break;
  }
  
  chkDbSchemaInput(codingPan, inputs, relation, mode);
  

  // console.log("yooo");
}

function test() {
  var relatoinInput = document.getElementById("relatoin-input").value.trim();
  var str = relatoinInput.split("\n");
  console.log(str[0]);
  console.log(str[1]);
}

/*
* checking model name
* return false if model name didn't pass
* return true if passed 
*/
function chkMyModelName(myModelName, codingPan) {
  cleanPan(codingPan);

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
*/ 
function chkRelationInput(relatoinInput, codingPan, mode) {
  // console.log("Checking relatoin...");
  
  // set up map
  var map = new Map();

  // check input has belongs_to or not
  mode = chkRelationType(mode, relatoinInput, codingPan);
  if (mode === "") {
    map.set("chk", false);
    return map;
  }

  var twoLine = [];
  var relation;
  if (mode === "t") { // [has_many :through] have two line
    twoLine = relatoinInput.split("\n");
    relation = twoLine[0].split(",");
  } else {
    relation = relatoinInput.split(",");
  }


  // check if input has right symbol
  var map2 = chkRelationSymbol(relation, codingPan);
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
    map.set("line2", twoLine[1]);
  }
  return map;
}

/*
* checking relation type
* return "t" if it's [has_many :through]
* return mode if it's [has_many] or [belongs_to]
* else return ""
*/
function chkRelationType(mode, relatoinInput, codingPan) {
  console.log(" chkRelationType...");
  switch (mode) {
    case "b":
      if (relatoinInput.includes("belongs_to")) {
        return mode;
      }
      break;
    case "m":
      if (relatoinInput.includes("has_many")) {
        if (relatoinInput.includes(":through")) {
          return "t";
        }
        if (relatoinInput.includes("through")) { //symbol error, lack of ":"
          mode = "t";
        } else {
          return mode;
        }
      }
      break;
    default:
      break;
  }
  // set up msg 
  printMsgLine(codingPan, "錯誤：你的" + getType(mode) + "咧?","red");
  return "";
}

function getType(mode) {
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
      return "You found a bug!";
      break;
  }
}

/*
* checking relation symbol
* return map {("chk", true), ("relation", relation2)} if pass
* return map {("chk", false)} if not pass
*/
function chkRelationSymbol(relation, codingPan) {
  // console.log("Checking symbol...");
  var relation2 = [];
  for (var i = 0; i <= relation.length-1; i++) {
    relation2.push(relation[i].split(":"));
  }
  var map = new Map();
  map.set("chk", false);
  // console.log(relation2[0].length);
  for (var i = 0; i <= relation2.length - 1; i++) {
      // console.log("=====\'"+relation2[i][1]+"\'");
    if (relation2[i].length < 2) {
      console.log("1");
      var place = relation2[i][0] === "" ? " [痾...這不好說] " : relation2[i][0];
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (relation2[i].length > 2) {
      console.log("1.5");
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+relation2[i][1]+"附近。","red");
      return map;
    }
    if (relation2[i][0] === "" || relation2[i][1] === "") {
      console.log("2");
      var place = relation2[i-1][0] === "" ? " [痾...這不好說] " : relation2[i-1][0];
      printMsgLine(codingPan, "錯誤：關聯設定符號有問題，請檢查你的逗號或冒號！<br>位於"+place+"附近。","red");
      return map;
    }
    if (i > 0) {
      if (!chkRelationKeyword(relation2[i][0].trim())) { 
        printMsgLine(codingPan, "錯誤：關鍵字應為\'class_name\', \'foreign_key\', \'primary_key\'其中之一。<br>位於"+relation2[i][0],"red");
        return map;
      }
      if (chkRightSpace(relation2[i][0])) {
        printMsgLine(codingPan, "錯誤：你的冒號要靠緊"+relation2[i][0],"red");
        return map;
      }
      if (!chkDoubleQuotes(relation2[i][1].trim())) {
      console.log("3");
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
* write Rails convention setup on code panel
*/
function chkRelationKeyword(str) {
  if (str === "class_name" || str === "foreign_key" || str === "primary_key") {
    return true;
  }
  return false;
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
function chkDbSchemaInput(codingPan, inputs, relation, mode) {
  // inputs[0] myModelName
  // inputs[2] fk
  // inputs[3] refTableName
  // inputs[4] pk
  if (inputs[2] === "" && inputs[3] === "" && inputs[4] === "") {
    return null;
  }

  var title = document.createElement("p");
  title.classList.add("code-white");
  title.innerHTML = "<br>==== checking result ====<br>";
  codingPan.appendChild(title);

  if (mode === "m" || mode === "t") {
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        chkHasManyConvention(codingPan, inputs[i], relation, i, inputs[0]);
        console.log("has_many ok");
      } else {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
      }
    }
  } else { // mode === "t"
    for (var i = 2; i < inputs.length; i++) {
      if (chkLetterBoth(inputs[i])) {
        chkBelongsToConvention(codingPan, inputs[i], relation, i);
      } else {
        printMsgLine(codingPan, "錯誤：DB schema" + getInputName(i) + "欄位輸入有誤。","red");
      }
    }
  }
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
      } else if (chkVal === convention) {
          printMsgLine(codingPan, "(OK)foreign_key: 符合慣例，可省略!","white");
      } else {
        hasError = true;
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
      printMsgLine(codingPan, "錯誤：DB schema欄位有誤，怎麼會有奇怪的東西混進來？。","red");
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
      } else if (chkVal === convention) {
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
      printMsgLine(codingPan, "錯誤：DB schema欄位有誤，怎麼會有奇怪的東西混進來？","red");
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
* print messages in particular color on coding panel
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