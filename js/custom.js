// Constants

let validMediafireFileDL = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]*\/file/gm;

// Functions

let validationChecker = function(url, dlBtn, pInvalid) {
  let validatedURL = validMediafireFileDL.test(url);

  // Test if the new value is a valid link, to enable the download button
  if (url) {
    // check if we have valid url
    if (validatedURL) {
      if (dlBtn.classList.contains('disable')) dlBtn.classList.remove('disable');
      if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
    } else {
      if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
      if (pInvalid.classList.contains('hide')) pInvalid.classList.remove('hide');
      }
  } else {
    // need to reset when no text is entered
    if (!dlBtn.classList.contains('disable')) dlBtn.classList.add('disable');
    if (!pInvalid.classList.contains('hide')) pInvalid.classList.add('hide');
  }
};

// Wait for page to load
window.addEventListener('load', function () {
  // Elements

  let inputMediafireURL = document.querySelector('#mediafire-url');
  let aMediafireDownloadBtn = document.querySelector('#mediafire-dl-btn');
  let pInvalidURL = document.querySelector('#invalid-url');
    
  // Main

  // need 100 ms delay to get true value afterwards

  // detect key presses
  inputMediafireURL.addEventListener('keyup', function() {setTimeout(function() {validationChecker(inputMediafireURL.value || '', aMediafireDownloadBtn, pInvalidURL)}, 100)});
  // detect right-click actions
  inputMediafireURL.addEventListener('oncut', function() {setTimeout(function() {validationChecker(inputMediafireURL.value || '', aMediafireDownloadBtn, pInvalidURL)}, 100)});
  inputMediafireURL.addEventListener('onpaste', function() {setTimeout(function() {validationChecker(inputMediafireURL.value || '', aMediafireDownloadBtn, pInvalidURL)}, 100)});
}