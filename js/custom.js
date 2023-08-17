/* Copyright (C) 2023  Andrew Larson (andrew.j.larson18+github+alt@gmail.com)
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

// Constants

const corsProxy = 'https://corsproxy.io/?';
const validMediafireIdentifierDL = /^[a-zA-Z0-9]+$/m;
const validMediafireShortDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+$/m;
const validMediafireLongDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_~%\.\-]+)?(\/file)?$/m;
const validMediafirePreDL = /(?<=['\"])(https?:)?(\/\/)?(www\.)?mediafire\.com\/(file|view|download)\/[^'\"\?]+\?dkey\=[^'\"]+(?=['\"])/;
const validDynamicDL = /(?<=['\"])https?:\/\/download[0-9]+\.mediafire\.com\/[^'\"]+(?=['\"])/;
const checkHTTP = /^https?:\/\//m;
const inputMediafireUrlID = 'mediafire-url';
const containerNewUrlID = 'new-url';
const spanMediafireNewUrlID = 'mediafire-new-url';
const aMediafireDownloadBtnID = 'mediafire-dl-btn';
const pInvalidUrlID = 'invalid-url';
const pInvalidPageID = 'invalid-page';
const paramDL_initialDelay = 50; // ms
const paramDL_loadDelay = 750; // ms
const paramDL_mediafireWebDelay = 1500; // ms; Mediafire's specified delay is 1000ms to redirect to parametered download URLs, and needs another 500ms to time things properly

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

var getQueryStringArray = function() {
  let assoc=[];
  let items = window.location.search.substring(1).split('&');
  for(let j = 0; j < items.length; j++) {
    let a = items[j].split('='); assoc[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
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
  if (url && validatedURL) {
    // we have a valid url
    if (dlBtn.classList.contains('disable')) dlBtn.classList.remove('disable');
    if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
    if (containedNewUrl.classList.contains('hide')) containedNewUrl.classList.remove('hide');
    spanMfNewURL.innerText = window.location.origin + window.location.pathname + '?dl=' + url;

    return true;
  } else {
    // need to reset when url isn't valid or no text is entered
    if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
    if (pInvalid.classList.contains('hide')) pInvalid.classList.remove('hide');
    if (!containedNewUrl.classList.contains('hide')) containedNewUrl.classList.add('hide');
    spanMfNewURL.innerText = '';

    return false;
  }
};

// if successful, trys to download file and returns the temporary direct download link as a string
var attemptDownloadRedirect = async function(url, dlBtn, invalidUrlP, invalidPageP, containerNewUrl, spanMediafireNewUrl) {
  // in case we are running from the download button
  if (!url) url = document.getElementById(inputMediafireUrlID).value;
  if (!containerNewUrl) containerNewUrl = document.getElementById(containerNewUrlID);
  if (!spanMediafireNewUrl) spanMediafireNewUrl = document.getElementById(spanMediafireNewUrlID);
  if (!dlBtn) dlBtn = document.getElementById(aMediafireDownloadBtnID);
  if (!invalidUrlP) invalidUrlP = document.getElementById(pInvalidUrlID);
  if (!invalidPageP) invalidPageP = document.getElementById(pInvalidPageID);

  // reset previous invalid page notice
  if (!invalidPageP.classList.contains('hide')) invalidPageP.classList.add('hide');

  // modify the link to work with proxy
  url = url.replace('http://', 'https://'); // not required, but makes them secure
  // if it's just the download identifier, add on mediafire pre-link
  if (validMediafireIdentifierDL.test(url)) url = 'https://mediafire.com/?' + url;
  // if the link doesn't have http(s), it needs to be appended
  if (!checkHTTP.test(url)) {
    if (url.startsWith('//')) url = 'https:' + url;
    else url = 'https://' + url;
  };

  console.log(`Checking "${url}" for valid download page...`);
  // try and get the mediafire page to get actual download link
  try {
    let mediafirePageResponse = await fetch(corsProxy+encodeURIComponent(url));
    
    // make sure the response was ok
    if (await mediafirePageResponse.ok) {
      let data = await mediafirePageResponse.text();

      // if we received a page
      if (data) {
        // check if download parameter link was instead used on website
        let dlPreUrls = data.match(validMediafirePreDL);
        if (dlPreUrls) {
          let dlPreUrl = dlPreUrls[0];
          return setTimeout(function() {
            return attemptDownloadRedirect(dlPreUrl, dlBtn, invalidUrlP, invalidPageP, containerNewUrl, spanMediafireNewUrl);
          }, paramDL_mediafireWebDelay); // delay is required, or else Mediafire's Cloudflare protection will not connect
        }

        // we try to find URL by regex matching
        let dlUrls = data.match(validDynamicDL);
        if (dlUrls) {
          let dlUrl = dlUrls[0];

          console.log(`Downloading from "${dlUrl}"...`);
          // need to do correct download based on if we came from parameters
          if (fromParameters) downloadFileBegin(dlUrl);
          else downloadFile(dlUrl);

          return dlUrl;
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

  let inputMediafireUrl = document.getElementById(inputMediafireUrlID);
  let containerNewUrl = document.getElementById(containerNewUrlID);
  let spanMediafireNewUrl = document.getElementById(spanMediafireNewUrlID);
  let aMediafireDownloadBtn = document.getElementById(aMediafireDownloadBtnID);
  let pInvalidUrl = document.getElementById(pInvalidUrlID);
  let pInvalidPage = document.getElementById(pInvalidPageID);
    
  // Main

  // check URL parameters first
  let paramURL = getQueryStringArray().dl;
  if (paramURL) {
    fromParameters = true;
    inputMediafireUrl.value = paramURL;
    console.log(`Validating "${paramURL}" as valid Mediafire download...`);
    // run checker once as is necessary
    if (validationChecker(paramURL, aMediafireDownloadBtn, pInvalidUrl, containerNewUrl, spanMediafireNewUrl)) {
      attemptDownloadRedirect(paramURL, aMediafireDownloadBtn, pInvalidUrl, pInvalidPage, containerNewUrl, spanMediafireNewUrl);
    }
  }

  // detect any changes to url value
  inputMediafireUrl.oninput = function() {
    // needs to be captured before checking since it changes fast
    let currentUrl = inputMediafireUrl.value;
    validationChecker(currentUrl, aMediafireDownloadBtn, pInvalidUrl, containerNewUrl, spanMediafireNewUrl);
  }
});
