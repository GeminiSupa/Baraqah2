# Messaging & Connection Flow Guide

## Overview
This document explains how the messaging and questionnaire flow works after someone accepts your connection request.

## Complete Flow Diagram

```
1. User A sends connection request to User B
   ↓
2. User B receives request notification
   ↓
3. User B views User A's profile & questionnaire answers
   ↓
4. User B accepts request
   ↓
5. User B is redirected to Compatibility Questionnaire page
   ↓
   ┌─────────────────────────────────────┐
   │  User B has 2 options:              │
   │                                     │
   │  Option A: Fill Questionnaire      │
   │  ↓                                  │
   │  • Answer compatibility questions   │
   │  • Save answers to profile          │
   │  • Wait for User A to complete      │
   │  • Once both complete → Can message │
   │                                     │
   │  Option B: Skip & Message Directly  │
   │  ↓                                  │
   │  • Skip questionnaire               │
   │  • Go directly to messaging        │
   │  • Start chatting immediately       │
   └─────────────────────────────────────┘
   ↓
6. Both users can now message each other
```

## Step-by-Step Process

### Step 1: Sending a Connection Request
- User A browses profiles and clicks "Like & Request"
- User A can optionally add a message
- Request is sent to User B
- Status: `pending`
- Connection Status: `pending`

### Step 2: Receiving & Reviewing Request
- User B sees the request in their Messages page
- User B can click to view:
  - User A's full profile
  - User A's questionnaire answers (if completed)
  - The message from User A

### Step 3: Accepting the Request
When User B clicks "Accept Request":
- Request status changes to: `approved`
- Connection status changes to: `accepted`
- User B is automatically redirected to: `/messaging/compatibility/[requestId]`

### Step 4: Compatibility Questionnaire Page
User B now sees the Compatibility Questionnaire page with two options:

#### Option A: Complete Questionnaire (Recommended)
1. **Select Religious Background** (if not already set):
   - Muslim
   - Non-religious
   - Other

2. **Answer Questions** (based on religious background):
   - **If Muslim**: 12 questions (including Islamic-specific questions)
   - **If Non-Muslim/Other**: 10 general compatibility questions

3. **Save Answers**:
   - Answers are saved to User B's profile
   - System checks if User A has also completed their questionnaire
   - If both completed → Connection status → `questionnaire_completed`
   - User B is redirected to messaging page

4. **If Only One Completed**:
   - User B waits for User A to complete their questionnaire
   - Once User A completes → Both can message

#### Option B: Skip & Message Directly
1. Click "Skip & Start Messaging Directly →" button
2. Connection status changes to: `connected`
3. User B is immediately redirected to messaging with User A
4. Both users can start chatting right away

### Step 5: Messaging
Once connection is established (either through questionnaire completion or skip):
- Both users can access: `/messaging/[otherUserId]`
- Real-time messaging interface
- Messages are stored and synced
- Both users can see the conversation history

## Connection Status Flow

```
pending → accepted → [questionnaire_completed OR connected] → messaging
```

### Status Meanings:
- **pending**: Request sent, waiting for response
- **accepted**: Request approved, questionnaire step
- **questionnaire_completed**: Both users completed questionnaires
- **connected**: User skipped questionnaire, direct messaging enabled
- **rejected**: Request was declined

## Key Features

### 1. Conditional Questions
- **Muslim users**: See 12 questions including:
  - Sect preference (Sunni/Shia)
  - Prayer practice
  - Hijab preference
  - + 12 compatibility questions

- **Non-Muslim users**: See 10 general compatibility questions

### 2. Questionnaire Persistence
- Answers are saved to the user's profile
- If user already answered before, answers are pre-filled
- User can update answers anytime from profile settings

### 3. Flexible Messaging
- Users can choose to:
  - Complete questionnaire for better compatibility matching
  - Skip questionnaire and message directly for faster connection

### 4. Request Management
- Users can view all requests (sent/received) in Messages page
- Filter by status: pending, approved, rejected
- View full profile and questionnaire before accepting

## API Endpoints Used

1. **Accept Request**: `PATCH /api/messaging/request/[requestId]`
   - Updates status to `approved`
   - Sets connection status to `accepted`

2. **Submit Questionnaire**: `POST /api/questionnaire/[requestId]`
   - Saves answers to user profile
   - Checks if both users completed
   - Updates connection status if both done

3. **Skip Questionnaire**: `PATCH /api/messaging/request/[requestId]`
   - Sets connection status to `connected`
   - Enables direct messaging

4. **Start Messaging**: `GET /api/messaging/conversation/[userId]`
   - Fetches conversation history
   - Verifies connection is approved

5. **Send Message**: `POST /api/messaging/send`
   - Sends new message
   - Stores in database

## User Experience Tips

1. **For Best Compatibility**: Complete the questionnaire
   - Helps both users understand each other better
   - Shows commitment to finding a serious match

2. **For Quick Connection**: Skip questionnaire
   - Faster way to start conversation
   - Can discuss compatibility through messaging

3. **Viewing Profiles**: Always review the other person's profile and questionnaire before accepting
   - Helps make informed decisions
   - Reduces mismatches

## Troubleshooting

### "Conversation not found or not approved"
- Make sure the request was accepted first
- Check connection status is `accepted`, `questionnaire_completed`, or `connected`

### "Request must be accepted first"
- The questionnaire can only be accessed after accepting the request
- Accept the request first, then fill the questionnaire

### Messages not appearing
- Check if connection status allows messaging
- Verify both users have approved the request
- Refresh the page

## Next Steps After Connection

Once messaging is enabled:
1. Start conversation with a greeting
2. Get to know each other through chat
3. Share more details about yourself
4. Discuss compatibility topics
5. If compatible, involve families (traditional approach)
6. Proceed with nikah/marriage plans
