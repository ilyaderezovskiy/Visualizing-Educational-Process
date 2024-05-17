from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from os import environ
from flask_cors import CORS 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DB_URL')
db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), unique=False, nullable=False)

    def json(self):
        return {'id': self.id,'username': self.username, 'password': self.password}

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, unique=False, nullable=False)
    name = db.Column(db.String(80), unique=False, nullable=False)
    description = db.Column(db.String(120), unique=False, nullable=False)
    date = db.Column(db.String(80), unique=False, nullable=False)
    eventlogs = db.Column(db.String(120), unique=False, nullable=False)
    notes = db.Column(db.String(120), unique=False, nullable=False)

    def json(self):
        return {'id': self.id, 'userId': self.userId, 'name': self.name, 'description': self.description, 'date': self.date,
        'eventlogs': self.eventlogs, 'notes': self.notes}
    
class Eventlog(db.Model):
    __tablename__ = 'eventlogs'

    id = db.Column(db.Integer, primary_key=True)
    projectId = db.Column(db.Integer, unique=False, nullable=False)
    case_id = db.Column(db.String(80), unique=False, nullable=False)
    activity = db.Column(db.String(120), unique=False, nullable=False)
    timestamp = db.Column(db.String(80), unique=False, nullable=False)
    student = db.Column(db.String(120), unique=False, nullable=False)
    lector = db.Column(db.String(120), unique=False, nullable=False)
    group = db.Column(db.String(120), unique=False, nullable=False)

    def json(self):
        return {'id': self.id, 'projectId': self.projectId, 'case_id': self.case_id, 'activity': self.activity, 'timestamp': self.timestamp,
        'student': self.student, 'lector': self.lector, 'group': self.group}
    
class Subset(db.Model):
    __tablename__ = 'subsets'

    id = db.Column(db.Integer, primary_key=True)
    projectId = db.Column(db.Integer, unique=False, nullable=False)
    eventlogId = db.Column(db.String(80), unique=False, nullable=False)
    filters = db.Column(db.String(120), unique=False, nullable=False)

    def json(self):
        return {'id': self.id, 'projectId': self.projectId, 'eventlogId': self.eventlogId, 'filters': self.filters}
    
db.create_all()

#create a test route
@app.route('/test', methods=['GET'])
def test():
  return make_response(jsonify({'message': 'test route'}), 200)


# create a user
@app.route('/users', methods=['POST'])
def create_user():
  try:
    new_user = User(username=request.form['username'], password=request.form['password'])
    db.session.add(new_user)
    db.session.commit()
    return make_response(jsonify({'id': new_user.id}), 201)
  except:
    return make_response(jsonify({'message': 'error creating user'}), 500)

# get all users
@app.route('/users', methods=['GET'])
def get_users():
  try:
    users = User.query.all()
    return make_response(jsonify([user.json() for user in users]), 200)
  except:
    return make_response(jsonify({'message': 'error getting users'}), 500)

# get a user by id
@app.route('/users/<int:id>', methods=['GET'])
def get_user(id):
  try:
    user = User.query.filter_by(id=id).first()
    if user:
      return make_response(jsonify({'user': user.json()}), 200)
    return make_response(jsonify({'message': 'user not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error getting user'}), 500)

# update a user
@app.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
  try:
    user = User.query.filter_by(id=id).first()
    if user:
      user.username = request.form['username']
      user.password = request.form['password']
      db.session.commit()
      return make_response(jsonify({'message': 'user updated'}), 200)
    return make_response(jsonify({'message': 'user not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error updating user'}), 500)

# delete a user
@app.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
  try:
    user = User.query.filter_by(id=id).first()
    if user:
      db.session.delete(user)
      db.session.commit()
      return make_response(jsonify({'message': 'user deleted'}), 200)
    return make_response(jsonify({'message': 'user not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error deleting user'}), 500)

@app.route('/projects', methods=['POST'])
def create_project():
  try:
    new_project = Project(userId=request.form['userId'], name=request.form['name'], description=request.form['description'],
        date=request.form['date'], eventlogs=request.form['eventlogs'], notes=request.form['notes'])
    db.session.add(new_project)
    db.session.commit()
    return make_response(jsonify({'id': new_project.id}), 201)
  except:
    return make_response(jsonify({'message': 'error creating project'}), 500)

