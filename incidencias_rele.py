import requests
import serial
import time

WEBHOOK_TOKEN = "YWEBHOOK_TOKEN"
URL = f"https://webhook.site/token/{WEBHOOK_TOKEN}/requests"

SERIAL_PORT = "COM6"
BAUDRATE = 9600

print("Initializing incident notification system...")

ser = serial.Serial(SERIAL_PORT, BAUDRATE)

processed = set()

try:
    r = requests.get(URL)
    data = r.json()

    for event in data["data"]:
        processed.add(event["uuid"])

    print("Existing events ignored:", len(processed))

except Exception as e:
    print("Initialization error:", e)

print("Monitoring started...")

while True:

    try:
        r = requests.get(URL)
        data = r.json()

        for event in data["data"]:

            uuid = event["uuid"]

            if uuid not in processed:

                print("New incident detected")

                ser.write(bytes([0xA0,0x01,0x01,0xA2]))
                time.sleep(5)
                ser.write(bytes([0xA0,0x01,0x00,0xA1]))

                processed.add(uuid)

    except Exception as e:
        print("Runtime error:", e)

    time.sleep(10)
