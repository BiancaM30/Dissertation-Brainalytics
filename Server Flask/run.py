import logging
from app import create_app

import http.client as http_client
http_client.HTTPConnection.debuglevel = 1

logging.basicConfig(level=logging.INFO)
app = create_app()

if __name__ == "__main__":
    logging.info("Starting Flask app...")
    app.run(debug=True)
