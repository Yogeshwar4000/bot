require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('setup-colors')
    .setDescription('Post the color role picker in this channel')
    .toJSON()
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