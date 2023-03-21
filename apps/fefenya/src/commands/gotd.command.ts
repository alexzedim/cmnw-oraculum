import { SlashCommandBuilder, TextChannel } from 'discord.js';
import {
  FEFENYA_COMMANDS,
  FEFENYA_DESCRIPTION,
  FEFENYA_STORAGE_KEYS,
  fefenyaRedisKey,
  GOTD_GREETING_FLOW,
  GOTD_SELECTED_FLOW,
  gotdGreeter,
  gotdSelected,
  ISlashCommand,
  ISlashCommandArgs,
  randInBetweenInt,
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

        const randIndex = randInBetweenInt(1, GOTD_SELECTED_FLOW.size);
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

      // const randIndex = randInBetweenInt(0, storage.length);

      const guildUserIdRandom = await redis.spop(
        fefenyaRedisKey(interaction.guild.id),
      );

      // const guildUserIdRandom = storage[randIndex];

      logger.log(`Fefenya pre-pick user as a gaylord: ${guildUserIdRandom}`);

      const gothUserEntity = await repository.findOneBy({
        id: guildUserIdRandom,
      });

      if (!gothUserEntity) {
        const guildMember = await interaction.guild.members.fetch(
          guildUserIdRandom,
        );

        const gothEntity = repository.create({
          id: guildUserIdRandom,
          name: guildMember.displayName,
          count: 1,
          guildId: interaction.guildId,
        });

        await repository.save(gothEntity);
      } else {
        await repository.update(
          { id: guildUserIdRandom },
          {
            name: gothUserEntity.name,
            count: gothUserEntity.count + 1,
          },
        );
      }

      const randIndex = randInBetweenInt(1, GOTD_GREETING_FLOW.size);
      const greetingFlow = GOTD_GREETING_FLOW.get(randIndex);
      const arrLength = greetingFlow.length;
      let content: string;

      await redis.set(
        FEFENYA_STORAGE_KEYS.GOTD_TOD_STATUS,
        gothUserEntity.name,
      );

      for (let i = 0; i < arrLength; i++) {
        content =
          arrLength - 1 === i
            ? gotdGreeter(greetingFlow[i], guildUserIdRandom)
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
      console.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
