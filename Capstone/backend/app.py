from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import datetime

# Initialize app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gym.db'
app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Change this in production

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(10), default='member')  # 'admin' or 'member'

class GymClass(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    schedule = db.Column(db.String(100), nullable=False)
    attendees = db.relationship('Attendance', backref='class_ref', lazy=True, cascade="all, delete-orphan")

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('gym_class.id'), nullable=False)
    status = db.Column(db.String(10), default='present')  # 'present' or 'absent'
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    print("Received data:", data)
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password, role=data.get('role', 'member'))
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print("Email received:", data['email'])  # ✅ This line was the issue
    user = User.query.filter_by(email=data['email']).first()
    print("User:", user)

    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = create_access_token(identity={
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        })
        return jsonify({'token': token, 'role': user.role})

    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/classes', methods=['GET'])
@jwt_required()
def get_classes():
    user = get_jwt_identity()
    user_id = user['id']

    # Get all classes
    classes = GymClass.query.all()
    # Get the classes the user is enrolled in
    enrolled_classes = {att.class_id for att in Attendance.query.filter_by(user_id=user_id).all()}

    # Construct and return the classes data with the enrolled count
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'capacity': c.capacity,
            'schedule': c.schedule,
            'enrolled': c.id in enrolled_classes,
            'enrolled_count': Attendance.query.filter_by(class_id=c.id).count()  # Get the actual enrolled count
        } for c in classes
    ])



@app.route('/classes', methods=['POST'])
@jwt_required()
def create_class():
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403

    data = request.json
    new_class = GymClass(
        name=data['name'],
        capacity=data['capacity'],
        schedule=data['schedule']
    )

    db.session.add(new_class)
    db.session.commit()

    # Return the newly created class with its ID
    return jsonify({
        "id": new_class.id,
        "name": new_class.name,
        "capacity": new_class.capacity,
        "schedule": new_class.schedule
    }), 201

@app.route("/classes/<int:class_id>/enroll", methods=["POST"])
@jwt_required()
def enroll_in_class(class_id):
    current_user = get_jwt_identity()
    user_id = current_user['id'] if isinstance(current_user, dict) else current_user

    # Check if user is already enrolled
    existing_attendance = Attendance.query.filter_by(user_id=user_id, class_id=class_id).first()
    if existing_attendance:
        return jsonify({"message": "You are already enrolled in this class."}), 400

    gym_class = GymClass.query.get(class_id)
    if not gym_class:
        return jsonify({"message": "Class not found."}), 404

    # Log the capacity before enrolling
    print(f"Before enrollment - Class {class_id} capacity: {gym_class.capacity}")

    # Count how many users are enrolled
    enrolled_count = Attendance.query.filter_by(class_id=class_id).count()
    print(f"Enrolled count: {enrolled_count}")

    # Check if there is space available
    if enrolled_count >= gym_class.capacity:
        print(f"Class {class_id} is full with capacity {gym_class.capacity} and enrolled count {enrolled_count}.")
        return jsonify({"message": "Class is full."}), 400

    # Enroll the user without changing class capacity
    new_attendance = Attendance(user_id=user_id, class_id=class_id, status='present')
    db.session.add(new_attendance)
    db.session.commit()

    # Log the updated capacity (capacity remains unchanged)
    print(f"Class {class_id} capacity: {gym_class.capacity} (Unchanged)")

    # Return updated class data (without modifying capacity)
    return jsonify({
        "id": gym_class.id,
        "name": gym_class.name,
        "capacity": gym_class.capacity,  # This stays fixed
        "schedule": gym_class.schedule
    }), 200

