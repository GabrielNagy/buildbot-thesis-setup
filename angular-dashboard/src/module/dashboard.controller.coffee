class BuildbotFriDashboard extends Controller
  constructor: ($scope, dataService, resultsService, @$uibModal) ->
    _.mixin($scope, resultsService)
    @data = dataService.open().closeOnDestroy($scope)

    $scope.sourcestampsMap = @sourcestampsMap = {}
    $scope.builds = @builds = {}
    $scope.buildrequests = @buildrequests = {}

    @buildrequestsMap = {}
    @buildsetsMap = {}

    @buildrequestsGetMap = {}
    @buildsGetMap = {}

    $scope.builders = @builders = @data.getBuilders()

    epochTime = Math.floor((new Date).getTime()/1000)
    earliestSubmittedTime = epochTime - (60 * 60 * 24 * 7)

    @buildsets = @data.getBuildsets(limit:128, order: "-bsid", submitted_at__gt:earliestSubmittedTime)
    @buildsets.onChange = @onChangeBuildsets

  onChangeBuildsets: =>
    if not (@buildsets.$resolved and @buildsets.length > 0)
      return

    getChangeFromBbSourceStamp = (sourcestampdetails) ->
      fakeChange = {
        "revision": sourcestampdetails['revision'],
        "when_timestamp": sourcestampdetails['created_at'],
        "codebase": sourcestampdetails['codebase'],
        "repository": sourcestampdetails['repository'],
        "branch": sourcestampdetails['branch'],
      }
      if sourcestampdetails.hasOwnProperty('patch') and sourcestampdetails['patch']
        fakeChange["author"] = sourcestampdetails['patch']['author']
        fakeChange["comments"] = sourcestampdetails['patch']['comment']
      return fakeChange

    for buildset in @buildsets
      sourcestamps = buildset['sourcestamps']
      if sourcestamps.length != 1
        console.log("Unexpected sourcestamps for buildset " + buildset['bsid'])
      sourcestamp = sourcestamps[0]
      ssid = sourcestamp['ssid']
      if not @sourcestampsMap.hasOwnProperty(ssid)
        @sourcestampsMap[ssid] = {
          change: getChangeFromBbSourceStamp(sourcestamp),
          buildsets : []
        }
      @sourcestampsMap[ssid]['buildsets'].push(buildset['bsid'])
      console.log @sourcestampsMap
      @buildrequestsGetMap[buildset['bsid']] = @data.getBuildrequests(buildsetid: buildset['bsid'])
      @buildrequestsGetMap[buildset['bsid']].onChange = @onChangeBuildrequests

  onChangeBuildrequests: =>
    for id, buildreq of @buildrequestsGetMap
      if not buildreq.$resolved
        return

    for buildsetid, buildrequests of @buildrequestsGetMap
      @buildsetsMap[buildsetid] = {}
      @buildsetsMap[buildsetid]['pendingBuildrequests'] = {}
      @buildsetsMap[buildsetid]['claimedBuildrequests'] = {}

      for buildrequest in buildrequests
        buildrequestid = buildrequest['buildrequestid']

        if buildrequest["claimed"]
          @buildsGetMap[buildrequestid] = @data.getBuilds(buildrequestid: buildrequestid)
          @buildsGetMap[buildrequestid].onChange = @onChangeBuild
          @buildsetsMap[buildsetid]['claimedBuildrequests'][buildrequestid] = buildrequest
        else
          @buildsetsMap[buildsetid]['pendingBuildrequests'][buildrequestid] = buildrequest

  onChangeBuild: =>
    for id, bld of @buildsGetMap
      if not bld.$resolved
        return
    for buildrequestid, builds of @buildsGetMap
      @buildrequestsMap[buildrequestid] = {}
      for build in builds
        @buildrequestsMap[buildrequestid][build['buildid']] = build
    @generateBuildsMap()


  generateBuildsMap: =>
    for ssid, sourcestamp of @sourcestampsMap
      @builds[ssid] = {}
      @buildrequests[ssid] = {}
      for buildsetid in sourcestamp["buildsets"]
        for buildrequestid, buildrequest of @buildsetsMap[buildsetid]['claimedBuildrequests']
          for buildid, build of @buildrequestsMap[buildrequestid]
            if not @builds[ssid].hasOwnProperty(buildrequest["builderid"])
              @builds[ssid][buildrequest["builderid"]] = {}
            @builds[ssid][buildrequest["builderid"]][buildid] = build
        for buildrequestid, buildrequest of @buildsetsMap[buildsetid]['pendingBuildrequests']
          if not @buildrequests[ssid].hasOwnProperty(buildrequest["builderid"])
            @buildrequests[ssid][buildrequest["builderid"]] = {}
          @buildrequests[ssid][buildrequest["builderid"]][buildrequestid] = buildrequest
     console.log "Number of builds: " + Object.keys(@builds).length
     console.log @builds

  selectBuild: (build) ->
    modal = @$uibModal.open
      templateUrl: "buildbot_fri_dashboard/views/modal.html"
      controller: 'dashboardModalController as modal'
      windowClass: 'modal-big'
      resolve:
        selectedBuild: -> build
