// Homepage main application using Zyx framework
import App from "./components/main-app.js";
import { css } from "/shared/dep/zyx-library/index.js";
css`
    @import "/static/homepage/@css/styles.css";
    @import "/static/homepage/@css/room-interface.css";
`;

const app = new App();
app.appendTo(document.body);
window.app = app;
