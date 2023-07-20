import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { Prompts, Fefenya } from '@cmnw/mongo';
import {
  COMMAND_DESCRIPTION_ENUMS,
  COMMAND_ENUMS,
  SlashCommand,
} from '@cmnw/commands';

import {
  ChatFlowDto,
  chatQueue,
  cryptoRandomIntBetween,
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  GOTD_SELECTED_FLOW,
  gotdGreeter,
  gotdSelected,
  pickRandomFefenyaUser,
  prettyGotd,
  prettyReply,
  ROLE_TAGS_ENUM,
  waitForDelay,
} from '@cmnw/core';

export const gotdCommand: SlashCommand = {
  name: COMMAND_ENUMS.FEFENYA_GOTD,
  description: COMMAND_DESCRIPTION_ENUMS.FEFENYA_GOTD,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTD)
    .setDescription(FEFENYA_DESCRIPTION.GOTD),

  executeInteraction: async function ({ interaction, logger, models, rabbit }) {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${FEFENYA_COMMANDS.GOTD} has been triggered`);

      let fefenyaUser = await models.usersFefenyaModel.findOne<Fefenya>({
        guildId: interaction.guildId,
        isGotd: true,
      });

      if (fefenyaUser) {
        const greetingSelectedFlow = GOTD_SELECTED_FLOW.random();

        await interaction.reply({
          content: gotdSelected(greetingSelectedFlow, fefenyaUser.username),
          ephemeral: false,
        });

        return;
      }

      logger.debug(
        `Selecting gay lord of the day from: ${interaction.guild.id}`,
      );

      await interaction.deferReply();

      fefenyaUser = await pickRandomFefenyaUser(
        models.usersFefenyaModel,
        interaction.guildId,
      );

      logger.log(
        `Fefenya pre-pick user as a gaylord: ${fefenyaUser._id} :: ${fefenyaUser.username}`,
      );

      const prompts = await models.prompts
        .find<Prompts>({
          tags: {
            $all: [
              ROLE_TAGS_ENUM.FEFENYA,
              ROLE_TAGS_ENUM.CONTEST,
              ROLE_TAGS_ENUM.FLOW_2,
            ],
          },
          position: { $in: [0, 1] },
        })
        .sort({ position: 1 });

      const chatFlow = ChatFlowDto.fromPromptsFlow(prompts);

      const response = await rabbit.request<string>({
        exchange: chatQueue.name,
        routingKey: 'v4',
        payload: chatFlow,
        timeout: 60 * 1000,
      });

      const names = [
        'Фефеня',
        'Ефхеня',
        'Фефеничная',
        'Расфуфеня',
        'ваша любимая и неподраждаемая Фефенадзе',
        'Ева Фефенистая',
      ];
      const i = cryptoRandomIntBetween(0, names.length - 1);
      const replies = prettyGotd(response, names[i]);
      const reply = replies.shift();
      const userTag = gotdGreeter(fefenyaUser._id);
      await interaction.editReply(reply);

      for (const replyBack of replies) {
        await (interaction.channel as TextChannel).send({
          content: prettyReply(replyBack),
        });
        const randomInt = cryptoRandomIntBetween(3, 70);
        await waitForDelay(randomInt);
      }

      await interaction.channel.send(userTag);
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
