from waitress import serve
from app import create_app
import ssl

app = create_app()

if __name__ == '__main__':
    print("Starting server on https://0.0.0.0:443")
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain(
        '/etc/letsencrypt/live/vibesearch.latentspaces.online/fullchain.pem',
        '/etc/letsencrypt/live/vibesearch.latentspaces.online/privkey.pem'
    )
    serve(app, host='0.0.0.0', port=443, url_scheme='https', _ssl_context=ssl_context) 