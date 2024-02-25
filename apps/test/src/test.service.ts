import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  decryptCommand,
  encryptCommand,
  encryptionModal,
  SlashCommand,
} from '@cmnw/commands';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from 'discord.js';

@Injectable()
export class TestService implements OnApplicationBootstrap {
  private client: Client;
  private readonly rest = new REST({ version: '10' });
  private commands: Collection<string, SlashCommand> = new Collection();
  private modals: Collection<string, any> = new Collection();
  private readonly logger = new Logger(TestService.name, {
    timestamp: true,
  });
  constructor() {}

  async onApplicationBootstrap(): Promise<void> {
    await this.loadBot();
    await this.loadCommands();
    await this.bot();
  }

  private async loadBot() {
    this.client = new Client({
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    await this.client.login(
      'MTEyNTg2NDAzNTI4ODYyMTEzNg.GIh8lc.UUX6SvVf_6Ja3y-nHysB_E0LcejSNe5a4d5efc',
    );
    this.rest.setToken(
      'MTEyNTg2NDAzNTI4ODYyMTEzNg.GIh8lc.UUX6SvVf_6Ja3y-nHysB_E0LcejSNe5a4d5efc',
    );
    await this.client.login(token);
    this.rest.setToken(token);
  }

  private async loadCommands(): Promise<void> {
    this.commands.set(encryptCommand.name, encryptCommand);
    this.commands.set(decryptCommand.name, decryptCommand);
    this.modals.set(encryptionModal.name, encryptionModal);

    await this.rest.put(Routes.applicationCommands(this.client.user.id), {
      body: [
        encryptCommand.slashCommand.toJSON(),
        decryptCommand.slashCommand.toJSON(),
      ],
    });

    this.logger.log('Commands updated');
  }

  async bot(): Promise<void> {
    try {
      this.client.on(Events.ClientReady, () => {
        this.logger.log(`${this.client.user.tag} signals ready!`);
      });

      this.client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit()) return;
        try {
          const modal = this.modals.get(interaction.customId);
          if (!modal) return;

          await modal.executeInteraction({
            interaction,
            models: {},
            // redis: this.redisService,
            logger: this.logger,
            // rabbit: this.amqpConnection,
          });
        } catch (errorException) {
          this.logger.error(errorException);
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          const isChatInputCommand = interaction.isChatInputCommand();
          if (!isChatInputCommand) return;

          try {
            const command = this.commands.get(interaction.commandName);
            if (!command) return;

            await command.executeInteraction({
              interaction,
              models: {},
              // redis: this.redisService,
              logger: this.logger,
              // rabbit: this.amqpConnection,
            });
          } catch (errorException) {
            this.logger.error(errorException);
            await interaction.reply({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          }
        },
      );
    } catch (errorOrException) {
      this.logger.error(errorOrException);
    }
  }
}
