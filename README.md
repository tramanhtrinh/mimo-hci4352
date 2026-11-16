# mimo: a gentle digital companion

mimo is a mobile app prototype (HCI 4352) that helps people use their phone less by caring for a virtual companion, Mimo the bear. Time spent away from the phone is how Mimo rests, grows and earns treats. Users also set their own screen-time goals and check in on them honestly each day.

The prototype is built with **React Native + Expo** and runs in a **web browser** (best viewed at phone size) or on a phone through the **Expo Go** app.

---

## Quick start

### Requirements

|                  |                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Node.js          | **22 LTS** recommended (20.19 or newer also works). Download from https://nodejs.org      |
| npm              | Comes with Node.js                                                                        |
| Browser          | Google Chrome (recommended), Safari, Edge or Firefox, all current versions                |
| Phone (optional) | The free **Expo Go** app (iOS App Store / Google Play), on the same Wi-Fi as the computer |

No database, server or account with any outside service is needed. Everything runs locally.

### Run it in a browser

```bash
git clone https://github.com/tramanhtrinh/mimo-hci4352.git
cd mimo-hci4352/frontend
npm install
npm run web
```

The app opens at **http://localhost:8081**. If it doesn't open by itself, press `w` in the terminal or open that address yourself.

For the intended look, view it at phone size: open the browser's developer tools (F12, or Cmd+Option+I on a Mac), turn on the device toolbar (Ctrl+Shift+M, or Cmd+Shift+M on a Mac) and pick a phone such as *iPhone 14 Pro*.

### Run it on a phone

```bash
cd mimo-hci4352/frontend
npm start
```

Scan the QR code in the terminal with the iPhone Camera app, or from inside Expo Go on Android. The phone and the computer must be on the same Wi-Fi network.

### Useful commands (run inside `frontend/`)

| Command           | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `npm run web`     | Start the app in a browser                           |
| `npm start`       | Start the dev server and show a QR code for Expo Go  |
| `npm run ios`     | Open in the iOS Simulator (macOS with Xcode only)    |
| `npm run android` | Open in an Android emulator (needs Android Studio)   |
| `npm run lint`    | Check the code with ESLint                           |

Press `Ctrl+C` in the terminal to stop the server.

---

## Signing in

After a short loading screen, the app shows the **Log in** screen.

- **Fastest way in:** tap **Try the demo account**. This signs in as *Alex* (`demo@mimo.app` / `mimo123`). The demo account starts with a few goals, some phone-free history from earlier in the week, a Level 3 Mimo and a Ribbon Bow, so every screen has something to show.
- **Your own account:** tap **Create an account** and enter your name, an email, a password (6+ characters) and a name for your companion. New accounts start from scratch: a Level 1 Mimo, 20 sparks and no goals.

Accounts are **simulated**. They are saved only in this browser or on this device, no email is ever sent ("Forgot password?" just shows a message), and passwords are not securely stored, so never use a real password.

---

## How mimo works

**The idea in one line:** put your phone down and Mimo gets rested; keep your goals and you earn **sparks**; spend the sparks on caring for Mimo.

- **Sparks** are the currency. You earn them with phone-free time (2 per minute), by keeping goals (the reward you chose for each goal) and with a daily +5 gift.
- **Mimo's needs** are Mood (happiness), Energy and Hunger. They drift down slowly while the app is open, about 1% every 20 seconds, but not during a phone-free session. When one drops below 50%, Mimo asks for help on the Home and Pet screens.
- **Growth** comes from phone-free minutes. Mimo grows through five stages: Seed, Bud, Sprout, Bloom and Blossom.

The app has five tabs along the bottom: **Home, Pet, Goals, Progress and Rewards**.

### Home

- The header shows your name, Mimo's streak and your spark balance. Tap the small bear at the top left to open **Account**.
- The pet card shows what Mimo needs right now in a speech bubble, with a button that takes you to the right place: **Rest together** / **Start phone-free time** opens a phone-free session, and **Feed Mimo** / **Play together** opens the Pet tab. Below that are Mimo's level, growth bar, happiness and energy.
- **Phone-free today** tracks today's phone-free minutes against the 60-minute daily goal.
- **Today's Mindful Goals** lists the goals scheduled for today, with check-in buttons. **View All →** opens the Goals tab.

### Phone-free session (the core feature)

Open it from **Rest together** on Home or Pet, from **Start phone-free time** on Rewards, or from **Start a … min session** on a "Rest with Mimo" goal.

1. Pick **5, 15 or 30 min**. The screen shows what Mimo will get (sparks, energy, growth).
2. **Demo speed (1 min = 1 sec)** is **on by default**, so a session finishes in seconds for presentations. Turn it off for real-time minutes.
3. Tap **Put phone down**. Mimo naps while a timer counts down.
4. Leaving the app or switching browser tabs mid-session counts as a **peek**, and each peek costs 5 sparks.
5. **Wake Mimo early** (tap twice to confirm) ends the session. Every minute still counts, but you get half the sparks.
6. The summary shows what you earned, whether Mimo grew a level, and any "Rest with Mimo" goals the session completed. From there you can go spend sparks on the Pet tab or go back Home.

### Pet

- See Mimo, its level and growth, and **Vital Harmony**: Mood, Energy and Hunger with an overall status (Thriving, Steady or Needs Care).
- **Care Rituals:**
  - **Rest Together** (free, earns sparks): starts a phone-free session.
  - **Feed Snack** (15 sparks): pick an apple, cookie or rice ball. Gives +20 Hunger (fullness) and +5 Mood.
  - **Play Mini-Game** (10 sparks): gives +15 Mood but uses some Energy and Hunger.
