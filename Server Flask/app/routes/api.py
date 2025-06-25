import logging
from flask import Blueprint, request, jsonify
from ..services.influx_service import InfluxService

api_bp = Blueprint('api', __name__)

@api_bp.route('/patients', methods=['GET'])
def get_patients():
    logging.info("Endpoint /patients accessed")
    label = request.args.get('label')
    service = InfluxService()
    patients = service.get_patients(label)
    return jsonify(patients)

@api_bp.route('/patient/<patient_id>/connectivity', methods=['GET'])
def get_connectivity(patient_id):
    service = InfluxService()
    matrix = service.get_connectivity(patient_id)
    return jsonify(matrix)

@api_bp.route('/patient/<patient_id>/region/<region>/timeseries', methods=['GET'])
def get_region_timeseries(patient_id, region):
    service = InfluxService()
    timeseries = service.get_region_timeseries(patient_id, region)
    return jsonify(timeseries)