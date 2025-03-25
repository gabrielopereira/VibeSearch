import logging
from logging.handlers import RotatingFileHandler
from waitress import serve
from app import create_app
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

app = create_app()

if __name__ == '__main__':
    logging.info("Starting server on http://127.0.0.1:8080")
    serve(app, host='127.0.0.1', port=8080, _server_logger=logger) 