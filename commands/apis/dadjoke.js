const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dadjoke')
        .setDescription('Get a random dad joke!'),
    async execute(interaction) {
        const url = 'https://icanhazdadjoke.com/';
        const headers = { Accept: 'application/json' }; // API expects an Accept header

        try {
            const response = await axios.get(url, { headers });
            const joke = response.data.joke;

            const jokeEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Dad Joke 🤣')
                .setDescription(joke)
                .setTimestamp();

            await interaction.reply({ embeds: [jokeEmbed] });
        } catch (error) {
            console.error('Error fetching dad joke:', error);
            await interaction.reply({ content: 'Failed to fetch a dad joke. Try again later!', ephemeral: true });
        }
    }
};
