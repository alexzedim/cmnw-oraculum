import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { ALGO, ENCRYPT_ENUM } from '@cmnw/commands/const';

export const algoInput = new TextInputBuilder()
  .setCustomId('algoInput')
  .setLabel('Algorithm')
  .setStyle(TextInputStyle.Short)
  .setMaxLength(11)
  .setMinLength(3)
  .setPlaceholder(ALGO)
  .setRequired(true);

export const keyInput = new TextInputBuilder()
  .setCustomId('keyInput')
  .setLabel('Input key')
  .setStyle(TextInputStyle.Short)
  .setMaxLength(30)
  .setMinLength(6)
  .setPlaceholder('Рекомендация: любой [vector] ID')
  // .setValue('1125864035288621136')
  .setRequired(true);

export const textInput = new TextInputBuilder()
  .setCustomId('textInput')
  .setLabel('Message Payload')
  .setPlaceholder('Необходимо вставить текст для шифрования')
  .setStyle(TextInputStyle.Paragraph)
  .setMaxLength(2000)
  .setRequired(true);

export const selectInput = new StringSelectMenuBuilder()
  .setCustomId('cipherInout')
  .setPlaceholder('Input algorythm')
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel('AES-128-ECB')
      .setDescription('The dual-type Grass/Poison Seed Pokémon.')
      .setValue('aes-128-ecb'),
  );

export const encCryptoModal = new ModalBuilder()
  .setCustomId(ENCRYPT_ENUM.NAME)
  .setTitle('Encryption Mode')
  .addComponents(
    new ActionRowBuilder().addComponents(algoInput) as any,
    new ActionRowBuilder().addComponents(keyInput) as any,
    new ActionRowBuilder().addComponents(textInput) as any,
  );
