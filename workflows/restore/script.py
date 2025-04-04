import json
import os
from datetime import datetime

import psycopg
from dotenv import load_dotenv
from psycopg import sql

load_dotenv()

DBURL = os.environ["DBURL"]
db = psycopg.Connection.connect(DBURL)


def restoreUser():
    with open("user.json", "r", encoding="utf8") as f:
        usersJson = json.load(f)

    with open("displayId.json", "r", encoding="utf8") as f:
        displayIdJson = json.load(f)

    displayIdMap = {item["user_id"]: item["display_id"] for item in displayIdJson}

    with db.cursor() as cur:
        cur.executemany(
            "INSERT INTO users (id, first_name, last_name, phone_number, email, user_role, display_id) OVERRIDING SYSTEM VALUE VALUES (%s,%s,%s,%s,%s,%s,%s)",
            [tuple((user['id'], user['first_name'], user['last_name'], user['phone_number'], user['email'], user['user_role'], displayIdMap[user['id']])) for user in usersJson]
        )
    
    db.commit()



def restore

restoreUser( )