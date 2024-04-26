const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription('Displays help information for available commands'),
    async execute(interaction) {
        const commands = Array.from(interaction.client.commands.values()).map(command => {
            return { name: command.data.name, description: command.data.description };
        });

        const pages = commands.reduce((acc, curr, i) => {
            const pageIndex = Math.floor(i / 5);
            acc[pageIndex] = acc[pageIndex] || [];
            acc[pageIndex].push(curr);
            return acc;
        }, []);

        let currentPage = 0;

        const createEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Help Commands')
                .setDescription('List of available commands:')
                .setTimestamp();

            pages[page].forEach(cmd => {
                embed.addFields({ name: `/${cmd.name}`, value: cmd.description || 'No description provided' });
            });

            return embed;
        };

        const createButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous_btn')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('next_btn')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === pages.length - 1 || pages.length === 0)
                );
        };

        const message = await interaction.reply({
            embeds: [createEmbed(currentPage)],
            components: [createButtons(currentPage)],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 180000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'You cannot use these buttons.', ephemeral: true });
            }

            if (i.customId === 'previous_btn' && currentPage > 0) {
                currentPage--;
            } else if (i.customId === 'next_btn' && currentPage < pages.length - 1) {
                currentPage++;
            }

            await i.update({ embeds: [createEmbed(currentPage)], components: [createButtons(currentPage)] });
        });

        collector.on('end', () => {
            message.edit({ components: [] }); // Clean up by removing the buttons
        });
    }
};
