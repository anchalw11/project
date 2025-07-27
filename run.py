from journal import create_app
from journal.extensions import socketio
from flask import jsonify

app = create_app()

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Trading Journal API. Please use the /api/journal endpoints."})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5002)
