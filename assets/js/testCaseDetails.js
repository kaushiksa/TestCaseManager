var gTestCaseID = null;

function loadTestCaseDetailsPage(testCaseID,errShow = true){
    gTestCaseID = testCaseID;
    getTestCaseDetails(testCaseID,updateTestCaseDetailsInUI,errShow);
}

function setTestCaseDisplayName(testCaseName){
    document.getElementById('name').value = String(testCaseName);
  }
  
function setTestCaseDescription(description){
  document.getElementById('description').innerText = String(description);
}
  function getTestCaseDetails(testCaseID,successCallback,errShow = true){
    testCasesDB.get(String(testCaseID),{attachments: true, binary:true}).then(function(testCaseDetails){
        console.log(testCaseDetails);
        successCallback(testCaseDetails);
    }).catch(function (err) {
      if(errShow){
        electron.remote.dialog.showMessageBox({
          buttons: ["OK"],
          message: "Something went wrong! Please help us by raising this on GITHUB"
         });
         throw "Not Found";

      }
      });
  }

  function updateTestCaseDetailsInUI(testCaseDetails){
    setTestCaseDisplayName(testCaseDetails.name);
    setTestCaseDescription(testCaseDetails.description);
    setBackButtonToCollectionView(testCaseDetails.collectionID);
    setTestCasePerformedDate(testCaseDetails.performed);
    setTestCaseAddedDate(testCaseDetails.added);
    if(testCaseDetails._attachments){
      setTestCaseAttachment(testCaseDetails._attachments.testCaseFile.data);

    }
    else{
      setTestCaseAttachment();
    }
  }

  function setBackButtonToCollectionView(collectionID){
    $('#btnBacktestCaseDetails').click(function(){
        openCollectionViewPage(collectionID);
    })
  }

  function editSaveTestCase(){ 

    let btn = $('#editSaveTestCaseBtn')
    if(btn.attr('editMode') == 'false'){

       // Trying to edit content

      //  Next operation would be save
       btn.html('Save');
       btn.attr('editMode',true);
       $('.contentEditable').attr('disabled',false);
       $('.datepicker').datepicker({
         format: 'dd/mm/yyyy',
     
       })
       $('#attachment').html('');
       $('#attachment').unbind('click');
       $('#attachment').append(
        $('<input/>').attr('type', 'file').attr('id', 'attachmentFile')
       )

    }
    else{
     
      // Trying to save edited content
      btn.html('Edit');
      btn.attr('editMode',false);
      $('.contentEditable').attr('disabled',true);
      let name = $('#name').val();
      let description = $('#description').val();
      let performedDate = $('#performedDate').val();
      let addedDate = $('#addedDate').val();
      let attachment = $('#attachmentFile')[0].files[0]
      updateTestCaseDetailsInDB(gTestCaseID,name,description,performedDate,addedDate,attachment);

    }

  }
  
function setTestCasePerformedDate(performedDate){
    document.getElementById('performedDate').value = String(performedDate);
  }
  
function setTestCaseAddedDate(addedDate){
    document.getElementById('addedDate').value = String(addedDate);
  }
  
function setTestCaseAttachment(attachment = null){
    let attachmentElem = $('#attachment');
 
  if(attachment){
    let blobUrl = URL.createObjectURL(attachment);
    if(attachment.type.includes("image")){
      let image = document.createElement('img');
      image.src = blobUrl;
      image.classList.add("previewImage");
      attachmentElem.click(function(e){
        openPreviewImage(image);
        e.stopPropagation();
      });
      attachmentElem.html('');
      attachmentElem.append(image);

    }

  }
  else{
    attachmentElem.html('NA');
  }
  }

  function updateTestCaseDetailsInDB(testCaseID,tName,tDescription, tPerform, tAdd, tAttachment){
   
    testCasesDB.get(String(testCaseID)).then(function(doc) {
      doc.name = String(tName);
      doc.description = String(tDescription);
      doc.performed = tPerform;
      doc.added = tAdd;
      if(tAttachment){
        doc._attachments = {
          'testCaseFile': {
            type: tAttachment.type,
            data: tAttachment
          }
        }
      }
      return testCasesDB.put(doc);
    }).then(function(response) {
      openTestCaseDetail(testCaseID);
      Swal.fire(
        'Saved',
        '',
        'success'
      )
    }).catch(function (err) {
      console.log(err);
    });
  }