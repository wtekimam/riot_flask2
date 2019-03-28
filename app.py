import sys
sys.path.append('home/pi/Documents/riot_flask')

from threading import Thread, Event
from time import sleep
import os
import ast

import requests
from requests.auth import HTTPBasicAuth

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from gpiozero import LED, Button, OutputDevice
import read_mfrc522

import Adafruit_DHT
import MFRC522

app = Flask(__name__)
# turn the app into socketio app
socketio = SocketIO(app)

thread = Thread()
thread_stop_event = Event()


class Temperature(Thread):
    def __init__(self):
        self.delay = 1
        self.door_sensor = Button(27)
        self.flash = LED(18)
        self.lock = OutputDevice(15, active_high=True, initial_value=True)
        self.item_list = {'Coke': 0, 'Sprite': 0}
        # self.humidity, self.temperature = Adafruit_DHT.read_retry(11, 17)
        self.uid = []
        
        # to make sure only take pic once after the door is closed
        self.take_pic = False

        # for determining role
        self.role = "Customer"
        
        # for detecting card tap
        self.card_tap = False

        # for detecting if picture is processed
        self.finish = False

        super(Temperature, self).__init__()

    def main_app(self):
        """Run and manage sensors then export the context to front end"""
        while not thread_stop_event.isSet():
            self.uid = read_mfrc522.rfid()
            print(self.uid)

            if self.uid:
                if self.uid is "vendor":
                    print("Found it")
                    self.role = "vendor"
                else:
                    self.unlock()
                    print(self.take_pic)
                self.card_tap = True

            if self.door_sensor.is_pressed and self.take_pic:
                self.finish = False
                print("finish " + str(self.finish))
                take_picture()
                self.item_list = ast.literal_eval(self.process_picture())
                print(self.item_list)
                print(type(self.item_list))
                self.take_pic = False
                self.finish = True
                print("finish: " + str(self.finish))

            door_status = "closed" if self.door_sensor.is_pressed else "open"

            context = {
                # 'humidity': self.humidity,
                # 'temperature': self.temperature,
                'door_status': door_status,
                'item_list': self.item_list,
                'role': self.role,
                'card_tap': self.card_tap,
                'finish': self.finish,
            }
            socketio.emit('temperature_read', context, namespace='/test')
            sleep(self.delay)
            self.card_tap = False
            self.finish = False
            self.role = ""

    @staticmethod
    def process_picture():
        """upload picture to ML engine in Google Cloud and process it"""
        print("uploading")
        url = "http://35.208.120.220/upload2"
        file = {'file': open("/home/pi/Documents/riot_flask/test.jpg", "rb")}
        print(url + " " + str(file))
        r = requests.post(url, auth=HTTPBasicAuth('riot', 'passw0rd1'), files=file)
        print("file uploaded")
        return r.text

    def unlock(self):
        """disengage magnet, wait for 2 seconds and engage the magnet to lock"""
        self.lock.off()
        sleep(2)
        self.lock.on()
        self.take_pic = True

    def run(self):
        self.main_app()
        pass


def take_picture():
    """take picture and save it to a file named test.jpg"""

    command = "raspistill -rot 180 -o ~/Documents/riot_flask/test.jpg"
    os.system(command)
    print("picture taken")


@app.route('/')
def hello_world():
    template_data = {
        'title': 'Hello, world!',
    }
    return render_template('index.html', **template_data)


@app.route('/peek', methods=['POST'])
def peek():
    take_picture()


@socketio.on('connect', namespace='/test')
def test_connect():
    # need visibility of the global thread object
    global thread
    print('Client connected')

    # Start the thread only if the thread has not been started before
    if not thread.isAlive():
        print("Starting Thread")
        thread = Temperature()
        thread.start()


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, 'localhost')
