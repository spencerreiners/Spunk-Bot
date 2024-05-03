const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendtochannel')
        .setDescription('Allows admins to send a message to a specific channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply({ content: "You don't have permission to use this command!", ephemeral: true });
        }

        const targetChannel = interaction.options.getChannel('channel');
        const messageToSend = interaction.options.getString('message');

        if (targetChannel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please specify a valid text channel.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setDescription(messageToSend)
            .setColor(0x0099FF); // You can customize the color

        targetChannel.send({ embeds: [embed] })
            .then(() => {
                interaction.reply({ content: `Message sent to ${targetChannel.name}`, ephemeral: true });
            })
            .catch(error => {
                console.error('Error sending message:', error);
                interaction.reply({ content: 'Failed to send message. Please check my permissions and try again.', ephemeral: true });
            });
    }
};
