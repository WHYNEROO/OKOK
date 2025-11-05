const { SlashCommandBuilder } = require('@discordjs/builders');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change the volume of the music')
    .addIntegerOption(option =>
      option.setName('percentage')
        .setDescription('Volume percentage (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)),
  
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
    
    const volumePercentage = ctx.getIntegerOption('percentage');
    
    if (volumePercentage === null || volumePercentage < 0 || volumePercentage > 100) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Please provide a valid volume (0-100)!`)], 
        ephemeral: true 
      });
    }
    
    try {
      queue.setVolume(volumePercentage);
      
      // Choose appropriate emoji based on volume level
      let volumeEmoji = emojis.volume;
      if (volumePercentage === 0) {
        volumeEmoji = emojis.mute;
      } else if (volumePercentage < 50) {
        volumeEmoji = emojis.volume;
      }
      
      await ctx.reply({ 
        embeds: [successEmbed(`${volumeEmoji} Volume set to: **${volumePercentage}%**`)]
      });
    } catch (error) {
      console.error(error);
      await ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Error changing volume: ${error.message}`)]
      });
    }
  },
}; 