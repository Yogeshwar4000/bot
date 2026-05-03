require('dotenv').config();
const {
  Client, GatewayIntentBits, ActionRowBuilder,
  StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
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
});

client.login(process.env.BOT_TOKEN);