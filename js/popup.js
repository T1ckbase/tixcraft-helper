document.querySelector('#create-captcha-solver').addEventListener('click', (ev) => {
    chrome.runtime.sendMessage({
        what: 'createCaptchaSolver',
        data: 5
    });
});


/** @type {HTMLInputElement} */
(document.querySelector('#auto-solve-captcha')).addEventListener('change', async function() {
    /** @type {HTMLButtonElement} */
    const createCaptchaSolverButton = document.querySelector('#create-captcha-solver');
    createCaptchaSolverButton.disabled = !this.checked;
    !this.checked && await chrome.runtime.sendMessage({ what: 'removeCaptchaSolver' });
});

// save settings
document.querySelector('form').addEventListener('change', (ev) => {
    const autoCheckTerms = /** @type {HTMLInputElement} */(document.querySelector('#auto-check-terms')).checked;
    const autoSolveCaptcha = /** @type {HTMLInputElement} */(document.querySelector('#auto-solve-captcha')).checked;
    // console.log(autoCheckTerms, autoSolveCaptcha);

    const settings = {
        autoCheckTerms: autoCheckTerms,
        autoSolveCaptcha: autoSolveCaptcha
    };

    chrome.storage.local.set(settings);
});


// load settings
chrome.storage.local.get().then(settings => {
    /** @type {HTMLInputElement} */(document.querySelector('#auto-check-terms')).checked = settings.autoCheckTerms ?? true;
    /** @type {HTMLInputElement} */(document.querySelector('#auto-solve-captcha')).checked = settings.autoSolveCaptcha ?? true;
    /** @type {HTMLButtonElement} */(document.querySelector('#create-captcha-solver')).disabled = !(settings.autoSolveCaptcha ?? true);
});