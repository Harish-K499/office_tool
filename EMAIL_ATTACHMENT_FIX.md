# Email Attachment Fix ✅

## Issue
The `send_email` function in `mail_app.py` didn't support attachments, causing the policy letter email to fail.

## Error
```
[DOJ Policy] Error: Error: Failed to send email
```

## Root Cause
The `send_email` function signature was:
```python
def send_email(subject, recipients, body, html=None, cc=None):
```

It didn't have an `attachments` parameter, so when the policy letter endpoint tried to send:
```python
send_email(
    subject=subject,
    recipients=[recipient],
    body=body,
    html=html,
    attachments=[("VTab_Onboarding_Package.pdf", merged_pdf_bytes.getvalue())]
)
```

The function call failed because it received an unexpected `attachments` argument.

## Solution

Updated `mail_app.py` to support attachments:

```python
def send_email(subject, recipients, body, html=None, cc=None, attachments=None):
    """
    Simple wrapper for sending email.
    
    Args:
        subject: Email subject
        recipients: List of recipient email addresses
        body: Plain text body
        html: HTML body (optional)
        cc: List of CC email addresses (optional)
        attachments: List of tuples (filename, file_data) for attachments (optional)
    """
    try:
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
```

## Changes Made

1. **Added `attachments` parameter** (default: `None`)
2. **Attachment handling logic**:
   - Checks if attachments provided
   - Loops through each attachment tuple (filename, file_data)
   - Attaches to message with PDF content type
   - Logs attachment name
3. **Enhanced error logging** with `traceback.print_exc()`

## Attachment Format

Attachments should be a list of tuples:
```python
attachments = [
    ("filename.pdf", pdf_bytes),
    ("another_file.pdf", another_pdf_bytes)
]
```

## Testing

After restarting the server, test the flow:

1. Navigate to Stage 4 in onboarding
2. Verify documents (set status to "Verified")
3. Select Date of Joining
4. Click "Send Policy Letter"
5. Check console logs:
   ```
   [POLICY LETTER] Generating personalized PDF...
   [POLICY LETTER] PDF generated successfully
   [POLICY LETTER] Sending email with PDF attachment...
   📎 Attached: VTab_Onboarding_Package.pdf
   📧 Email sent -> [candidate@email.com]
   [POLICY LETTER] Email sent successfully
   ```
6. Check candidate's email for PDF attachment

## Status
✅ **Fixed** - Email function now supports PDF attachments
