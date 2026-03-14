# MuzikaX - Rwanda's Digital Music Ecosystem

MuzikaX is a digital music platform connecting creators (artists, DJs, producers) with fans in Rwanda and beyond.

## Tech Stack

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- TypeScript
- AWS S3 for file uploads (Presigned URLs)

### Backend
- Node.js
- Express.js
- AWS SDK v3 (S3 Client)
- MongoDB with Mongoose
- JWT Authentication

## Features

### User Roles
1. **Fan (Regular User)**
   - Listen to music
   - Create playlists
   - Like / comment / share tracks
   - Follow creators
   - Get personalized recommendations

2. **Creator (Uploads content)**
   - Artist, DJ, or Producer
   - Upload dashboard
   - Analytics section
   - Profile management
   - Upload music / beats / mixes (to AWS S3)
   - Manage collaborations
   - See followers and stats

3. **Admin**
   - Manage all users
   - Approve/removes content
   - Global analytics dashboard

### Core Functionality
- JWT authentication with refresh token
- Role-based access control
- Audio streaming with player
- Track upload and management with AWS S3 integration (Presigned URLs)
- Creator profiles and analytics
- Social features (following, comments)
- Search and discovery

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- npm or yarn
- AWS Account with S3 Bucket (S3 Express One Zone recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment Variables

#### Backend (.env)
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
Access_Key_ID=your_aws_access_key
Secret_Access_Key=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

#### Frontend (.env.local)
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### AWS S3 Setup
1. Create an AWS S3 Bucket (S3 Express One Zone recommended for performance).
2. Configure CORS for your bucket to allow your frontend domain (e.g., http://localhost:3000).
3. Create an IAM user with `AmazonS3FullAccess` or specific permissions for the bucket.
4. Add the AWS credentials to your backend `.env` file.

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Frontend
Deploy to Vercel for automatic CI/CD:
```bash
npm run build
```

### Backend
Deploy to Render/Railway with environment variables configured.

## Project Structure

```
muzikax/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── .env
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── ...
│   ├── .env.local
│   └── ...
└── README.md
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // fan, creator, admin
  creatorType: String, // artist, dj, producer
  avatar: String,
  bio: String,
  socials: Object,
  followersCount: Number
}
```

### Track Model
```javascript
{
  creatorId: ObjectId,
  creatorType: String,
  title: String,
  description: String,
  audioURL: String,
  coverURL: String,
  genre: String,
  type: String, // song, beat, mix
  plays: Number,
  likes: Number,
  comments: [ObjectId]
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/trending` - Get trending tracks
- `GET /api/tracks/:id` - Get track by ID
- `GET /api/tracks/creator/:creatorId` - Get tracks by creator
- `POST /api/tracks/upload` - Upload new track (creator only)
- `PUT /api/tracks/:id/play` - Increment play count
- `PUT /api/tracks/:id` - Update track (creator only)
- `DELETE /api/tracks/:id` - Delete track (creator/admin only)

### Users (Admin)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/approve` - Approve creator (admin only)

### Creator Analytics
- `GET /api/users/analytics` - Get creator analytics (creator only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue on GitHub.