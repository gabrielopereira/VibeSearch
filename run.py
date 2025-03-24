from waitress import serve
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting server on http://0.0.0.0:8080")
    serve(app, host='0.0.0.0', port=8080) 