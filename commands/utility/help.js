const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { Pagination } = require('pagination.djs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information for available commands'),
    async execute(interaction) {
        const commands = Array.from(interaction.client.commands.values())
            .map(command => ({
                name: command.data.name,
                description: command.data.description
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const descriptions = commands.map(cmd => `**/${cmd.name}**\n${cmd.description}`);

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
        pagination.setTitle('Available Commands'); // Set a title for all embeds
        pagination.setDescription('Navigate through the pages to see all the commands.'); // Optional: Set a general description

        pagination.setDescriptions(descriptions);
        await pagination.render();
    }
};
