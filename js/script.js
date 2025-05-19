// Fun little animation for the download button on click
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.querySelector('.download-btn');
    if (btn) {
        btn.addEventListener('click', function(e) {
            btn.classList.add('clicked');
            setTimeout(() => btn.classList.remove('clicked'), 300);
        });
    }
});