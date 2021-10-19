# app.py
from flask import Flask, jsonify, request, render_template
from flask.wrappers import Request
app = Flask(__name__)

from sniffer import main
global json_capture
json_capture = []

@app.route('/generate', methods=['GET', 'POST'])
def generate():
    if request.method == 'GET':
        json_capture = main(15)  # capture during 30 seconds
        print("Json generated!")
        return jsonify(json_capture)
        # return 'OK', 200

@app.route('/return_capture', methods=['GET', 'POST'])
def return_capture():
    
    if request.method == 'GET':
        import json
        f = open('capture.json')
        json_capture = json.load(f)
        print("Python sent the capture")
        return jsonify(json_capture)  # serialize and use JSON headers
