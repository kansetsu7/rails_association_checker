function check (){
  var modelName = document.getElementById("model-name").value
  var relatoinInput = document.getElementById("relatoin-input").value
  var myTableName = document.getElementById("my-table-name").value
  var fk = document.getElementById("fk").value
  var refTableName = document.getElementById("ref-table-name").value
  var pk = document.getElementById("pk").value
  if (chkModelName(modelName)) {
   /* 
  }else if (relatoinInput == "" || !relatoinInput.includes("belongs_to")) {
    alert("你的belongs_to咧?");
  }else{
    var relation = relatoinInput.split(",");
    var relation2 = [];
    for (var i = 0; i <= relation.length-1; i++) {
      relation2.push(relation[i].split(":"));
    }
    relation_log(relation2);
    */
  }

  
}

function chkModelName(modelName) {
  console.log("Checking model name...");
  if (modelName === "") {
    alert("Model名稱必填");
    return true;
  }else if (chkCapitalize(modelName)) {
    // alert("great!");
    console.log("great!");
    console.log(capFirstLetter(modelName));
    return false;
  }
    console.log("oops");
    console.log(capFirstLetter(modelName));
    return false;
}

function chkCapitalize(string) {
  if (!isNaN(string.charAt(0))) {   //first latter is a number
    console.log("Model名開頭不能為數字！");
    return false;
  }else if (capFirstLetter(string) === string) {
    return true;
  }else{
    console.log("Model名開頭需大寫");
    return false;
  }
}

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