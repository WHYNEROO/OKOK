# Configuration Guide

## Setting Up Admin Access

To use the `noprefix` command, you need to configure admin users first.

### Steps:

1. **Get your Discord User ID:**
   - Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
   - Right-click your username and select "Copy ID"

2. **Edit `config/admins.json`:**
   ```json
   {
     "ownerId": "YOUR_USER_ID_HERE",
     "adminIds": [
       "ADMIN_USER_ID_1",
       "ADMIN_USER_ID_2"
     ]
   }
   ```

   - `ownerId`: The bot owner's Discord user ID
   - `adminIds`: Array of additional admin user IDs

### Example:
```json
{
  "ownerId": "123456789012345678",
  "adminIds": [
    "234567890123456789",
    "345678901234567890"
  ]
}
```

## No-Prefix Users

The `config/noPrefixUsers.json` file is automatically managed by the bot through the `noprefix` command. You don't need to edit it manually.

### Using the noprefix command:

Only admins (owner and admin IDs) can use this command:

- **Add a user:** `!noprefix add @user` or `/noprefix add @user`
- **Remove a user:** `!noprefix remove @user` or `/noprefix remove @user`
- **List all no-prefix users:** `!noprefix list` or `/noprefix list`

Users with no-prefix access can use commands without any prefix:
- Regular user: `!play Despacito`
- No-prefix user: `play Despacito` (or still use `!play Despacito`)
