const { SlashCommandBuilder, ButtonStyle } = require('discord.js');
const { Pagination } = require('pagination.djs');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baltop')
        .setDescription('Displays the top 50 richest users'),
    async execute(interaction) {
        const rows = db.prepare('SELECT userId, balance FROM balances ORDER BY balance DESC LIMIT 50').all();
        const pages = rows.map((r, i) => `**${i + 1}. <@${r.userId}>** 💰 ${r.balance} Spunkcoins`);

        const pagination = new Pagination(interaction, { idle: 60000, ephemeral: true });

        pagination.setButtonAppearance({
            first: { label: 'First', emoji: '⏮️', style: ButtonStyle.Primary },
            prev: { label: 'Prev', emoji: '◀️', style: ButtonStyle.Secondary },
            next: { label: 'Next', emoji: '▶️', style: ButtonStyle.Success },
            last: { label: 'Last', emoji: '⏭️', style: ButtonStyle.Danger }
        });

        pagination.setTitle('Balance Top 50');
        pagination.setDescription('Navigate through the pages to see the top balances.');
        pagination.setDescriptions([pages.join('\n')]);
        await pagination.render();
    }
};
