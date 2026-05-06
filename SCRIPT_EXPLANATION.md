# 🚀 Rocket Team Progress Tracker - User Guide

Hey folks! When I first read the P2 about the Zendesk workflow changes, it occurred to me that at some point, I want to be able to see the tickets I have been working on, whether it's messaging or non-messaging. I want to be able to track that. So, thinking about what we used to have with the MC stats, I made a few changes to the script Steve showed me, and I've been playing around with it.

I added a feature that displays my daily interactions in a calendar view, making it easier for me to access that information and get those ticket #. If you'd like to try it out, here it is: https://d.pr/f/v0qluh (You need to use Tampermonkey).

If you have any feedback, I would be happy to review it.

---

## 📋 What This Script Does

The **Rocket Team Progress Tracker** is a browser extension that automatically tracks your Zendesk ticket interactions and displays them in a visual calendar format. It helps you:

- **Track all tickets you work on** (both messaging and non-messaging)
- **View your daily interaction history** in an easy-to-read calendar
- **Monitor your progress** toward daily interaction goals
- **Access ticket details** quickly from the calendar view

---

## 🎯 How It Works

### Automatic Tracking
The script automatically tracks interactions when you **add a private note** to a ticket. Here's how:

1. **Detection**: The script monitors your Zendesk tabs and detects when a new comment/note is added
2. **Smart Filtering**: It specifically tracks when you add a private note (not public comments or other users' notes)
3. **Data Capture**: When a private note is detected, it captures:
   - Ticket ID
   - Ticket Subject
   - Product field
   - Status
   - Priority
   - Requester
   - Timestamp
4. **Storage**: All data is stored locally in your browser (no external servers)

### Why Private Notes?
The script uses private notes as the trigger because:
- It's a clear indicator that you've actually worked on a ticket
- It works for both messaging and non-messaging tickets
- It avoids double-counting (one ticket = one interaction per day)

---

## 🎨 Features

### 1. **Daily Progress Counter**
- Displays in the Zendesk header showing: `Current Count / Daily Target (Progress %)`
- Shows your working hours and target rate: `🚀 Team Rocket: 8h @ 3.5/h`
- Color-coded progress bar that changes as you approach your goal
- Rocket-themed animations when you hit milestones (25%, 50%, 75%, 100%, etc.)

### 2. **Calendar View** 📅
- Click the calendar icon (📅) in the top-right corner to open
- Opens in a new tab with a full calendar view
- Shows:
  - **Daily interaction counts** for each day
  - **Weekly totals** in the rightmost column
  - **Monthly total** at the top
  - **Color-coded days** (blue = has interactions, green border = today)
- Click any day to see detailed ticket information:
  - Ticket numbers (clickable to open tickets)
  - Time of interaction
  - Subject line
  - Product, Status, Priority
- Navigate between months with Previous/Next buttons
- Automatically jumps to the most recent month with interactions

### 3. **Customizable Settings**

#### ⏰ **Adjust Support Hours** (Clock Icon)
- Set how many hours you're working today
- Prompt: *"🚀 How many support hours are you fueling up for today?"*
- Default: 8 hours
- Updates your daily target automatically

#### 🎯 **Adjust Target Rate** (Target Icon)
- Set your desired interactions per hour
- Prompt: *"🚀 What's your target interactions per hour?"*
- Default: 3.5 interactions/hour
- The script calculates: `Daily Target = Working Hours × Target Rate`
- Example: 8 hours × 3.5/h = 28 interactions target

#### 🔄 **Adjust Interaction Count** (Reset Icon)
- Manually correct the counter if it breaks or miscounts
- Prompt: *"🚀 Adjust your rocket's current altitude (interactions count):"*
- Useful if the script misses a ticket or counts incorrectly

---

## 🚀 Setup Instructions

### Prerequisites
- **Tampermonkey** browser extension (Chrome, Firefox, Edge, Safari)
  - Install from: https://www.tampermonkey.net/

### Installation Steps

1. **Install Tampermonkey** (if not already installed)
   - Go to your browser's extension store
   - Search for "Tampermonkey"
   - Click "Add to Browser"

2. **Install the Script**
   - Open Tampermonkey dashboard (click the extension icon → Dashboard)
   - Go to the "Utilities" tab → "Import from URL"
   - Paste the script URL: `https://d.pr/f/v0qluh`
   - Click "Install"

3. **Verify Installation**
   - Navigate to Zendesk: `https://a8c.zendesk.com/agent/*`
   - You should see:
     - A progress counter in the header (top-right)
     - A calendar icon (📅) button in the top-right corner
     - Three small buttons (⏰ 🎯 🔄) next to the counter

---

## 📖 How to Use

### First-Time Setup

1. **Set Your Working Hours**
   - Click the ⏰ (clock) icon
   - Enter how many hours you're working today (e.g., "8")
   - Click OK

2. **Set Your Target Rate** (Optional)
   - Click the 🎯 (target) icon
   - Enter your desired interactions per hour (default: 3.5)
   - Click OK
   - Your daily target will update automatically

### Daily Usage

1. **Work Normally**: Just use Zendesk as usual
2. **Add Private Notes**: When you add a private note to a ticket, it's automatically tracked
3. **View Progress**: Check the counter in the header to see your progress
4. **View Calendar**: Click the 📅 icon anytime to see your interaction history

### Viewing Your Interactions

1. Click the **📅 calendar icon** (top-right)
2. Calendar opens in a new tab
3. **Navigate months** using Previous/Next buttons
4. **Click any day** with interactions to see:
   - List of all tickets worked on that day
   - Ticket numbers (click to open)
   - Time of interaction
   - Subject, Product, Status, Priority
5. **Click a ticket** in the modal to open it in a new tab

---

## 💡 Tips & Best Practices

### Getting Accurate Counts
- **Always add a private note** when you work on a ticket (this is what triggers tracking)
- The script tracks **one interaction per ticket per day** (prevents double-counting)
- If you work on the same ticket multiple times in a day, it updates the timestamp but doesn't create duplicate entries

### If the Counter Breaks
- Click the **🔄 (reset) icon** to manually adjust the count
- The script resets automatically at midnight (based on your timezone)
- If tracking seems off, check that you're adding private notes (not just public comments)

### Customizing Your Target
- **Adjust hours daily**: If you're working part-time or overtime, update your hours
- **Adjust rate**: If your team has different expectations, change the interactions/hour rate
- The script remembers your settings (stored in browser localStorage)

### Calendar Navigation
- The calendar automatically shows the **most recent month with interactions**
- Use Previous/Next to browse historical data
- Click any day to see detailed ticket information
- All ticket numbers are clickable links

---

## 🔧 Troubleshooting

### Counter Not Showing
- Make sure you're on a Zendesk agent page (`https://a8c.zendesk.com/agent/*`)
- Refresh the page
- Check Tampermonkey is enabled (green icon)

### Interactions Not Tracking
- **Make sure you're adding private notes** (not public comments)
- Check that the ticket tab is open/active when you add the note
- Wait a moment after adding the note (script checks every 2 seconds)

### Calendar Not Opening
- Check if pop-ups are blocked
- Try clicking the calendar icon again
- The calendar opens in a new tab - check your browser tabs

### Counter Shows Wrong Number
- Click the 🔄 icon to manually adjust
- The counter resets daily at midnight
- Check that you're adding private notes (this is what triggers tracking)

### Data Not Persisting
- All data is stored in browser localStorage
- Clearing browser data will delete your history
- Data is browser-specific (won't sync across devices)

---

## 📊 Understanding the Display

### Progress Counter
```
🔧 15/28 (54%)
🚀 Team Rocket: 8h @ 3.5/h
[Progress Bar]
```

- **15/28**: 15 interactions completed out of 28 target
- **(54%)**: Percentage of daily goal achieved
- **8h @ 3.5/h**: Working 8 hours at 3.5 interactions per hour = 28 target
- **Progress Bar**: Visual indicator (changes color as you progress)

### Calendar View
- **Blue background**: Days with interactions
- **Green border**: Today's date
- **Numbers**: Interaction count for that day
- **Weekly totals**: Rightmost column shows sum for each week
- **Monthly total**: Top-right shows total for the displayed month

---

## 🎯 Key Features Summary

✅ **Automatic tracking** when you add private notes  
✅ **Calendar view** of all your interactions  
✅ **Daily progress tracking** with visual indicators  
✅ **Customizable targets** (hours and rate)  
✅ **Ticket details** captured automatically  
✅ **Historical data** - browse past months  
✅ **Rocket-themed** fun animations and messages  
✅ **Dark mode support** (follows system preference)  
✅ **Timezone support** (tracks based on your timezone)  

---

## 🤝 Feedback & Support

If you have any feedback, suggestions, or run into issues, feel free to reach out! The script is designed to be helpful and non-intrusive, so if something isn't working as expected, I'm happy to help troubleshoot.

**Remember**: This script only tracks what you do - it doesn't send any data anywhere. Everything is stored locally in your browser for your personal use.

---

*Happy tracking! 🚀*

