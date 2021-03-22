// Constants

let validMediafireFileDL = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]*\/file/gm;
let validateDelayCheck = null;

// Functions

function getQueryStringArray(){
  let assoc=[]; 
  let items = window.location.search.substring(1).split('&'); 
  for(let j = 0; j < items.length; j++) { 
    let a = items[j].split('='); assoc[a[0]] = a[1]; 
  }
  return assoc;
}

let validationChecker = function(url, dlBtn, pInvalid) {
  // clear previous timeout
  if (validateDelayCheck) {
    clearTimeout(validateDelayCheck);
    validateDelayCheck = null;
  }

  // start new timeout
  validateDelayCheck = setTimeout(function() {
    let validatedURL = validMediafireFileDL.test(url || '');

    // Test if the new value is a valid link, to enable the download button
    if (url) {
      // check if we have valid url
      if (validatedURL) {
        if (dlBtn.classList.contains('disable')) dlBtn.classList.remove('disable');
        if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');

        return true;
      } else {
        if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
        if (pInvalid.classList.contains('hide')) pInvalid.classList.remove('hide');

        return false;
      }
    } else {
      // need to reset when no text is entered
      if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
      if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');

      return false;
    }
  }, 100);
};

// Wait for page to load
window.addEventListener('load', function () {
  // Elements

  let inputMediafireURL = document.querySelector('#mediafire-url');
  let aMediafireDownloadBtn = document.querySelector('#mediafire-dl-btn');
  let pInvalidURL = document.querySelector('#invalid-url');
    
  // Main

  // check URL parameters first
  let paramURL = getQueryStringArray().url;
  if (paramURL) inputMediafireURL.value = paramURL;
  // run checker once on after parameter check
  if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidURL)) {
    console.log(`Checking "${paramURL}" for valid download link...`);
    // try and get the mediafire page to get actual download link
    $.ajax({
      url: 'http://cors-proxy.taskcluster.net/request',
      method: 'POST',
      contentType: 'application/json',
      data: {
        url: paramURL,
      }
    }).done(function(res) {
      console.log(res);
    });
console.log('AJAX FINISHED!!!!!!!!');

    // redirect to direct download if the download page was real (and not taken down)
    // TODO: ...
  } else console.log('SOMEHOW BROKE???');

  // need 100 ms delay to get true value afterwards

  // detect key presses (except enter)
  inputMediafireURL.addEventListener('keyup', function(e) {if (!(e.key === 'Enter' || e.keyCode === 13)) validationChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
  // detect right-click actions
  inputMediafireURL.addEventListener('oncut', function() {validationChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
  inputMediafireURL.addEventListener('onpaste', function() {validationChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
});