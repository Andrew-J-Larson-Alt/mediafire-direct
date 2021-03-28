// Constants

const corsProxy = 'https://api.allorigins.win/get?url=';
const validMediafireIdentifierDL = /^[a-zA-Z0-9]+$/m;
const validMediafireShortDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/\?[a-zA-Z0-9]+/m;
const validMediafireViewDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/view\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_\-\.~%]+)?$/m;
const validMediafireFileDL = /^(https?:\/\/)?(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+(\/[a-zA-Z0-9_\-\.~%]+)?(\/file)?$/m;
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
console.log('after fourth function');