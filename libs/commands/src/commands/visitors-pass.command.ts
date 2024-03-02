import { BaseGuildTextChannel } from 'discord.js';
import { Duration } from 'luxon';
import { ISlashInteraction } from '@cmnw/commands/types';
import {
  VISITORS_CHANNEL_ENUM,
  VISITORS_EXP_ENUM,
  VISITORS_PASS,
  VISITORS_PASS_ENUM,
  VISITORS_TEMP_ENUM,
  VISITORS_USER_ENUM,
} from '@cmnw/commands';

export const visitorsPassCommand: ISlashInteraction = {
  name: VISITORS_PASS_ENUM.NAME,
  description: VISITORS_PASS_ENUM.DESCRIPTION,
  slashCommand: VISITORS_PASS,

  executeInteraction: async function ({ interaction, logger, redis }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      const { options, guild } = interaction;

      const [userId, temporary, expMinutes, channel] = [
        options.getString(VISITORS_USER_ENUM.NAME, true),
        options.getBoolean(VISITORS_TEMP_ENUM.NAME, true),
        options.getString(VISITORS_EXP_ENUM.NAME, false),
        options.getChannel(VISITORS_CHANNEL_ENUM.NAME, false),
      ];

      const minutes = Number(expMinutes) || 1440;
      const maxAge = Duration.fromObject({
        minutes,
      }).toMillis();

      const inviteChannel = channel ? channel : guild.systemChannel;

      const isNotJoin = channel && 'joinable' in channel && !channel.joinable;
      if (isNotJoin) {
        throw new Error(`Channel ${channel.id} doesn't support joins`);
      }

      const invite = await (inviteChannel as BaseGuildTextChannel).createInvite(
        {
          maxUses: 1,
          maxAge: maxAge,
          temporary,
        },
      );

      // TODO write to redis or invite;

      const toJson = invite.toString();

      await redis.set(`${REDIS_KEYS.INGRESS}#${userId}`, toJson, 'EX', maxAge);
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
