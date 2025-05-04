### Capstone Project

**This is an app that allows a User to create/cancel a membership and enroll/unenroll from classes.
It also has an Admin that can create/edit/delete classes, allowoing them to chnage the name, time,
and limit of attendees.**

### To Start Project

**You will need two terminal windows open, 
one for the frontend and one for the backend.**

**The backend will use localhost:5000 and the frontend will use localhost:3000**

1. ### Navigate to the Back-End first:
   cd Capstone/backend

   ### Seed Database:
   python3 seed.py
   
   ### To Start:
   flask run/python3 app.py (could be python app.py)

1. ### Navigate to the Front-End:
   cd Capstone/frontend

   ### To Start:
   (make sure you are using Node version 20 before you start)
   nvm use 20

   **Then:**
   npm start
   
### The app will then start in your browser.

**The seed.py will add an admin and two members, along with three classes**

### Admin-
email: admin@example.com
password: admin123

### Member1-
email: member1@example.com
password: member123

### Member2-
email: member2@example.com
passowrd: member123
