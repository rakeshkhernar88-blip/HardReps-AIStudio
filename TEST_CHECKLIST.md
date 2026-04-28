# HardReps App Test Checklist

| Tab / Category | Tappable Element | Expected Behavior | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **Navigation** | Tab Bar Icons | Swaps view between Home, Train, Coach, etc. Active icon highlighted. | |
| **Home (Dashboard)** | Refresh Icon | Triggers Google Fit data re-sync animation and logic. | |
| | Circular Progress Card | Tapping reveals detailed breakdown of steps/calories for the day. | |
| | Workout Card | Opens selected workout details or starts session. | |
| | Google Fit Data | Data (Steps, Calories, Heart Points) matches source or mock values. | |
| **Train (Workouts)** | Workout List Item | Expands to show exercises, reps, and sets. | |
| | "Add Custom" Button | Opens form to create a new personalized workout routine. | |
| | Start Session | Navigates to active workout screen with timer and rep tracker. | |
| **AI Coach** | Chat Input Field | Keyboard opens (UI adjusts via KeyboardAvoidingView). | |
| | Send Button (Ionicons) | Submits text. User message appears on right (#6C63FF). | |
| | Typing Indicator | 3 pulsating dots appear while AI is "thinking". | |
| | AI Response | Received text appears on left (#1a1a1a) with timestamp. | |
| | Command JSON | AI successfully executes SET_REMINDER or UPDATE_GOAL if requested. | |
| **Stats (Analytics)** | Period Toggle (W/M/Y) | Chart updates to show weekly, monthly, or yearly progress. | |
| | Chart Bar/Point | Tapping shows specific value and date for that data point. | |
| **Board (Social)** | User Profile | Navigates to another user's public profile and stats. | |
| | Like/Clap Button | Increments interaction count for a shared workout session. | |
| **Sleep** | Sleep Chart | Displays sleep stages and cycles from Google Fit data. | |
| | Bedtime Goal Toggle | Saves new target sleep hours to AsyncStorage. | |
| **Journal** | Add Entry Button | Opens rich text editor/modal to log daily reflection. | |
| | List Entry | Expands to read full text of a past journal entry. | |
| **Hub (Shop/More)** | Product Item | Opens store page for supplements or apparel. | |
| | Settings Icon | Opens preferences (Theme, Units, Notifications). | |
| **Infrastructure** | App Load | Correctly reads previous session data from AsyncStorage. | |
| | Permission Prompt | Correctly requests Health/Google Fit access on first run. | |
