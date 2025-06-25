from influxdb_client import InfluxDBClient
from app.config import Config


class InfluxService:
    def __init__(self):
        self.client = InfluxDBClient(
            url=Config.INFLUXDB_URL,
            token=Config.INFLUXDB_TOKEN,
            org=Config.INFLUXDB_ORG,
            timeout=30_000
        )
        self.query_api = self.client.query_api()
        self.bucket = Config.INFLUXDB_BUCKET

    def get_patients(self, label=None):
        flux_filter = f'|> filter(fn: (r) => r["label"] == "{label}")' if label else ""
        flux_query = f'''
            from(bucket: "{Config.INFLUXDB_BUCKET}")
              |> range(start: 0)
              |> filter(fn: (r) => r["_measurement"] == "brain_region_connectivity")
              {flux_filter}
              |> keep(columns: ["patient_id"])
              |> group()
              |> distinct(column: "patient_id")
        '''
        result = self.query_api.query(query=flux_query, org=Config.INFLUXDB_ORG)
        patients = []
        for table in result:
            for record in table.records:
                pid = record.values.get("_value")
                patients.append({"patient_id": pid})
        return patients

    def get_connectivity(self, patient_id):
        flux_query = f'''
            from(bucket: "{self.bucket}")
            |> range(start: 0)
            |> filter(fn: (r) => r["_measurement"] == "brain_region_connectivity")
            |> filter(fn: (r) => r["patient_id"] == "{patient_id}")
        '''
        result = self.query_api.query(query=flux_query, org=Config.INFLUXDB_ORG)
        matrix = {}
        for table in result:
            for record in table.records:
                region_from = record.values.get("region_from")
                region_to = record.values.get("region_to")
                correlation = record.get_value()
                if region_from not in matrix:
                    matrix[region_from] = {}
                matrix[region_from][region_to] = correlation
        return matrix

    def get_region_timeseries(self, patient_id, region):
        flux_query = f'''
            from(bucket: "{self.bucket}")
            |> range(start: 0)
            |> filter(fn: (r) => r["_measurement"] == "brain_region_connectivity")
            |> filter(fn: (r) => r["patient_id"] == "{patient_id}" and r["region_from"] == "{region}")
            |> map(fn: (r) => ({{
                r with _value: float(v: r._value)
            }}))
            |> keep(columns: ["_time", "_value"])
            |> sort(columns: ["_time"])
        '''
        result = self.query_api.query(query=flux_query, org=Config.INFLUXDB_ORG)
        timeseries = []
        for table in result:
            for record in table.records:
                timeseries.append({
                    "time": record.get_time().isoformat(),
                    "value": record.get_value()
                })
        return timeseries
