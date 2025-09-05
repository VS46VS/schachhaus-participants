# Schachhaus-Cup Tournament Registration System Manual

## 🎯 System Overview

A complete tournament registration system with admin approval workflow running on Hetzner server `YOUR_SERVER_IP`.

### Components:
- **Registration Form** - Participants register online
- **Approval System** - Admin controls who appears publicly  
- **Admin Dashboard** - Manage pending registrations
- **Email Notifications** - Automatic confirmations
- **Public Participants List** - Shows approved participants only

---

## 🌐 Live URLs

| Function | URL | Purpose |
|----------|-----|---------|
| **Registration** | http://YOUR_SERVER_IP/ | Public registration form |
| **Participants List** | http://YOUR_SERVER_IP/participants.html | Public list (approved only) |
| **Admin Dashboard** | http://YOUR_SERVER_IP/admin.html | Manage approvals |

---

## 👥 User Workflows

### For Participants:
1. Visit registration form
2. Fill out: Name, Club, Birth Year, ELO (optional), Email (required)
3. Accept privacy terms
4. Submit → Get confirmation email
5. **Status**: Pending (not visible on public list until approved)

### For Admin (You):
1. Get email notification for each new registration
2. Visit admin dashboard
3. Review pending registrations
4. Click "Genehmigen" (approve) or "Ablehnen" (reject)
5. Approved participants appear on public list

---

## 🖥️ Server Management

### Connection:
```bash
ssh root@YOUR_SERVER_IP
```

### Server Status:
```bash
pm2 status
pm2 logs tournament-backend --lines 10
```

### Restart Server:
```bash
pm2 restart tournament-backend
```

### Check Database:
```bash
cd /root/tournament/server
sqlite3 tournament.db "SELECT * FROM participants ORDER BY registrationDate DESC;"
```

---

## 📂 File Structure

### Server Files (`/root/tournament/server/`):
- `server.js` - Main backend application
- `package.json` - Dependencies
- `.env` - Email configuration (One.com SMTP)
- `tournament.db` - SQLite database (auto-created)

### Web Files (`/var/www/tournament/`):
- `index.html` - Registration form
- `script.js` - Form validation and submission
- `styles.css` - Styling (Source Sans 3 font)
- `participants.html` - Public participants list
- `participants-list.js` - List functionality
- `admin.html` - Admin dashboard

### Local Backup (`/path/to/local/anmeldetool/`):
- Complete copy of all files
- All files configured with server IP `YOUR_SERVER_IP`

---

## 🔧 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/register` | Submit registration |
| GET | `/api/participants/approved` | Get approved participants (public) |
| GET | `/api/admin/participants` | Get all participants (admin) |
| GET | `/api/admin/pending` | Get pending participants |
| POST | `/api/admin/approve/:id` | Approve participant |
| POST | `/api/admin/reject/:id` | Reject participant |
| GET | `/api/stats` | Get tournament statistics |
| GET | `/health` | Server health check |

---

## 💾 Database Schema

### `participants` table:
```sql
CREATE TABLE participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    club TEXT NOT NULL,
    birthYear INTEGER NOT NULL,
    eloDwz INTEGER,
    email TEXT,
    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    approved BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending'
);
```

---

## 📧 Email Configuration

### One.com SMTP Settings (in `.env`):
```
EMAIL_HOST=send.one.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@your-domain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=your-email@your-domain.com
ADMIN_EMAIL=your-email@your-domain.com
```

### Email Types:
1. **Admin Notification** - You get notified of each registration
2. **Participant Confirmation** - Registrant gets confirmation email

---

## 🔄 Common Tasks

### Update Files:
```bash
# Upload from local to server
scp /path/to/local/anmeldetool/index.html root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/server/server.js root@YOUR_SERVER_IP:/root/tournament/server/

# Restart after changes
pm2 restart tournament-backend
```

