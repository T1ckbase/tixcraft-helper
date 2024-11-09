/**
 * @param {Blob} blob
 * @returns {Promise<string>} 
 */
function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T}
 */
function mostFrequent(array) {
    return Array.from(new Set(array)).reduce((prev, curr) => array.filter(el => el === curr).length > array.filter(el => el === prev).length ? curr : prev);
}

class CaptchaSolver {
    /** @type {chrome.tabs.Tab[]} */
    tabs = [];

    async create(n) {
        for (let i = 0; i < n; i++) {
            const tab = await chrome.tabs.create({
                url: 'https://translate.google.com/?hl=en&sl=en&tl=et&op=images#captchaSolver',
                active: false,
                // pinned: true
            });
            await chrome.tabs.update(tab.id, {
                autoDiscardable: false,
            });
            this.tabs.push(tab);
        }
        return this.tabs;
    }

    async remove() {
        const tabs = await chrome.tabs.query({ url:'*://translate.google.com/*', title: 'Captcha Solver' });
        if (!tabs.length) {
            return;
        }
        const promises = tabs.map(async tab => chrome.tabs.remove(tab.id).catch(e => void e));
        return Promise.all(promises);
    }

    /**
     * @return {Promise<string | null>}
     */
    async solve() {
        if (!this.tabs || !this.tabs.length) {
            return Promise.reject('No tabs found');
        }

        /** @type {Promise<string>[]} */
        const promises = this.tabs.map(async (tab) => {
            const response = await fetch('https://tixcraft.com/ticket/captcha', { cache: 'no-store' });
            const blob = await response.blob();
            const base64Image = await blobToBase64(blob);
            const result = await chrome.tabs.sendMessage(tab.id, { what: 'solveCaptcha', data: base64Image });
            return (typeof result === 'string' && result.replace(/ /g, '').length === 4) ? result.replace(/ /g, '').toLocaleLowerCase() : null;
        });

        /**@type {Array<string | null>}*/
        let results = await Promise.all(promises);
        console.log(results);
        results = results.filter(item => typeof item === 'string');
        return results.length ? mostFrequent(results) : null;
    }
}

// chrome.action.setBadgeText({
//     text: '🟢'
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message);
    switch (message.what) {
        case 'removeCaptchaSolver': {
            captchaSolver.remove().then(() => { sendResponse() });
            return true;
        }

        case 'createCaptchaSolver': {
            captchaSolver.remove();
            captchaSolver.create(message.data).then(tabs => sendResponse(tabs));
            return true;
        }

        case 'solveCaptcha': {
            const before = Date.now();
            captchaSolver.solve().then(result => {
                sendResponse(result);
                const after = Date.now();
                console.log('duration:', after - before);
            });
            return true;
        }

        default: {
            break;
        }
    }
});



chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        captchaSolver.remove();
    });
});



const captchaSolver = new CaptchaSolver();

// close old tabs
captchaSolver.remove();