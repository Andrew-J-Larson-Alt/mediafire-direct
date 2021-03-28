// Constants

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireIdentifierDL = true;
const validMediafireShortDL = true;
const validMediafireViewDL = true;
const validMediafireFileDL = true;
const checkHTTP = false;
const paramDL_initialDelay = 50; // ms
const paramDL_loadDelay = 750; // ms

// Browser Detection Variables
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
var isPhantomJS = window.callPhantom || window._phantom;

// Variables

let validateDelayCheck = null;
let fromParameters = false;
let previousUrlValue = '';

// Functions

var getQueryStringArray = function() {
  let assoc=[];
  let items = window.location.search.substring(1).split('&');
  for(let j = 0; j < items.length; j++) {
    let a = items[j].split('='); assoc[a[0]] = a[1];
  }
  return assoc;
};

var validationChecker = function(url, dlBtn, pInvalid, containedNewUrl, spanMfNewURL) {
  let validatedURL = validMediafireIdentifierDL.test(url) || validMediafireShortDL.test(url) || validMediafireViewDL.test(url) || validMediafireFileDL.test(url);

  // Test if the new value is a valid link, to enable the download button
  if (url) {
    // check if we have valid url
    if (validatedURL) {
      if (dlBtn.classList.contains('disable')) dlBtn.classList.remove('disable');
      if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
      spanMfNewURL.innerText = window.location.origin + window.location.pathname + '?dl=' + url;
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

var attemptDownloadRedirect = async function(url, dlBtn, invalidUrlP, invalidPageP, containerNewUrl, spanMediafireNewUrl) {
  // in case we are running from the download button
  if (!url) url = document.getElementById('mediafire-url').value;
  if (!containerNewUrl) containerNewUrl = document.getElementById('new-url');
  if (!spanMediafireNewUrl) spanMediafireNewUrl = document.getElementById('mediafire-new-url');
  if (!dlBtn) dlBtn = document.getElementById('mediafire-dl-btn');
  if (!invalidUrlP) invalidUrlP = document.getElementById('invalid-url');
  if (!invalidPageP) invalidPageP = document.getElementById('invalid-page');

  // reset previous invalid page notice
  if (!invalidPageP.classList.contains('hide')) invalidPageP.classList.add('hide');

  // modify the link to work with proxy
  url = url.replace('http://', 'https://'); // not required, but makes them secure
  // if it's just the download identifier, add on mediafire pre-link
  if (validMediafireIdentifierDL.test(url)) url = 'https://mediafire.com/?' + url;
  // if the link doesn't have http(s), it needs to be appended
  if (!checkHTTP.test(url)) url = 'https://' + url;

  if (!isPhantomJS) console.log(`Checking "${url}" for valid download page...`);
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
          let dlUrl = mfDlBtn.href;

          // provide support for phantomJS to allow scripted downloads
          if (isPhantomJS) console.log(dlUrl);

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
window.addEventListener('load', function() {
  // Elements

  let inputMediafireURL = document.getElementById('mediafire-url');
  let containerNewUrl = document.getElementById('new-url');
  let spanMediafireNewUrl = document.getElementById('mediafire-new-url');
  let aMediafireDownloadBtn = document.getElementById('mediafire-dl-btn');
  let pInvalidURL = document.getElementById('invalid-url');
  let pInvalidPage = document.getElementById('invalid-page');
    
  // Main

  // check URL parameters first
  let paramURL = getQueryStringArray().dl;
  if (paramURL) {
    fromParameters = true;
    inputMediafireURL.value = paramURL;
    if (!isPhantomJS) console.log(`Validating "${paramURL}" as valid Mediafire download...`);
  }
  // run checker once on after parameter check
  if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)) {
    if (!attemptDownloadRedirect(paramURL, aMediafireDownloadBtn, pInvalidURL, pInvalidPage, containerNewUrl, spanMediafireNewUrl)) {
      // provide support for phantomJS to prevent its callback from hanging
      if (isPhantomJS) console.log('');
    }
  }
});
