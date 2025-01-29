import glob
import io
import os
import sys
from typing import List

from PIL import Image, ImageCms

relativePath = "." if len(sys.argv) != 2 else sys.argv[1]

quality = int(input("Compression quality? (0 - 100, 100 is best quality)"))
deleteOriginal = input("delete originalFile? (T/N)").lower() == "t"
resize = input("Resize images? Enter result width (leave empty for no resize): ")
if not resize:
    resize = 0
else:
    resize = int(resize)

queue: List[str] = []
nameToSize = dict()
print("Process the following files:")

for file in glob.glob(f"{relativePath}/**/*.png", recursive=True) + glob.glob(
    f"{relativePath}/**/*.jpg", recursive=True
):
    queue.append(file)
    nameToSize[file] = os.path.getsize(file) // 1024

    print(file, f"({nameToSize[file]}kb)")


abort = input("\n Continue? (T/N)").lower() != "t"

if abort:
    sys.exit()

for file in queue:
    img: Image.Image = Image.open(file)
    iccProfile = img.info.get("icc_profile")
    if iccProfile:
        iccBytes = io.BytesIO(iccProfile)
        colorProfile = ImageCms.ImageCmsProfile(iccBytes)

    newPath = file.rstrip(".jpg").rstrip(".png") + ".webp"
    if resize > 0:
        print(img.width, img.height, (resize, int((resize / img.width) * img.height)))
        img = img.resize(
            (resize, int((resize / img.width) * img.height)), Image.Resampling.LANCZOS, reducing_gap=2
        )  # resize the img such that width is "resize" and height is scaled to keep aspect ratio
    print(f"saving image: {img.width}, {img.height}")
    if iccProfile:
        img.save(newPath, "webp", optimize=True, quality=quality, icc_profile=colorProfile.tobytes())
    else:
        img.save(newPath, "webp", optimize=True, quality=quality)

    print(f"Processed file {file}, {nameToSize[file]}kb -> {os.path.getsize(newPath) // 1024}kb")

for file in queue:
    if deleteOriginal:
        print("deleting ", file)
        os.remove(file)



