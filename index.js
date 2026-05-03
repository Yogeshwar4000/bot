require('dotenv').config();
const {
  Client, GatewayIntentBits, ActionRowBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const COLOR_ROLES = [
  { label: '🔴 Red',       value: '1500460985163452640',       description: 'Bold and fiery'         },
  { label: '🟠 Orange',    value: '1500462215277314088',    description: 'Warm and energetic'      },
  { label: '🟡 Yellow',    value: '1500464508039200938',    description: 'Bright and cheerful'     },
  { label: '🟢 Green',     value: '1500464377319653406',     description: 'Fresh and natural'       },
  { label: '🌿 Lime',      value: '1500464613060509697',      description: 'Sharp and vivid'         },
  { label: '🔵 Blue',      value: '1500464683591929876',      description: 'Cool and calm'           },
  { label: '🩵 Sky Blue',  value: '1500464835287191643',   description: 'Light and airy'          },
  { label: '🟣 Purple',    value: '1500466298486788297',    description: 'Deep and mysterious'     },
  { label: '💜 Lavender',  value: '1500464933001887795',  description: 'Soft and dreamy'         },
  { label: '🩷 Pink',      value: '1500465187332034661',      description: 'Sweet and playful'       },
  { label: '🌸 Rose',      value: '1500465530526634054',      description: 'Elegant and gentle'      },
  { label: '🤎 Brown',     value: '1500465672155693166',     description: 'Earthy and grounded'     },
  { label: '🩶 Silver',    value: '1500465780159152335',    description: 'Sleek and modern'        },
  { label: '⚫ Black',     value: '1500466097860640881',     description: 'Dark and mysterious'     },
  { label: '⚪ White',     value: '1500466048242024661',     description: 'Clean and pure'          },
];

// All color role IDs in a flat array — used for cleanup
const ALL_COLOR_IDS = COLOR_ROLES.map(c => c.value);

// Track mirrored users
const mirroredUsers = new Set();

// VS battle outcomes — {w} = winner, {l} = loser
const VS_OUTCOMES = [
  '🔥 {w} absolutely destroys {l}',
  '💨 {w} farts their way to the win against {l}',
  '😭 {w} slimes {l} neg diff',
  '🍽️ {w} ate and left no crumbs, {l} didn\'t even get a plate',
  '👟 {w} ran {l} out of the server',
  '🪦 {l} was never a threat. {w} wins easily',
  '🤡 {l} showed up. {w} didn\'t even try and still won',
  '💀 {w} ended {l}\'s career in 3 seconds',
  '🧹 {w} swept {l} without breaking a sweat',
  '😤 {w} looked at {l} and they gave up instantly',
  '🗑️ {l} got thrown out like last week\'s trash by {w}',
  '👑 {w} is built different. {l} never had a chance',
  '📞 {l} called their mum crying after {w} was done with them',
  '🎤 {w} dropped the mic on {l} and walked away',
  '💤 {w} beat {l} in their sleep',
  '🐛 {l} got cooked. {w} didn\'t even season them',
  '🏳️ {l} waved the white flag before {w} even started',
  '⚰️ {w} sent {l} to another dimension',
  '🤧 {l} was a disappointment. {w} expected more',
  '🌊 {w} washed {l} so hard they need to dry off',
];

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // Fires when onboarding is completed — pending goes from true to false
  if (oldMember.pending === true && newMember.pending === false) {
    try {
      const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);
      if (!channel) return;
 
      const embed = new EmbedBuilder()
        .setTitle(`👋 Welcome to the server, ${newMember.displayName}!`)
        .setDescription(
          `> Glad to have you here!\n` +
          `> Head over to <#YOUR_ROLES_CHANNEL_ID> to grab your roles.\n` +
          `> Pick a color, make yourself at home. 🎨`
        )
        .setColor(0x7F77DD)
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'LIFELESS TAMIL' })
        .setTimestamp();
 
      await channel.send({ content: `${newMember}`, embeds: [embed] });
    } catch (err) {
      console.error('Welcome message error:', err);
    }
  }
});

client.once('clientReady', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // /setup-colors — posts the embed + dropdown
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'setup-colors') {

    const embed = new EmbedBuilder()
      .setTitle('🎨 Pick Your Color Role')
      .setDescription(
        '> Use the dropdown below to choose your color.\n' +
        '> You can only have **one color** at a time —\n' +
        '> selecting a new one will replace your current color.'
      )
      .setColor(0x7F77DD)
      .setFooter({ text: 'LIFELESS TAMIL • Color Roles' })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('color_select')
      .setPlaceholder('✨ Choose your color...')
      .addOptions(
        COLOR_ROLES.map(c =>
          new StringSelectMenuOptionBuilder()
            .setLabel(c.label)
            .setValue(c.value)
            .setDescription(c.description)
        )
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }

  // Dropdown selection — remove all color roles, add the chosen one
  if (interaction.isStringSelectMenu() &&
      interaction.customId === 'color_select') {

    const selectedId = interaction.values[0];
    const member = interaction.member;
    const selected = COLOR_ROLES.find(c => c.value === selectedId);

    try {
      // Remove every color role the member currently has
      const toRemove = member.roles.cache.filter(r =>
        ALL_COLOR_IDS.includes(r.id)
      );
      if (toRemove.size > 0) {
        await member.roles.remove(toRemove.map(r => r.id));
      }

      // Assign the newly selected color
      await member.roles.add(selectedId);

      await interaction.reply({
        content: `🎨 You've been given **${selected.label}**!`,
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: '❌ Something went wrong. Make sure my role is **above** the color roles in Server Settings → Roles.',
        ephemeral: true
      });
    }
  }

  // /mirror command
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'mirror') {

    const target = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(target.id);
    const executor = interaction.member;

    if (target.bot) {
      return await interaction.reply({
        content: '❌ Cannot mirror a bot.',
        ephemeral: true
      });
    }

    if (member.roles.highest.position >= executor.roles.highest.position) {
      return await interaction.reply({
        content: '❌ You cannot mirror someone with an equal or higher role than you.',
        ephemeral: true
      });
    }

    mirroredUsers.add(target.id);
    await interaction.reply({
      content: `🪞 Now mirroring **${target.username}**. Use /unmirror to stop.`,
      ephemeral: true
    });
  }

  // /unmirror command
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'unmirror') {

    const target = interaction.options.getUser('user');

    if (!mirroredUsers.has(target.id)) {
      return await interaction.reply({
        content: `❌ **${target.username}** is not being mirrored.`,
        ephemeral: true
      });
    }

    mirroredUsers.delete(target.id);
    await interaction.reply({
      content: `🪞 Stopped mirroring **${target.username}**.`,
      ephemeral: true
    });
  }

  // /vs command
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'vs') {

    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');

    // Randomly pick winner and loser
    const [winner, loser] = Math.random() < 0.5
      ? [user1, user2]
      : [user2, user1];

    // Pick a random outcome
    const outcome = VS_OUTCOMES[Math.floor(Math.random() * VS_OUTCOMES.length)];
    const result = outcome
      .replace('{w}', `**${winner.displayName}**`)
      .replace('{l}', `**${loser.displayName}**`);

    await interaction.reply(`⚔️ ${result}`);
  }

});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Mirror
  if (mirroredUsers.has(message.author.id)) {
    await message.reply(message.content);
  }

  if (message.content.toLowerCase().includes('lifeless')) {
    await message.reply('you called? 👀');
  }
});

client.login(process.env.BOT_TOKEN);