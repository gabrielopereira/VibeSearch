"""Development-only live reload. Never registered in production (see create_app).

Every HTML page gets a small script that polls /__dev/reload and reacts when
something under templates/ or static/ changes:
  - CSS changed      -> stylesheets are swapped in place, page state is kept
  - anything else    -> the page is reloaded
  - server restarted -> the page is reloaded (Python changes restart the server)
"""
import logging
import os
import time

from flask import jsonify, request
from jinja2.utils import htmlsafe_json_dumps

RELOAD_PATH = '/__dev/reload'
BOOT_ID = str(time.time())  # changes every time the server process restarts

CLIENT_SCRIPT = """<script>
(function () {
    var post = __POST_FIELDS__;  // [name, value] pairs if this page answered a POST
    var seen = null;
    var SCROLL_KEY = '__devreload_scroll';

    try {
        var y = sessionStorage.getItem(SCROLL_KEY);
        if (y !== null) {
            sessionStorage.removeItem(SCROLL_KEY);
            window.addEventListener('load', function () { window.scrollTo(0, +y); });
        }
    } catch (e) {}

    function reloadPage() {
        try { sessionStorage.setItem(SCROLL_KEY, window.scrollY); } catch (e) {}
        if (!post) { location.reload(); return; }
        // Re-send the POST ourselves: location.reload() on a POST result
        // makes the browser ask "resubmit the form?" every time.
        var form = document.createElement('form');
        form.method = 'post';
        form.action = location.href;
        post.forEach(function (field) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = field[0];
            input.value = field[1];
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
    }

    function reloadCss() {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
            var url = new URL(link.href);
            if (url.origin !== location.origin) return;
            url.searchParams.set('_devreload', Date.now());
            // Load the new sheet next to the old one and only then drop the
            // old one, so the page never flashes unstyled.
            var fresh = link.cloneNode();
            fresh.href = url;
            fresh.onload = function () { link.remove(); };
            link.after(fresh);
        });
    }

    function tick() {
        fetch('__RELOAD_PATH__', { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (now) {
                if (seen && (now.boot !== seen.boot || now.page !== seen.page)) {
                    reloadPage();
                    return;
                }
                if (seen && now.css !== seen.css) reloadCss();
                seen = now;
                setTimeout(tick, 700);
            })
            .catch(function () { setTimeout(tick, 700); });  // server is restarting
    }
    tick();
})();
</script>"""


def _snapshot(watch_dirs):
    """Newest modification time of the CSS files and of everything else."""
    css = page = 0.0
    for watch_dir in watch_dirs:
        for root, _, files in os.walk(watch_dir):
            for name in files:
                if name.startswith('.') or name.endswith('~'):
                    continue  # .DS_Store, editor swap files
                try:
                    mtime = os.path.getmtime(os.path.join(root, name))
                except OSError:
                    continue
                if name.endswith('.css'):
                    css = max(css, mtime)
                else:
                    page = max(page, mtime)
    return {'boot': BOOT_ID, 'css': css, 'page': page}


class _HidePolling(logging.Filter):
    def filter(self, record):
        return RELOAD_PATH not in record.getMessage()


def init_devreload(app):
    watch_dirs = [os.path.join(app.root_path, 'templates'), app.static_folder]

    # The poll fires more than once a second; keep it out of the request log.
    logging.getLogger('werkzeug').addFilter(_HidePolling())

    @app.route(RELOAD_PATH)
    def dev_reload():
        return jsonify(_snapshot(watch_dirs))

    @app.after_request
    def inject_client_script(response):
        if response.mimetype != 'text/html' or response.direct_passthrough:
            return response
        body = response.get_data(as_text=True)
        if '</body>' not in body:
            return response
        post_fields = None
        if request.method == 'POST':
            post_fields = list(request.form.items(multi=True))
        script = (CLIENT_SCRIPT
                  .replace('__RELOAD_PATH__', RELOAD_PATH)
                  .replace('__POST_FIELDS__', htmlsafe_json_dumps(post_fields)))
        head, _, tail = body.rpartition('</body>')
        response.set_data(head + script + '</body>' + tail)
        return response
