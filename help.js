const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emojis } = require('../config/emojis');
const { normalizeContext, PREFIX, PREFIXES } = require('../utils/commandHelper');

const commandCategories = {
  playback: {
    title: `${emojis.play} Playback Controls`,
    description: 'Commands to control music playback.',
    commands: [
      { name: 'play <song>', description: 'Play a song or playlist', example: 'play Despacito' },
      { name: 'pause', description: 'Pause the current song', example: 'pause' },
      { name: 'resume', description: 'Resume playback', example: 'resume' },
      { name: 'skip', description: 'Skip to the next song', example: 'skip' },
      { name: 'stop', description: 'Stop and clear the queue', example: 'stop' }
    ]
  },
  queue: {
    title: `${emojis.queue} Queue Management`,
    description: 'Commands to manage the music queue.',
    commands: [
      { name: 'queue', description: 'View the current queue', example: 'queue' },
      { name: 'nowplaying', description: 'Show current song details', example: 'nowplaying' },
      { name: 'shuffle', description: 'Shuffle the queue', example: 'shuffle' }
    ]
  },
  settings: {
    title: `${emojis.settings} Settings`,
    description: 'Commands to adjust settings.',
    commands: [
      { name: 'volume <0-100>', description: 'Adjust volume (0-100%)', example: 'volume 50' },
      { name: 'loop <Off/Song/Queue>', description: 'Set loop mode', example: 'loop Song' },
      { name: 'noprefix <add/remove/list> <user>', description: 'Manage no-prefix users (Admin only)', example: 'noprefix add @user' },
      { name: 'help', description: 'Show this help menu', example: 'help' }
    ]
  }
};

const createHelpEmbed = (ctx, page) => {
  const categoryKeys = Object.keys(commandCategories);
  const category = categoryKeys[page];
  const prefix = ctx.isSlash ? '/' : PREFIX;
  const prefixInfo = ctx.isSlash ? '**Prefix:** `/`' : (PREFIXES.length > 1 ? `**Prefixes:** \`${PREFIXES.join('` `')}\`` : `**Prefix:** \`${PREFIX}\``);

  const embed = new EmbedBuilder()
    .setColor('#9B59B6')
    .setAuthor({
      name: 'Music Bot Help',
      iconURL: 'https://i.imgur.com/tQfGnLe.png'
    })
    .setTitle(commandCategories[category].title)
    .setDescription(commandCategories[category].description + `\n\n${prefixInfo}`)
    .addFields(
      commandCategories[category].commands.map(cmd => ({
        name: `${prefix}${cmd.name}`,
        value: `${cmd.description}\n*Example:* \`${prefix}${cmd.example}\``,
        inline: false
      }))
    )
    .setFooter({
      text: `Requested by ${ctx.user.username} • Page ${page + 1} of ${categoryKeys.length}`,
      iconURL: ctx.user.displayAvatarURL({ dynamic: true })
    })
    .setTimestamp()
    .setThumbnail('https://i.imgur.com/tQfGnLe.png');

  return embed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available music commands'),

  async execute(interaction) {
    const ctx = normalizeContext(interaction);
    let currentPage = 0;

    const embed = createHelpEmbed(ctx, currentPage);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === Object.keys(commandCategories).length - 1)
      );

    await ctx.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const filter = i => i.user.id === ctx.user.id;
    const replyMsg = await ctx.fetchReply();
    
    if (!replyMsg) {
      return;
    }
    
    const collector = ctx.channel.createMessageComponentCollector({ 
      filter, 
      time: 60000,
      message: replyMsg
    });

    collector.on('collect', async i => {
      if (i.customId === 'prev') {
        currentPage--;
      } else if (i.customId === 'next') {
        currentPage++;
      }

      const newEmbed = createHelpEmbed(ctx, currentPage);
      await i.update({ 
        embeds: [newEmbed], 
        components: [row] 
      });

      // Update button states
      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === Object.keys(commandCategories).length - 1);
    });

    collector.on('end', async () => {
      const message = await ctx.fetchReply();
      if (message) {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            ButtonBuilder.from(row.components[0]).setDisabled(true),
            ButtonBuilder.from(row.components[1]).setDisabled(true)
          );
        if (ctx.isSlash) {
          await interaction.editReply({ components: [disabledRow] }).catch(() => {});
        } else {
          await message.edit({ components: [disabledRow] }).catch(() => {});
        }
      }
    });
  },
};
