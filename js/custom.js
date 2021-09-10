// Constants

/* Copyright (C) 2020  Andrew Larson (thealiendrew@gmail.com)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireIdentifierDL = /^[a-zA-Z0-9]+$/m;
const validMediafireShortDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/m;
const validMediafireLongDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_\-\.~%]+)?(\/file)?$/m;
const checkHTTP = /^https?:\/\//m;
const paramDL_initialDelay = 50; // ms
const paramDL_loadDelay = 750; // ms

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

// normal way to download file
var downloadFile = function(filePath) {
  let link=document.createElement('a');
  link.href = filePath;
  link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
  link.click();
};

// alternative way when using parameters, to know when the download starts
var downloadFileStarting = function() {
  // will try to redirect to previous page or new tab when download starts after a tiny delay
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
  }, paramDL_loadDelay);
};
var downloadFileBegin = function(filePath) {
  let iframeDivDL = document.createElement('div');
  iframeDivDL.style = 'display: none';
  document.body.appendChild(iframeDivDL);

  let iframeFileDL = '<iframe id="iframeFileDL" src="about:blank" onload="downloadFileStarting()"></iframe>';
  iframeDivDL.innerHTML = iframeFileDL;

  setTimeout(function() {document.getElementById('iframeFileDL').src = filePath}, paramDL_initialDelay);
};

var validationChecker = function(url, dlBtn, pInvalid, containedNewUrl, spanMfNewURL) {
  let validatedURL = validMediafireIdentifierDL.test(url) || validMediafireShortDL.test(url) || validMediafireLongDL.test(url);

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
          let dlUrl = mfDlBtn.href;

          console.log(`Downloading from "${dlUrl}"...`);
          // need to do correct download based on if we came from parameters
          if (fromParameters) downloadFileBegin(dlUrl);
          else downloadFile(dlUrl);

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
    console.log(`Validating "${paramURL}" as valid Mediafire download...`);
  }
  // run checker once on after parameter check
  if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl)) {
    attemptDownloadRedirect(paramURL, aMediafireDownloadBtn, pInvalidURL, pInvalidPage, containerNewUrl, spanMediafireNewUrl);
  }

  // detect any changes to url value
  inputMediafireURL.oninput = function() {
    // needs to be captured before checking since it changes fast
    let currentUrl = inputMediafireURL.value;
    validationChecker(currentUrl, aMediafireDownloadBtn, pInvalidURL, containerNewUrl, spanMediafireNewUrl);
    previousUrlValue = currentUrl;
  }
});
