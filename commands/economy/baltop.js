const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Pagination } = require('pagination.djs');
const { db } = require('../../setup-database');  // Ensure you have the correct path to your database module

module.exports = {
    data: new SlashCommandBuilder()
        .setName('baltop')
        .setDescription('Displays the current rankings for users by balance in a paginated format.'),
    async execute(interaction) {
        // Fetch the balance data from your database
        db.all(`SELECT userId, balance FROM balances ORDER BY balance DESC LIMIT 50`, async (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                return interaction.reply({ content: 'Error retrieving balance data.', ephemeral: true });
            }

            // Map the rows into a formatted string array
            const balanceDescriptions = rows.map((row, index) => 
                `**${index + 1}. <@${row.userId}>** 💰 ${row.balance} Spunkcoins`).join('\n');

            const pagination = new Pagination(interaction, {
                idle: 60000, // active for 60 seconds
                ephemeral: true
            });

            // Customize button appearances
            pagination.setButtonAppearance({
                first: { // customize the 'first' page button
                    label: 'First',
                    emoji: '⏮️',
                    style: ButtonStyle.Primary
                },
                prev: { // customize the 'previous' page button
                    label: 'Prev',
                    emoji: '◀️',
                    style: ButtonStyle.Secondary
                },
                next: { // customize the 'next' page button
                    label: 'Next',
                    emoji: '▶️',
                    style: ButtonStyle.Success
                },
                last: { // customize the 'last' page button
                    label: 'Last',
                    emoji: '⏭️',
                    style: ButtonStyle.Danger
                }
            });

            // Set the title and other options for the embed
            pagination.setTitle('Balance Top 50'); // Set a title for all embeds
            pagination.setDescription('Navigate through the pages to see the top balances.'); // Optional: Set a general description

            pagination.setDescriptions([balanceDescriptions]);  // Notice the array wrapping
            await pagination.render();
        });
    }
};
