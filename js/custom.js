// Constants

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireFileDL = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]*\/file/gm;

// Variables

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
};

let validationDelayChecker = function(url, dlBtn, pInvalid) {
  // clear previous timeout
  if (validateDelayCheck) {
    clearTimeout(validateDelayCheck);
    validateDelayCheck = null;
  }

  // start new timeout
  validateDelayCheck = setTimeout(function() {
    validationChecker(url, dlBtn, pInvalid);
  }, 100);
};

let attemptDownloadRedirect = async function(url, dlBtn, invalidUrlP, invalidPageP) {
  // in case we are running from the download button
  if (!url) url = document.getElementById('mediafire-url').value;
  if (!dlBtn) dlBtn = document.getElementById('mediafire-dl-btn');
  if (!invalidUrlP) document.getElementById('invalid-url');
  if (!invalidPageP) document.getElementById('invalid-page');

  // reset previous invalid page notice
  if (!invalidPageP.classList.contains('hide')) invalidPageP.classList.add('hide');

  console.log(`Checking "${url}" for valid download page...`);
  // try and get the mediafire page to get actual download link
  try {
    let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url));
    
    // make sure the response was ok
    if (response.ok) {
      let data = await mediafirePageResponse.json();

      let html = data.contents;

      // Convert the HTML string into a document object
	  let parser = new DOMParser();
	  let doc = parser.parseFromString(html, 'text/html');

	  // redirect to direct download if the download page was real (and not taken down)
      let mfDlBtn = doc.getElementById('downloadButton');
	  if (mfDlBtn && mfDlBtn.href) {
        console.log(`Redirecting to "${mfDlBtn.href}"...`);
        window.location = mfDlBtn.href;
        window.location = 'about:blank';
        return true;
      } else {
        console.error(`No valid download button at "${url}".`);
        if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
        return false;
      }
    } else {
      console.error(`No valid download button at "${url}".`);
      if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
      return false;
    }
  } catch (err) {
    // There was an error
    console.warn('Something went wrong.', err);
    console.error(`No valid download button at "${url}".`);
    if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
    return false;
  }
};

// Wait for page to load
window.addEventListener('load', function () {
  // Elements

  let inputMediafireURL = document.getElementById('mediafire-url');
  let aMediafireDownloadBtn = document.getElementById('mediafire-dl-btn');
  let pInvalidURL = document.getElementById('invalid-url');
  let pInvalidPage = document.getElementById('invalid-page');
    
  // Main

  // check URL parameters first
  let paramURL = getQueryStringArray().url;
  if (paramURL) {
    inputMediafireURL.value = paramURL;
    console.log(`Validating "${paramURL}" as Mediafire download link...`);
  }
  // run checker once on after parameter check
  if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidURL)) {
    attemptDownloadRedirect(paramURL, aMediafireDownloadBtn, pInvalidURL, pInvalidPage);
  };

  // need 100 ms delay to get true value afterwards

  // detect key presses (except enter)
  inputMediafireURL.addEventListener('keyup', function(e) {if (!(e.key === 'Enter' || e.keyCode === 13)) validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
  // detect right-click actions
  inputMediafireURL.addEventListener('oncut', function() {validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
  inputMediafireURL.addEventListener('onpaste', function() {validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL)});
});