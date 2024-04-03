import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { ButtonStyle } from 'discord-api-types/v10';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';

export const votingButtons = () =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('Yes')
      .setLabel('✅ За')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('No')
      .setLabel('✖️ Против')
      .setStyle(ButtonStyle.Danger),
  ) as ActionRowBuilder<MessageActionRowComponentBuilder>;

export const votingEmbed = (
  title: string,
  description: string,
  initiatedBy: string,
  memberVoters: number | string,
  status: string,
  icon: string,
) =>
  new EmbedBuilder()
    .setTitle(title)
    .setDescription(
      `${description}\nИнициировано: <@${initiatedBy}>\nДоступно для ${memberVoters} участников\nНеобходимо для кворума: 70% | ${memberVoters}\n\t\t**${status}**`,
    )
    .setColor('#00FF98')
    .addFields([
      {
        name: '───────────────',
        value: `⠀⠀⠀⠀⠀За: 0\n───────────────`,
        inline: true,
      },
      {
        name: `───────────────`,
        value: `Решение будет принято *только* при\n${memberVoters} из ${memberVoters} голосах\n───────────────`,
        inline: true,
      },
      {
        name: `───────────────`,
        value: `⠀⠀⠀Против: 0\n───────────────`,
        inline: true,
      },
    ])
    .setThumbnail(icon)
    .setImage(
      'https://cdn.discordapp.com/attachments/778457504794935326/1001872806658711623/ae6e2b2299c25219.png',
    )
    .setTimestamp()
    .setFooter({
      text: 'CYR • NEO • MONK • DSCD • CMNTY',
      iconURL:
        'https://cdn.discordapp.com/attachments/323531345961811968/965297572317122650/Monk_Logo_site.png?ex=65919feb&is=657f2aeb&hm=0748d2dee0bb2e37f36ad29a8e38a4b3e3a0b63f62c060e50de7a6bf13a48e00&',
    });

export const votingSanctionsEmbed = (
  votingAction: string,
  userSanctioned: string,
  initiatedBy: string,
  memberVoters: number | string,
) =>
  new EmbedBuilder()
    .setTitle(
      `Количественное голосование за **${votingAction}** к ${userSanctioned}`,
    )
    .setDescription(
      `
        Инициировано: ${initiatedBy}
        Доступно для ${memberVoters} участников
        Необходимо для кворума: 70% |
        
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀*голосование активно ещё*
        
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**${status}**
        `,
    )
    .addFields([
      {
        name: '───────────────',
        value: `⠀⠀⠀⠀⠀За: 0\n───────────────`,
        inline: true,
      },
      {
        name: `───────────────`,
        value: `Решение будет принято *только* при\n из ${memberVoters} голосах\n───────────────`,
        inline: true,
      },
      {
        name: `───────────────`,
        value: `⠀⠀⠀Против: 0\n───────────────`,
        inline: true,
      },
    ]);
