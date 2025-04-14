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
            [
                tuple(
                    (
                        user["id"],
                        user["first_name"],
                        user["last_name"],
                        user["phone_number"],
                        user["email"],
                        user["user_role"],
                        displayIdMap[user["id"]],
                    )
                )
                for user in usersJson
            ],
        )

    db.commit()


def restoreOAuth():
    with open("oauth.json", "r", encoding="utf8") as f:
        oauths = json.load(f)

    with db.cursor() as cur:
        cur.executemany(
            "INSERT INTO user_oauth (user_id, provider)  VALUES (%s, %s)",
            [(oauth["user_id"], oauth["provider"]) for oauth in oauths],
        )

    db.commit()


def restoreCheckins():
    with open("checkins.json", "r", encoding="utf8") as f:
        checkins = json.load(f)

    with db.cursor() as cur:
        cur.executemany(
            "INSERT INTO check_ins (event_id, user_id, check_in_time)  VALUES (%s, %s, %s)",
            [(checkin["event_id"], checkin["user_id"], datetime.fromtimestamp(checkin["check_in_time"])) for checkin in checkins],
        )

    db.commit()
    
    
def restoreApplications():
    with open("applications.json", "r", encoding="utf8") as f:
        applications = json.load(f)

    with db.cursor() as cur:
        cur.executemany(
            "INSERT INTO applications (hackathon_id, user_id, current_status, pending_status, response, created_date)  VALUES (%s, %s, %s, %s, %s, %s)",
            [(
                app['hackathon_id'], app['user_id'], app['currentStatus'], app['pendingStatus'], json.dumps(app['response']), datetime.fromtimestamp(app['createdDate'])
                ) for app in applications],
        )

    db.commit()


restoreApplications()
