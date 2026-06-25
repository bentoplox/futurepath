import sys
from flask import Flask
from flask_cors import CORS

# Import Blueprints
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.ai_routes import ai_bp
from routes.alumni_routes import alumni_bp
from routes.quality_routes import quality_bp
from routes.quiz_routes import quiz_bp
from routes.workshop_routes import workshop_bp
from routes.discussion_routes import discussion_bp 

# 🔥 WINDOWS CRASH FIX
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(student_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(alumni_bp)
app.register_blueprint(quality_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(workshop_bp)
app.register_blueprint(discussion_bp) 

import os

if __name__ == '__main__':
    print("🚀 FuturePath Modular Backend Starting...")
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)