# Zola.chat + N8N Backend Setup Guide

This guide helps you configure the forked Zola.chat frontend to work with your n8n webhook backend.

## Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# N8N Backend Configuration (REQUIRED)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat

# CSRF Protection (REQUIRED - generate with: openssl rand -hex 32)
CSRF_SECRET=your_csrf_secret_key

# Optional: Disable Ollama if not needed
DISABLE_OLLAMA=true
```

## N8N Webhook Expected Format

Your n8n webhook should expect this JSON payload:

```json
{
  "messages": [
    {
      "role": "user|assistant|system",
      "content": "message content",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "id": "unique_id"
    }
  ],
  "model": "model_name",
  "userId": "user_id",
  "chatId": "chat_id",
  "systemPrompt": "optional_system_prompt"
}
```

Your n8n webhook should respond with:

```json
{
  "message": "AI response message",
  "success": true
}
```

Or for errors:

```json
{
  "message": "",
  "success": false,
  "error": "Error description"
}
```

## Files Modified

1. **lib/encryption.ts** - Removed ENCRYPTION_KEY requirement
2. **lib/n8n-api.ts** - New API service for n8n integration
3. **app/api/chat/route.ts** - Replaced Supabase with n8n webhook calls
4. **N8N_SETUP.md** - This setup guide

## Features Removed/Simplified

- ✅ BYOK (Bring Your Own Key) - simplified/removed
- ✅ Supabase authentication - removed
- ✅ Message persistence - now using in-memory storage (replace as needed)
- ✅ User management - simplified
- ✅ File attachments - removed (can be re-added to n8n webhook)
- ✅ Rate limiting - removed (implement in n8n if needed)

## Next Steps

1. **Set up your environment variables** in `.env.local`
2. **Configure your n8n webhook** to match the expected format above
3. **Test the integration** by starting the app with `npm run dev`
4. **Replace in-memory storage** with your preferred persistence layer
5. **Remove unused API routes** (see below)

## API Routes to Remove (Optional)

Since you're using n8n backend, you can delete these API routes:

- `app/api/user-keys/` - BYOK functionality
- `app/api/user-preferences/` - User preferences
- `app/api/projects/` - Project management
- `app/api/create-chat/` - Chat creation
- `app/api/rate-limits/` - Rate limiting
- `app/api/providers/` - Provider management

## Testing

1. Start your n8n instance with the webhook configured
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000
4. Try sending a message - it should call your n8n webhook

## Troubleshooting

- **"Cannot find module 'crypto'"** - Run `npm install --save-dev @types/node`
- **N8N connection fails** - Check N8N_WEBHOOK_URL is correct and n8n is running
- **CSRF errors** - Make sure CSRF_SECRET is set in .env.local 