import os
import common
from flask import Flask, render_template

from buildbot.process.results import statusToString

dashapp = Flask('test', root_path=os.path.dirname(__file__))
# this allows to work on the template without having to restart Buildbot
dashapp.config['TEMPLATES_AUTO_RELOAD'] = True


@dashapp.route("/index.html")
def main():
    # This code fetches build data from the data api, and give it to the
    # template
    from buildbot.data.resultspec import Filter

    builders = dashapp.buildbot_api.dataGet(
        "/builders",
        filters=[
            Filter("tags", "contains", ["hello-world"]),
            Filter("masterids", "ne", [[]])
        ])

    bigData = {}

    import time
    epoch_time = int(time.time())
    earliestSubmittedTime = epoch_time - (60 * 60 * 24 * 7)

    buildsets = dashapp.buildbot_api.dataGet(
        "buildsets",
        limit=128,
        order=["-bsid"],
        filters=[Filter("submitted_at", "gt", [earliestSubmittedTime])])

    for buildset in buildsets:
        sourcestamps = buildset['sourcestamps']
        sourcestamp = sourcestamps[0]
        proj = sourcestamp['project']
        if proj != "hello-world":
            continue

        ssid = sourcestamp['ssid']
        if ssid not in bigData:
            bigData[ssid] = {}
            bigData[ssid]['change'] = common.getChangeFromBbSourceStamp(
                sourcestamp)
            bigData[ssid]['builders'] = {}
        buildrequests = dashapp.buildbot_api.dataGet(
            "buildrequests",
            filters=[Filter("buildsetid", "eq", [buildset['bsid']])])
        for buildrequest in buildrequests:
            id = buildrequest['builderid']
            if id not in bigData[ssid]['builders']:
                bigData[ssid]['builders'][id] = []
            if buildrequest["claimed"]:
                builds = dashapp.buildbot_api.dataGet(
                    ("buildrequests", buildrequest["buildrequestid"], "builds"))
                for build in builds:
                    results_text = statusToString(build['results']).upper()
                    if results_text == 'NOT FINISHED':
                        results_text = 'PENDING pulse'

                    bigData[ssid]['builders'][id].append({
                        'type': 'build',
                        'number': build["number"],
                        'results_text': results_text
                    })
            else:
                bigData[ssid]['builders'][id].append({
                    'type': 'buildrequest',
                    'id': buildrequest["buildrequestid"],
                    'results_text': "UNKNOWN"
                })
    # dash.html is a template inside the template directory
    return render_template('dash.html', builders=builders, bigdata=bigData)


@dashapp.after_request
def response_minify(response):
    """
    minify html response to decrease site traffic
    """
    from htmlmin.main import minify
    if response.content_type == u'text/html; charset=utf-8':
        response.set_data(minify(response.get_data(as_text=True)))

        return response
    return response
