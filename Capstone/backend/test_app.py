import pytest
from app import app, db, User, GymClass, Attendance
from flask_jwt_extended import decode_token

@pytest.fixture(scope='module')
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as testing_client:
        with app.app_context():
            db.create_all()
            yield testing_client
            db.drop_all()

def register_user(client, name, email, password, role='member'):
    return client.post('/register', json={
        'name': name,
        'email': email,
        'password': password,
        'role': role
    })

def login_user(client, email, password):
    response = client.post('/login', json={'email': email, 'password': password})
    if response.status_code == 200:
        return response.get_json()['token']
    return None

def test_registration_and_login(test_client):
    # Register admin and member
    res_admin = register_user(test_client, 'Admin', 'admin@test.com', 'adminpass', 'admin')
    res_member = register_user(test_client, 'Member', 'user@test.com', 'userpass')

    assert res_admin.status_code == 201
    assert res_member.status_code == 201

    # Test login works for both
    token_admin = login_user(test_client, 'admin@test.com', 'adminpass')
    token_member = login_user(test_client, 'user@test.com', 'userpass')

    assert token_admin is not None
    assert token_member is not None

def test_admin_creates_class(test_client):
    token = login_user(test_client, 'admin@test.com', 'adminpass')
    headers = {'Authorization': f'Bearer {token}'}

    res = test_client.post('/classes', json={
        'name': 'Yoga',
        'capacity': 10,
        'schedule': 'Mondays at 6PM'
    }, headers=headers)

    assert res.status_code == 201
    data = res.get_json()
    assert data['name'] == 'Yoga'

def test_member_cannot_create_class(test_client):
    token = login_user(test_client, 'user@test.com', 'userpass')
    headers = {'Authorization': f'Bearer {token}'}

    res = test_client.post('/classes', json={
        'name': 'Zumba',
        'capacity': 15,
        'schedule': 'Wednesdays at 7PM'
    }, headers=headers)

    assert res.status_code == 403
    assert res.get_json()['message'] == 'Access denied'

def test_get_classes_and_enroll(test_client):
    # Login as admin to create a class
    token_admin = login_user(test_client, 'admin@test.com', 'adminpass')
    headers_admin = {'Authorization': f'Bearer {token_admin}'}

    # Create the class
    res_create = test_client.post('/classes', json={
        'name': 'Yoga',
        'capacity': 10,
        'schedule': 'Mondays at 6PM'
    }, headers=headers_admin)
    assert res_create.status_code == 201
    class_id = res_create.get_json()['id']

    # Login as member
    token = login_user(test_client, 'user@test.com', 'userpass')
    headers = {'Authorization': f'Bearer {token}'}

    # Enroll in the class
    enroll_res = test_client.post(f'/classes/{class_id}/enroll', headers=headers)
    assert enroll_res.status_code == 200
    assert enroll_res.get_json()['name'] == 'Yoga'

def test_enroll_twice_fails(test_client):
    token = login_user(test_client, 'user@test.com', 'userpass')
    headers = {'Authorization': f'Bearer {token}'}

    # Get class ID
    res = test_client.get('/classes', headers=headers)
    class_id = res.get_json()[0]['id']

    # First enrollment
    first_res = test_client.post(f'/classes/{class_id}/enroll', headers=headers)
    assert first_res.status_code == 200  # First time should succeed

    # Second enrollment attempt
    second_res = test_client.post(f'/classes/{class_id}/enroll', headers=headers)
    assert second_res.status_code == 400  # Now it should fail
    assert "already enrolled" in second_res.get_json()['message'].lower()

def test_get_profile(test_client):
    token = login_user(test_client, 'user@test.com', 'userpass')
    headers = {'Authorization': f'Bearer {token}'}

    res = test_client.get('/profile', headers=headers)
    assert res.status_code == 200
    profile = res.get_json()
    assert profile['email'] == 'user@test.com'
    assert len(profile['enrolled_classes']) >= 1

def test_unenroll_from_class(test_client):
    token = login_user(test_client, 'user@test.com', 'userpass')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Get class ID
    classes = test_client.get('/classes', headers=headers).get_json()
    class_id = classes[0]['id']

    res = test_client.post(f'/classes/{class_id}/unenroll', headers=headers)
    assert res.status_code == 200
    assert res.get_json()['id'] == class_id

def test_delete_class_by_admin(test_client):
    token = login_user(test_client, 'admin@test.com', 'adminpass')
    headers = {'Authorization': f'Bearer {token}'}

    # Create another class
    res = test_client.post('/classes', json={
        'name': 'Pilates',
        'capacity': 5,
        'schedule': 'Fridays at 8AM'
    }, headers=headers)
    class_id = res.get_json()['id']

    # Now delete it
    delete_res = test_client.delete(f'/classes/{class_id}', headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.get_json()['message'] == 'Class deleted'
