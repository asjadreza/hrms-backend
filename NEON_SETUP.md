# Setting up Neon DB for HRMS Lite

## Step-by-Step Guide

### 1. Create a Neon Account
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up for a free account (no credit card required)

### 2. Create a New Project
1. After logging in, click **"Create a project"**
2. Choose a project name (e.g., "HRMS Lite")
3. Select a region closest to you
4. Choose PostgreSQL version (latest is recommended)
5. Click **"Create project"**

### 3. Get Your Connection String
1. Once your project is created, you'll see the **Project Dashboard**
2. Click the **"Connect"** button
3. In the **"Connect to your database"** modal:
   - Select your branch (usually `main`)
   - Select your database (default database name is usually `neondb`)
   - Select your role (default role is usually your username)
   - **Keep "Connection pooling" enabled** (recommended for better performance)
4. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

### 4. Update Your .env.local File
1. Open `backend/.env.local`
2. Replace the `DATABASE_URL` value with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-username:your-password@ep-xxxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
   PORT=5000
   ```

### 5. Run Database Migrations
After updating your `.env.local` file, run:

```bash
cd backend
npm run generate  # Generate Prisma Client
npm run migrate   # Run database migrations
```

### 6. Verify Connection
You can verify your connection by running:

```bash
cd backend
npm run dev
```

If the server starts without errors, your connection is working!

## Important Notes

- **SSL Required**: Neon requires SSL connections. Make sure your connection string includes `?sslmode=require`
- **Connection Pooling**: Use the pooled connection (with `-pooler` in the hostname) for better performance and to handle more concurrent connections
- **Free Tier Limits**: Neon's free tier includes:
  - 0.5 GB storage
  - Limited compute hours
  - Perfect for development and small projects

## Troubleshooting

### Connection Errors
- Make sure your connection string includes `?sslmode=require`
- Verify your password is correct (it's shown in the connection string)
- Check that your IP isn't blocked (Neon allows all IPs by default)

### Migration Errors
- Ensure Prisma Client is generated: `npm run generate`
- Check that your DATABASE_URL is correctly formatted
- Verify you have the correct database name in your connection string

## Need Help?
- [Neon Documentation](https://neon.tech/docs)
- [Neon Discord Community](https://discord.gg/92vNTzKDGp)
