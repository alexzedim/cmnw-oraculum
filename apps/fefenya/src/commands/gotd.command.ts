import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { Repository } from 'typeorm';
import { FefenyaUsersEntity } from '@cmnw/pg';
import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  FEFENYA_STORAGE_KEYS,
  GOTD_GREETING_FLOW,
  GOTD_SELECTED_FLOW,
  gotdGreeter,
  gotdSelected,
  ISlashCommand,
  ISlashCommandArgs,
  cryptoRandomIntBetween,
} from '@cmnw/shared';

export const gotdCommand: ISlashCommand = {
  name: FEFENYA_COMMANDS.GOTD,
  description: FEFENYA_DESCRIPTION.GOTD,
  guildOnly: true,
  slashCommand: new SlashCommandBuilder()
    .setName(FEFENYA_COMMANDS.GOTD)
    .setDescription(FEFENYA_DESCRIPTION.GOTD),

  async executeInteraction({
    interaction,
    redis,
    repository,
    logger,
  }: ISlashCommandArgs): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${FEFENYA_COMMANDS.GOTD} has been triggered`);

      const isGotdTriggered = !!(await redis.exists(
        FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS,
      ));

      if (isGotdTriggered) {
        const gotdUser = await redis.get(FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS);

        const randIndex = cryptoRandomIntBetween(1, GOTD_SELECTED_FLOW.size);
        const greetingSelectedFlow = GOTD_SELECTED_FLOW.get(randIndex);

        await interaction.reply({
          content: gotdSelected(greetingSelectedFlow, gotdUser),
          ephemeral: false,
        });

        return;
      }

      logger.debug(
        `Selecting gay lord of the day from: ${interaction.guild.id}`,
      );

      const to = await repository.count();
      const randomInt = cryptoRandomIntBetween(1, to);

      logger.log(
        `Fefenya randomize in between ${to} values, roll is ${randomInt}`,
      );

      const [fefenyaUsersEntity] = await (
        repository as Repository<FefenyaUsersEntity>
      ).find({
        order: {
          count: 'ASC',
        },
        skip: randomInt,
        take: 1,
      });

      logger.log(
        `Fefenya pre-pick user as a gaylord: ${fefenyaUsersEntity.id}`,
      );

      await (repository as Repository<FefenyaUsersEntity>).update(
        { id: fefenyaUsersEntity.id },
        {
          name: fefenyaUsersEntity.name,
          count: fefenyaUsersEntity.count + 1,
        },
      );

      const randIndex = cryptoRandomIntBetween(1, GOTD_GREETING_FLOW.size);
      const greetingFlow = GOTD_GREETING_FLOW.get(randIndex);
      const arrLength = greetingFlow.length;
      let content: string;

      await redis.set(
        FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS,
        fefenyaUsersEntity.name,
      );

      for (let i = 0; i < arrLength; i++) {
        content =
          arrLength - 1 === i
            ? gotdGreeter(greetingFlow[i], fefenyaUsersEntity.id)
            : greetingFlow[i];

        if (i === 0) {
          await interaction.reply({
            content,
            ephemeral: false,
          });
        } else {
          await (interaction.channel as TextChannel).send({ content });
        }
      }
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
