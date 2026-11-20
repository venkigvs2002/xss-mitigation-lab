
const commentsContainer = document.getElementById("comments");
const commentForm = document.getElementById("commentForm");
const renderMode = document.getElementById("renderMode");
const status = document.getElementById("status");

// Client-side HTML encoder.
// This helper is for HTML text content only.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;"
    })[char]);
}

// Create a comment element using a selected defense
function createCommentElement(comment, mode) {

    const commentElement = document.createElement("div");
    commentElement.className = "comment";

    if (mode === "textContent") {

        // METHOD 1: textContent
        const name = document.createElement("h3");
        name.textContent = comment.name;

        const message = document.createElement("p");
        message.textContent = comment.comment;

        commentElement.append(name, message);

    } else if (mode === "innerText") {

        // METHOD 2: innerText
        const name = document.createElement("h3");
        name.innerText = comment.name;

        const message = document.createElement("p");
        message.innerText = comment.comment;

        commentElement.append(name, message);

    } else if (mode === "htmlEncoding") {

        // METHOD 3: Client-side HTML entity encoding
        commentElement.innerHTML = `
            <h3>${escapeHTML(comment.name)}</h3>
            <p>${escapeHTML(comment.comment)}</p>
        `;

    } else if (mode === "dompurify") {

        // METHOD 4: DOMPurify
        const dirtyHTML = `
            <h3>${comment.name}</h3>
            <p>${comment.comment}</p>
        `;

        const cleanHTML = DOMPurify.sanitize(dirtyHTML);

        commentElement.innerHTML = cleanHTML;

    } else if (mode === "serverEncoding") {

        // METHOD 5: Server already encoded HTML text values.
        // These values are safe for these specific HTML text positions.
        commentElement.innerHTML = `
            <h3>${comment.name}</h3>
            <p>${comment.comment}</p>
        `;
    }

    return commentElement;
}

// Load comments
async function loadComments() {

    const mode = renderMode.value;

    // Use server-encoded response only for method 5
    const endpoint = mode === "serverEncoding"
        ? "/comments/encoded"
        : "/comments";

    const response = await fetch(endpoint);

    const comments = await response.json();

    commentsContainer.replaceChildren();

    comments.forEach(comment => {

        const element = createCommentElement(comment, mode);

        commentsContainer.appendChild(element);

    });
}

// Change rendering strategy
renderMode.addEventListener("change", loadComments);

// Submit comments
commentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const formData = new FormData(commentForm);

    const response = await fetch("/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(formData)
    });

    if (response.ok) {

        status.textContent = "Comment posted successfully!";

        commentForm.reset();

        loadComments();

    } else {

        status.textContent = "Something went wrong.";

    }

});

// Initial rendering
loadComments();
