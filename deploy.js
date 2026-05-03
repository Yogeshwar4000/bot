require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('setup-colors')
    .setDescription('Post the color role picker in this channel')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('mirror')
    .setDescription('Mirror a user\'s messages')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mirror')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('unmirror')
    .setDescription('Stop mirroring a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmirror')
        .setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: '10' })
  .setToken(process.env.BOT_TOKEN);

(async () => {
  console.log('Registering slash command...');
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );
  console.log('Done! Slash command registered.');
})();