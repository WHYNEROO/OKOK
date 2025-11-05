const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playing music and clear the queue'),
  
  async execute(interaction) {
    const ctx = normalizeContext(interaction);
    const voiceChannel = ctx.member.voice.channel;
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in a voice channel to use this command!`)], 
        ephemeral: true 
      });
    }
    
    const queue = ctx.client.distube.getQueue(ctx.guildId);
    
    // Check if there's a queue
    if (!queue) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} There is nothing playing right now!`)], 
        ephemeral: true 
      });
    }
    
    try {
      await queue.stop();
      await ctx.reply({ 
        embeds: [successEmbed(`${emojis.stop} Stopped playing music and cleared the queue!`)]
      });
    } catch (error) {
      console.error(error);
      await ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error stopping music: ${error.message}`)]
      });
    }
  },
}; 