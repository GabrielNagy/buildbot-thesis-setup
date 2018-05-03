BOWERDEPS = (typeof BOWERDEPS === 'undefined') ? {}: BOWERDEPS;
(function() {
  var BuildbotFriDashboard, State;

  BuildbotFriDashboard = (function() {
    function BuildbotFriDashboard() {
      return ['ui.router', 'ui.bootstrap', 'buildbot_config', 'guanlecoja.ui', 'bbData'];
    }

    return BuildbotFriDashboard;

  })();

  State = (function() {
    function State($stateProvider, glMenuServiceProvider) {
      var caption, cfg, name, state;
      name = "buildbot_fri_dashboard";
      caption = "FRI Dashboard v2.19";
      glMenuServiceProvider.addGroup({
        name: name,
        caption: caption,
        icon: 'user-circle',
        order: 10
      });
      cfg = {
        group: name,
        caption: caption
      };
      state = {
        controller: "buildbotFriDashboardController",
        controllerAs: "d",
        templateUrl: "buildbot_fri_dashboard/views/dashboard.html",
        name: name,
        url: "/" + name,
        data: cfg
      };
      $stateProvider.state(state);
    }

    return State;

  })();

  angular.module('buildbot_fri_dashboard', new BuildbotFriDashboard()).config(['$stateProvider', 'glMenuServiceProvider', State]);

}).call(this);

