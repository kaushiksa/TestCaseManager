
var gDisplayName = "";

function loadSettingsPage(){
  // window.addEventListener('PageLoaded', () => {
      onSettingsLoadThemeRadioBtn();
      document.getElementById('displayName').value=gDisplayName;
      settingsLoadColorStatusNames();
  // });
}

function onSettingsLoadThemeRadioBtn(){
 if(nativeTheme.themeSource == "dark"){
  document.getElementById("darkTheme").checked = true;
 }
 else if(nativeTheme.themeSource == "light"){
  document.getElementById("lightTheme").checked = true;
 }
}
function saveSettingsChange(){
  let theme = saveThemeChanges();
  let displayName = getDisplayName();
  let gColorStatusNames = getColorNameObject();
  saveUserProfileInDB(theme,displayName,gColorStatusNames);
  // openHomePage();
  getColorNameObject();
}
function saveThemeChanges(){
  if(document.getElementById("darkTheme").checked){
      nativeTheme.themeSource = "dark"; 
      loadCSS("dark");
      return('dark');
  }
  else if(document.getElementById("lightTheme").checked){
      nativeTheme.themeSource = "light"; 
      loadCSS("light");
      return('light');
  }
}


function cancelSettingsChange(){
  openHomePage();
}

function getDisplayName(){
  return document.getElementById('displayName').value;
}

function settingsLoadColorStatusNames(){
  if(gColorStatusNames){
    $('#redColorName').val(gColorStatusNames.redColor);
    $('#greenColorName').val(gColorStatusNames.greenColor);
    $('#yellowColorName').val(gColorStatusNames.yellowColor);
    $('#blueColorName').val(gColorStatusNames.blueColor);

  }
}

function getColorNameObject(){

  let red = $('#redColorName').val();
  let green = $('#greenColorName').val();
  let yellow = $('#yellowColorName').val();
  let blue = $('#blueColorName').val();

  return {
  'redColor': red,
  'greenColor': green,
  'yellowColor':yellow ,
  'blueColor':blue,
} 
  
}

function saveUserProfileInDB(themeName,displayName,statusColorName){


  userProfile.get('userProfile').then(function(doc) {
      doc.theme = themeName;
      doc.name = displayName;
      doc.statusColors = statusColorName;
      return userProfile.put(doc);
    }).then(function(response) {
      // handle response
    }).catch(function (err) {
      console.log(err);
    });
}