# Register new module
class BuildbotFriDashboard extends App
    constructor: -> return [
        'ui.router', 'ui.bootstrap', 'buildbot_config', 'guanlecoja.ui', 'bbData'
    ]

# Register new state
class State extends Config
    constructor: ($stateProvider, glMenuServiceProvider) ->

        # Name of the state
        name = "buildbot_fri_dashboard"
        caption = "FRI Dashboard v2.19"
        # Configuration
        glMenuServiceProvider.addGroup
            name: name
            caption: caption
            icon: 'user-circle'
            order:  10
        cfg =
            group: name
            caption: caption

        # Register new state
        state =
            controller: "buildbotFriDashboardController"
            controllerAs: "d"
            templateUrl: "buildbot_fri_dashboard/views/dashboard.html"
            name: name
            url: "/#{name}"
            data: cfg
        $stateProvider.state(state)
