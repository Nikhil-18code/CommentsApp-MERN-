const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    bannedWords: {
        type: [String],
        default: ['kill', 'murder', 'suicide', 'die', 'poison', 'immigrate']
    },
    suspectWords: {
        type: [String],
        default: ['stupid', 'loser', 'hate', 'dumb', 'shutup', 'theif']
    }
});

module.exports = mongoose.model('Settings', settingsSchema);