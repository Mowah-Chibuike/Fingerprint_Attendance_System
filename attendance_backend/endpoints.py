from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from flask_restful import Resource, Api, reqparse, abort, marshal_with, fields
from . import db
from .models import Device, Attendee
import requests
import base64

endpoints = Blueprint('endpoints', __name__)
api = Api(endpoints)

device_put_args = reqparse.RequestParser()
device_put_args.add_argument('id', type=str, help='ID is required', required=True)
device_put_args.add_argument('ip', type=str, help='IP address is required', required=True)

device_fields = {
    "device_id": fields.String,
    "ip_address": fields.String
}

enroll_fields = {
    "matric_no": fields.String
}

attendee_fields = {
    "matric_no": fields.String,
    "fingerprint": fields.String
}

enroll_post_args = reqparse.RequestParser()
enroll_post_args.add_argument('first_name', type=str, required=False, default="")
enroll_post_args.add_argument('last_name', type=str, required=False, default="")
enroll_post_args.add_argument('matric_no', type=str, required=True)
enroll_post_args.add_argument('department', type=str, required=True)
enroll_post_args.add_argument('fingerprint', type=str, help='', required=True)


class Devices(Resource):
    @marshal_with(device_fields)
    def get(self):
        devices = Device.query.all()
        return devices, 200
    
    # @marshal_with(device_fields)
    # def post(self):
    #     args = device_put_args.parse_args(strict=True)
    #     device = Device.query.filter_by(device_id=args["id"]).first()

    #     if device:
    #         abort(409, message='Device already exists')
    #     else:
    #         new_device = Device(device_id=args["id"], ip_address=args["ip"])
    #         db.session.add(new_device)
    #         db.session.commit()

    #     return new_device, 201
    
    @marshal_with(device_fields)
    def put(self):
        args = device_put_args.parse_args(strict=True)
        device = Device.query.filter_by(device_id=args["id"]).first()

        if device:
            device.ip_address = args["ip"]
            db.session.commit()
        else:
            abort(404, message="Device doesn't exist, cannot update.")
        
        return device, 200
    

class Enroll(Resource):
    @marshal_with(enroll_fields)
    def post(self):
        args = enroll_post_args.parse_args(strict=True)
        attendee = Attendee.query.filter_by(matric_no=args["matric_no"]).first()

        if attendee:
            abort(409, message='Matric no already exists')
        else:
            new_attendee = Attendee(
                first_name=args["first_name"],
                last_name=args["last_name"],
                matric_no=args["matric_no"],
                department=args["department"],
                fingerprint=args["fingerprint"]
            )
            db.session.add(new_attendee)
            db.session.commit()

        return new_attendee, 201
    

class ConnectDevice(Resource):
    @login_required
    def get(self, device_id):
        device = Device.query.filter_by(device_id=device_id).first()

        print(device)
        if not device:
            abort(404, message='Device does not exist')
        else:
            try:
                res = requests.get(f"http://{device.ip_address}:80/connect")
                res.raise_for_status()
                current_user.device_id = device.id
                db.session.commit()
                return res.json()
            except requests.exceptions.RequestException as err:
                current_user.device_id = None
                db.session.commit()
                return {'error': str(err)}, 500
            

class FingerPrint(Resource):
    @login_required
    def get(self):
        try:
            print(current_user.device)
            if not current_user.device:
                return {'error': 'Connect to a device'}, 404
            res = requests.get(f"http://{current_user.device.ip_address}:80/fingerprint")
            res.raise_for_status()
            return res.json()
        except requests.exceptions.RequestException as err:
            print("Raised!!")
            return {'error': 'Couldn\' get fingerprint features. Try again!!'}, 502


class Verify(Resource):
    @marshal_with(attendee_fields)
    def get(self):
        attendees = Attendee.query.all()
        # attendee_list = [a.to_dict() for a in attendees]
        # print(attendee_list)
        return attendees, 200

api.add_resource(Devices, '/devices')
api.add_resource(ConnectDevice, '/devices/<device_id>')
api.add_resource(Enroll, '/enroll')
api.add_resource(FingerPrint, '/fingerprint')
api.add_resource(Verify, '/verify')