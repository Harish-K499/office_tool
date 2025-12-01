# Email Checking Implementation Guide

## Overview
The onboarding system now includes automatic email reply checking for Stage 3 (Mail Confirmation). The system connects to the configured Gmail inbox via IMAP to check for candidate responses.

## How It Works

### 1. Backend Implementation (`unified_server.py`)
- **Endpoint**: `GET /api/onboarding/<record_id>/check-email`
- **Functionality**:
  - Connects to Gmail inbox using IMAP
  - Searches for emails from the candidate's email address
  - Analyzes the most recent email for acceptance/decline keywords
  - Automatically updates the `mail_reply` field based on detected response

### 2. Email Detection Logic
**Acceptance Keywords** (sets mail_reply to "Yes"):
- "yes"
- "accept"
- "agree"
- "confirm"
- "i accept"

**Decline Keywords** (sets mail_reply to "No"):
- "no"
- "decline"
- "reject"
- "cannot"

### 3. Frontend Implementation (`onboarding.js`)
- **Button**: "Check Email Reply" on Stage 3 page
- **Loading State**: Shows spinner while checking
- **Auto-refresh**: Reloads the stage after successful check
- **Success Messages**:
  - ✅ "Candidate accepted the offer! You can now proceed to Document Verification."
  - ❌ "Candidate declined the offer."
  - ℹ️ "No reply found yet" (if no email from candidate)

## Configuration

### Email Credentials (id.env)
```env
MAIL_USERNAME=hrtool.vtab@gmail.com
MAIL_PASSWORD=pgngluvadpbheeko
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
```

### Gmail Setup Requirements
1. **Enable IMAP** in Gmail settings
2. **App Password**: Use an app-specific password (not regular Gmail password)
3. **Less Secure Apps**: May need to enable if using regular password

## Usage Flow

1. **Stage 2**: HR sends offer letter to candidate
2. **Stage 3**: System waits for candidate response
3. **HR clicks "Check Email Reply"**:
   - System connects to inbox
   - Searches for candidate's email
   - Analyzes content for keywords
   - Updates mail_reply automatically
4. **If "Yes"**: Green banner appears with "Proceed to Document Verification" button
5. **If "No"**: Status shows "Declined"

## Error Handling

- **No email found**: Shows "No reply found yet"
- **Connection failed**: Shows "Failed to check email. Please try again."
- **No credentials**: Shows "Email credentials not configured"
- **Ambiguous response**: Shows "Email found but no clear response detected"

## Security Notes

- Email credentials stored in environment variables
- IMAP connection uses SSL/TLS
- Only searches for emails from specific candidate
- Automatically logs out after checking

## Testing

To test the email checking:
1. Create an onboarding record with a test email
2. Send offer letter (Stage 2)
3. From the test email, reply with "Yes, I accept the offer"
4. Click "Check Email Reply" button
5. System should detect acceptance and update status

## Troubleshooting

### "Email credentials not configured"
- Check `id.env` has `MAIL_USERNAME` and `MAIL_PASSWORD`
- Restart the backend server

### "Failed to check email"
- Verify Gmail IMAP is enabled
- Check if app password is correct
- Ensure internet connection is active

### "No reply found yet"
- Candidate hasn't replied yet
- Email might be in spam/trash
- Check candidate email address is correct

## Future Enhancements

- [ ] Support for multiple email providers (Outlook, etc.)
- [ ] Email thread tracking
- [ ] Automatic periodic checking
- [ ] Email template customization
- [ ] Reply history logging
