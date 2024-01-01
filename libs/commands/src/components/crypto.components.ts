import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export const keyInput = new TextInputBuilder()
  .setCustomId('keyInput')
  .setLabel('Input key')
  .setStyle(TextInputStyle.Short)
  .setMaxLength(30)
  .setMinLength(6)
  .setPlaceholder('Recommended: userId or any [vector]Id')
  .setValue('Default')
  .setRequired(true);

export const textInput = new TextInputBuilder()
  .setCustomId('textInput')
  .setLabel('Message Payload')
  .setPlaceholder('Необходимо вставить текст для шифрования')
  // Paragraph means multiple lines of text.
  .setStyle(TextInputStyle.Paragraph)
  .setMaxLength(2000)
  .setRequired(true);

export const encCryptoModal = new ModalBuilder()
  .setCustomId('encryption')
  .setTitle('Encryption Mode')
  .addComponents(new ActionRowBuilder().addComponents(textInput) as any);
