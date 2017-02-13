module.exports = [{
        title: "cameras",
        icon: "facetime-video",
        id: "cameras",
    },
    {
        title: "settings",
        icon: "cog",
        id: "settings",
        controller: require('./settings'),
    },
    {
        title: "profile",
        icon: "user",
        id: "profile",
        controller: require('./profile'),
    },
    {
        title: "logout",
        icon: "log-out",
        id: "logout",
        controller: require('./logout'),
    }
];