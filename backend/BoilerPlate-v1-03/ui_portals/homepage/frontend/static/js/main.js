// Homepage main application using Zyx framework
import { html, css } from "/shared/dep/zyx-library/index.js";
import HomepageApp from "./components/HomepageApp.js";
css`
    @import "/static/homepage/@css/styles.css";
`;

function initHomepage() {
    // Create and mount the main homepage app
    const homepage = new HomepageApp();
    // Append the main element to body
    if (homepage.main) {
        document.body.appendChild(homepage.main);
    }
}

// Initialize the homepage
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomepage);
} else {
    initHomepage();
}


