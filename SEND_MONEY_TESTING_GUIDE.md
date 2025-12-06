# Send Money Feature - Testing Guide

## 🎯 Complete Flow Test

This guide will help you test the complete Send Money flow from profile to payment gateway.

---

## 📋 Prerequisites

1. **Two User Accounts**:
   - Sender: `@antu_5936` (or your account)
   - Receiver: `@nia_1945` (or any other user)

2. **Servers Running**:
   ```bash
   # Backend (Terminal 1)
   cd Campus/BackEnd
   npm start
   # Should run on http://localhost:5000
   
   # Frontend (Terminal 2)
   cd Campus/FrontEnd
   npm run dev
   # Should run on http://localhost:3000
   ```

3. **Browser**: Open Chrome/Edge and press **F12** to open DevTools Console

---

## 🧪 Testing Steps

### Step 1: Navigate to Receiver's Profile
1. Login as **@antu_5936** (sender)
2. Navigate to **@nia_1945**'s profile (receiver)
3. Look for the **Send Money** button (green button with money icon 💵)

**✅ Expected**: Send Money button is visible on the profile

---

### Step 2: Click Send Money Button
1. Click the **Send Money** button
2. **Check Browser Console** for:
   ```
   Fetching receiver info for ID: <user_id>
   ✅ Receiver info successfully loaded: {
     id: <id>,
     full_name: "Nia ...",
     username: "nia_1945",
     profile_picture: "Yes/No"
   }
   ```

**✅ Expected**: 
- Page navigates to `/send-money?to=<nia_user_id>`
- Receiver card displays:
  - Profile picture or avatar initial
  - Full name: "Nia ..."
  - Username: "@nia_1945"
  - Green online indicator dot

---

### Step 3: Review Send Money Page
1. Check **Left Sidebar** shows:
   - **"Sending to"** section with @nia_1945's info
   - **Available Balance** (your balance)
   - **Transaction Info** card

2. Check **Right Section** shows:
   - Payment method selection (bKash, Nagad, Rocket)
   - Amount input field
   - Optional notes field
   - **Send Money** button

**✅ Expected**: All receiver information is clearly visible

---

### Step 4: Enter Transaction Details
1. Select a payment method (e.g., **bKash**)
2. Enter amount: `100` (between ৳50-৳5000)
3. Optionally add notes: "Thanks for lunch!"
4. Click **Send Money** button

**✅ Expected**: Validation passes, confirmation modal opens

---

### Step 5: Review Confirmation Modal
1. **Check Browser Console** for:
   ```
   🔍 Confirmation Modal Data:
     💰 Amount: 100
     💳 Payment Method: bkash
     👤 Sender: {
       full_name: "Antu ...",
       username: "antu_5936",
       hasData: true
     }
     📥 Receiver: {
       full_name: "Nia ...",
       username: "nia_1945",
       hasData: true
     }
   ```

2. **Check Modal Content**:
   - **Amount**: ৳100.00
   - **From**: 
     - Your full name
     - @antu_5936
   - **To**:
     - Nia's full name
     - @nia_1945
   - **Payment Method**: bKash
   - **New Balance**: (current balance - 100)

**✅ Expected**: All information displays correctly with proper formatting

---

### Step 6: Confirm Transaction
1. Review all details in the modal
2. Click **Confirm & Send** button

**✅ Expected**: 
- Button shows "Sending..." with spinner
- Redirects to bKash payment gateway Demo/OTP page

---

### Step 7: Complete Payment
1. On bKash Demo page, enter OTP (if required)
2. Click **Success** button

**✅ Expected**: 
- Payment processes successfully
- Redirects back to application
- Shows success message
- Balance is updated

---

## 🐛 Troubleshooting Console Logs

### If Receiver Info Not Loading:
**Check Console for**:
```
❌ Failed to load receiver: <error>
```
**Solution**: Check if the user ID in the URL is valid and the backend API is running

---

### If Sender Info Not Loading:
**Check Console for**:
```
✅ Sender info loaded from localStorage key: null
```
**Solution**: User might not be logged in. Check localStorage for `userData`, `user`, or `profile` keys

---

### If Confirmation Modal Shows Fallback Text:
- **"You"** instead of sender name → localStorage doesn't have user data
- **"Recipient"** instead of receiver name → receiverInfo is null
- **"Your account"** / **"No username"** → Username field is missing

**Solution**: Check browser console for which data is missing and why

---

## 📊 What Should Display

### Receiver Card (Main Page):
```
┌─────────────────────────────────────┐
│ 📧 Sending to                      │
├─────────────────────────────────────┤
│  [Avatar]  Nia Ahmed               │
│            @nia_1945                │
│            🟢                       │
└─────────────────────────────────────┘
```

### Confirmation Modal:
```
┌─────────────────────────────────────┐
│ 🛡️ Confirm Transaction              │
│ Review details before sending       │
├─────────────────────────────────────┤
│                                     │
│         ৳100.00                     │
│      via bKash                      │
│                                     │
├─────────────────────────────────────┤
│ From                                │
│ Antu Ahmed                          │
│ @antu_5936                          │
│          ⬇️                          │
│ To                                  │
│ Nia Ahmed                           │
│ @nia_1945                           │
├─────────────────────────────────────┤
│ Amount:           ৳100.00           │
│ Method:           bKash             │
│ New Balance:      ৳900.00           │
├─────────────────────────────────────┤
│  [Cancel]      [Confirm & Send]    │
└─────────────────────────────────────┘
```

---

## ✅ Success Criteria

- [x] Send Money button works from profile
- [x] Page loads with receiver info (name, username, picture)
- [x] Amount and payment method can be selected
- [x] Confirmation modal shows both sender and receiver details
- [x] Names and usernames display correctly (not "You" or "Recipient")
- [x] Payment gateway redirect works
- [x] Transaction completes successfully

---

## 📝 Notes

- **Console Logging**: Enhanced console logs help track data flow
- **Fallback Messages**: If data is missing, friendly messages display
- **URL Parameter**: The `?to=<user_id>` parameter is crucial for loading receiver
- **localStorage**: Sender info comes from localStorage (set during login)
- **API Response**: Receiver info comes from backend API `/api/users/:id`

---

## 🎨 Visual Design

- **Clean & Professional**: No clutter, only essential information
- **Color Coded**: 
  - Cyan/Blue for actions and highlights
  - Emerald/Green for success states
  - Gray for secondary information
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Hover effects and transitions

---

## 🚀 Quick Test Command

```bash
# Open both terminals
# Terminal 1 - Backend
cd 's:/C-Gigs-React/Campus/BackEnd' && npm start

# Terminal 2 - Frontend
cd 's:/C-Gigs-React/Campus/FrontEnd' && npm run dev

# Open browser to http://localhost:3000
# Login → Visit Profile → Click Send Money → Check Console (F12)
```

---

## Need Help?

If something doesn't work as expected:
1. Check browser console (F12) for detailed logs
2. Verify both backend (port 5000) and frontend (port 3000) are running
3. Ensure you're logged in and have sufficient balance
4. Check the error messages in console - they include ✅ and ❌ icons for easy identification
