#!/usr/bin/python

import atexit
import signal
import json
import os
import RPi.GPIO as GPIO
import time
import random

# Variables
steps = 1500
staging = 100
delay = 0
previous = 0.01
microsteps = 1
current = 0
offset = 0
speed = 0
death = 0
speed_1 = 33.3
speed_2 = 45
time_1 = 22
time_2 = 15
status = False

# Define controller URLs
commandfile = "/var/www/html/commands/command.json"
logfile = "/var/www/html/commands/log.json"

# Activate GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(True)

# Enable GPIO pins for  ENA and ENB for stepper
enable_a = 21
enable_b = 13

# Enable pins for IN1-4 to control step sequence
a1 = 20
a2 = 16
b1 = 26
b2 = 19

# Listen pins for button switch
toggle_speed_1 = 17
toggle_speed_2 = 27

# Set pin states
GPIO.setup(enable_a, GPIO.OUT)
GPIO.setup(enable_b, GPIO.OUT)
GPIO.setup(a1, GPIO.OUT)
GPIO.setup(a2, GPIO.OUT)
GPIO.setup(b1, GPIO.OUT)
GPIO.setup(b2, GPIO.OUT)
GPIO.setup(toggle_speed_1, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(toggle_speed_2, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Function for step sequence
def adjust(pin, state, delay, step):
    calc = int(microsteps*step)
    if calc<2:
        GPIO.output(pin, state)
        time.sleep(delay)
    else:
        microdelay = float(delay)/float(calc)
        for a in range(0, calc):
            percentage = float(a)/float(calc)

            GPIO.output(pin, not state)
            time.sleep(float(microdelay)*(1-percentage))

            GPIO.output(pin, state)
            time.sleep(float(microdelay)*(percentage))


# Handle abortions safely
def abort():
    GPIO.output(enable_a, False)
    GPIO.output(enable_b, False)

atexit.register(abort)
signal.signal(signal.SIGTSTP, abort)

# loop through step sequence based on number of steps
while True:
    io_timer = time.clock()
    death_timer = time.time()

    # Check toggle state
    if GPIO.input(toggle_speed_1) and GPIO.input(toggle_speed_2):
        status = False
        death = 0
        previous = 0.01
        offset = 0
        speed = 0
        delay = 0

    elif GPIO.input(toggle_speed_1) or GPIO.input(toggle_speed_2):
        if GPIO.input(toggle_speed_1):
            if speed != speed_1:
                speed = speed_1
                death = (time_1*60)+death_timer
        else:
            if speed != speed_2:
                speed = speed_2
                death = (time_2*60)+death_timer

        # If we're still allowed to run
        if death_timer < death:
            # Define current time, and activate runner
            current = 1/float((30.0/7.0)*200*2/60.0*float(speed))
            status = True

            # Do we have a sample time?
            if offset:
                error = offset/float(steps)/4.0
                if current<error:
                    current = 0.00010
                else:
                    current -= error

        # Otherwise, let's deactivate motor
        else:
            status = False

    # Otherwise, let's load the last valued one
    else:
        status = False
        death = 0
        previous = 0.01
        offset = 0
        speed = 0
        delay = 0

    # If we've got green light, run
    if(status):
        print "Active"
        GPIO.output(enable_a, True)
        GPIO.output(enable_b, True)

        # Go through motor in X steps
        for i in range(0, steps):
            if delay != current:
                if i<staging:
                    delay = current
                    delay -= ((current-previous)/(staging))*(staging-i)
                else:
                    delay = current

            # Move to step
            adjust(b1, False, delay, 1)
            adjust(b2, True, delay, 1)

            adjust(a1, False, delay, 1)
            adjust(a2, True, delay, 1)

            adjust(b2, False, delay, 1)
            adjust(b1, True, delay, 1)

            adjust(a2, False, delay, 1)
            adjust(a1, True, delay, 1)

        log = {"running": True}

        offset = time.clock()-io_timer
        previous = current

    else:
        GPIO.output(enable_a, False)
        GPIO.output(enable_b, False)

        time.sleep(1)

    # Write log-file
    #try:
        #holder = open(logfile, "w")
        #json.dump(log, holder)
        #holder.close()

    #except OSError:
    #    print "log file deleted to soon"