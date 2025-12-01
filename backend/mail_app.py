from flask import Flask, jsonify, request , session
from flask_mail import Mail, Message
import os
import traceback
from dotenv import load_dotenv
load_dotenv("id.env")  # 👈 this makes .env variables available via os.getenv


app = Flask(__name__)

# ------------------------------
# ✉️ Email Configuration
# ------------------------------
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])
mail = Mail(app)
print("DEBUG: MAIL_USERNAME =", os.getenv("MAIL_USERNAME"))
print("DEBUG: MAIL_DEFAULT_SENDER =", os.getenv("MAIL_DEFAULT_SENDER"))




# ------------------------------
# ✉️ Email Send Function
# ------------------------------
def send_email(subject, recipients, body, html=None, cc=None, attachments=None):
    """Simple wrapper for sending email via the configured Flask-Mail app."""
    try:
        with app.app_context():
            msg = Message(subject=subject, recipients=recipients, cc=cc, body=body, html=html)

            # Add attachments if provided
            if attachments:
                for filename, file_data in attachments:
                    msg.attach(
                        filename=filename,
                        content_type='application/pdf',
                        data=file_data
                    )
                    print(f"📎 Attached: {filename}")

            mail.send(msg)
            print(f"📧 Email sent -> {recipients}")
            return True
    except Exception as e:
        print(f"⚠️ Failed to send email to {recipients}: {e}")
        traceback.print_exc()
        return False
    
    
