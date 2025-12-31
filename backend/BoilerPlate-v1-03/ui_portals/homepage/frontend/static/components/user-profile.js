import { html } from "/shared/dep/zyx-library/index.js";

class UserProfileComponent {
    constructor() {
        html`
            <div class="profile-content">
                <h2>Profile</h2>
                <p>Welcome to your profile.</p>
            </div>
        `.bind(this);
    }
}

export default UserProfileComponent;

export const UserProfileNamespace = {
    UserProfileComponent,
};
