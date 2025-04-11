import psycopg
import json
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

DBURL = os.environ("DBURL")

db = psycopg.Connection.connect(DBURL)

def getUsers():
    cur = db.execute("select * from users");
    items = cur.fetchall()
    arr = []
    for item in items:
        arr.append({
            "id": item[0],
            "first_name":item[1],
            "last_name":item[2],
            "phone_number":item[3],
            "email":item[4],
            "user_role":item[5]
        })
        
    with open("out.json", 'w', encoding='utf8') as f:
        json.dump(arr, f)
        
        
def getUserDisplayId():
    cur = db.execute("select * from user_display_id")
    items = cur.fetchall()
    arr = []
    
    for item in items:
        arr.append({
            "display_id":item[0],
            "user_id":item[1] # this is the foreign key to users
        })
        
    with open("displayId.json", 'w', encoding='utf8') as f:
        json.dump(arr, f)
        
def getOAuthInfo():
    cur = db.execute("select * from user_oauth")
    items = cur.fetchall()
    arr = []
    
    for item in items:
        arr.append({
            "user_id":item[0],
            "provider":item[1]
        })
        
    with open("oauth.json", 'w', encoding='utf8') as f:
        json.dump(arr, f)
        
def getApplication():
    cur = db.execute("select * from applications")
    items = cur.fetchall()
    arr = []
    
    for item in items:
        date: datetime = item[5]
        arr.append({
            "hackathon_id":item[0], #foreign key
            "user_id":item[1], # foreign key
            "currentStatus":item[2],
            "pendingStatus":item[3],
            "response":item[4],
            "createdDate":date.timestamp(), # unix timestamp
        })
        
    with open("applications.json", 'w', encoding='utf8') as f:
        json.dump(arr, f)

def getCheckIns():
    cur = db.execute("select * from check_ins")
    items = cur.fetchall()
    arr = []
    
    for item in items:
        date : datetime = item[2]
        arr.append({
            "event_id":item[0], # foreign key
            "user_id":item[1], # foreign key
            "check_in_time": date.timestamp()
        })
        
    with open("checkins.json", 'w', encoding='utf8') as f:
        json.dump(arr, f)

getCheckIns()