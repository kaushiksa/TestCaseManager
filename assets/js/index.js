const HOMEPAGE = 1;
const COLLECTION_LISTING_PAGE = 1;
const COLLECTION_VIEW_PAGE = 2;
const TEST_CASE_LISTING_PAGE =2;
const TEST_CASE_DETAILS_PAGE = 3;
const TEST_CASE_EDIT_PAGE = 3;
const SETTINGS_PAGE = 4;
const USER_PROFILE_PAGE = 4;


var gCurrentPage = HOMEPAGE;
var gEscOpenPage = gCurrentPage;
async function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, false);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
includeHTML();




const electron = require("electron"); 
const Swal = require('sweetalert2')
const Mousetrap = require('mousetrap');

const app = electron.app
const BrowserWindow = electron.remote.BrowserWindow;

const MenuItem = electron.MenuItem

// Importing the nativeTheme module 
// using Electron remote 
const nativeTheme = electron.remote.nativeTheme; 
const path = require("path"); 
const { isNumber } = require("util");

console.log("By Default, Dark Theme Enabled - ", 
			nativeTheme.shouldUseDarkColors); 
console.log("High Contrast Colors - ", 
			nativeTheme.shouldUseHighContrastColors); 
console.log("Inverted Colors - ", 
			nativeTheme.shouldUseInvertedColorScheme); 

nativeTheme.on("updated", () => { 
	console.log("Updated Event has been Emitted"); 

	if (nativeTheme.shouldUseDarkColors) { 
		console.log("Dark Theme Chosen by User"); 
	} else { 
		console.log("Light Theme Chosen by User"); 
	} 
}); 

function loadCSS(load) { 
  var head = document.getElementsByTagName("head")[0]; 
  var link = document.createElement("link"); 
  link.rel = "stylesheet"; 
  link.type = "text/css"; 
  link.href = path.join(__dirname, "/assets/css/" 
                        + load + ".css"); 
  head.appendChild(link); 
} 

Mousetrap.bind(['command+shift+f', 'ctrl+shift+f'], () => {

  let { value: collectionName } =  Swal.fire({
    title: 'Enter Test Case ID',
    input: 'text',
    // inputValue: ,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value || isNaN(Number(value))) {
        return 'Oops! Are you sure about the ID?'
      }
      else{
        shortcutTestCaseFind(value);
        
      }
    }
  })
  // return false to prevent default behavior and stop event from bubbling
    return false
})


async function shortcutTestCaseFind(testCaseID){
  try{
    testCaseDetails = await testCasesDB.get(String(testCaseID));
    openTestCaseDetail(testCaseID);
  }
  catch{
    Swal.fire({
      icon: 'error',
      title: 'Test Case Not Found',
      footer: '<a href>If this information is wrong, please report on GITHUB</a>'
    })

  }
}

function setPageNavigation(currentPage, gEscPage){
  gCurrentPage = currentPage;
  gEscOpenPage = gEscPage;
}

Mousetrap.bind(['command+n', 'ctrl+n', 'n'], () => {
  switch(gCurrentPage){
    case HOMEPAGE :
      newTestCollection();
      break;

    case COLLECTION_VIEW_PAGE:
      btnAddNewTestCase();
      break;

    default:
      return false;
    
  }
  
  // return false to prevent default behavior and stop event from bubbling
    return false
})



Mousetrap.bind(['esc'], () => {
  switch(gEscOpenPage){
    case HOMEPAGE :
      openHomePage();
      break;
    case SETTINGS_PAGE :
      openSettings();
      break;
    case TEST_CASE_DETAILS_PAGE :
      openTestCaseDetail(gTestCaseID);
      break;
      
    case COLLECTION_VIEW_PAGE:
      openCollectionViewPage(gCollectionID);
      break;

    default:
      return false;
    
  }
  
  // return false to prevent default behavior and stop event from bubbling
    return false
})
require('electron').webFrame.setVisualZoomLevelLimits(1, 3)
const { desktopCapturer, remote } = require('electron');
const { dialog, Menu } = remote;
