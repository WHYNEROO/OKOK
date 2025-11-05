const { SlashCommandBuilder } = require('@discordjs/builders');
const { infoEmbed, errorEmbed } = require('../utils/embeds');
const { emojis } = require('../config/emojis');
const { normalizeContext } = require('../utils/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The song URL or search query')
        .setRequired(true)),
  
  async execute(interaction) {
    const ctx = normalizeContext(interaction);
    const query = ctx.getStringOption('query');
    const voiceChannel = ctx.member.voice.channel;
    
    if (!query || query.trim() === '') {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} Please provide a song name or URL!`)], 
        ephemeral: true 
      });
    }
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} You need to be in a voice channel to use this command!`)], 
        ephemeral: true 
      });
    }
    
    // Check bot permissions
    const permissions = voiceChannel.permissionsFor(ctx.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return ctx.reply({ 
        embeds: [errorEmbed(`${emojis.error} I need permissions to join and speak in your voice channel!`)], 
        ephemeral: true 
      });
    }
    
    // Defer reply since playing music might take some time
    await ctx.deferReply();
    
    try {
      // Set textChannel for DisTube events
      const queue = ctx.client.distube.getQueue(ctx.guildId);
      if (!queue) {
        ctx.client.distube.voices.join(voiceChannel);
      }
      
      await ctx.client.distube.play(voiceChannel, query, {
        member: ctx.member,
        textChannel: ctx.channel,
        metadata: { interaction: ctx.isSlash ? interaction : null }
      });
      
      // Edit the deferred reply
      await ctx.editReply({ 
        embeds: [infoEmbed(`${emojis.search} Searching for: \`${query}\``)]
      });
    } catch (error) {
      console.error(error);
      await ctx.editReply({ 
        embeds: [errorEmbed(`${emojis.error} Error playing music: ${error.message}`)]
      });
    }
  },
}; 