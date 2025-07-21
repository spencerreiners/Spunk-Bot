const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testmovieform')
        .setDescription('Manually trigger the movie suggestion form.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎬 Suggest a Movie!')
            .setDescription('Submit your movie suggestion by clicking below.')
            .setColor('Blue');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('submit_movie')
                .setLabel('Submit')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ content: 'Movie form triggered:', embeds: [embed], components: [row] });
    }
};
