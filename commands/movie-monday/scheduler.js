const cron = require('node-cron');
const { db } = require('../../setup-database');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = (client) => {
    // Monday 10 PM
    cron.schedule('45 17 * * *', async () => {
        const channel = await client.channels.fetch('1361176597616660480');
        if (!channel) return;
        db.prepare('DELETE FROM movie_suggestions').run();

        const embed = new EmbedBuilder().setTitle('🎬 Suggest a Movie!').setColor('Blue');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('submit_movie').setLabel('Submit').setStyle(ButtonStyle.Primary)
        );
        await channel.send({ embeds: [embed], components: [row] });
    });

    // Sunday 4 PM
    cron.schedule('0 16 * * 0', async () => {
        const channel = await client.channels.fetch('YOUR_CHANNEL_ID');
        if (!channel) return;

        const rows = db.prepare('SELECT userId, suggestion FROM movie_suggestions').all();
        if (!rows.length) return;

        const options = rows.map((r, i) => ({
            label: r.suggestion,
            value: `${r.suggestion}_${r.userId}`.slice(0, 100)
        }));

        const embed = new EmbedBuilder().setTitle('🎥 Vote for This Week’s Movie!').setColor('Green');
        const select = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('vote_movie').setPlaceholder('Choose your pick').addOptions(options)
        );
        await channel.send({ embeds: [embed], components: [select] });
    });
};
