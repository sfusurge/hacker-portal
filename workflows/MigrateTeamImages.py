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
    s3 = boto3.resource(
        "s3", endpoint_url=s3_endpoint, aws_access_key_id=acesskey, aws_secret_access_key=secret, region_name=region
    )
    bucket = s3.Bucket("team-pictures")

    for obj in bucket.objects.all():
        res = obj.get()
        try:
            yield (res["Metadata"]["userid"], obj.key, res["Body"], res["ContentType"])
        except KeyError as e:
            print(e)
            print(res["Metadata"], obj.key)
            continue


def process():
    imageProfiles = fetchExistingImages()

    cur = db.execute('''
                        SELECT DISTINCT u.id, t.team_picture_url, t.id FROM "user" u
                        JOIN memberships m ON u.id = m.user_id
                        JOIN teams t ON m.team_id = t.id
                        WHERE t.team_picture_url IS NOT NULL
                    ''')
    items = cur.fetchall()
    cur.close()

    leaderIdMapToImage = {item[0]:(item[1], item[2]) for item in items}

    for userId, imageKey, stream, mimeType in imageProfiles:
        team = leaderIdMapToImage.get(int(userId), None)
        
        if team:
            print(f"Converting data for {team}")
            image = Image.open(BytesIO(stream.read()), "r", [mimeType.removeprefix("image/"), 'png', 'jpeg'])
            image = image.convert("RGB")
            image.save(f"temp.jpg", "jpeg", )
            iconName = f"{imageKey}.jpg"
            subprocess.run(
                ["vercel", "blob", "put", "temp.jpg", "-f", "-p", f"team_icon/{iconName}", "-t", vercelToken],
                shell=True,
            )

            db.execute('update public."teams" set team_picture_url = %s where id = %s', (iconName, team[1]))
            db.commit()
            print(f"Processed: {team}")



process()