### Clear All Participants (Manual):
```bash
ssh root@YOUR_SERVER_IP
cd /root/tournament/server
# Backup first
cp tournament.db tournament_backup_$(date +%Y%m%d).db
# Clear all
sqlite3 tournament.db "DELETE FROM participants;"
```

### View Registrations:
```bash
sqlite3 tournament.db "SELECT id, name, club, approved, status FROM participants;"
```

### Manually Approve Participant:
```bash
sqlite3 tournament.db "UPDATE participants SET approved = 1, status = 'approved' WHERE id = X;"
```

---

## 🛡️ Security Features

### Approval System:
- **New registrations** are `pending` by default
- **Public list** shows only `approved` participants
- **Admin dashboard** required for approvals
- **Prevents fake/joke registrations** from appearing publicly

### Protection:
- Email field is **required** (prevents anonymous registrations)
- **Form validation** on client and server side
- **IP address logging** for registrations
- **Admin-only endpoints** (TODO: Add authentication)

---

## 🎨 Design Features

### Consistent Branding:
- **Source Sans 3** font throughout
- **Color scheme**: rgb(208, 176, 144) background, rgb(94, 41, 37) text
- **Tool-like containers** ready for Webflow embedding
- **Responsive design** works on all devices

### Typography:
- **Main titles**: 2.2rem, weight 700
- **Subtitles**: 1.2rem, weight 500
- **Form labels**: 0.9rem, weight 600
- **Button text**: 1.3rem, weight 600

---

## 🚨 Troubleshooting

### Server Not Responding:
```bash
pm2 restart tournament-backend
pm2 logs tournament-backend --lines 20
```

### Email Issues:
- Check `.env` file has correct One.com credentials
- Verify `EMAIL_HOST=send.one.com` (not localhost)
- Test with: `pm2 logs tournament-backend | grep -i email`

### Database Issues:
```bash
# Check if database exists
ls -la /root/tournament/server/tournament.db
# Check table structure
sqlite3 tournament.db ".schema participants"
```

### 404 Errors:
- Check file exists: `ls -la /var/www/tournament/`
- Check Nginx config: `nginx -t`
- Restart Nginx: `systemctl reload nginx`

---

## 🔄 Development Workflow

### Making Changes:
1. **Edit local files** in `/path/to/local/anmeldetool/`
2. **Test locally** (optional)
3. **Upload to server** via scp
4. **Restart server** if backend changed
5. **Test live system**

### File Upload Commands:
```bash
# Frontend files
scp /path/to/local/anmeldetool/index.html root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/script.js root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/styles.css root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/participants.html root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/participants-list.js root@YOUR_SERVER_IP:/var/www/tournament/
scp /path/to/local/anmeldetool/admin.html root@YOUR_SERVER_IP:/var/www/tournament/

# Backend files
scp /path/to/local/anmeldetool/server/server.js root@YOUR_SERVER_IP:/root/tournament/server/
scp /path/to/local/anmeldetool/server/.env root@YOUR_SERVER_IP:/root/tournament/server/
```

---

## 🎯 Next Steps / Future Enhancements

### Webflow Integration:
- Keep backend on Hetzner
- Use Webflow for frontend design
- Connect forms to existing API endpoints

### Security:
- Add authentication to admin endpoints
- Implement rate limiting for registrations
- Add HTTPS/SSL certificate

### Features:
- Export participant list to CSV
- Tournament bracket generation
- Advanced filtering and search
- Custom email templates

---

## 📞 Support

### Server Info:
- **Provider**: Hetzner
- **IP**: YOUR_SERVER_IP
- **OS**: Ubuntu
- **Web Server**: Nginx
- **Database**: SQLite
- **Runtime**: Node.js + PM2

### Important Files Backup:
Keep local copy of:
- All files in `/path/to/local/anmeldetool/`
- Server database (download periodically): `/root/tournament/server/tournament.db`

---

**System Status**: ✅ **Fully Operational**
- Registration form working
- Email notifications active  
- Approval system functional
- Admin dashboard operational

**Last Updated**: $(date)
**Version**: 1.0 - Production Ready