const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');
const fs = require('fs');
const path = require('path');

// Helper functions
function getAdmins() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../config/admins.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { ownerId: '', adminIds: [] };
  }
}

function getNoPrefixUsers() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../config/noPrefixUsers.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { userIds: [] };
  }
}

function saveNoPrefixUsers(data) {
  fs.writeFileSync(
    path.join(__dirname, '../config/noPrefixUsers.json'),
    JSON.stringify(data, null, 2)
  );
}

function isAdmin(userId) {
  const admins = getAdmins();
  return userId === admins.ownerId || admins.adminIds.includes(userId);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('noprefix')
    .setDescription('Manage users who can use commands without prefix (Admin only)')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Add User', value: 'add' },
          { name: 'Remove User', value: 'remove' },
          { name: 'List Users', value: 'list' }
        ))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add/remove')
        .setRequired(false)),
  
  async execute(interaction) {
    const ctx = normalizeContext(interaction);
    
    // Check if user is admin
    if (!isAdmin(ctx.user.id)) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Only admins can use this command!`)], 
        ephemeral: true 
      });
    }
    
    const action = ctx.getStringOption('action');
    
    if (!action || !['add', 'remove', 'list'].includes(action.toLowerCase())) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Please provide a valid action: add, remove, or list!`)], 
        ephemeral: true 
      });
    }
    
    try {
      const noPrefixData = getNoPrefixUsers();
      
      if (action === 'list') {
        if (noPrefixData.userIds.length === 0) {
          return ctx.reply({ 
            embeds: [infoEmbed(`${emojis.info} No users have no-prefix access.`)]
          });
        }
        
        const userList = noPrefixData.userIds.map((id, index) => `${index + 1}. <@${id}> (${id})`).join('\n');
        return ctx.reply({ 
          embeds: [infoEmbed(`**Users with No-Prefix Access:**\n\n${userList}`)]
        });
      }
      
      // For add and remove, we need a user
      let targetUser;
      
      if (ctx.isSlash) {
        targetUser = interaction.options.getUser('user');
      } else {
        // For prefix commands, parse user mention or ID from args
        const userArg = ctx.args[1];
        if (!userArg) {
          return ctx.reply({ 
            embeds: [errorEmbed(`${emojis.error} Please mention a user or provide their ID!`)], 
            ephemeral: true 
          });
        }
        
        // Try to extract user ID from mention or use as-is
        const userId = userArg.replace(/[<@!>]/g, '');
        try {
          targetUser = await ctx.client.users.fetch(userId);
        } catch (error) {
          return ctx.reply({ 
            embeds: [errorEmbed(`${emojis.error} Could not find that user!`)], 
            ephemeral: true 
          });
        }
      }
      
      if (!targetUser) {
        return ctx.reply({ 
          embeds: [errorEmbed(`${emojis.error} Please specify a user!`)], 
          ephemeral: true 
        });
      }
      
      if (action === 'add') {
        if (noPrefixData.userIds.includes(targetUser.id)) {
          return ctx.reply({ 
            embeds: [errorEmbed(`${emojis.error} ${targetUser.tag} already has no-prefix access!`)], 
            ephemeral: true 
          });
        }
        
        noPrefixData.userIds.push(targetUser.id);
        saveNoPrefixUsers(noPrefixData);
        
        return ctx.reply({ 
          embeds: [successEmbed(`${emojis.success} Added ${targetUser.tag} to no-prefix users!`)]
        });
      }
      
      if (action === 'remove') {
        const index = noPrefixData.userIds.indexOf(targetUser.id);
        if (index === -1) {
          return ctx.reply({ 
            embeds: [errorEmbed(`${emojis.error} ${targetUser.tag} doesn't have no-prefix access!`)], 
            ephemeral: true 
          });
        }
        
        noPrefixData.userIds.splice(index, 1);
        saveNoPrefixUsers(noPrefixData);
        
        return ctx.reply({ 
          embeds: [successEmbed(`${emojis.success} Removed ${targetUser.tag} from no-prefix users!`)]
        });
      }
    } catch (error) {
      console.error(error);
      await ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error managing no-prefix users: ${error.message}`)]
      });
    }
  },
};
