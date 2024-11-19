let script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.runtime.getURL('js/autocomplete.js'));
document.body.appendChild(script);