- If you don't have enough sparks, the card tells you how many more you need.

### Goals

- **Weekly Flow** is a calendar strip for this week. Tap a day to see the goals planned for it, in time order, and tap a goal there to edit it.
- **This week** shows how many scheduled check-ins you have kept so far.
- **+ Create a goal** opens the goal editor.
- Each goal card shows its schedule, time, spark reward, personal treat, streak, your reason ("why") and this week's check-ins (✓ kept, – missed).
- **Checking in** (only on days the goal is scheduled):
  - **I did it ✓** gives the goal's sparks plus a mood boost, and adds 1 to the streak.
  - **Not today** costs nothing. The streak just starts over. If you change your mind, tap **I did it after all**.
  - "Rest with Mimo" goals don't have an "I did it" button. Instead, they are checked in automatically when you finish a session that is at least as long as the goal (sessions ended early don't count).
- Tap **Edit** on any card to change or delete the goal.

### Creating or editing a goal

Start from a template under **Start from an idea** (for example *No social before bed*, *Phone-free meals*, *Focused study* or *Game-day focus*), or build your own:

1. **Name your goal.**
2. **What kind of goal?** *Stay off* (avoid apps for a while), *Limit to* (a daily budget) or *Rest with Mimo* (a phone-free session).
3. **Which apps?** Social media, Video apps, Games or All apps. You can also pick specific apps, such as TikTok or YouTube.
4. **When?** Before bed, After waking, During meals, While studying, Before practice, Before a game, or Any time.
5. **Length**, from 10 minutes to 2 hours.
6. **How often?** Every day, Weekdays, Weekends, or tap individual days.
7. **What time?** (optional) This places the goal on the Weekly Flow. Use − / + to change it in 30-minute steps.
8. **Your reward:** 10–50 sparks per kept day, plus an optional treat you promise yourself (for example "read a chapter").
9. **Why it matters to you** (optional): Mimo shows this back to you on the goal card.

A live preview shows the goal in plain English, and Mimo gives a tip if a goal looks hard to keep. Tap **Set this goal** (or **Save changes**). A goal needs a name and at least one day before it can be saved. To delete a goal, open it and tap **Delete goal** twice.

### Progress

- **This week:** a bar chart of phone-free minutes per day, with the daily goal line.
- **Your phone use:** a sample week of screen time by category and top apps, plus your peak usage time. **Make a goal for this** opens the goal editor already filled in for your biggest habit. *These screen-time numbers are pretend data. The prototype does not read your real phone usage.*
- All-time totals (phone-free time, sessions, goals kept this week, streak), Mimo's growth stages, and **Milestones** such as *First rest together* and *3-day streak*.

### Rewards

- **Daily hello:** claim +5 free sparks once per day.
- **Shop:** buy accessories for Mimo with sparks: Ribbon Bow (30), Cozy Scarf (50), Reading Glasses (60), Flower Crown (80) and Party Hat (120). Tap **Buy** to buy an item, and Mimo puts it on right away. Tap **Wear** on an item you own to switch to it, or tap **Wearing** (or **Take it off**) to remove it.
- **Treats you promised yourself** lists the personal rewards from your goals.
- **How to earn sparks** is a quick reminder, with a button to start phone-free time.

### Account

Open it with the bear avatar at the top left of Home. Here you can see your stats, change your name, email or companion's name, change your password, **Log out**, or **Delete account**. The demo account can't be deleted.

---

## Saved data and resetting

- Everything (accounts, goals, sparks and Mimo's state) is saved locally: in the browser's local storage on web, or on the device in Expo Go. Data persists across reloads and is separate for each account.
- Goal check-ins and daily phone-free minutes reset at the start of each week (Sunday).
- **To reset the demo account**, clear the site data for `localhost:8081` (Chrome: DevTools → Application → Storage → **Clear site data**) and reload. On a phone, delete and re-open the project in Expo Go, or log in with a fresh account.

## Limitations

- **No real app blocking or tracking.** mimo can't see or limit your real phone use. Phone-free time is only counted inside the app's session timer.
- **Screen-time numbers are pretend.** The "Your phone use" card shows a hard-coded sample week.
- **Accounts are simulated.** They're saved only on this browser or device, no emails are sent, and passwords aren't securely stored.
- **No notifications or reminders.** Goals don't alert you at their set time.
- **Data resets weekly.** Check-ins and daily phone-free minutes start over each Sunday.
- **Best viewed at phone size.** On a wide desktop window the layout is centered but not designed for desktop.

## Troubleshooting

- **Port 8081 is already in use:** stop the other Expo server, or accept the prompt to use a different port.
- **The phone can't connect:** make sure both devices are on the same Wi-Fi, or run `npx expo start --tunnel`.
- **Strange errors after pulling new changes:** run `npm install` again, then `npx expo start -c` to clear the cache.

## Project structure

```
frontend/src/
  app/                 Screens (Expo Router, file-based routes)
    index.tsx          Opening / loading screen
    (auth)/            Log in and sign up
    (app)/(tabs)/      Home, Pet, Goals, Progress, Rewards
    (app)/focus.tsx    Phone-free session
    (app)/goal-editor.tsx, account.tsx
  components/mimo/     Mimo's illustrations, cards, nav bar, form parts
  state/               Accounts, pet/sparks logic, goals, shop, sample usage data
```

Screenshots of the app are in [`screenshots/`](screenshots/).
