# Orbitask v3.0.2 — Bug Fixes, Performance, and Classroom Sync Improvements

**Release Date:** June 10, 2026  
**Build Status:** ✅ Stable & Production Ready

---

## 🎯 What's New in v3.0.2

### ✅ **New Features**

#### 1. **User Profile Shows Classroom Access**
- When viewing any user's profile, now displays all classrooms they have access to
- Helps teams understand user permissions at a glance
- Shows classrooms as styled badges at the bottom of the profile modal

#### 2. **Realtime Classroom Assignment Sync**
- When admin assigns/removes classroom access, changes now sync **instantly** instead of 5-second delay
- Added realtime subscription for `wt_user_classrooms` table changes
- Automatic workspace cache refresh when classroom access changes
- Users see new projects immediately without page reload

#### 3. **Board View Task Drag-Drop Persistence** 
- ✅ Fixed: Tasks can now be dragged between columns (To Do → In Progress → Done)
- ✅ Fixed: Task status changes are now properly saved to database
- ✅ Fixed: Task reordering within columns is now persisted
- Added visual drag handle that appears on hover
- Improved drag animations and feedback (card rotation + elevated shadow)

#### 4. **Team Activity Map Display**
- Fixed: D3.js force-directed graph now displays on Users page
- Interactive visualization showing team member activity nodes
- Online status indicators with green pulses
- Draggable nodes for exploration
- Hover tooltips showing activity hours and online status

---

## 🐛 **Bug Fixes**

### Critical Fixes
1. **Team Activity Map** - Was showing empty on Users page (D3 initialization wasn't being called)
2. **Board Drag-Drop** - Tasks could be dragged visually but changes weren't saved to database
3. **Classroom Sync Delay** - Classroom assignments took 5+ seconds to appear (now instant)

### Minor Fixes
1. Improved error handling in board drag-drop persistence
2. Added validation checks in classroom assignment
3. Better error messages for failed operations
4. Improved console logging for debugging

---

## 🎨 **Visual Polish**

### Task Card Improvements
- **Hover Effects**: Cards now lift slightly on hover with elevated shadow (8px)
- **Drag Feedback**: During drag, cards show rotation (2deg) for better visual feedback
- **Smooth Animations**: All transitions use cubic-bezier easing (0.24s duration)
- **Drag Handle**: Visual 6-dot grip icon appears on hover in both list and board views
- **Color Feedback**: Hover states include subtle border color changes

### Classroom Badges
- New classroom display badges in user profiles
- Styled with proper padding and rounded corners
- Consistent color theming with app

---

## 🔧 **Technical Improvements**

### Realtime Sync
```
BEFORE: Classroom changes every 5 seconds (polling)
AFTER: Classroom changes instantly via realtime subscription
```

### Error Handling
- Added comprehensive error handling to board drag-drop
- Better error messages shown to users via toast notifications
- Improved logging for debugging sync issues

### Performance
- Optimized calendar sync data fetching (3-month range)
- Improved cache invalidation for classroom changes
- Reduced polling overhead with realtime subscriptions

### Code Quality
- Removed debugging console.log statements
- Added better error context logging
- Improved function documentation
- Consistent error handling patterns

---

## 📊 **What's Fixed**

| Issue | Severity | Status | Impact |
|-------|----------|--------|--------|
| Team Activity Map empty | HIGH | ✅ Fixed | Users page now shows D3 visualization |
| Board drag-drop not saving | HIGH | ✅ Fixed | Tasks now persist when reordered |
| Classroom sync 5s delay | MEDIUM | ✅ Fixed | Instant visibility of new classrooms |
| Missing classroom info | MEDIUM | ✅ Fixed | Users can see their permissions |
| Missing drag handles | LOW | ✅ Fixed | Better visual feedback for dragging |

---

## 📋 **Installation & Update**

### For Auto-Update
Simply launch the app - it will automatically detect and download v3.0.2

### For Manual Update
1. Download latest version from GitHub releases
2. Run the installer
3. App will automatically backup settings
4. Restart app to use new version

### Rollback
If you need to rollback to v3.0.1:
```bash
git checkout v3.0.1
npm run pack
npm start
```

---

## ✅ **Testing Checklist**

All features have been tested:
- [x] User profiles show classrooms
- [x] Classroom assignment appears instantly
- [x] Board view drag-drop saves changes
- [x] Team Activity Map displays correctly
- [x] Task list drag-drop still works
- [x] No console errors on startup
- [x] Performance is smooth
- [x] All notifications work
- [x] Realtime sync is functioning
- [x] Calendar sync working

---

## 🔄 **Migration Notes**

**No migration needed** - v3.0.2 is fully backward compatible with v3.0.1.

If you have existing tasks/projects from v3.0.1:
- ✅ All data is preserved
- ✅ No database changes required  
- ✅ Existing classroom assignments work as before
- ✅ Task order/status preserved

---

## 📞 **Known Issues**

**None reported** - v3.0.2 is production-ready.

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Try refreshing the page
3. Try restarting the app
4. Check your internet connection
5. Report issue with screenshot and console output

---

## 🚀 **What's Coming in v3.1**

Planned for next release:
- [ ] Project completion notifications
- [ ] Rich-text task notes with Quill.js
- [ ] PDF report generation (jsPDF)
- [ ] Enhanced project dependency visualization
- [ ] Advanced search with Fuse.js
- [ ] Date picker improvement with Flatpickr
- [ ] Additional analytics with Chart.js

---

## 📝 **Detailed Changelog**

### Commits in v3.0.2
```
0ab0ead - Docs: Comprehensive guides for three important issues
df74052 - Add: Realtime subscription for user classroom changes
fab1f7d - Feature: Display user's classroom access in profile modal
c6f4396 - Fix: Board view drag-drop now persists task status and order changes
87eb417 - Improve task card visual polish: hover effects, drag feedback, and smooth transitions
f4d1caf - Fix: Team Activity Map empty on Users page and board view task drag-reordering
433da39 - Implement calendar sync: add calendar events to pull cycle and realtime listener
75b2a6b - Docs: Comprehensive improvement guide for v3.0.1+ fixes
```

### Contributors
- Everlasting (core development)
- Claude Haiku 4.5 (AI-assisted development)

---

## 🎓 **For Developers**

### New Event Listeners
- `wt-user-classroom-changed`: Fires when user's classroom access changes in realtime
- Triggers automatic workspace cache refresh

### New Realtime Subscriptions
- `wt_user_classrooms`: Subscribe to changes for current user's classroom assignments

### Database Functions
- `getUserClassroomIds(userId)`: Get list of classroom IDs for a user
- `setUserClassrooms(userId, classroomIds)`: Assign classrooms to a user
- All properly error-handled with try/catch blocks

### Testing Improvements
- Added comprehensive diagnostic guides in `THREE_IMPORTANT_FIXES.md`
- Added debugging instructions for classroom sync issues
- Better error messages for common problems

---

## 📦 **Build Info**

- **Electron Version:** 33.4.11
- **Build Tool:** electron-builder 25.1.8
- **Platform:** Windows, macOS, Linux
- **Size:** ~188MB (built binary)
- **Auto-Update:** Enabled via electron-updater

---

## 🙏 **Thank You**

Thank you for using Orbitask! Your feedback helps us improve. 

For feature requests or bug reports, please create an issue on GitHub or reach out to the team.

---

**Status:** ✅ **Ready for Production**  
**Stability:** Excellent (no known issues)  
**Recommended For:** All users - no risks with this update
