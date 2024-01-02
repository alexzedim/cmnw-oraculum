import { SlashCommand } from '@cmnw/commands/types';
import { IDENTITY, IDENTITY_ENUM } from '@cmnw/commands/const';
import { Profiles } from '@cmnw/mongo';

export const identityCommand: SlashCommand = {
  name: IDENTITY_ENUM.NAME,
  description: IDENTITY_ENUM.DESCRIPTION,
  slashCommand: IDENTITY,

  executeInteraction: async function ({
    interaction,
    redis,
    models,
    logger,
  }): Promise<void> {
    if (!interaction.isChatInputCommand()) return;
    try {
      logger.log(`${IDENTITY_ENUM.NAME} triggered by ${interaction.user.id}`);

      const profileName = interaction.options.getString(
        IDENTITY_ENUM.PROFILE_OPTION,
        true,
      );

      const { profilesModel } = models;
      const { user } = interaction.client;
      const username = user.username;
      const id = user.id;

      // TODO bound profile
      const profileEntity = await profilesModel.findOne<Profiles>({
        username: profileName,
      });

      if (!profileEntity) {
        throw new Error('Выбранный профиль не найден.');
      }

      const profileUnset = await profilesModel.findOneAndUpdate<Profiles>(
        {
          userId: user.id,
        },
        {
          userId: undefined,
          keyId: undefined,
        },
      );

      if (profileUnset) {
        logger.log(
          `Profile ${profileUnset.username} for client ${username} unset.`,
        );
      }

      await user.setUsername(profileEntity.username);
      await user.setAvatar(profileEntity.avatar);
      user.setStatus('online');

      profileEntity.username = username;
      profileEntity.userId = id;
      await profileEntity.save();

      // user.setActivity('');
      // user.setPresence('');

      await interaction.reply({
        content: `Личностный профиль к ${id}:${username} применен.`,
        ephemeral: true,
      });
    } catch (errorOrException) {
      logger.error(errorOrException);
      await interaction.reply({
        content: errorOrException.message,
        ephemeral: true,
      });
    }
  },
};
