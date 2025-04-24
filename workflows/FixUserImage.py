import psycopg
import json
from datetime import datetime
from dotenv import load_dotenv
import os
import boto3
from typing import Dict

load_dotenv()

postgres_url = os.environ["DBURL"]
s3_endpoint = os.environ["R2_ENDPOINT"]
acesskey = os.environ["R2_ACCESS_KEY_ID"]
secret = os.environ["R2_SECRET_ACCESS_KEY"]
region = os.environ["R2_REGION"]

db = psycopg.Connection.connect(postgres_url)


def fetchExistingImages():
    client = boto3.client(
        "s3", endpoint_url=s3_endpoint, aws_access_key_id=acesskey, aws_secret_access_key=secret, region_name=region
    )
    s3 = boto3.resource(
        "s3", endpoint_url=s3_endpoint, aws_access_key_id=acesskey, aws_secret_access_key=secret, region_name=region
    )
    bucket = s3.Bucket("profile-pictures")

    out: Dict[str, str] = dict()
    for obj in bucket.objects.all():
        val = client.head_object(Bucket="profile-pictures",Key=obj.key)
        out[val['Metadata']['userid']] = obj.key
        print(val['Metadata']['userid'], obj.key)

    return out


def process():
    profileIconMap = fetchExistingImages()

    cur = db.execute('select * from public."user"')
    items = cur.fetchall()
    cur.close()


    userIds = [item[0] for item in items]
    for userId in userIds:
        print(userId, type(userId))
        if str(userId) in profileIconMap:
            cur = db.execute('Update public."user" set image = %s where id = %s', (profileIconMap[str(userId)], userId),  )
            print('processed: ', (profileIconMap[str(userId)]), userId)
    db.commit()


process()