# get projects by userid
@app.route('/projects/<int:id>', methods=['GET'])
def get_project(id):
  try:
    projects = Project.query.filter_by(userId=id)
    if projects:
      return make_response(jsonify([project.json() for project in projects]), 200)
    return make_response(jsonify({'message': 'projects not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error getting projects'}), 500)

# update a project
@app.route('/projects/<int:id>', methods=['PUT'])
def update_project(id):
  try:
    project = Project.query.filter_by(id=id).first()
    if project:
      project.userId = request.form['userId']
      project.name = request.form['name']
      project.description = request.form['description']
      project.date = request.form['date']
      project.eventlogs = request.form['eventlogs']
      project.notes = request.form['notes']

      db.session.commit()
      return make_response(jsonify({'message': 'project updated'}), 200)
    return make_response(jsonify({'message': 'project not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error updating project'}), 500)

# update a project
@app.route('/projects/notes/<int:id>', methods=['PUT'])
def set_project_note(id):
  try:
    project = Project.query.filter_by(id=id).first()
    if project:
      project.notes = request.form['notes']

      db.session.commit()
      return make_response(jsonify({'message': 'project updated'}), 200)
    return make_response(jsonify({'message': 'project not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error updating project'}), 500)

# delete a project
@app.route('/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
  try:
    project = Project.query.filter_by(id=id).first()
    if project:
      db.session.delete(project)
      db.session.commit()
      return make_response(jsonify({'message': 'project deleted'}), 200)
    return make_response(jsonify({'message': 'project not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error deleting project'}), 500)
  
# get eventlog by id
@app.route('/eventlogs/<int:id>', methods=['GET'])
def get_eventlog(id):
  try:
    eventlog = Eventlog.query.filter_by(id=id).first()
    if eventlog:
      return make_response(jsonify({'eventlog': eventlog.json()}), 200)
    return make_response(jsonify({'message': 'eventlog not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error getting eventlog'}), 500)
  
# add new eventlog
@app.route('/eventlogs', methods=['POST'])
def create_eventlog():
  try:
    new_eventlog = Eventlog(projectId=request.form['projectId'], case_id=request.form['case_id'], activity=request.form['activity'],
        timestamp=request.form['timestamp'], student=request.form['student'], lector=request.form['lector'], group=request.form['group'])
    db.session.add(new_eventlog)
    db.session.commit()
    return make_response(jsonify({'id': new_eventlog.id}), 201)
  except:
    return make_response(jsonify({'message': 'error creating eventlog'}), 500)

# delete an eventlog
@app.route('/eventlogs/<int:id>', methods=['DELETE'])
def delete_eventlog(id):
  try:
    eventlog = Eventlog.query.filter_by(id=id).first()
    if eventlog:
      db.session.delete(eventlog)
      db.session.commit()
      return make_response(jsonify({'message': 'eventlog deleted'}), 200)
    return make_response(jsonify({'message': 'eventlog not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error deleting eventlog'}), 500)
  
# get subsets by projectId
@app.route('/subsets/<int:id>', methods=['GET'])
def get_subsets(id):
  try:
    subsets = Subset.query.filter_by(projectId=id)
    if subsets:
      return make_response(jsonify([subset.json() for subset in subsets]), 200)
    return make_response(jsonify({'message': 'subsets not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error getting subsets'}), 500)
  
# add new subset
@app.route('/subsets', methods=['POST'])
def create_subset():
  try:
    new_subset = Subset(projectId=request.form['projectId'], eventlogId=request.form['eventlogId'], filters=request.form['filters'])
    db.session.add(new_subset)
    db.session.commit()
    return make_response(jsonify({'id': new_subset.id}), 201)
  except:
    return make_response(jsonify({'message': 'error creating new_subset'}), 500)

# delete a subset
@app.route('/subsets/<int:id>', methods=['DELETE'])
def delete_subset(id):
  try:
    subset = Subset.query.filter_by(id=id).first()
    if subset:
      db.session.delete(subset)
      db.session.commit()
      return make_response(jsonify({'message': 'subset deleted'}), 200)
    return make_response(jsonify({'message': 'subset not found'}), 404)
  except:
    return make_response(jsonify({'message': 'error deleting subset'}), 500)