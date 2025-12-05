from flask import Flask, jsonify, request, session, current_app
from flask_mail import Mail, Message
import os
import traceback
import requests as http_requests  # renamed to avoid conflict
from dotenv import load_dotenv

# Load env for local dev
if os.path.exists("id.env"):
    load_dotenv("id.env")
load_dotenv()

# Standalone app for backward compatibility
app = Flask(__name__)
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
# ✉️ Email Send via Resend API
# ------------------------------
def send_email_resend(subject, recipients, body, html=None):
    """
    Send email using Resend API (HTTP-based, works on Render free tier).
    Requires RESEND_API_KEY env var.
    """
    api_key = os.getenv('RESEND_API_KEY')
    from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
    
    if not api_key:
        print("[MAIL-RESEND] No RESEND_API_KEY configured", flush=True)
        return False
    
    print(f"[MAIL-RESEND] Sending to {recipients} from {from_email}", flush=True)
    
    # Prepare recipients list
    to_list = recipients if isinstance(recipients, list) else [recipients]
    
    payload = {
        "from": from_email,
        "to": to_list,
        "subject": subject,
        "text": body,
    }
    if html:
        payload["html"] = html
    
    try:
        response = http_requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"[MAIL-RESEND] Email sent successfully: {response.json()}", flush=True)
            return True
        else:
            print(f"[MAIL-RESEND] Failed: {response.status_code} - {response.text}", flush=True)
            return False
    except Exception as e:
        print(f"[MAIL-RESEND] Error: {e}", flush=True)
        traceback.print_exc()
        return False


def send_email(subject, recipients, body, html=None, cc=None, attachments=None):
    """
    Send email - uses Resend API (HTTP) since Render blocks SMTP.
    Falls back to Flask-Mail for local dev or attachments.
    """
    print(f"[MAIL] send_email called: to={recipients}, subject={subject}", flush=True)
    
    # Try Resend API first (works on Render)
    if os.getenv('RESEND_API_KEY') and not attachments:
        return send_email_resend(subject, recipients, body, html)
    
    # Fall back to Flask-Mail (for local dev or attachments)
    print("[MAIL] Using Flask-Mail fallback", flush=True)
    try:
        flask_app = current_app._get_current_object()
        mail_instance = flask_app.extensions.get('mail')
        if not mail_instance:
            flask_app = app
            mail_instance = mail
    except RuntimeError:
        flask_app = app
        mail_instance = mail

    try:
        with flask_app.app_context():
            msg = Message(subject=subject, recipients=recipients, cc=cc, body=body, html=html)
            if attachments:
                for filename, file_data in attachments:
                    msg.attach(filename=filename, content_type='application/pdf', data=file_data)
                    print(f"[MAIL] Attached: {filename}", flush=True)
            mail_instance.send(msg)
            print(f"[MAIL] Email sent successfully -> {recipients}", flush=True)
            return True
    except Exception as e:
        print(f"[MAIL] Failed to send email to {recipients}: {e}", flush=True)
        traceback.print_exc()
        return False
    
    
