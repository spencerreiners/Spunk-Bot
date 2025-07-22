const { db } = require('../../setup-database');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

function getNextMondayDate() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = (8 - dayOfWeek) % 7;
    now.setDate(now.getDate() + daysUntilMonday);
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

async function sendMovieForm(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;
    db.prepare('DELETE FROM movie_suggestions').run();

    const mondayDate = getNextMondayDate();
    const embed = new EmbedBuilder().setTitle(`🎬 Suggest a Movie for ${mondayDate}!`).setColor('Blue');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('submit_movie').setLabel('Submit').setStyle(ButtonStyle.Primary)
    );

    await channel.send({
        content: `@here 🎬 Suggest a Movie for ${mondayDate}!`,
        embeds: [embed],
        components: [row],
        allowedMentions: { parse: ['everyone'] }
    });
}

async function closeMovieForm(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;

    const rows = db.prepare('SELECT userId, suggestion FROM movie_suggestions').all();
    if (!rows.length) {
        await channel.send({
            content: '@here 📭 No movie suggestions were submitted this week.',
            allowedMentions: { parse: ['everyone'] }
        });
        return;
    }

    const suggestions = rows.map(r => `• ${r.suggestion}`).join('\n');
    const embed = new EmbedBuilder()
        .setTitle('🍿 Movie Suggestions Closed')
        .setDescription(`Here are the submitted suggestions:\n\n${suggestions}`)
        .setColor('Orange');

    await channel.send({
        content: '@here 🍿 Movie suggestion period is now closed!',
        embeds: [embed],
        allowedMentions: { parse: ['everyone'] }
    });
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

    const mondayDate = getNextMondayDate();
    const embed = new EmbedBuilder()
        .setTitle(`🎥 Vote for This Week’s Movie (${mondayDate})!`)
        .setColor('Green');

    const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('vote_movie')
            .setPlaceholder('Choose your pick')
            .addOptions(options)
    );

    await channel.send({
        content: `@here 🗳️ Movie voting is open for ${mondayDate}!`,
        embeds: [embed],
        components: [select],
        allowedMentions: { parse: ['everyone'] }
    });
}

async function closeMoviePoll(client) {
    const channel = await client.channels.fetch('1361176597616660480');
    if (!channel) return;

    const votes = db.prepare('SELECT suggestion, userId FROM votes').all();
    if (!votes.length) {
        await channel.send({
            content: '@here 📭 No votes were cast this week.',
            allowedMentions: { parse: ['everyone'] }
        });
        return;
    }

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

    const mondayDate = getNextMondayDate();
    const embed = new EmbedBuilder()
        .setTitle('🏆 Poll Closed!')
        .setColor('Gold')
        .setDescription(`Winning movie${winners.length > 1 ? 's' : ''} for ${mondayDate}: **${winners.join(', ')}** (${maxVotes} vote${maxVotes > 1 ? 's' : ''})`);

    await channel.send({
        content: '@here 🏁 Movie poll closed!',
        embeds: [embed],
        allowedMentions: { parse: ['everyone'] }
    });

    db.prepare('DELETE FROM votes').run();
    db.prepare('DELETE FROM movie_suggestions').run();
}

module.exports = {
    sendMovieForm,
    closeMovieForm,
    sendMoviePoll,
    closeMoviePoll,
};
