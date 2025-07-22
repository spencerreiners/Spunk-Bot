const { db } = require('../../setup-database');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

async function sendMovieForm(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;
    db.prepare('DELETE FROM movie_suggestions').run();

    const embed = new EmbedBuilder().setTitle('🎬 Suggest a Movie!').setColor('Blue');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('submit_movie').setLabel('Submit').setStyle(ButtonStyle.Primary)
    );
    await channel.send({ embeds: [embed], components: [row] });
}

async function closeMovieForm(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;

    const rows = db.prepare('SELECT userId, suggestion FROM movie_suggestions').all();
    if (!rows.length) {
        await channel.send('📭 No movie suggestions were submitted this week.');
        return;
    }

    const suggestions = rows.map(r => `• ${r.suggestion}`).join('\n');
    const embed = new EmbedBuilder()
        .setTitle('🍿 Movie Suggestions Closed')
        .setDescription(`Here are the submitted suggestions:\n\n${suggestions}`)
        .setColor('Orange');

    await channel.send({ embeds: [embed] });
}

async function sendMoviePoll(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;

    const rows = db.prepare('SELECT userId, suggestion FROM movie_suggestions').all();
    if (!rows.length) return;

    const options = rows.map(r => ({
        label: r.suggestion,
        value: `${r.suggestion}_${r.userId}`.slice(0, 100)
    }));

    const embed = new EmbedBuilder().setTitle('🎥 Vote for This Week’s Movie!').setColor('Green');
    const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('vote_movie')
            .setPlaceholder('Choose your pick')
            .addOptions(options)
    );

    await channel.send({ embeds: [embed], components: [select] });
}

async function closeMoviePoll(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;

    const votes = db.prepare('SELECT suggestion, userId FROM votes').all();
    if (!votes.length) {
        await channel.send('📭 No votes were cast this week.');
        return;
    }

    // Overwrite previous votes, ensuring one vote per user
    const latestVotes = {};
    for (const { suggestion, userId } of votes) {
        latestVotes[userId] = suggestion;
    }

    const tally = {};
    for (const vote of Object.values(latestVotes)) {
        const movie = vote.split('_')[0];
        tally[movie] = (tally[movie] || 0) + 1;
    }

    const maxVotes = Math.max(...Object.values(tally));
    const winners = Object.entries(tally)
        .filter(([_, count]) => count === maxVotes)
        .map(([name]) => name);

    const embed = new EmbedBuilder()
        .setTitle('🏆 Poll Closed!')
        .setColor('Gold')
        .setDescription(`Winning movie${winners.length > 1 ? 's' : ''}: **${winners.join(', ')}** (${maxVotes} vote${maxVotes > 1 ? 's' : ''})`);

    await channel.send({ embeds: [embed] });

    // Reset everything for next week
    db.prepare('DELETE FROM votes').run();
    db.prepare('DELETE FROM movie_suggestions').run();
}

module.exports = {
    sendMovieForm,
    closeMovieForm,
    sendMoviePoll,
    closeMoviePoll,
};
