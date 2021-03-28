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

console.log('after browser variables');
