import shutil
import os
from swagger_ui_bundle import swagger_ui_path

dst = "app/static/swagger-ui"
os.makedirs(dst, exist_ok=True)
shutil.copytree(swagger_ui_path, dst, dirs_exist_ok=True)
print("OK:", os.listdir(dst))