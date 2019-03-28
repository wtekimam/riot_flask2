import os
import datetime
from gpiozero import LED, Button, OutputDevice
from signal import pause
from time import sleep, time, strftime
import Adafruit_DHT

led = LED(4)
flash = LED(22)
button = Button(17)
doorSensor = Button(18)
tempHumiSensor = 23
doorSwitch = OutputDevice(27, active_high=True, initial_value=False)

pictureCount = 1

desiredTempRange = [22, 25]
desiredHumRange = [40, 46]

Message = []

timeDifferenceBetweenTempChecks = 15


class log():
    def __init__(self):
        pass

    def create_log(self):
        global dirpathLog, today_now

        today_now = str(datetime.datetime.now())

        # dirpathLog = os.path.join('./log')
        Message = ["new log created"]
        instances = 1
        self.editLog(Message)

        return

    def editLog(self, Message):
        os.chdir("/home/pi/riot/log/")

        filename = str("%s.txt" % today_now)  # make file name

        instances = len(Message)

        file = open(filename, "a+")
        print("file open")

        for i in range(instances):
            time = strftime("%I:%M:%S")  # get the current hour, minute, and second
            print("writing %s to file" % Message[i])
            file.write("%s %s\r\n" % (time, Message[i]))

        file.close()
        print("file closed")

        return


class temperature():
    def __init__(self):
        pass

    def checkTemp(self):
        global Message

        humidity, temperature = Adafruit_DHT.read_retry(11, tempHumiSensor)
        temp = temperature
        humidity = humidity
        print("temp: %d humidity: %d" % (temp, humidity))

        Message = Message.append("temp: %d humidity: %d" % (temp, humidity))

        if temp < desiredTempRange[0] or temp > desiredTempRange[1]:
            print("********************** temperature warning : %d" % temp)
            Message.append("********************** temperature warning : %d" % temp)
        if humidity < desiredHumRange[0] or humidity > desiredHumRange[1]:
            print("********************** humidity warning : %d" % humidity)
            Message.append("********************** temperature warning : %d" % humidity)

        print(Message)
        class_log.editLog(Message)

        return


class photos():
    def __init__(self):
        pass

    def takePic(self, doorOpen):
        global pictureCount

        os.chdir(dirpathPhotos)

        self.flash()  # turn flash on
        timerStart = time()

        filename = "image%d" % pictureCount  # make file name
        command = "raspistill -vf -hf -w 640 -h 480 -q 25 -o %s.jpg" % filename
        os.system(command)

        timerStop = time()
        self.flash()  # turn flash off
        totalTime = str(timerStop - timerStart)

        pictureCount += 1
        print("total time taken for picture: %s" % totalTime)

        sleep(
            2)  # time needed for the door mag to be far enough away so that it doesn't trigger

        if doorOpen is False:
            Message.append("picture 2/2: picture name: %s" % filename)
            class_log.editLog(Message)  # log picture

        else:
            Message.append("picture 1/2: picture name: %s" % filename)
            class_door_status.checking("normal")

        return

    def flash(self):
        print("flash")
        flash.toggle()
        led.toggle()
        return


class door_status():
    def __init__(self):
        pass

    def checking(self, doorOpen):

        if doorOpen == "normal":
            while True:
                if doorSensor.is_pressed == True:
                    print("door closed")
                    doorOpen = False
                    sleep(1)
                    class_photos.takePic(doorOpen)

        elif doorOpen == "overide":
            print("overide")
            doorOpen = False
            sleep(1)
            class_photos.takePic(doorOpen)

    def door_lock(self):
        doorSwitch.off()
        print("door unlocked")
        sleep(1)
        doorSwitch.on()
        print("door locked")


class initialize():
    def __init__(self):
        doorSwitch.on()
        class_log.create_log()
        messPhoto = self.create_photos_folder()
        messTemp = self.test_temperature()
        messCamera = self.test_camera()
        messDoor = self.check_door_status()

        Message = [messPhoto, messTemp, messCamera, messDoor]
        # instances = len(Message)
        class_log.editLog(Message)

    def create_photos_folder(self):
        global dirpathPhotos, today_now

        dirpathPhotos = os.path.join('/home/pi/riot/photos/', today_now[1:])

        try:
            os.mkdir(dirpathPhotos)
        except FileExistsError:
            print("Directory {} already exists".format(dirpathPhotos))
            Message = ["photo folder already exists, name: %s" % dirpathPhotos]
        else:
            print("Directory {} created".format(dirpathPhotos))
            Message = ["photo folder created, name: %s" % dirpathPhotos]

        return Message

    def check_door_status(self):
        if doorSensor:
            Message = "door is closed"
        else:
            Message = "door is open"

        return Message

    def test_temperature(self):
        class_temperature.checkTemp()
        Message = "test temperature complete"
        return Message

    def test_camera(self):
        Message = "test camera skipped"
        return Message


##############  Start ##############

print("Starting up")

class_log = log()
class_photos = photos()
class_door_status = door_status()
class_temperature = temperature()
class_initialize = initialize()

tTime = int(strftime("%S"))  # I = hour M = minutes S = Seconds

while True:
    print("main loop")
    if button.is_pressed == True:
        class_photos.takePic(True)

    #     sleep(3)
    #     class_photos.takePic("overide")  # for continuous photo taking

    # define time between checks
    currentTime = int(strftime("%S"))  # I = hour M = minutes S = Seconds
    if currentTime >= tTime + timeDifferenceBetweenTempChecks or currentTime == "00":
        tTime = currentTime
        tempClass = temperature()
        tempClass.checkTemp()