from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/devices/<ip>')
def get_ipaddress(ip):
    return jsonify({
        "ip": ip 
    })

if __name__ == '__main__':
    app.run(debug=True)