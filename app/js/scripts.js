function buttonresize() {
    var button = document.getElementById("submit");
    var input = document.getElementById("typebox");
    button.style.height = input.offsetHeight + "px"; // Use offsetHeight for height
}

function sendMessage() {
    var input = document.getElementById("typebox");
    var userText = input.value.trim();
    if (!userText) return;

    // Add user message with profile image
    let output = document.getElementById("output");
    let userMsg = document.createElement("div");
    userMsg.className = "container";
    userMsg.innerHTML = `
        <img src="img/default_profile.png" alt="User" />
        <strong>You:</strong> ${userText}
    `;
    output.appendChild(userMsg);

    // Show CSS spinner on button
    var button = document.getElementById("submit");
    var originalButtonHTML = button.innerHTML;
    button.innerHTML = '<span class="button-spinner"></span>';
    button.disabled = true;

    input.value = "";

    // Force DOM update before fetch
    setTimeout(function() {
        fetch("/", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: userText
        })
        .then(response => response.text())
        .then(data => {
            // Add AI message
            let aiMsg = document.createElement("div");
            aiMsg.className = "container";
            aiMsg.innerHTML = `
                <img src="img/locale_profile.png" alt="Locale" />
                <strong>Locale:</strong> <span class="ai-text"></span>
            `;
            output.appendChild(aiMsg);

            let aiTextSpan = aiMsg.querySelector('.ai-text');
            typeWriter(aiTextSpan, data, 1, 3);

            // Restore button
            button.innerHTML = originalButtonHTML;
            button.disabled = false;

            // Scroll to bottom
            output.scrollTop = output.scrollHeight;
        })
        .catch(error => {
            console.error("Error:", error);
            button.innerHTML = originalButtonHTML;
            button.disabled = false;
        });
    }, 0);
}

// Call on page load
window.addEventListener("DOMContentLoaded", function() {
    buttonresize();
    // Add Enter key listener to input
    var input = document.getElementById("typebox");
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
// Call on window resize
window.addEventListener("resize", buttonresize);

function typeWriter(element, text, speed = 20, charsPerTick = 1) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.substr(i, charsPerTick);
            i += charsPerTick;
            setTimeout(type, speed);
        }
    }
    type();
}