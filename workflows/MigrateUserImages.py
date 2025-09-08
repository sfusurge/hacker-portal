import psycopg
import json
from datetime import datetime
from dotenv import load_dotenv
import os
import boto3
from typing import Dict
from PIL import Image, ImageFile, UnidentifiedImageError
ImageFile.LOAD_TRUNCATED_IMAGES = True
from io import BytesIO
import sys
import subprocess


load_dotenv()

postgres_url = os.environ["DBURL"]
s3_endpoint = os.environ["R2_ENDPOINT"]
acesskey = os.environ["R2_ACCESS_KEY_ID"]
secret = os.environ["R2_SECRET_ACCESS_KEY"]
region = os.environ["R2_REGION"]

vercelToken = os.environ["Migration"]

db = psycopg.Connection.connect(postgres_url)

# init vercel vars
subprocess.run(["vercel", "env", "pull", ".env.local", "-t", vercelToken], shell=True)


def fetchExistingImages():
    client = boto3.client(
        "s3", endpoint_url=s3_endpoint, aws_access_key_id=acesskey, aws_secret_access_key=secret, region_name=region
    )
    s3 = boto3.resource(
        "s3", endpoint_url=s3_endpoint, aws_access_key_id=acesskey, aws_secret_access_key=secret, region_name=region
    )
    bucket = s3.Bucket("profile-pictures")

    for obj in bucket.objects.all():
        res = obj.get()
        yield (res["Metadata"]["userid"], obj.key, res["Body"], res["ContentType"])


def process():
    imageProfiles = fetchExistingImages()

    cur = db.execute('select * from public."user"')
    items = cur.fetchall()
    cur.close()

    userIdMap = {item[0]: item for item in items}

    for userId, imageKey, stream, mimeType in imageProfiles:
        user = userIdMap.get(int(userId), None)
        print("checking", userId, imageKey)
        if user and imageKey in user:
            print(f"Converting and uploading {userId}")
            image = Image.open(BytesIO(stream.read()), "r", [mimeType.removeprefix("image/"), 'png', 'jpeg'])
            image = image.convert("RGB")
            image.save(f"temp.jpg", "jpeg", )

            usericonName = f"{imageKey}.jpg"
            subprocess.run(
                ["vercel", "blob", "put", "temp.jpg", "-f", "-p", f"user_icon/{usericonName}", "-t", vercelToken],
                shell=True,
            )

            db.execute('update public."user" set image = %s where id = %s', (usericonName, user[0]))
            db.commit()
            print(f"Processed: {usericonName}")



process()
