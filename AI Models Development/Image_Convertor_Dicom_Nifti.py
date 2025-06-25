import os
import subprocess

base_dir = "C:/Dataset/Dicom/MCI/ADNI"
output_dir = "C:/Dataset/Nifti/MCI/ADNI"
os.makedirs(output_dir, exist_ok=True)

for subject_id in os.listdir(base_dir):
    subject_path = os.path.join(base_dir, subject_id, "Resting_State_fMRI")
    
    if os.path.isdir(subject_path):
        for visit_date in os.listdir(subject_path):
            visit_path = os.path.join(subject_path, visit_date)
            if os.path.isdir(visit_path):
                for image_id in os.listdir(visit_path):
                    dicom_folder = os.path.join(visit_path, image_id)
                    if os.path.isdir(dicom_folder):
                        print(f"Processing {image_id} from {subject_id}...")
                        output_filename = f"{image_id}.nii.gz"
                        subprocess.run([
                            "dcm2niix",
                            "-o", output_dir,
                            "-f", output_filename,
                            dicom_folder
                        ])
print("Conversion completed for all subjects!")
