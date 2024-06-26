const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { token } = require("./config.json");
const { db, initDb } = require("./setup-database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

initDb();

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  checkBirthdaysDaily();
});

client.on('ready', async () => {
    const channel = client.channels.cache.get('1065349629232828569'); // Replace with your channel ID
    if (!channel) return console.error('Channel not found');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verified')
                .setLabel('✅ Verify Your Humanity')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('film_critic')
                .setLabel('🍿 Film Critics')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('true_gamer')
                .setLabel('🎮 True Gamer')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('bell_dinger')
                .setLabel('🔔 Bell Dinger')
                .setStyle(ButtonStyle.Primary)
        );

    const embed = new EmbedBuilder()
        .setColor(16777062)  // Bright yellow
        .setTitle('Choose your roles!')
        .setDescription("Click on the button corresponding to the roles you desire.\n🍿 Film Critics: Gain access to the Theater!\n🎮 True Gamer: Gain access to the Gamer's Grotto!\n🔔 Bell Dinger: Receive announcement and event notifications!");

    await channel.send({ embeds: [embed], components: [row] });
});

function checkBirthdaysDaily() {
    setInterval(() => {
        const today = new Date().toISOString().slice(5, 10);  // Get today's date in MM-DD format
        db.all("SELECT userId, birthday FROM birthdays WHERE substr(birthday, 6) = ?", [today], (err, rows) => {
            if (err) {
                console.error("Error fetching birthdays: ", err);
                return;
            }
            rows.forEach(row => {
                const user = client.users.cache.get(row.userId);
                if (user) {
                    const year = row.birthday.split('-')[0];
                    const age = year.length === 4 ? new Date().getFullYear() - parseInt(year) : "unknown"; // Calculate age only if year is known
                    const embed = new EmbedBuilder()
                        .setColor(0xFFFF00) // Set a festive color
                        .setTitle('🎉 Happy Birthday! 🎉')
                        .setDescription(`Happy Birthday, ${user.username}! You are ${age} years old today!`);
                    user.send({ embeds: [embed] }).catch(console.error);
                }
            });
        });
    }, 86400000);  // 86400000 milliseconds in a day
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown ?? 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                await interaction.reply({ content: `Please wait ${((expirationTime - now) / 1000).toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`, ephemeral: true });
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    } else if (interaction.isButton()) {
        // Commented out the /help handling part
        // if (interaction.customId.startsWith('help_')) {
        //     // Handle help navigation buttons
        //     console.log('Handling help navigation:', interaction.customId);
        //     return; // Here you should implement the actual help page navigation logic
        // }

        // Handle role assignment buttons
        const roleMap = {
            "verified": "355442027757961218",
            "film_critic": "1065351909025779835",
            "true_gamer": "1065347777158189147",
            "bell_dinger": "1065357188975046738",
        };

        const roleId = roleMap[interaction.customId];
        if (!roleId) {
            await interaction.reply({ content: 'No role found for this button.', ephemeral: true });
            return;
        }

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            await interaction.reply({ content: 'The role no longer exists.', ephemeral: true });
            return;
        }

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            await interaction.reply({ content: `You have been removed from the ${role.name} role.`, ephemeral: true });
        } else {
            await member.roles.add(role);
            await interaction.reply({ content: `You have been added to the ${role.name} role!`, ephemeral: true });
        }
    }
});

client.login(token);
