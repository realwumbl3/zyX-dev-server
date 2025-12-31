import { html } from "/shared/dep/zyx-library/index.js";

class UserSettingsComponent {
    constructor() {
        html`
            <div class="settings-content">
                <h2>Settings</h2>
                <p>Welcome to your settings.</p>
            </div>
        `.bind(this);
    }
}

export default UserSettingsComponent;

export const UserSettingsNamespace = {
    UserSettingsComponent,
};
