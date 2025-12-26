// Homepage main application using Zyx framework
import App from "./components/app.js";
import { css } from "/shared/dep/zyx-library/index.js";
css`
    @import "/static/homepage/@css/styles.css";
`;

const app = new App();
app.appendTo(document.body);
window.app = app;
