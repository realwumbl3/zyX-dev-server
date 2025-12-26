"""
Backend package for the homepage.

This module defines the `homepage_bp` blueprint which owns:
- All HTTP routes under the `/` URL prefix (root).
- The homepage Jinja templates in `frontend/templates/`.

Static assets for this page are served directly by Nginx from
`pages/homepage/frontend/static/`, so this blueprint does not define
its own `static_folder` or `static_url_path`.
"""

# Import Flask primitives to build the API and render the HTML shell.
from flask import Blueprint, jsonify, render_template, request

# Import database models and utilities
from server.models import Room

# Create the homepage blueprint that encapsulates all related routes.
homepage_bp = Blueprint(
    "homepage",  # Blueprint name for `url_for("homepage.*")`.
    __name__,  # Module name; Flask uses this as a base for path resolution.
    url_prefix="/",  # URL prefix for all routes on this page (root).
    # Templates live under `pages/homepage/frontend/templates/`.
    template_folder="../frontend/templates",
)


@homepage_bp.route("/")
def homepage_home():
    """
    Render the main homepage.

    The `homepage.html` template resides in this blueprint's
    `template_folder`, keeping the HTML shell colocated with its JS/CSS.
    """
    return render_template("homepage.html")


@homepage_bp.route("/auth/success")
def auth_success():
    """
    Handle OAuth success page that sends token to parent window and closes popup.

    This page is loaded in the OAuth popup after successful authentication.
    It extracts the token from cookies and sends it to the parent window.
    """
    return render_template("auth_success.html")