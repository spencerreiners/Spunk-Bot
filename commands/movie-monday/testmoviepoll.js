const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testmoviepoll')
        .setDescription('Manually trigger the movie voting poll from current suggestions.'),

    async execute(interaction) {
        const suggestions = db.prepare('SELECT userId, suggestion FROM movie_suggestions').all();

        if (!suggestions.length) {
            return interaction.reply({ content: 'No movie suggestions found.', ephemeral: true });
        }

        const options = suggestions.map(s => ({
            label: s.suggestion,
            value: `${s.suggestion}_${s.userId}`.slice(0, 100)
        }));

        const embed = new EmbedBuilder()
            .setTitle('🎥 Vote for This Week’s Movie!')
            .setDescription('Select your favorite.')
            .setColor('Green');

        const select = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('vote_movie')
                .setPlaceholder('Choose your pick')
                .addOptions(options)
        );

        await interaction.reply({ content: 'Movie poll triggered:', embeds: [embed], components: [select] });
    }
};
