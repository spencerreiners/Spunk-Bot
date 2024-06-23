const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rememberbirthday')
        .setDescription('Remembers your birthday')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Your birthday (MM-DD or YYYY-MM-DD)')
                .setRequired(true)),
    async execute(interaction) {
        const birthday = interaction.options.getString('date');

        // Validate date format (MM-DD or YYYY-MM-DD)
        if (!/^(\d{4}-)?\d{2}-\d{2}$/.test(birthday)) {
            return interaction.reply({ content: 'Please use the MM-DD or YYYY-MM-DD format for the date.', ephemeral: true });
        }

        const userId = interaction.user.id;

        // Store the birthday in the database
        db.run('INSERT OR REPLACE INTO birthdays (userId, birthday) VALUES (?, ?)', [userId, birthday], function(err) {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Failed to remember your birthday.', ephemeral: true });
            }
            interaction.reply({ content: 'Your birthday has been saved!', ephemeral: true });
        });
    },
};
