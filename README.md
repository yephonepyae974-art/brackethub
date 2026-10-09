# BracketHub

BracketHub is a web-based E-sports Tournament Management System built with Next.js and MongoDB.

The system allows tournament organizers to create tournaments, register teams, schedule matches, record match results, and track tournament progress through a tournament bracket.

Visitors can also view tournaments, participating teams, match results, and tournament brackets.
---

Team Members GitHub Repository:

https://github.com/yephonepyae974-art/brackethub
---

## Features

### Dashboard
- View total tournaments
- View total registered teams
- View total matches
- View scheduled, ongoing, and completed match statistics
- View recent matches
- Quick access to tournament management features

### Tournament Management
- Create tournaments
- View all tournaments
- View tournament details
- Edit tournament information
- Delete tournaments
- Prevent deletion when teams or matches are still connected to a tournament
- Track tournament status:
  - Upcoming
  - Ongoing
  - Completed

### Team Management
- Register teams
- Assign teams to tournaments
- View registered teams
- Filter teams by tournament
- Edit team information
- Delete teams
- Prevent deletion when a team is currently used in a match

### Match Management
- Schedule matches
- Select teams from a tournament
- View scheduled matches
- Filter matches by tournament
- Edit match information
- Record match scores
- Automatically determine the winner
- Track match status:
  - Scheduled
  - Ongoing
  - Completed
- Delete matches

### Tournament Bracket
BracketHub supports an 8-team tournament structure:

Quarter Finals → Semi Finals → Final → Champion

The system allows only qualified teams to progress to the next round.

- 4 Quarter Final matches
- 2 Semi Final matches
- 1 Final match
- Winner progression
- Tournament champion display

---

## Technology Stack

### Frontend
- Next.js
- React
- JavaScript
- CSS

### Backend
- Next.js REST API
- Node.js

### Database
- MongoDB
- Official MongoDB Node.js Driver

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

---

## Live Demo
BracketHub is deployed on Vercel and connected to MongoDB Atlas.

Live Website:
https://brackethub-psi.vercel.app/
---


## Installation and Setup
### Requirements
- Node.js
- npm
- MongoDB Atlas database
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yephonepyae974-art/brackethub.git
```

### Step 2: Open the Project
```bash
cd brackethub
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Configure Environment Variables
Create a `.env.local` file in the project root.
```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=your_database_name
```
Replace the example values with your own MongoDB Atlas credentials.

### Step 5: Run the Application
```bash
npm run dev
```

### Step 6: Open the Website
Visit:
http://localhost:3000

---

## Deployment
BracketHub is deployed using Vercel.
- Frontend: Next.js
- Backend: Next.js API Routes
- Database: MongoDB Atlas
- Hosting: Vercel
- Source Code: GitHub


## Application Screenshots

### Dashboard
<img width="1470" height="956" alt="Screenshot 2569-10-09 at 6 04 58 PM" src="https://github.com/user-attachments/assets/1b867988-cd7a-453b-89ad-c70cbf1d15a4" />
<img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/03f25815-8392-4b31-8689-b0261f117fea" />


### Tournament Management
![Tournaments](screenshots/tournaments.png)

### Team Management
![Teams](screenshots/teams.png)

### Match Management
![Matches](screenshots/matches.png)

### Tournament Bracket
![Bracket](screenshots/bracket.png)
