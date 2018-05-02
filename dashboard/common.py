from buildbot.util import datetime2epoch


def get_changed_files(patch_body):
    file_list = []
    files = patch_body.split("diff --git")

    for f in files[1:]:
        f2 = f.split()
        f2[0] = f2[0].strip("a/")
        file_list.append(f2[0])

    return file_list[0:]


def getChangeFromBbSourceStamp(sourcestampdetails):
    fakeChange = {
        "revision": str(sourcestampdetails['revision']),
        "when_timestamp": datetime2epoch(sourcestampdetails['created_at']),
        "codebase": str(sourcestampdetails['codebase']),
        "repository": str(sourcestampdetails['repository']),
        "branch": str(sourcestampdetails['branch']),
    }
    if sourcestampdetails['patch']:
        fakeChange["files"] = get_changed_files(
            sourcestampdetails['patch']['body'])
        fakeChange["author"] = str(sourcestampdetails['patch']['author'])
        fakeChange["comments"] = str(sourcestampdetails['patch']['comment'])

    return fakeChange


def getChangeFromBbChange(bbChange):
    change = {
        "revision": str(bbChange['revision']),
        "when_timestamp": bbChange['when_timestamp'],
        "codebase": str(bbChange['codebase']),
        "repository": str(bbChange['repository']),
        "branch": str(bbChange['branch']),
        "files": [],
        "author": str(bbChange['author']),
        "comments": str(bbChange['comments'])
    }
    for file in bbChange['files']:
        change['files'].append(str(file))

    if (change["branch"] == 'None'):
        change["branch"] = 'master'
    return change
