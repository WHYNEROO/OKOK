const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),
  
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
      if (!queue.paused) {
        return ctx.reply({ 
          embeds: [errorEmbed(`${emojis.warning} The music is already playing!`)], 
          ephemeral: true 
        });
      }
      
      queue.resume();
      await ctx.reply({ 
        embeds: [successEmbed(`${emojis.play} Resumed the music!`)]
      });
    } catch (error) {
      console.error(error);
      await ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error resuming music: ${error.message}`)]
      });
    }
  },
}; 