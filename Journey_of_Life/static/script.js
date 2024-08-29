const header = document.querySelector('header');
const img = document.querySelector('.img');
let scrollDistance = 0;
let requestId = null;

function scrollHandler(event) {
    if (event.deltaY < 0) {
        scrollDistance = Math.max(0, scrollDistance + event.deltaY);
    } else {
        scrollDistance = Math.min(600, scrollDistance + event.deltaY);
    }
    if (!requestId) {
        requestId = window.requestAnimationFrame(() => {
            updateHeaderClipPath();
            requestId = null;
        });
    }
}
window.addEventListener('wheel', scrollHandler);