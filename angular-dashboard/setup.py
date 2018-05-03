#!/usr/bin/env python

from __future__ import absolute_import, division, print_function

try:
    from buildbot_pkg import setup_www_plugin
except ImportError:
    import sys
    print("Please install buildbot_pkg module in order to install that package, or use the pre-build .whl modules available on pypi", file=sys.stderr)
    sys.exit(1)


setup_www_plugin(
    name='angular-dashboard',
    description='Angular Dashboard',
    author=u'Gabriel Nagy',
    author_email=u'gabriel.nagy@nokia.com',
    url='/',
    license='',
    packages=['buildbot_fri_dashboard'],
    package_data={
        '': [
            'VERSION',
            'static/*'
        ]
    },
    entry_points="""
        [buildbot.www]
        buildbot_fri_dashboard = buildbot_fri_dashboard:ep
    """,
)
