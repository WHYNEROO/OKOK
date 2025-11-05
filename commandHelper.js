/**
 * Command helper utility to support both slash and prefix commands
 * Made by Friday and Powered By Cortex Realm
 * Support Server: https://discord.gg/EWr3GgP6fe
 */

const PREFIXES = ['!'];
const PREFIX = PREFIXES[0];

/**
 * Normalizes context for both slash and prefix commands
 */
function normalizeContext(ctx) {
  const isSlash = ctx.isChatInputCommand && ctx.isChatInputCommand();
  
  if (isSlash) {
    return {
      isSlash: true,
      user: ctx.user,
      member: ctx.member,
      guild: ctx.guild,
      channel: ctx.channel,
      client: ctx.client,
      guildId: ctx.guildId,
      args: [],
      getStringOption: (name) => ctx.options.getString(name),
      getIntegerOption: (name) => ctx.options.getInteger(name),
      reply: async (content) => {
        return ctx.reply(content);
      },
      deferReply: async () => {
        return ctx.deferReply();
      },
      editReply: async (content) => {
        return ctx.editReply(content);
      },
      followUp: async (content) => {
        return ctx.followUp(content);
      },
      fetchReply: async () => {
        return ctx.fetchReply();
      },
    };
  } else {
    return {
      isSlash: false,
      user: ctx.author,
      member: ctx.member,
      guild: ctx.guild,
      channel: ctx.channel,
      client: ctx.client,
      guildId: ctx.guildId,
      args: ctx.args || [],
      getStringOption: (name) => ctx.args && ctx.args.length > 0 ? ctx.args[0] : null,
      getIntegerOption: (name) => {
        if (ctx.args && ctx.args.length > 0) {
          const num = parseInt(ctx.args[0]);
          return isNaN(num) ? null : num;
        }
        return null;
      },
      reply: async (content) => {
        return ctx.reply(content);
      },
      deferReply: async () => {
        return ctx.deferReply();
      },
      editReply: async (content) => {
        return ctx.editReply(content);
      },
      followUp: async (content) => {
        return ctx.followUp(content);
      },
      fetchReply: async () => {
        return ctx.fetchReply();
      },
    };
  }
}

/**
 * Update help command text to show prefix
 */
function updateHelpText(text) {
  return text.replace(/\//g, PREFIX);
}

module.exports = {
  normalizeContext,
  updateHelpText,
  PREFIX,
  PREFIXES,
};
