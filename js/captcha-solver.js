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

const title = 'Captcha Solver';

/**
 * @param {string} base64Image 
 * @returns {Promise<string | null>}
 */
async function solveCaptcha(base64Image) {
    const blob = await (await fetch(base64Image)).blob();

    document.querySelector('button[aria-label="Clear image"]')?.click();

    /** @type {HTMLInputElement} */
    const fileInput = await waitForElement('input[name="file"][accept*="image"]').catch(error => {
        console.log(error);
        return null;
    });
    if (!fileInput) {
        return null;
    }

    const file = new File([blob], 'image.png', { type: blob.type });
    const container = new DataTransfer(); 
    container.items.add(file);
    fileInput.files = container.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    const img = await waitForElement('img[src*="blob"][alt]').catch(error => {
        console.log(error);
        return null;
    });
    if (!img) {
        return null;
    }

    const text = img.getAttribute('alt');
    return text;
}



document.title = `🟠 ${title}`;

window.addEventListener('load', (ev) => {
    document.title = title;
});




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.what) {
        case 'solveCaptcha': {
            // document.querySelector('button[aria-label="Clear image"]')?.click(); // clear image

            // waitForElement('img[src*="blob"][alt]')
            // .then(element => {
            //     const text = element.getAttribute('alt');
            //     sendResponse(text);
            // })
            // .catch(error => {
            //     console.error('Error:', error);
            //     sendResponse(null);
            // });

            // waitForElement('input[name="file"][accept*="image"]')
            // .then((/** @type {HTMLInputElement} */ fileInput) => {
            //     fetch(message.data) // base64 image
            //     .then(response => response.blob())
            //     .then(blob => {
            //         const file = new File([blob], 'image.png', { type: blob.type });
            //         const container = new DataTransfer(); 
            //         container.items.add(file);
            //         fileInput.files = container.files;
            //         fileInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            //     })
            //     .catch(error => {
            //         console.error('Error:', error);
            //         sendResponse(null);
            //     });
            // });
            solveCaptcha(message.data).then((result) => {
                sendResponse(result);
            }).catch(error => {
                console.error('Error:', error);
                sendResponse(null);
            });

            return true;
        }

        default: {
            break;
        }
    }
});

chrome.runtime.connect({ name: 'foo' });