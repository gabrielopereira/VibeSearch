import argparse
import logging
import os
from logging.handlers import RotatingFileHandler
import sys

# Configure logging with rotation
log_handler = RotatingFileHandler(
    'output.log',
    maxBytes=1024 * 1024,  # 1MB per file
    backupCount=5  # Keep 5 backup files
)
log_handler.setFormatter(logging.Formatter(
    '%(asctime)s [%(levelname)s] %(message)s'
))

logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        log_handler
    ]
)

# Get waitress logger
logger = logging.getLogger('waitress')
logger.setLevel(logging.INFO)

def serve_production(host, port):
    from waitress import serve
    from app import create_app

    app = create_app()
    logging.info(f"Starting production server on http://{host}:{port}")
    serve(app, host=host, port=port)


def serve_development(host, port):
    """Dev server: restarts when a Python file changes, and open pages refresh
    themselves when a template, stylesheet or script changes (app/devreload.py)."""
    from werkzeug.serving import run_simple, is_running_from_reloader

    app = None
    if is_running_from_reloader():
        # Only this worker process serves requests. The parent process just
        # watches files, so it skips loading the embedding model.
        try:
            from app import create_app
            app = create_app(dev=True)
        except Exception as e:
            # Keep running so that fixing the file restarts the server,
            # and show the error in the browser in the meantime.
            logging.exception("Could not start the app")
            startup_error = e

            def app(environ, start_response):
                raise startup_error
    else:
        logging.info(f"Starting development server on http://{host}:{port} (hot reload enabled)")

    run_simple(host, port, app, use_reloader=True, use_debugger=True, threaded=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run VibeSearch")
    parser.add_argument('--dev', action='store_true',
                        default=os.environ.get('FLASK_ENV') == 'development',
                        help="development server with hot reload (also: FLASK_ENV=development)")
    parser.add_argument('--host', default='127.0.0.1',
                        help="use 0.0.0.0 to reach it from other devices on your network")
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()

    if args.dev:
        serve_development(args.host, args.port)
    else:
        serve_production(args.host, args.port)
