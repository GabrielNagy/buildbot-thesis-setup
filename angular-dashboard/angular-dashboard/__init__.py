from buildbot.www.plugin import Application


class BuildbotGridDashboardApplication(Application):
    pass

# create the interface for the setuptools entry point
ep = BuildbotGridDashboardApplication(__name__, "")
