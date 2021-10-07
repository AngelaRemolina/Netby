import sniffer
import json
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/sniff', methods=['GET', 'POST'])
def sniff():
    #sniffer.main()
    if request.method == 'POST':
        result = "sniff test"
        return json.dumps(result)
    elif request.method == 'GET':
        # todo 
        return None


if __name__ == "__main__":
    app.run()

