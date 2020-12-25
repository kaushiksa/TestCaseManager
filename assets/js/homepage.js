
document.addEventListener("DOMContentLoaded", function(event) { 

// Common global declarations
  userProfile = new PouchDB('userProfile');
  testCollections = new PouchDB('testCollections');
  testCasesDB = new PouchDB('testCases');
  loadHomePageFunctions();
});

function loadHomePageFunctions(){
    loadUserProfile();
    getTestCollectionsForUser();


}


function openSettings(){
    setPageNavigation(SETTINGS_PAGE,HOMEPAGE);
    let embedDiv = document.getElementById('embedDiv');
    embedDiv.setAttribute('w3-include-html','settings/index.html');
    includeHTML();
    loadSettingsPage();

}
function openHomePage(){

    setPageNavigation(HOMEPAGE,HOMEPAGE);
    let embedDiv = document.getElementById('embedDiv');
    embedDiv.setAttribute('w3-include-html','home/index.html');
    includeHTML();
    loadHomePageFunctions();

}

function openCollectionViewPage(collectionID){
  setPageNavigation(COLLECTION_VIEW_PAGE,HOMEPAGE);

  let embedDiv = document.getElementById('embedDiv');
  embedDiv.setAttribute('w3-include-html','testCollectionView/index.html');
  includeHTML();
  loadCollectionViewPage(collectionID);
}


function cancelSettingsChange(){
    openHomePage();
}
function saveSettingsChange(){
    let theme = saveThemeChanges();
    let displayName = getDisplayName();
    saveUserProfileInDB(theme,displayName);
    // openHomePage();
}
function getDisplayName(){
    return document.getElementById('displayName').value;
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

function loadSettingsPage(){
    // window.addEventListener('PageLoaded', () => {
        onSettingsLoadThemeRadioBtn();
        document.getElementById('displayName').value=gDisplayName;
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
var gDisplayName = "";

function loadUserProfile(){
    userProfile.get('userProfile').catch(function (err) {
        if (err.name === 'not_found') {
            let profile = {
                _id: 'userProfile',
                theme: 'dark',
                name: null,
    
              };
            userProfile.put(profile);
          return profile;
        } else { 
          throw err;
        }
      }).then(function (userProfile) {
        applyTheme(userProfile.theme);
        if(userProfile.name){
            gDisplayName = userProfile.name;
            updateDisplayNameInUI(userProfile.name);

        }

    }).catch(function (err) {
        electron.remote.dialog.showMessageBox({
            buttons: ["OK"],
            message: "Something went wrong! Please help us by raising this on GITHUB"
           });

        
      });


}

function updateDisplayNameInUI(name){

    document.getElementById('userDisplayName').innerHTML=name;

}



function saveUserProfileInDB(themeName,displayName){
    userProfile.get('userProfile').then(function(doc) {
        doc.theme = themeName;
        doc.name = displayName;
        return userProfile.put(doc);
      }).then(function(response) {
        // handle response
      }).catch(function (err) {
        console.log(err);
      });
}
function applyTheme(themeName){

    if(themeName == 'light'){
        nativeTheme.themeSource = "light"; 
        loadCSS("light");

    }
    else{
        nativeTheme.themeSource = "dark"; 
        loadCSS("dark");
    }
     
}

function getTestCollectionsForUser(){
    // To load all the collections of tests
    testCollections.get('testCollections').catch(function (err) {
        if (err.name === 'not_found') {
            let collections = {
                _id: 'testCollections',
                collectionNames: {}
                
              };
              testCollections.put(collections);
          return collections;
        } else { 
          throw err;
        }
      }).then(function (collections) {
        
        loadTestCollectionsInHome(collections.collectionNames);

        }).catch(function (err) {
        electron.remote.dialog.showMessageBox({
            buttons: ["OK"],
            message: "Something went wrong! Please help us by raising this on GITHUB"
           });

        
      });

}

function loadTestCollectionsInHome(collections){

    let keys=Object.keys(collections)
    if(keys.length==0){
        allCollectionList = document.getElementById('testCollectionList');
        allCollectionList.innerHTML="None";
    }

    for(collectionID in collections){
        allCollectionList = document.getElementById('testCollectionList');
        collectionNameLink = document.createElement('a');
        list = document.createElement('li');
        collectionNameLink.setAttribute('onclick','openCollectionViewPage('+ collectionID +')');
        collectionNameLink.classList.add("cursorPointer");
        collectionNameLink.innerHTML=collections[collectionID]+"<br>";
        list.appendChild(collectionNameLink);
        allCollectionList.appendChild(list);

    }
}


function newTestCollection(){
    let { value: collectionName } =  Swal.fire({
        title: 'Enter the collection name',
        input: 'text',
        // inputValue: ,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Oops! Why do we think that was an invalid name?'
          }
          else{
            addNewCollectionInDB(value);
          }
        }
      })
}

function addNewCollectionInDB(pCollectionName){
    testCollections.get('testCollections').then(function (collections) {
        let keys=Object.keys(collections.collectionNames)
        
        // Creating a collection 
        let nextNumberToInsert = keys.length;
        testCollections.put({
            _id: String(nextNumberToInsert),
            name: String(pCollectionName),

          });

        // Making entry in collectionName variable for easy fetch
        collections.collectionNames[nextNumberToInsert]=pCollectionName;
        testCollections.put(collections);
        openHomePage();

        }).catch(function (err) {
        electron.remote.dialog.showMessageBox({
            buttons: ["OK"],
            message: "Something went wrong! Please help us by raising this on GITHUB"
           });

        
      });
}
