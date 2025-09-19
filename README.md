# ClubHub

ClubHub is a comprehensive platform for managing student clubs, designed to streamline club operations, member management, event planning, and more. Below is a detailed overview of its features and current development status.

## Features

### 1. Club Creation & Authentication
- **Create Club:** Register new clubs with unique credentials and club information.
- **Club Login:** Secure login for club owners using username and password.

### 2. Member Management
- **Recruit Members:** Custom form validation and recruitment process for new members.
- **Pending Members:** New applicants are added as pending members, requiring approval.
- **Accept/Reject Applicants:** Club owners can accept or reject member applications, updating their status and role.
- **Role Assignment:** Assign roles to members (e.g., President, Vice President, Member).
- **Member List:** View and manage all club members, including pending and active members.

### 3. Club Information & Settings
- **Edit Club Info:** Update club name, type, contact details, and other information.
- **Additional Info:** Add goals and requirements for the club.
- **Contact Info:** Manage club phone, email, and social media links.
- **Settings:** Configure maximum members, meeting location, and meeting frequency.
- **Status Toggle:** Activate or deactivate club status.
- **Member Recruitment Toggle:** Enable or disable member recruitment.

### 4. Event Management
- **Create Events:** Add new events with name, type, date, and time.
- **Upcoming Events:** View a list of upcoming club events in a dedicated panel.

### 5. AI-Generated Tasks
- **Task Generation:** Use Cohere AI to generate actionable club tasks based on club info, goals, and description.
- **Task List:** Display AI-generated tasks in the dashboard for club members.

### 6. Real-Time Updates
- **Socket.io Integration:** Real-time updates for club data, member changes, and events.

### 7. Club Deletion
- **Delete Club:** Club owners can delete their club, removing all associated data.

### 8. Dashboard & UI
- **Student Dashboard:** View club details, members, events, and tasks.
- **Manage Club Dashboard:** Comprehensive control panel for club owners.
- **Responsive Design:** Modern, mobile-friendly UI using EJS and custom CSS.

## Incomplete / Planned Features

- **Notifications:** Real-time notifications for member applications, event reminders, and club updates.
- **Email Integration:** Automated emails for recruitment, event invites, and announcements.
- **Advanced AI Models:** Support for more advanced or instruction-following models for better task generation.
- **Member Profiles:** Detailed member profiles with activity history and achievements.

## Getting Started

1. Clone the repository and install dependencies:
   ```sh
   git clone <repo-url>
   cd ClubHub
   npm install
   ```
2. Set up your `.env` file with Firebase and Cohere AI API credentials.
3. Start the server:
   ```sh
   node server.js
   ```
4. Access the dashboard at `http://localhost:3000`.

## Technologies Used
- Node.js
- Express.js
- Firebase Admin SDK
- Socket.io
- Cohere AI API
- EJS Templating
- Custom CSS

## Contributing
Contributions are welcome! Please submit issues or pull requests for bug fixes, new features, or improvements.

## License
MIT
