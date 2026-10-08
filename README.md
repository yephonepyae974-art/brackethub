# BracketHub

BracketHub is a web-based E-sports Tournament Management System built with Next.js and MongoDB.

The system allows tournament organizers to create tournaments, register teams, schedule matches, record match results, and track tournament progress through a tournament bracket.

Visitors can also view tournaments, participating teams, match results, and tournament brackets.

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

## Main Data Models

BracketHub uses three main MongoDB collections.

### Tournament

Example fields:

```text
name
game
description
startDate
endDate
status
createdAt
updatedAt