(function() {
  var BuildbotFriDashboard,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BuildbotFriDashboard = (function() {
    function BuildbotFriDashboard($scope, dataService, resultsService, $uibModal) {
      var earliestSubmittedTime, epochTime;
      this.$uibModal = $uibModal;
      this.generateBuildsMap = bind(this.generateBuildsMap, this);
      this.onChangeBuild = bind(this.onChangeBuild, this);
      this.onChangeBuildrequests = bind(this.onChangeBuildrequests, this);
      this.onChangeBuildsets = bind(this.onChangeBuildsets, this);
      _.mixin($scope, resultsService);
      this.data = dataService.open().closeOnDestroy($scope);
      $scope.sourcestampsMap = this.sourcestampsMap = {};
      $scope.builds = this.builds = {};
      $scope.buildrequests = this.buildrequests = {};
      this.buildrequestsMap = {};
      this.buildsetsMap = {};
      this.buildrequestsGetMap = {};
      this.buildsGetMap = {};
      $scope.builders = this.builders = this.data.getBuilders();
      epochTime = Math.floor((new Date).getTime() / 1000);
      earliestSubmittedTime = epochTime - (60 * 60 * 24 * 7);
      this.buildsets = this.data.getBuildsets({
        limit: 128,
        order: "-bsid",
        submitted_at__gt: earliestSubmittedTime
      });
      this.buildsets.onChange = this.onChangeBuildsets;
    }

    BuildbotFriDashboard.prototype.onChangeBuildsets = function() {
      var buildset, getChangeFromBbSourceStamp, i, len, ref, results, sourcestamp, sourcestamps, ssid;
      if (!(this.buildsets.$resolved && this.buildsets.length > 0)) {
        return;
      }
      getChangeFromBbSourceStamp = function(sourcestampdetails) {
        var fakeChange;
        fakeChange = {
          "revision": sourcestampdetails['revision'],
          "when_timestamp": sourcestampdetails['created_at'],
          "codebase": sourcestampdetails['codebase'],
          "repository": sourcestampdetails['repository'],
          "branch": sourcestampdetails['branch']
        };
        if (sourcestampdetails.hasOwnProperty('patch') && sourcestampdetails['patch']) {
          fakeChange["author"] = sourcestampdetails['patch']['author'];
          fakeChange["comments"] = sourcestampdetails['patch']['comment'];
        }
        return fakeChange;
      };
      ref = this.buildsets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        buildset = ref[i];
        sourcestamps = buildset['sourcestamps'];
        if (sourcestamps.length !== 1) {
          console.log("Unexpected sourcestamps for buildset " + buildset['bsid']);
        }
        sourcestamp = sourcestamps[0];
        ssid = sourcestamp['ssid'];
        if (!this.sourcestampsMap.hasOwnProperty(ssid)) {
          this.sourcestampsMap[ssid] = {
            change: getChangeFromBbSourceStamp(sourcestamp),
            buildsets: []
          };
        }
        this.sourcestampsMap[ssid]['buildsets'].push(buildset['bsid']);
        console.log(this.sourcestampsMap);
        this.buildrequestsGetMap[buildset['bsid']] = this.data.getBuildrequests({
          buildsetid: buildset['bsid']
        });
        results.push(this.buildrequestsGetMap[buildset['bsid']].onChange = this.onChangeBuildrequests);
      }
      return results;
    };

    BuildbotFriDashboard.prototype.onChangeBuildrequests = function() {
      var buildreq, buildrequest, buildrequestid, buildrequests, buildsetid, id, ref, ref1, results;
      ref = this.buildrequestsGetMap;
      for (id in ref) {
        buildreq = ref[id];
        if (!buildreq.$resolved) {
          return;
        }
      }
      ref1 = this.buildrequestsGetMap;
      results = [];
      for (buildsetid in ref1) {
        buildrequests = ref1[buildsetid];
        this.buildsetsMap[buildsetid] = {};
        this.buildsetsMap[buildsetid]['pendingBuildrequests'] = {};
        this.buildsetsMap[buildsetid]['claimedBuildrequests'] = {};
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = buildrequests.length; i < len; i++) {
            buildrequest = buildrequests[i];
            buildrequestid = buildrequest['buildrequestid'];
            if (buildrequest["claimed"]) {
              this.buildsGetMap[buildrequestid] = this.data.getBuilds({
                buildrequestid: buildrequestid
              });
              this.buildsGetMap[buildrequestid].onChange = this.onChangeBuild;
              results1.push(this.buildsetsMap[buildsetid]['claimedBuildrequests'][buildrequestid] = buildrequest);
            } else {
              results1.push(this.buildsetsMap[buildsetid]['pendingBuildrequests'][buildrequestid] = buildrequest);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    BuildbotFriDashboard.prototype.onChangeBuild = function() {
      var bld, build, buildrequestid, builds, i, id, len, ref, ref1;
      ref = this.buildsGetMap;
      for (id in ref) {
        bld = ref[id];
        if (!bld.$resolved) {
          return;
        }
      }
      ref1 = this.buildsGetMap;
      for (buildrequestid in ref1) {
        builds = ref1[buildrequestid];
        this.buildrequestsMap[buildrequestid] = {};
        for (i = 0, len = builds.length; i < len; i++) {
          build = builds[i];
          this.buildrequestsMap[buildrequestid][build['buildid']] = build;
        }
      }
      return this.generateBuildsMap();
    };

    BuildbotFriDashboard.prototype.generateBuildsMap = function() {
      var build, buildid, buildrequest, buildrequestid, buildsetid, i, len, ref, ref1, ref2, ref3, ref4, sourcestamp, ssid;
      ref = this.sourcestampsMap;
      for (ssid in ref) {
        sourcestamp = ref[ssid];
        this.builds[ssid] = {};
        this.buildrequests[ssid] = {};
        ref1 = sourcestamp["buildsets"];
        for (i = 0, len = ref1.length; i < len; i++) {
          buildsetid = ref1[i];
          ref2 = this.buildsetsMap[buildsetid]['claimedBuildrequests'];
          for (buildrequestid in ref2) {
            buildrequest = ref2[buildrequestid];
            ref3 = this.buildrequestsMap[buildrequestid];
            for (buildid in ref3) {
              build = ref3[buildid];
              if (!this.builds[ssid].hasOwnProperty(buildrequest["builderid"])) {
                this.builds[ssid][buildrequest["builderid"]] = {};
              }
              this.builds[ssid][buildrequest["builderid"]][buildid] = build;
            }
          }
          ref4 = this.buildsetsMap[buildsetid]['pendingBuildrequests'];
          for (buildrequestid in ref4) {
            buildrequest = ref4[buildrequestid];
            if (!this.buildrequests[ssid].hasOwnProperty(buildrequest["builderid"])) {
              this.buildrequests[ssid][buildrequest["builderid"]] = {};
            }
            this.buildrequests[ssid][buildrequest["builderid"]][buildrequestid] = buildrequest;
          }
        }
      }
      console.log("Number of builds: " + Object.keys(this.builds).length);
      return console.log(this.builds);
    };

    BuildbotFriDashboard.prototype.selectBuild = function(build) {
      var modal;
      return modal = this.$uibModal.open({
        templateUrl: "buildbot_fri_dashboard/views/modal.html",
        controller: 'dashboardModalController as modal',
        windowClass: 'modal-big',
        resolve: {
          selectedBuild: function() {
            return build;
          }
        }
      });
    };

    return BuildbotFriDashboard;

  })();

  angular.module('buildbot_fri_dashboard').controller('buildbotFriDashboardController', ['$scope', 'dataService', 'resultsService', '$uibModal', BuildbotFriDashboard]);

}).call(this);

(function() {
  var DashboardModal;

  DashboardModal = (function() {
    function DashboardModal($scope, $uibModalInstance, selectedBuild) {
      this.$uibModalInstance = $uibModalInstance;
      this.selectedBuild = selectedBuild;
      $scope.$on('$stateChangeStart', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
    }

    DashboardModal.prototype.close = function() {
      return this.$uibModalInstance.close();
    };

    return DashboardModal;

  })();

  angular.module('buildbot_fri_dashboard').controller('dashboardModalController', ['$scope', '$uibModalInstance', 'selectedBuild', DashboardModal]);

}).call(this);

angular.module("buildbot_fri_dashboard").run(["$templateCache", function($templateCache) {$templateCache.put("buildbot_fri_dashboard/views/dashboard.html","<div class=\"container mydashboard\"><table class=\"table\"><tr><th>SourceStamp</th><th ng-repeat=\"builder in builders\"><a ng-href=\"#/builders/{{ builder.builderid }}\" ng-bind=\"builder.name\"></a></th></tr><tr ng-repeat=\"(id, sourcestamp) in sourcestampsMap\"><td><changedetails change=\"sourcestamp.change\"><td ng-repeat=\"builder in builders\"><a ng-repeat=\"(buildid, build) in builds[id][builder.builderid]\"><span class=\"badge-status\" ng-class=\"results2class(build, \'pulse\')\" ng-click=\"d.selectBuild(build)\">{{ build.number }}</span></a><a ng-repeat=\"(buildrequestid, buildrequest) in buildrequests[id][builder.builderid]\" ui-sref=\"buildrequest({buildrequest: buildrequest.buildrequestid})\"><span class=\"badge-status\" ng-class=\"results2class(buildrequest, \'pulse\')\"><div class=\"badge-inactive\">{{buildrequest.buildrequestid}}</div><div class=\"badge-active\">{{results2text(buildrequest)}}{{ buildrequest.buildrequestid }}</div></span></a></td></changedetails></td></tr></table></div>");
$templateCache.put("buildbot_fri_dashboard/views/modal.html","<!-- Show build summary for the selected build in a modal window--><div class=\"modal-header\"><i class=\"fa fa-times pull-right\" ng-click=\"modal.close()\"></i><h4 class=\"modal-title\">Build summary</h4></div><div class=\"modal-body\"><buildsummary ng-if=\"modal.selectedBuild\" buildid=\"modal.selectedBuild.buildid\"></buildsummary></div>");}]);
//# sourceMappingURL=scripts.js.map
