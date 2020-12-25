var gCollectionID = null;
function loadCollectionViewPage(collectionID){
    gCollectionID = collectionID;
    testCollections.get('testCollections').then(function(testCollections){
    setCollectionDisplayName(testCollections.collectionNames[collectionID]);
    });

    loadTestCasesForCollection(collectionID);
    $(".custom-file-input").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
}

function createColumnForTestCaseRow(idName ,ColData, dType='text'){
  let col = document.createElement('td');
  col.id = String(idName);
  if(dType == 'text'){
    col.innerText = String(ColData);
    // col.contentEditable = true;
    // col.classList.add('editableColumn');
    // col.onblur = function(){
    //   editedColumnValue(col);
    // };

  }
  else if(dType == 'iconImg'){

    col.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>'
  }
  return col;

}
function createTestCaseRow(tNum, tName, tDescription, tPerform, tAdd, tAttachment){

  let testCaseList = document.getElementById('testCaselist');
  let row = document.createElement('tr');
  row.id = String(tNum);
  let rowElements = {colNumber:{element:null,value:tNum,type:'text',idName : 'colNumber'+String(tNum)},
                    colName:{element:null,value:tName,type:'text',idName : 'colName'+String(tNum)},
                    colDescription:{element:null,value:tDescription,type:'text',idName : 'colDesc'+String(tNum)},
                    colDatePerformed:{element:null,value:tPerform,type:'text',idName : 'colDatePerform'+String(tNum)},
                    colDateAdded:{element:null,value:tAdd,type:'text',idName : 'colDateAdded'+String(tNum)},
                    colAttachment:{element:null,value:tAttachment,class:null,type:'iconImg',idName : 'colAttach'+String(tNum)},                    
                  };


  for(col in rowElements){
    rowElements[col].element = createColumnForTestCaseRow(rowElements[col].idName,rowElements[col].value,rowElements[col].type);

    if(rowElements[col].class){
      rowElements[col].element.classList.add(col.class);

    }
    row.appendChild(rowElements[col].element);
  }
  
  row.onclick = function(){
    openTestCaseDetail(tNum);
  }
  row.classList.add('testCaseRow');
  // colAttachment.setAttribute('onclick','openCollectionViewPage('+ collectionID +')');

  testCaseList.appendChild(row);
}
function setCollectionDisplayName(collectionName){
  document.getElementById('collectionDisplayName').innerHTML = String(collectionName);
}


function noTestCasesAvailable(){
  testCaseList = document.getElementById('testCaselist');
  row = document.createElement('tr');
  colNumber = document.createElement('td');
  colNumber.setAttribute('colspan','5');
  colNumber.setAttribute('style','text-align: center;');
  colNumber.classList.add("cursorPointer");

  colNumber.innerHTML = " None ";
  row.appendChild(colNumber);
  testCaseList.appendChild(row);
}

function createIndexForCollectionIDInTestCaseDB(){
  testCasesDB.createIndex({
    index: {fields: ['collectionID']}
  });
}

function getTestCasesForCollection(collectionID){

  return testCasesDB.find({
    selector: {
      collectionID: String(collectionID)
    },

  });
}

function updateAttachmentFieldInRow(data,testCaseID = null){
  let columnID = 'colAttach'+String(testCaseID);
  let colElem = $('#'+columnID);
  if(data){
    let blobUrl = URL.createObjectURL(data);
    if(data.type.includes("image")){
      let image = document.createElement('img');
      image.src = blobUrl;
      image.classList.add("previewImage");
      colElem.click(function(e){
        openPreviewImage(image);
        e.stopPropagation();
      });
      colElem.html('');
      colElem.append(image);

    }

  }
  else{
    $('#'+columnID).html('NA');
  }
}

function getAttachmentsForTestCase(testCaseID,callback){
  testCasesDB.getAttachment(String(testCaseID), 'testCaseFile').then(function (data) {
    callback(data,testCaseID);
    // handle result
  }).catch(function (err) {
    callback(false,testCaseID);
  });
}
function loadTestCasesForCollection(collectionID){

  getTestCasesForCollection(collectionID).then(function (testCasesList) {
    
    // loadTestCollectionsInHome(collections.collectionNames);
    if(testCasesList.docs.length){
      testCasesList.docs.forEach(element => {
        createTestCaseRow(element._id,element.name,element.description,element.performed,element.added,element.attachment);
        getAttachmentsForTestCase(element._id,updateAttachmentFieldInRow)
      });
    }
    console.log(testCasesList);

    }).catch(function (err) {
      if (err.name === 'not_found') {
        noTestCasesAvailable();
      } else { 
        electron.remote.dialog.showMessageBox({
          buttons: ["OK"],
          message: "Something went wrong! Please help us by raising this on GITHUB"
         });      
        }
  
    
  });


  
}

function addNewTestCaseInDB(tName, tDescription, tPerform, tAdd, tAttachment, collectionID){

      testCasesDB.info().then(function(info){
        let dbPutData = {
          _id: String(info.doc_count),
          collectionID: String(collectionID),
          name:String(tName),
          description:String(tDescription),
          performed: tPerform,
          added : tAdd,
        }
        if(tAttachment){
          dbPutData._attachments = {
            'testCaseFile': {
              type: tAttachment.type,
              data: tAttachment
            }
          }
        }
        testCasesDB.put(dbPutData).then(function(response){
          console.log(response);
          openCollectionViewPage(collectionID);

        }).catch(function (err) {
          electron.remote.dialog.showMessageBox({
              buttons: ["OK"],
              message: "Something went wrong! Please help us by raising this on GITHUB"
             });;
      }) 
              
    });
}

function btnAddNewTestCase(){
  setPageNavigation(gCurrentPage,null);
  $('.datepicker').datepicker({
    format: 'dd/mm/yyyy',

  })
  $('#addNewTestCase').modal();
  $('#testCaseName').focus();
}

function btnSaveNewTestCase(){

  let testCaseName = $('#testCaseName').val();
  let testCaseDescription = $('#testCaseDescription').val();
  let performedDate = $('#performedDate').val();
  let attachment= $('#attachment')[0].files[0]


  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();

  today = dd + '/' + mm + '/' + yyyy;
  addNewTestCaseInDB(testCaseName,testCaseDescription,performedDate,today,attachment,gCollectionID);

}

function openPreviewImage(img){

  setPageNavigation(gCurrentPage,null);
  // Get the image and insert it inside the modal - use its "alt" text as a caption
  var modalImg = document.getElementById("imagePreview");
  var captionText = document.getElementById("caption");
  modalImg.src = img.src;
  captionText.innerHTML = img.alt;

  $('#imagePreviewModal').modal();

}


// $('body').on('focus', '[contenteditable]', function() {
//   const $this = $(this);
//   $this.data('before', $this.html());
// }).on('blur keyup paste input', '[contenteditable]', function() {
//   const $this = $(this);
//   if ($this.data('before') !== $this.html()) {
//       $this.data('before', $this.html());
//       editedColumnValue($this)
//   }
// });

// function editedColumnValue(element){
//   console.log(element.innerHTML);
// }
function openTestCaseDetail(testCaseNum, errShow = true){
  setPageNavigation(TEST_CASE_DETAILS_PAGE,COLLECTION_VIEW_PAGE);
  let embedDiv = document.getElementById('embedDiv');
  embedDiv.setAttribute('w3-include-html','testCaseDetails/index.html');
  includeHTML();
  loadTestCaseDetailsPage(testCaseNum,errShow);
}

