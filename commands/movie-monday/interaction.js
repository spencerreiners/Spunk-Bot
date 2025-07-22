const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    async handleButton(interaction) {
        if (interaction.customId === 'submit_movie') {
            const modal = new ModalBuilder()
                .setCustomId('movie_modal')
                .setTitle('Movie Suggestion')
                .addComponents(new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('movie_input')
                        .setLabel('Your movie:')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ));
            await interaction.showModal(modal);
        }
    },

    async handleModal(interaction) {
        const movie = interaction.fields.getTextInputValue('movie_input');
        db.prepare('INSERT INTO movie_suggestions (userId, suggestion) VALUES (?, ?)').run(interaction.user.id, movie);
        interaction.reply({ content: 'Suggestion submitted!', ephemeral: true });
    },

    async handleSelect(interaction) {
        const selected = interaction.values[0]; // e.g., "MovieTitle_userId"
        const [suggestion] = selected.split('_');

        // Upsert vote (overwrite previous vote if user already voted)
        db.prepare(`
            INSERT INTO votes (userId, suggestion)
            VALUES (?, ?)
            ON CONFLICT(userId) DO UPDATE SET suggestion = excluded.suggestion
        `).run(interaction.user.id, selected);

        interaction.reply({ content: `You voted for **${suggestion}**. Thanks!`, ephemeral: true });
    }
};
