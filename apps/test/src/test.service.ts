import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { decryptCommand, encryptCommand, SlashCommand } from '@cmnw/commands';
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
  private commandsMessage: Collection<string, SlashCommand> = new Collection();
  private readonly logger = new Logger(TestService.name, {
    timestamp: true,
  });
  constructor() {}

  async onApplicationBootstrap(): Promise<void> {
    await this.loadBot();
    await this.loadCommands();
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
        status: 'invisible',
      },
    });

    await this.client.login(
      'token',
    );
    this.rest.setToken(
      'token',
    );
  }

  private async loadCommands(): Promise<void> {
    this.commandsMessage.set(encryptCommand.name, encryptCommand);
    this.commandsMessage.set(decryptCommand.name, decryptCommand);

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
      this.client.on(Events.ClientReady, async () => {
        this.logger.log(`Logged in as ${this.client.user.tag}!`);
      });

      this.client.on(
        Events.InteractionCreate,
        async (interaction): Promise<void> => {
          const isChatInputCommand = interaction.isChatInputCommand();
          if (!isChatInputCommand) return;

          try {
            const command = this.commandsMessage.get(interaction.commandName);
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
