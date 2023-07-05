import { Repository } from 'typeorm';
import { GuildsEntity } from '@cmnw/pg';
import { Guild, SnowflakeUtil } from 'discord.js';
import { DateTime } from 'luxon';

export async function indexGuildByRepository(
  repository: Repository<GuildsEntity>,
  guild: Guild,
  scannedBy: string,
  forceUpdate = false,
  tags = ['UNCLASSIFIED'],
) {
  let guildEntity = await repository.findOneBy({ id: guild.id });

  if (guildEntity && forceUpdate) {
    // TODO if owner has been changed

    await repository.update(
      { id: guild.id },
      {
        name: guild.name,
        icon: guild.icon,
        ownerId: guild.ownerId,
        membersNumber: guild.memberCount,
        updatedBy: scannedBy,
      },
    );
  }

  if (!guildEntity) {
    guildEntity = repository.create({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      ownerId: guild.ownerId,
      tags: tags,
      membersNumber: guild.memberCount,
      scannedBy: scannedBy,
      createdAt: DateTime.fromMillis(
        SnowflakeUtil.timestampFrom(guild.id),
      ).toJSDate(),
    });

    await repository.save(guildEntity);
  }
}
