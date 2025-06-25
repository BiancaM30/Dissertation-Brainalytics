import os
import numpy as np
import nibabel as nib
from nilearn.input_data import NiftiLabelsMasker
from tqdm import tqdm

BASE_DIR = r"C:\Dataset\Preprocessed\ADNI"
OUTPUT_DIR = r"C:\Dataset\Timeseries_Schaefer200"

# 2 brain parcellation schemes: AAL90 and Schaefer200
# AAL_TEMPLATE = r"C:\Atlas\Timeseries_AAL90\AAL90_3mm.nii"
AAL_TEMPLATE = r"C:\Atlas\Timeseries_Schaefer200\schaefer200MNI.nii"

os.makedirs(os.path.join(OUTPUT_DIR, "AD"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "CN"), exist_ok=True)


def extract_timeseries(fmri_path, output_path, masker):
    img = nib.load(fmri_path)
    time_series = masker.fit_transform(img)
    np.savetxt(output_path, time_series, delimiter=" ")
    print(f"Saved: {output_path}")


masker = NiftiLabelsMasker(labels_img=AAL_TEMPLATE, standardize=True)

for group in ["AD", "CN"]:
    input_dir = os.path.join(BASE_DIR, group)
    output_dir = os.path.join(OUTPUT_DIR, group)

    subjects = os.listdir(input_dir)
    for subject in tqdm(subjects, desc=f"Processing {group} Subjects"):
        fmri_file = os.path.join(input_dir, subject, "GretnaFunNIfTI", subject, "swrnrest.nii")
        output_file = os.path.join(output_dir, f"{subject}.txt")

        if os.path.exists(fmri_file):
            extract_timeseries(fmri_file, output_file, masker)
        else:
            print(f"Missing file: {fmri_file}")

print("Time series extraction complete!")
