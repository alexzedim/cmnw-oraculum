import { Guild, SnowflakeUtil } from 'discord.js';
import { DateTime } from 'luxon';
import { Guilds } from '@cmnw/mongo';
import { Model } from 'mongoose';
import { isDurationNotPass } from '@cmnw/core/utils';

export const indexGuild = async (
  model: Model<Guilds>,
  guild: Guild,
  scannedBy: string,
) => {
  let guildEntity = await model.findById<Guilds>(guild.id);

  if (!guildEntity) {
    guildEntity = new model({
      _id: guild.id,
      name: guild.name,
      icon: guild.icon,
      ownerId: guild.ownerId,
      membersNumber: guild.memberCount,
      updatedBy: scannedBy,
      scannedAt: new Date(),
      scannedBy: scannedBy,
      createdAt: DateTime.fromMillis(
        SnowflakeUtil.timestampFrom(guild.id),
      ).toJSDate(),
    });
  }

  if (guildEntity) {
    // TODO check changes of ownerId
    guildEntity.name = guild.name;
    guildEntity.icon = guild.icon;
    guildEntity.ownerId = guild.ownerId;
    guildEntity.membersNumber = guild.memberCount;
    guildEntity.updatedBy = scannedBy;

    const isReadyToUpdate = isDurationNotPass(guildEntity.updatedAt, 1);
    if (isReadyToUpdate) {
      return;
    }
  }

  await guildEntity.save();
};
