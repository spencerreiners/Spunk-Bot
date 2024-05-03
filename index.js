const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { db, initDb } = require('./setup-database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

initDb();

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
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
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            await interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`, ephemeral: true });
            return;
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Reaction role assignment
const roleReactions = new Map([
    ['MESSAGE_ID', { 'EMOJI_NAME_OR_ID': 'ROLE_ID' }]
]);

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    const rolesConfig = roleReactions.get(reaction.message.id);
    if (!rolesConfig) return;

    const roleId = rolesConfig[reaction.emoji.name] || rolesConfig[reaction.emoji.id];
    if (!roleId) return;

    const role = reaction.message.guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`Role does not exist: ${roleId}`);
        return;
    }

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;
    if (member.roles.cache.has(roleId)) return;

    member.roles.add(role).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    const rolesConfig = roleReactions.get(reaction.message.id);
    if (!rolesConfig) return;

    const roleId = rolesConfig[reaction.emoji.name] || rolesConfig[reaction.emoji.id];
    if (!roleId) return;

    const role = reaction.message.guild.roles.cache.get(roleId);
    if (!role) {
        console.log(`Role does not exist: ${roleId}`);
        return;
    }

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;
    if (!member.roles.cache.has(roleId)) return;

    member.roles.remove(role).catch(console.error);
});

client.login(token);
