# Email (password reset, monthly digests) with this app

WorkTracker is a **static, browser-only** app. It **cannot send email by itself** because there is no server to hold an SMTP password or an email API key (and you should never put those keys in front-end code where anyone can read them).

## Practical options

1. **Use `#/recovery` + master recovery key**  
   Users reset passwords through the recovery page after you set the master key (first admin setup or Admin panel). No email required.

2. **`mailto:` links (manual)**  
   From Admin, you can email users outside the app (e.g. Outlook/Gmail) and paste a link or instructions. You could add a future UI button that opens `mailto:user@example.com?subject=...&body=...` with a prefilled message.

3. **Export + mail merge**  
   Use **Export** to download JSON, derive what you need (e.g. task counts per user), and use Excel + Word mail merge or a newsletter tool for “monthly progress” updates.

4. **Small backend (real automation)**  
   Add a minimal server (Node, serverless function, etc.) that calls **Resend**, **SendGrid**, or **AWS SES** with the API key stored **only on the server**. The admin UI would call your API to “send digest” or “invite user.” This is the right approach if you need true automated email.

## Summary

- **Today:** recovery flow + admin password reset + manual email/export.  
- **Later:** optional backend + email provider for automated messages.
