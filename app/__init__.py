from flask import Flask
from app.routes import init_routes

def create_app(dev=False):
    app = Flask(__name__)
    if dev:
        # Templates are re-read on every request, errors show in the browser
        app.debug = True
        from app.devreload import init_devreload
        init_devreload(app)
    init_routes(app)
    return app
