// window.addEventListener('pagereveal', (ev) => {
//     document.title = '🟢 Captcha Solver';
// });


// fps boost
// https://github.com/brian-girko/always-active/blob/master/v3/data/inject/main.js#L140
window.requestAnimationFrame = new Proxy(window.requestAnimationFrame, {
    apply(target, self, args) {
        const id = setTimeout(function () {
            args[0](performance.now());
        }, 0);
        return id;
    }
});

window.cancelAnimationFrame = new Proxy(window.cancelAnimationFrame, {
    apply(target, self, args) {
        clearTimeout(args[0]);
        return Reflect.apply(target, self, args);
    }
});