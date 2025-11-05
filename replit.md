# Discord DisTube Music Bot

## Overview
A feature-rich Discord music bot using DisTube with slash commands, beautiful embeds, and comprehensive error handling. The bot can play music from YouTube, Spotify, SoundCloud, and more.

## Recent Changes
- **2025-11-05**: Added no-prefix system and admin management
  - Created admin configuration system (owner + admin IDs)
  - Added `noprefix` command for admins to manage no-prefix users
  - Users with no-prefix access can use commands without any prefix
  - Updated help menu to include noprefix command
- **2025-11-05**: Added prefix command support and mention response feature
  - Implemented text-based commands with `!` prefix alongside slash commands
  - Added bot mention response showing prefix and help command
  - Updated all commands to work with both slash and prefix commands
  - Created command context normalization system
- **2025-11-05**: Initial import and setup in Replit environment
  - Installed Node.js 20 and FFmpeg system dependencies
  - Installed npm dependencies including discord.js, DisTube, and related plugins
  - Configured for Replit environment

## Project Architecture

### Structure
- `index.js` - Main entry point, initializes Discord client and DisTube
- `commands/` - Slash command implementations (play, pause, skip, etc.)
- `events/` - Discord event handlers (interactionCreate, ready)
- `utils/` - Utility functions for embeds and DisTube events
- `config/` - Configuration files (emojis)

### Key Dependencies
- **discord.js v14** - Discord API wrapper
- **DisTube v5** - Music bot framework
- **FFmpeg** - Audio processing (system dependency)
- **Plugins**: Spotify, SoundCloud, YtDlp

### Features
- **Triple command system**: Slash commands (/), prefix commands (`!`), and no-prefix for specific users
- **Admin system**: Owner and admin users can manage no-prefix access
- **Bot mention response**: Tag the bot to see its prefix and get help
- Queue management with loop and shuffle
- Volume control
- Support for YouTube, Spotify, and SoundCloud
- Beautiful embeds with custom emojis
- Comprehensive error handling and fallbacks

## Required Secrets
- `TOKEN` - Discord bot token (get from Discord Developer Portal)
- `CLIENT_ID` - Discord application client ID

## Configuration Files
- `config/admins.json` - Owner and admin user IDs (see config/README.md for setup)
- `config/noPrefixUsers.json` - Users who can use commands without prefix (managed via `/noprefix`)
- `config/emojis.js` - Custom emoji configuration

## Running the Bot
The bot runs via `npm start` which executes `node index.js`. On startup, it:
1. Loads environment variables from .env
2. Initializes Discord client with required intents
3. Sets up DisTube with plugins
4. Loads slash commands from the commands directory
5. Registers slash commands globally
6. Connects to Discord

## Admin Setup
To use the `noprefix` command, you must configure admin IDs in `config/admins.json`.
See `config/README.md` for detailed setup instructions.

## User Preferences
None configured yet.
