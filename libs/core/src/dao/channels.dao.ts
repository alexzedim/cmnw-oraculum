import { Channels } from '@cmnw/mongo';
import { Model } from 'mongoose';
import { ChannelType, SnowflakeUtil, TextChannel } from 'discord.js';
import { isDurationNotPass } from '@cmnw/core/utils';
import { DateTime } from 'luxon';

export const getChannelByTags = async (
  model: Model<Channels>,
  tags: Array<string>,
) =>
  await model.findOne<Channels>({
    tags: { $all: tags },
  });

export const bindChannelTags = async (
  model: Model<Channels>,
  guildId: string,
  channelId: string,
  tags: Array<string>,
) => {
  const channel = await model.findOne<Channels>({
    guildId: guildId,
    tags: { $all: tags },
  });

  if (!channel) {
    return model.findOneAndUpdate<Channels>(
      {
        _id: channelId,
        guildId: guildId,
      },
      {
        $addToSet: { tags: tags },
      },
    );
  }

  const isUnbind = channel._id !== channelId;

  if (isUnbind) {
    channel.tags.pull(tags);
    channel.markModified('tags');
    await channel.save();
  }

  return model.findOneAndUpdate(
    {
      _id: channelId,
      guildId: guildId,
    },
    { $addToSet: { tags: tags } },
  );
};

export const indexChannel = async (
  model: Model<Channels>,
  channel: TextChannel,
  guildId: string,
  scannedBy: string,
) => {
  let channelEntity = await model.findById<Channels>(channel.id);
  if (channelEntity) {
    if (isDurationNotPass(channelEntity.updatedAt)) {
      return channelEntity;
    }
    channelEntity.parentId = channel.parentId;
    channelEntity.updatedBy = scannedBy;
  } else {
    channelEntity = new model({
      _id: channel.id,
      name: channel.name,
      guildId: channel.guildId,
      parentId: channel.parentId,
      channelType: ChannelType[channel.type],
      isRedacted: false,
      isWatch: false,
      scannedBy: scannedBy,
      scannedAt: new Date(),
      createdAt: DateTime.fromMillis(
        SnowflakeUtil.timestampFrom(channel.id),
      ).toJSDate(),
    });
  }

  if ('rawPosition' in channel) {
    channelEntity.position = channel.rawPosition;
  }

  await channelEntity.save();
};
