import MFRC522
import os
from time import sleep



def rfid():
    MIFAREReader = MFRC522.MFRC522()
    auth_uid = []
    while True:
        (status, TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

        # if a card is detected
        if status == MIFAREReader.MI_OK:
            print("Card detected")

        (status, uid) = MIFAREReader.MFRC522_Anticoll()

        if status == MIFAREReader.MI_OK:
            print("door unlocked")
            card_tap = True
            take_pic = True

            auth_uid = [uid[0], uid[1], uid[2], uid[3]]
            if auth_uid:
                if auth_uid == [153, 58, 123, 41]:
                    print("Shutting down...")
                    sleep(2)
                    os.system("sudo shutdown now")

                # change role
                if auth_uid == [137, 143, 125, 89]:
                    role = "vendor"
                    print(role)
                    return role
                elif uid[0] == 2:
                    role = "Rega Optima"
                    print(role)

            print(auth_uid)
            # Print UID
            # print("Card read UID: %s,%s,%s,%s" % (uid[0], uid[1], uid[2], uid[3]))

            MIFAREReader.MFRC522_SelectTag(uid)

            # This is the default key for authentication
            key = [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]

            # Authenticate
            status = MIFAREReader.MFRC522_Auth(MIFAREReader.PICC_AUTHENT1A, 8, key, uid)

            # Check if authenticated
            if status == MIFAREReader.MI_OK:
                MIFAREReader.MFRC522_Read(8)
                MIFAREReader.MFRC522_StopCrypto1()
            else:
                print("Authentication error")

        return auth_uid if uid else []
