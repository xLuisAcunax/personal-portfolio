# SaaS Portfolio Enhancement

This portfolio website has been enhanced with SaaS (Software as a Service) functionality using Prisma ORM and SQLite database.

## 🆕 New Features

### 1. Database Integration
- **Prisma ORM** for type-safe database operations
- **SQLite** database for local development
- Database models for Users, Projects, Contacts, and Analytics

### 2. API Routes
- `POST/GET /api/contact` - Handle contact form submissions and retrieve statistics
- `POST/GET /api/analytics` - Track and retrieve analytics data
- `POST/GET /api/projects` - Manage user projects (CRUD operations)

### 3. Admin Dashboard
- Visit `/admin` to access the SaaS management dashboard
- View contact form statistics
- Monitor analytics events
- Track user engagement

### 4. Enhanced Contact Form
- Contact submissions are now stored in the database
- Real-time analytics tracking
- Success/error handling with feedback

### 5. Analytics Tracking
- Automatic page view tracking
- Contact form interaction analytics
- User behavior insights

## 🚀 Database Schema

### Users
- User account management
- Email-based identification
- Related projects and contacts

### UserProjects
- User-specific project management
- Technology stack tracking
- Public/private project visibility
- Project status management

### Contacts
- Contact form submissions storage
- Status tracking (new, read, replied, archived)
- Optional user association

### Analytics
- Event-based tracking system
- Custom data storage
- User agent and IP tracking

## 🛠️ Setup Instructions

1. **Environment Configuration**
   ```bash
   # Copy .env.example to .env and configure
   DATABASE_URL="file:./dev.db"
   ```

2. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

3. **Development**
   ```bash
   # Start development server
   npm run dev
   
   # Access admin dashboard
   open http://localhost:4321/admin
   ```

## 📊 API Examples

### Contact Form Submission
```javascript
fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello world!'
  })
})
```

### Analytics Tracking
```javascript
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'button_click',
    data: { button: 'download_cv' }
  })
})
```

### Project Management
```javascript
fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My New Project',
    description: 'Project description',
    techStack: ['React', 'Node.js'],
    userId: 'user-id',
    isPublic: true
  })
})
```

## 🔧 Available Scripts

- `npm run setup` - Run initial setup
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database

## 🌐 Deployment Considerations

For production deployment:

1. **Database**: Consider upgrading to PostgreSQL or MySQL
2. **Environment**: Set production environment variables
3. **Authentication**: Implement proper user authentication
4. **Security**: Add rate limiting and input validation
5. **Monitoring**: Set up proper logging and monitoring

## 🔐 Security Features

- Input validation using Zod schemas
- SQL injection protection via Prisma
- Rate limiting ready for implementation
- Environment variable configuration
- Error handling and logging

This enhanced portfolio now serves as a foundation for building SaaS applications with user management, data persistence, and analytics tracking capabilities.