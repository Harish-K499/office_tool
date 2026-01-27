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
# ✉️ Email Send via Gmail API
# ------------------------------
def send_email_gmail_api(subject, recipients, body, html=None, attachments=None):
    """
    Send email using Gmail API (supports attachments).
    Requires GMAIL_API_CREDENTIALS (service account JSON) env var.
    """
    import base64
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email import encoders
    
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        print("[MAIL-GMAIL] google-auth and google-api-python-client not installed", flush=True)
        return False
    
    credentials_json = os.getenv('GMAIL_API_CREDENTIALS')
    sender_email = os.getenv('GMAIL_SENDER_EMAIL', os.getenv('MAIL_USERNAME', 'noreply@example.com'))
    
    if not credentials_json:
        print("[MAIL-GMAIL] No GMAIL_API_CREDENTIALS configured", flush=True)
        return False
    
    print(f"[MAIL-GMAIL] Sending to {recipients} from {sender_email}", flush=True)
    
    try:
        # Parse credentials
        import json
        creds_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/gmail.send']
        )
        
        # Delegate to the sender email if using service account
        if 'client_email' in creds_dict:
            credentials = credentials.with_subject(sender_email)
        
        service = build('gmail', 'v1', credentials=credentials)
        
        # Create message
        if attachments:
            message = MIMEMultipart()
        else:
            message = MIMEText(body)
            message['subject'] = subject
            message['from'] = sender_email
            message['to'] = ', '.join(recipients) if isinstance(recipients, list) else recipients
            
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {'raw': raw}
            
            result = service.users().messages().send(userId='me', body=send_message).execute()
            print(f"[MAIL-GMAIL] Email sent successfully: {result.get('id')}", flush=True)
            return True
        
        # With attachments
        message['subject'] = subject
        message['from'] = sender_email
        message['to'] = ', '.join(recipients) if isinstance(recipients, list) else recipients
        
        # Add body
        if html:
            message.attach(MIMEText(html, 'html'))
        message.attach(MIMEText(body, 'plain'))
        
        # Add attachments
        for filename, file_data in attachments:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(file_data)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={filename}')
            message.attach(part)
            print(f"[MAIL-GMAIL] Attached: {filename}", flush=True)
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_message = {'raw': raw}
        
        result = service.users().messages().send(userId='me', body=send_message).execute()
        print(f"[MAIL-GMAIL] Email sent successfully with attachments: {result.get('id')}", flush=True)
        return True
        
    except Exception as e:
        print(f"[MAIL-GMAIL] Error: {e}", flush=True)
        traceback.print_exc()
        return False


# ------------------------------
# ✉️ Email Send via Brevo API (formerly Sendinblue)
# ------------------------------
def send_email_brevo(subject, recipients, body, html=None):
    """
    Send email using Brevo API (HTTP-based, works on Render free tier).
    Free tier: 300 emails/day, no domain verification required.
    Requires BREVO_API_KEY env var.
    """
    api_key = os.getenv('BREVO_API_KEY')
    from_email = os.getenv('BREVO_FROM_EMAIL', os.getenv('MAIL_USERNAME', 'noreply@example.com'))
    from_name = os.getenv('BREVO_FROM_NAME', 'VTab Office Tool')
    
    if not api_key:
        print("[MAIL-BREVO] No BREVO_API_KEY configured", flush=True)
        return False
    
    print(f"[MAIL-BREVO] Sending to {recipients} from {from_email}", flush=True)
    
    # Prepare recipients list
    to_list = recipients if isinstance(recipients, list) else [recipients]
    to_formatted = [{"email": email} for email in to_list]
    
    payload = {
        "sender": {"name": from_name, "email": from_email},
        "to": to_formatted,
        "subject": subject,
        "textContent": body,
        "headers": {
            "X-Mailin-custom": "disable-tracking"
        },
        "params": {
            "DISABLE_TRACKING": True
        }
    }
    # Disable click tracking to avoid broken redirect links
    payload["trackClicks"] = False
    payload["trackOpens"] = False
    
    if html:
        payload["htmlContent"] = html
    
    try:
        response = http_requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json=payload,
            timeout=15
        )
        
        if response.status_code in [200, 201]:
            print(f"[MAIL-BREVO] Email sent successfully: {response.json()}", flush=True)
            return True
        else:
            print(f"[MAIL-BREVO] Failed: {response.status_code} - {response.text}", flush=True)
            return False
    except Exception as e:
        print(f"[MAIL-BREVO] Error: {e}", flush=True)
        traceback.print_exc()
        return False


# ------------------------------
# ✉️ Email Send via Resend API (backup)
# ------------------------------
def send_email_resend(subject, recipients, body, html=None):
    """
    Send email using Resend API (HTTP-based).
    Note: Free tier only allows sending to your own email without domain verification.
    """
    api_key = os.getenv('RESEND_API_KEY')
    from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
    
    if not api_key:
        print("[MAIL-RESEND] No RESEND_API_KEY configured", flush=True)
        return False
    
    print(f"[MAIL-RESEND] Sending to {recipients} from {from_email}", flush=True)
    
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
    Send email - tries multiple providers in order:
    1. Gmail API (supports attachments, works on Render)
    2. Brevo API (300 free emails/day, no domain verification)
    3. Resend API (requires domain verification for non-self emails)
    4. Flask-Mail SMTP (for local dev fallback)
    """
    print(f"[MAIL] send_email called: to={recipients}, subject={subject}, attachments={len(attachments) if attachments else 0}", flush=True)
    
    # Try Gmail API first (works with attachments)
    if os.getenv('GMAIL_API_CREDENTIALS'):
        result = send_email_gmail_api(subject, recipients, body, html, attachments)
        if result:
            return True
        print("[MAIL] Gmail API failed, trying next provider...", flush=True)
    
    # For simple emails without attachments, try HTTP-based APIs
    if not attachments:
        # Try Brevo (most permissive free tier)
        if os.getenv('BREVO_API_KEY'):
            result = send_email_brevo(subject, recipients, body, html)
            if result:
                return True
            print("[MAIL] Brevo failed, trying next provider...", flush=True)
        
        # Try Resend as backup
        if os.getenv('RESEND_API_KEY'):
            result = send_email_resend(subject, recipients, body, html)
            if result:
                return True
            print("[MAIL] Resend failed, trying Flask-Mail...", flush=True)
    
    # Fall back to Flask-Mail (for local dev, attachments, or if APIs fail)
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
        print(f"[MAIL] Flask-Mail failed: {e}", flush=True)
        traceback.print_exc()
        return False
    
    
