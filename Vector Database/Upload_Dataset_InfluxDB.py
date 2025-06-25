import os
import re
import pandas as pd
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

bucket = "bucket1"
org = "dss"
token = "8dr...."
url="https://..."
client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api(write_options=SYNCHRONOUS)

region_df = pd.read_excel("AAL90_region_info.xlsx", engine='openpyxl', header=None)
region_mapping = region_df[1].to_dict()

meta_df = pd.read_csv("pacient_metadata.csv")
meta_dict = {}

for _, row in meta_df.iterrows():
    match = re.search(r"(I\d+)", str(row["Image Data ID"]))
    if match:
        patient_id = match.group(1)
        meta_dict[patient_id] = {
            "sex": row["Sex"],
            "age": row["Age"]
        }

base_path = "C:/Dataset/ADNI"

for label in ["AD", "MCI", "CN"]:
    folder_path = os.path.join(base_path, label)
    for filename in os.listdir(folder_path):
        if filename.endswith(".txt"):
            match = re.search(r"Sub_(I\d+)_", filename)
            if not match:
                continue
            patient_id = match.group(1)
            matrix = pd.read_csv(os.path.join(folder_path, filename), delim_whitespace=True, header=None).values
            meta = meta_dict.get(patient_id, {"sex": "Unknown", "age": None})

            points = []
            for i in range(90):
                for j in range(90):
                    point = (
                        Point("brain_region_connectivity")
                        .tag("patient_id", patient_id)
                        .tag("label", label)
                        .tag("region_from", region_mapping.get(i, f"Region_{i}"))
                        .tag("region_to", region_mapping.get(j, f"Region_{j}"))
                        .tag("sex", meta["sex"])
                        .field("age", int(meta["age"]))
                        .field("correlation", float(matrix[i][j]))
                    )
                    points.append(point)

            write_api.write(bucket=bucket, org=org, record=points)

