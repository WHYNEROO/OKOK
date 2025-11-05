const { SlashCommandBuilder } = require('@discordjs/builders');
const { errorEmbed } = require('../utils/embeds');
const { queueEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue'),
  
  async execute(interaction) {
    const ctx = normalizeContext(interaction);
    const queue = ctx.client.distube.getQueue(ctx.guildId);
    
    // Check if there's a queue
    if (!queue || !queue.songs || queue.songs.length === 0) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} There is nothing playing right now!`)], 
        ephemeral: true 
      });
    }
    
    try {
      await ctx.reply({ 
        embeds: [queueEmbed(queue)]
      });
    } catch (error) {
      console.error(error);
      await ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error displaying queue: ${error.message}`)]
      });
    }
  },
}; 