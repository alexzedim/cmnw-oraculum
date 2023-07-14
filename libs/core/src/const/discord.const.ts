import { Snowflake } from 'discord.js';
import { ClassHall } from '@cmnw/core/types';
import {
  DISCORD_AUTHORIZED_ENUM,
  DISCORD_BAN_REASON_ENUM,
  DISCORD_MONK_ROLES,
  DISCORD_SERVER_RENAME_ENUM,
  DISCORD_SERVERS_ENUM,
  GUILD_TAGS_ENUM,
} from '@cmnw/core/enums';

export const DISCORD_CLASS_HALLS: Map<DISCORD_SERVERS_ENUM, ClassHall> =
  new Map([
    [
      DISCORD_SERVERS_ENUM.SanctumOfLight,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.PALADINS,
        ],
        emoji: '741997711678636074',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.TempleOfFiveDawns,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.MONKS,
        ],
        emoji: '741997711926100018',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.Maelstorm,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.SHAMAN,
        ],
        emoji: '741997712035020860',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.Akerus,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.DEATH_KNIGHT,
        ],
        emoji: '741997712022438018',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.DreamGroove,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.DRUID,
        ],
        emoji: '741997711779168328',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.HuntersLounge,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.HUNTER,
        ],
        emoji: '741997711548612610',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.FelHammer,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.DH,
        ],
        emoji: '895343481491423332',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.BlackTemple,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.DH,
          GUILD_TAGS_ENUM.RODRIGA,
        ],
        emoji: '741997711888351312',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.HallOfTheGuardian,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.MAGE,
        ],
        emoji: '741997711955460116',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.SkyholdCitadel,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.WARRIOR,
        ],
        emoji: '741997711775236127',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.TempleOfVoidLight,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.PRIEST,
        ],
        emoji: '741997711854665798',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.HallOfShadows,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.ROGUE,
        ],
        emoji: '741997712198860870',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.BlackScar,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.WARLOCK,
        ],
        emoji: '741997712198860870',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.Achievements,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.ACHIEVEMENTS,
        ],
        emoji: '741997712198860870',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.TempleOfWyrm,
      {
        tags: [
          GUILD_TAGS_ENUM.CLASS_HALL,
          GUILD_TAGS_ENUM.COMMUNITY,
          GUILD_TAGS_ENUM.EVOKER,
        ],
        emoji: '1129072439947690034',
      },
    ],
    [
      DISCORD_SERVERS_ENUM.CrossClass,
      {
        tags: [GUILD_TAGS_ENUM.MODER_HALL],
      },
    ],
  ]);

export const DISCORD_RELATIONS: Map<string, string> = new Map([
  [DISCORD_AUTHORIZED_ENUM.Rainon, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Solifugae, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Uchur, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Danaya, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Lapa, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.SanctumOfLight, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Schneissy, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Mizzrim, DISCORD_SERVERS_ENUM.SanctumOfLight],
  [DISCORD_AUTHORIZED_ENUM.Jarisse, DISCORD_SERVERS_ENUM.TempleOfFiveDawns],
  [DISCORD_AUTHORIZED_ENUM.Nims, DISCORD_SERVERS_ENUM.TempleOfFiveDawns],
  [DISCORD_AUTHORIZED_ENUM.Collidus, DISCORD_SERVERS_ENUM.TempleOfFiveDawns],
  [DISCORD_AUTHORIZED_ENUM.MonkNikita, DISCORD_SERVERS_ENUM.TempleOfFiveDawns],
  [DISCORD_AUTHORIZED_ENUM.Openal, DISCORD_SERVERS_ENUM.TempleOfFiveDawns],
  [DISCORD_AUTHORIZED_ENUM.Diezzz, DISCORD_SERVERS_ENUM.DreamGroove],
  [DISCORD_AUTHORIZED_ENUM.Talissia, DISCORD_SERVERS_ENUM.DreamGroove],
  [DISCORD_AUTHORIZED_ENUM.Amani, DISCORD_SERVERS_ENUM.Maelstorm],
  [DISCORD_AUTHORIZED_ENUM.Orenji, DISCORD_SERVERS_ENUM.Maelstorm],
  [DISCORD_AUTHORIZED_ENUM.Daren, DISCORD_SERVERS_ENUM.Akerus],
  [DISCORD_AUTHORIZED_ENUM.Resgast, DISCORD_SERVERS_ENUM.Akerus],
  [DISCORD_AUTHORIZED_ENUM.Lengi, DISCORD_SERVERS_ENUM.HuntersLounge],
  [DISCORD_AUTHORIZED_ENUM.Freerun, DISCORD_SERVERS_ENUM.HuntersLounge],
  [DISCORD_AUTHORIZED_ENUM.Amuress, DISCORD_SERVERS_ENUM.FelHammer],
  [DISCORD_AUTHORIZED_ENUM.Sangreal, DISCORD_SERVERS_ENUM.FelHammer],
  [DISCORD_AUTHORIZED_ENUM.Rodrig, DISCORD_SERVERS_ENUM.BlackTemple],
  [DISCORD_AUTHORIZED_ENUM.Akula, DISCORD_SERVERS_ENUM.HallOfTheGuardian],
  [DISCORD_AUTHORIZED_ENUM.HardKul, DISCORD_SERVERS_ENUM.HallOfTheGuardian],
  [DISCORD_AUTHORIZED_ENUM.Annet, DISCORD_SERVERS_ENUM.HallOfTheGuardian],
  [DISCORD_AUTHORIZED_ENUM.Yadder, DISCORD_SERVERS_ENUM.SkyholdCitadel],
  [DISCORD_AUTHORIZED_ENUM.Enmerkar, DISCORD_SERVERS_ENUM.TempleOfVoidLight],
  [DISCORD_AUTHORIZED_ENUM.Restar, DISCORD_SERVERS_ENUM.TempleOfVoidLight],
  [DISCORD_AUTHORIZED_ENUM.Lowiq, DISCORD_SERVERS_ENUM.HallOfShadows],
  [DISCORD_AUTHORIZED_ENUM.Darkcat, DISCORD_SERVERS_ENUM.HallOfShadows],
]);

export const DISCORD_SERVER_RENAME: Set<Snowflake> = new Set(
  Object.values(DISCORD_SERVER_RENAME_ENUM),
);

export const DISCORD_MONK_ROLES_BOOST_TITLES: Set<Snowflake> = new Set([
  DISCORD_MONK_ROLES.Boost1,
  DISCORD_MONK_ROLES.Boost2,
  DISCORD_MONK_ROLES.Boost3,
  DISCORD_MONK_ROLES.Boost4,
  DISCORD_MONK_ROLES.Boost5,
]);

export const DISCORD_REASON_BANS: Set<string> = new Set(
  Object.values(DISCORD_BAN_REASON_ENUM),
);
