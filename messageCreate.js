/**
 * Message event handler for prefix commands
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const { Events } = require('discord.js');
const { errorEmbed, infoEmbed } = require('../utils/embeds');
const fs = require('fs');
const path = require('path');

const PREFIXES = ['!'];

// Load no-prefix users
function getNoPrefixUsers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../config/noPrefixUsers.json'), 'utf8');
    return JSON.parse(data).userIds || [];
  } catch (error) {
    return [];
  }
}

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore bots
    if (message.author.bot) return;
    
    console.log(`[DEBUG] Received message: "${message.content}" from ${message.author.tag}`);
    
    // Handle bot mentions
    if (message.mentions.has(message.client.user)) {
      const prefixText = PREFIXES.length > 1 ? `My prefixes are \`${PREFIXES.join('` `')}\`` : `My prefix is \`${PREFIXES[0]}\``;
      return message.reply({ 
        embeds: [infoEmbed(`👋 Hey ${message.author}! ${prefixText}\nUse \`${PREFIXES[0]}help\` to see all available commands!`)]
      });
    }
    
    // Check for no-prefix users
    const noPrefixUsers = getNoPrefixUsers();
    const isNoPrefixUser = noPrefixUsers.includes(message.author.id);
    
    console.log(`[DEBUG] Is no-prefix user: ${isNoPrefixUser}, No-prefix users: ${noPrefixUsers.length}`);
    
    let usedPrefix = null;
    let content = message.content;
    
    if (isNoPrefixUser) {
      // For no-prefix users, check if they used a prefix or not
      const foundPrefix = PREFIXES.find(prefix => message.content.startsWith(prefix));
      if (foundPrefix) {
        usedPrefix = foundPrefix;
        content = message.content.slice(foundPrefix.length).trim();
      } else {
        // No prefix used, treat entire message as command
        usedPrefix = '';
        content = message.content.trim();
      }
    } else {
      // Regular users must use a prefix
      usedPrefix = PREFIXES.find(prefix => message.content.startsWith(prefix));
      if (!usedPrefix) return;
      content = message.content.slice(usedPrefix.length).trim();
    }
    
    // Parse command and arguments
    const args = content.split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    console.log(`[DEBUG] Command: ${commandName}, Args: [${args.join(', ')}]`);
    
    // Get the command
    const command = message.client.commands.get(commandName);
    
    if (!command) {
      console.log(`[DEBUG] Command not found: ${commandName}`);
      return;
    }
    
    console.log(`[DEBUG] Executing command: ${commandName}`);
    
    try {
      // Create a context object that works like interaction
      const context = {
        isSlash: false,
        message,
        member: message.member,
        guild: message.guild,
        channel: message.channel,
        author: message.author,
        client: message.client,
        args,
        reply: async (content) => {
          const reply = await message.reply(content);
          context.sentMessage = reply;
          return reply;
        },
        deferReply: async () => {
          context.deferred = true;
          context.deferredMsg = await message.channel.send({ embeds: [infoEmbed('⏳ Processing...')] });
          return context.deferredMsg;
        },
        editReply: async (content) => {
          if (context.deferred && context.deferredMsg) {
            return context.deferredMsg.edit(content);
          }
          if (context.sentMessage) {
            return context.sentMessage.edit(content);
          }
          return message.reply(content);
        },
        followUp: async (content) => {
          return message.channel.send(content);
        },
        fetchReply: async () => {
          if (context.deferred && context.deferredMsg) {
            return context.deferredMsg;
          }
          if (context.sentMessage) {
            return context.sentMessage;
          }
          return null;
        },
        options: {
          getString: (name) => {
            // For play command, join all args; for other commands return first arg
            if (commandName === 'play' || commandName === 'search') {
              return args.join(' ') || null;
            }
            return args[0] || null;
          },
          getInteger: (name) => {
            const num = parseInt(args[0]);
            return isNaN(num) ? null : num;
          },
          get: (name) => args.join(' ') || null,
        },
        guildId: message.guild?.id,
        replied: false,
        deferred: false,
      };
      
      await command.execute(context);
    } catch (error) {
      console.error(`Error executing ${commandName}`);
      console.error(error);
      
      await message.reply({ 
        embeds: [errorEmbed('There was an error while executing this command!')]
      });
    }
  },
};