@app.route("/classes/<int:class_id>/unenroll", methods=["POST"])
@jwt_required()
def unenroll_from_class(class_id):
    current_user = get_jwt_identity()
    user_id = current_user['id'] if isinstance(current_user, dict) else current_user

    attendance = Attendance.query.filter_by(user_id=user_id, class_id=class_id).first()
    if not attendance:
        return jsonify({"message": "You are not enrolled in this class."}), 400

    db.session.delete(attendance)
    db.session.commit()

    # Return updated class data (capacity remains unchanged)
    gym_class = GymClass.query.get(class_id)
    return jsonify({
        "id": gym_class.id,
        "name": gym_class.name,
        "capacity": gym_class.capacity,  # This stays fixed
        "schedule": gym_class.schedule
    }), 200


@app.route('/classes/<int:class_id>', methods=['DELETE'])
@jwt_required()
def delete_class(class_id):
    print(f"Attempting to delete class with ID: {class_id}") 
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403

    gym_class = GymClass.query.get(class_id)
    if not gym_class:
        return jsonify({'message': 'Class not found'}), 404

    db.session.delete(gym_class)
    db.session.commit()

    return jsonify({'message': 'Class deleted'}), 200

@app.route('/classes/<int:class_id>', methods=['PUT'])
@jwt_required()
def update_class(class_id):
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403

    data = request.json
    gym_class = GymClass.query.get(class_id)
    if not gym_class:
        return jsonify({'message': 'Class not found'}), 404

    # Update class details
    gym_class.name = data.get('name', gym_class.name)
    gym_class.capacity = data.get('capacity', gym_class.capacity)
    gym_class.schedule = data.get('schedule', gym_class.schedule)

    db.session.commit()

    # Return updated class data
    return jsonify({
        "id": gym_class.id,
        "name": gym_class.name,
        "capacity": gym_class.capacity,
        "schedule": gym_class.schedule
    }), 200

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_jwt_identity()
    print("User data:", user)
    user_id = user['id'] if isinstance(user, dict) else user

    # Get the user's enrolled classes and their attendance
    enrollments = Attendance.query.filter_by(user_id=user_id).all()

    enrolled_classes = []
    for enrollment in enrollments:
        gym_class = GymClass.query.get(enrollment.class_id)
        enrolled_classes.append({
            'class_id': gym_class.id,
            'class_name': gym_class.name,
            'schedule': gym_class.schedule,
            'status': enrollment.status,
            'timestamp': enrollment.timestamp
        })

    return jsonify({
        'user_id': user_id,
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'enrolled_classes': enrolled_classes
    })

@app.route('/cancel-membership', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def cancel_membership():
    if request.method == 'OPTIONS':
        return jsonify({'ok': True}), 200

    user = get_jwt_identity()
    user_id = user['id'] if isinstance(user, dict) else user

    # Get the user record
    user_record = User.query.get(user_id)
    if not user_record:
        return jsonify({'error': 'User not found'}), 404

    # Delete all attendance records (removes class enrollments)
    Attendance.query.filter_by(user_id=user_id).delete()

    # Delete the user
    db.session.delete(user_record)
    db.session.commit()

    return jsonify({'message': 'Membership cancelled and user deleted'}), 200


@app.route('/attendance', methods=['GET'])
@jwt_required()
def get_attendance():
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    records = Attendance.query.all()
    return jsonify([{'id': a.id, 'user_id': a.user_id, 'class_id': a.class_id, 'status': a.status} for a in records])

@app.route('/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    data = request.json
    user = get_jwt_identity()
    attendance = Attendance(user_id=user['id'], class_id=data['class_id'], status=data['status'])
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance recorded'})

@app.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_identity = get_jwt_identity()

    if isinstance(user_identity, dict):
        user_id = user_identity.get("id") 
    else:
        user_id = user_identity 

    user = User.query.get(user_id) 

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role})


def create_default_admin():
     admin_exists = User.query.filter_by(role='admin').first()
     if not admin_exists:
         hashed_password = bcrypt.generate_password_hash("adminpassword").decode('utf-8')
         admin_user = User(name="Admin", email="admin@example.com", password=hashed_password, role="admin")
         db.session.add(admin_user)
         db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This ensures the database tables are created
        create_default_admin()  # Ensure the admin is created if it doesn't exist
    app.run(debug=True)
