import { Injectable } from '@nestjs/common';
import { Guild, PermissionsBitField, Role, TextChannel } from 'discord.js';
import { from, lastValueFrom, mergeMap } from 'rxjs';
import { Contests, Prompts } from '@cmnw/mongo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  CHAT_ROLE_ENUM,
  FEFENYA_NAMING,
  getRandomReplyByEvent,
  prettyContestPrompt,
  EVENT_PROMPT_ENUM,
  random,
  wait,
  formatRedisKey,
} from '@cmnw/core';

@Injectable()
export class ContestServices {
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
    @InjectModel(Prompts.name)
    private readonly promptsModel: Model<Prompts>,
    @InjectModel(Contests.name)
    private readonly contestsModel: Model<Contests>,
  ) {}

  determinateGuildWinner(guild: Guild) {
    const winnerAt = random(0, guild.memberCount);
    let guildMember = guild.members.cache.at(winnerAt);
    let isWinnerBot = guildMember.user.bot;
    while (isWinnerBot) {
      guildMember = guild.members.cache.random();
      isWinnerBot = guildMember.user.bot;
    }

    return guildMember;
  }

  public async contestGuildsFlow(guild: Guild): Promise<void> {
    const guildContests = await this.contestsModel.find<Contests>({
      guildId: guild.id,
      // TODO filter by winnerAt field
    });

    await lastValueFrom(
      from(guildContests).pipe(mergeMap(async (contestEntity) => {})),
    );
  }

  public async contestGuildFlow(guild: Guild, contestEntity: Contests) {
    const isNotEnd = random(0, 10);
    if (isNotEnd > 4) return;

    const key = `${guild.id}:${contestEntity._id}`;
    const contestKey = formatRedisKey(key, 'CONTEST');
    const isContestLocked = Boolean(await this.redisService.get(contestKey));
    if (isContestLocked) return;

    await this.redisService.set(contestKey, 1, 'EX', 10);

    // TODO dao
    const contestPrompts = await this.promptsModel
      .find<Prompts>({
        blockId: contestEntity.blockId,
        position: 1,
      })
      .sort({ position: 1 });

    const isCapWinnerHistory = contestEntity.winnerHistory.length >= 10;
    if (isCapWinnerHistory) {
      contestEntity.winnerHistory.pop();
    }

    const fefenyaName = FEFENYA_NAMING.random();

    const channel = guild.channels.cache.get(
      contestEntity.channelId,
    ) as TextChannel;

    const isChannel = !channel && channel.isTextBased();
    if (isChannel) {
      throw new Error(`Channel ${contestEntity.channelId} not found!`);
    }

    for (const contestPrompt of contestPrompts) {
      const contestText = prettyContestPrompt(
        contestPrompt.text,
        fefenyaName,
        contestEntity.title,
      );

      const delayTime = random(1, 10);
      await wait(delayTime);

      await channel.send({ content: contestText });
    }

    await this.endContestFlow(guild, contestEntity, channel);
  }

  async endContestFlow(guild: Guild, contest: Contests, channel: TextChannel) {
    let role: Role;
    let hasPermissions = false;

    if (contest.roleId) {
      role = guild.roles.cache.get(contest.roleId);
      hasPermissions = guild.members.me.permissions.has(
        PermissionsBitField.Flags.ManageRoles,
      );
    }

    const isRoleLogic = role && hasPermissions;
    const isOldWinner = isRoleLogic && contest.winnerUserId;
    if (isOldWinner) {
      await guild.members.cache.get(contest.winnerUserId).roles.remove(role.id);
    }
    /**
     * winner as a random user from guild members not bot++
     * else iterate next until bot
     */
    const guildWinnerMember = this.determinateGuildWinner(guild);

    if (isRoleLogic) {
      await guild.members.cache
        .get(guildWinnerMember.user.id)
        .roles.add(role.id);
    }

    const promptsStaring = await this.promptsModel.find<Prompts>({
      // TODO from current profile generated
      blockId: { $ne: contest.blockId },
      position: 1,
      isGenerated: true,
      // TODO reset status
      onEvent: EVENT_PROMPT_ENUM.TROPHY,
      type: EVENT_PROMPT_ENUM.CONTEST,
      role: CHAT_ROLE_ENUM.ASSISTANT,
    });

    const startingContestPrompt =
      promptsStaring[random(0, promptsStaring.length - 1)];

    contest.promptPosition = 1;
    contest.promptId = startingContestPrompt._id;
    contest.winnerHistory.push(guildWinnerMember.user.id);
    contest.winnerUserId = guildWinnerMember.user.id;
    contest.winnerAt = new Date();
    await contest.save();

    const promoPrompt = await getRandomReplyByEvent(
      this.promptsModel,
      EVENT_PROMPT_ENUM.PROMO,
    );

    const name = FEFENYA_NAMING.random();
    const winnerName =
      guildWinnerMember.displayName ?? guildWinnerMember.user.username;

    const winnerText = prettyContestPrompt(
      promoPrompt.text,
      name,
      contest.title,
      winnerName,
    );

    await channel.send({ content: winnerText });
  }
}
