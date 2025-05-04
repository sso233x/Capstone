from app import app, db, User, GymClass
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

with app.app_context():
    db.create_all()
    # Only add the admin if it doesn't already exist
    existing_admin = User.query.filter_by(email="admin@example.com").first()
    
    if not existing_admin:
        hashed_pwd = bcrypt.generate_password_hash("admin123").decode('utf-8')
        user = User(name="Admin", email="admin@example.com", password=hashed_pwd, role="admin")
        db.session.add(user)
        db.session.commit()
        print("Admin user added ✅")
    else:
        print("Admin user already exists. No changes made ✅")

    # Add non-admin users if they don't already exist
    non_admins = [
        {"name": "Member One", "email": "member1@example.com", "password": "member123"},
        {"name": "Member Two", "email": "member2@example.com", "password": "member123"}
    ]

    for member in non_admins:
        existing_user = User.query.filter_by(email=member["email"]).first()
        if not existing_user:
            hashed_pwd = bcrypt.generate_password_hash(member["password"]).decode('utf-8')
            user = User(name=member["name"], email=member["email"], password=hashed_pwd, role="member")
            db.session.add(user)
            db.session.commit()
            print(f"Non-admin user {member['name']} added ✅")
        else:
            print(f"User {member['name']} already exists. No changes made ✅")

    # Add gym classes if not already added
    existing_classes = GymClass.query.all()
    if not existing_classes:
        classes = [
            {"name": "Yoga", "capacity": 5, "schedule": "Mon 9:00 AM"},
            {"name": "Pilates", "capacity": 5, "schedule": "Tue 10:00 AM"},
            {"name": "Spinning", "capacity": 5, "schedule": "Wed 6:00 PM"}
        ]
        for class_data in classes:
            gym_class = GymClass(name=class_data["name"], capacity=class_data["capacity"], schedule=class_data["schedule"])
            db.session.add(gym_class)
            db.session.commit()
            print(f"Gym class {class_data['name']} added ✅")
    else:
        print("Gym classes already exist. No changes made ✅")
