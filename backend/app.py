import sys
from flask import Flask
from flask_cors import CORS

# Import Blueprints
from routes.student_routes import student_bp
from routes.admin_routes import admin_bp
from routes.ai_routes import ai_bp
from routes.alumni_routes import alumni_bp

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

if __name__ == '__main__':
    print("🚀 FuturePath Modular Backend Starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)
