// Constants

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireFileDL = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]*\/file/gm;
const delayToDownload = 500; // ms to wait for download, and then redirect

// Browser Detection Variables
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
var isBlink = (isChrome || isOpera) && !!window.CSS;

// Variables

let validateDelayCheck = null;
let fromParameters = false;

// Functions

function getQueryStringArray(){
  let assoc=[]; 
  let items = window.location.search.substring(1).split('&'); 
  for(let j = 0; j < items.length; j++) { 
    let a = items[j].split('='); assoc[a[0]] = a[1]; 
  }
  return assoc;
}

function downloadFile(filePath){
  let link=document.createElement('a');
  link.href = filePath;
  link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
  link.target = '_blank';
  link.click();
}

let validationChecker = function(url, dlBtn, pInvalid, containedNewUrl, spanMfNewURL) {
  let validatedURL = validMediafireFileDL.test(url || '');

  // Test if the new value is a valid link, to enable the download button
  if (url) {
    // check if we have valid url
    if (validatedURL) {
      if (dlBtn.classList.contains('disable')) dlBtn.classList.remove('disable');
      if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
      spanMfNewURL.innerText = window.location.origin + window.location.pathname + '?url=' + url;
      if (containedNewUrl.classList.contains('hide')) containedNewUrl.classList.remove('hide');

      return true;
    } else {
      if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
      if (pInvalid.classList.contains('hide')) pInvalid.classList.remove('hide');
      if (!containedNewUrl.classList.contains('hide')) containedNewUrl.classList.add('hide');
      spanMfNewURL.innerText = '';

      return false;
    }
  } else {
    // need to reset when no text is entered
    if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
    if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
    if (!containedNewUrl.classList.contains('hide')) containedNewUrl.classList.add('hide');
    spanMfNewURL.innerText = '';

    return false;
  }
};

let validationDelayChecker = function(url, dlBtn, pInvalid, containedNewUrl, spanMediafireNewUrl) {
  // clear previous timeout
  if (validateDelayCheck) {
    clearTimeout(validateDelayCheck);
    validateDelayCheck = null;
  }

  // start new timeout
  validateDelayCheck = setTimeout(function() {
    validationChecker(url, dlBtn, pInvalid, containedNewUrl, spanMediafireNewUrl);
  }, 100);
};

let attemptDownloadRedirect = async function(url, dlBtn, invalidUrlP, invalidPageP, containerNewUrl, spanMediafireNewUrl) {
  // in case we are running from the download button
  if (!url) url = document.getElementById('mediafire-url').value;
  if (!containerNewUrl) containerNewUrl = document.getElementById('new-url');
  if (!spanMediafireNewUrl) spanMediafireNewUrl = document.getElementById('mediafire-new-url');
  if (!dlBtn) dlBtn = document.getElementById('mediafire-dl-btn');
  if (!invalidUrlP) invalidUrlP = document.getElementById('invalid-url');
  if (!invalidPageP) invalidPageP = document.getElementById('invalid-page');

  // reset previous invalid page notice
  if (!invalidPageP.classList.contains('hide')) invalidPageP.classList.add('hide');

  console.log(`Checking "${url}" for valid download page...`);
  // try and get the mediafire page to get actual download link
  try {
    let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url));
    
    // make sure the response was ok
    if (mediafirePageResponse.ok) {
      let data = await mediafirePageResponse.json();
      let html = data.contents;

      // if we received a page
      if (html) {
        // Convert the HTML string into a document object
	    let parser = new DOMParser();
	    let doc = parser.parseFromString(html, 'text/html');

	    // redirect to direct download if the download page was real (and not taken down)
        let mfDlBtn = doc.getElementById('downloadButton');
	    if (mfDlBtn && mfDlBtn.href) {
          console.log(`Downloading from "${mfDlBtn.href}"...`);
          downloadFile(mfDlBtn.href);
          // change to default newtab if we came from a 
          if (fromParameters) {
            // need a delay from redirection so download can start
            setTimeout(function() {
              // redirect to previous page if it exists
              if (window.history.length >= 2) window.history.back();
              else {
                // redirect to browser specfic newtab
                if (isSafari) window.location = 'favorites://';
                else if (isChrome) window.location = 'chrome://newtab';
                else if (isOpera) window.location = 'opera://newtab';
                else if (isEdgeChromium) window.location = 'edge://newtab';
                else if (isEdge || isIE) window.location = 'about:tabs';
                else if (isFirefox) window.location = 'about:newtab';
                else window.location = 'about:blank';
              }
            }, delayToDownload);
          }
          return true;
        }
      }
    }

    // all else should produce an error
    console.error(`No valid download button at "${url}".`);
    if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
    if (!containerNewUrl.classList.contains('hide')) containerNewUrl.classList.add('hide');
    spanMediafireNewUrl.innerText = '';

    return false;
  } catch (err) {
    // There was an error
    console.warn('Something went wrong.', err);
    console.error(`No valid download button at "${url}".`);
    if (invalidPageP.classList.contains('hide')) invalidPageP.classList.remove('hide');
    if (!containerNewUrl.classList.contains('hide')) containerNewUrl.classList.add('hide');
    spanMediafireNewUrl.innerText = '';

    return false;
  }
};

// Wait for page to load
window.addEventListener('load', function () {
  // Elements

  let inputMediafireURL = document.getElementById('mediafire-url');
  let containerNewUrl = document.getElementById('new-url');
  let spanMediafireNewUrl = document.getElementById('mediafire-new-url');
  let aMediafireDownloadBtn = document.getElementById('mediafire-dl-btn');
  let pInvalidURL = document.getElementById('invalid-url');
  let pInvalidPage = document.getElementById('invalid-page');
    
  // Main

  // check URL parameters first
  let paramURL = getQueryStringArray().url;
  if (paramURL) {
    fromParameters = true;
    inputMediafireURL.value = paramURL;
    console.log(`Validating "${paramURL}" as Mediafire download link...`);
  }
  // run checker once on after parameter check
  if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)) {
    attemptDownloadRedirect(paramURL, aMediafireDownloadBtn, pInvalidURL, pInvalidPage, containerNewUrl, spanMediafireNewUrl);
  };

  // need 100 ms delay to get true value afterwards

  // detect key presses (except enter)
  inputMediafireURL.addEventListener('keyup', function(e) {if (!(e.key === 'Enter' || e.keyCode === 13)) validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)});
  // detect right-click actions
  inputMediafireURL.addEventListener('oncut', function() {validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)});
  inputMediafireURL.addEventListener('onpaste', function() {validationDelayChecker(inputMediafireURL.value, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)});
});