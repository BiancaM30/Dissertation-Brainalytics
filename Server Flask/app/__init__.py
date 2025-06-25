from flask import Flask
from app.routes.api import api_bp
from app.routes.inference import inference_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(inference_bp, url_prefix='/api')
    return app
