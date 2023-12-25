import { Model } from 'mongoose';
import { Keys, Profiles } from '@cmnw/mongo';
import { TAGS_ENUM, STATUS_ENUM } from '@cmnw/core';
import { Logger } from '@nestjs/common';

/**
 *
 * @param logger - NestJs default logger
 * @param model - MongoDB profile schema
 * @param key - Key Document for profile loading if binding is set
 * @param profileDetails - Profile Partition Document for search & precursor
 *
 * @description Create or load profile entity model for current discord user, based
 * @description on a key binding or existing profile in the current collection
 */
export const getProfile = async (
  logger: Logger,
  model: Model<Profiles>,
  key: Keys,
  profileDetails: Partial<Profiles>,
): Promise<Profiles | undefined> => {
  /**
   * @description create profile precursor
   * @description and add it to collection by binding or create the bind itself
   * TODO add current avatar to s3
   */
  const profilePart = {
    keyId: key._id,
    userId: profileDetails.userId,
    name: profileDetails.name,
    username: profileDetails.username,
    avatarUrl: profileDetails.avatarUrl,
    status: STATUS_ENUM.ACTIVE,
  };

  const query = profileDetails.name || profileDetails.username;

  let profile = await model.findOneAndUpdate<Profiles>(
    { keyId: key._id },
    profilePart,
  );

  if (!profile) {
    logger.log(`profile by binding ${key._id} not found!`);
    profile = await model.findOneAndUpdate(
      {
        $text: { $search: `${query}` },
      },
      profilePart,
    );
  }

  if (profile) {
    logger.log(`profile ${profile.codename} bind & updated`);
  }

  if (!profile) {
    const isBot = key.tags.includes(TAGS_ENUM.BOT);
    logger.warn(`profile ${query} not found! isBot :: ${isBot}`);
    if (isBot) {
      await model.create({
        ...profilePart,
        avatar: profileDetails.avatar,
      });
    }
  }

  return profile;
};
