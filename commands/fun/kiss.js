const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

// Array of kiss messages
const kissMessages = [
    "sends a flying kiss to",
    "blows a gentle kiss towards",
    "gives a sweet kiss on the cheek to",
    "plants a soft kiss on the forehead of",
    "throws a loving kiss to"
];

function getRandomMessage() {
    return kissMessages[Math.floor(Math.random() * kissMessages.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Send a kiss to another user!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to kiss')
                .setRequired(true)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const message = getRandomMessage();
        const response = new EmbedBuilder()
            .setColor(0xff69b4) // A light pink color
            .setTitle('💋 A Kiss!')
            // Using the correct mention format
            .setDescription(`${interaction.user} ${message} <@${target.id}>! 😘`)
            .setTimestamp();

        await interaction.reply({ embeds: [response] });
    }
};
