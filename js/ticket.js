/**
 * @param {string} selector 
 * @returns {Promise<Element>}
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject)=> {
        const timer = setTimeout(() => {
            reject(new Error(`Timeout: Element '${selector}' not found within ${timeout}ms`));
        }, timeout);
        if (document.querySelector(selector)) {
            clearTimeout(timer);
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                clearTimeout(timer);
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}


(async() => {
    const settings = await chrome.storage.local.get();

    document.addEventListener('DOMContentLoaded', (ev) => {
        // /** @type {HTMLSelectElement | null} */
        // const select = document.querySelector('#ticketPriceList select');
        // if (select) {
        //     select.value = 3;
        //     select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        // }

        if (settings.autoCheckTerms) {
            // check terms
            /** @type {HTMLInputElement | null} */
            const agreeInput = document.querySelector('#TicketForm_agree');
            if (agreeInput) {
                agreeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                agreeInput.checked = true;
                agreeInput.addEventListener('input', function(ev) { this.checked = true });
            }
        }
    });

    if (settings.autoSolveCaptcha) {
        console.log('solving captcha...');
        chrome.runtime.sendMessage({
            what: 'solveCaptcha'
        }).then(async code => {
            if (!code) {
                return;
            }
        
            /** @type {HTMLInputElement} */
            const verifyCodeInput = await waitForElement('#TicketForm_verifyCode');
            verifyCodeInput.value = code;
            console.log(code);
        });
    }

})();