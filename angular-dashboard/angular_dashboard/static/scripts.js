BOWERDEPS="undefined"==typeof BOWERDEPS?{}:BOWERDEPS,function(){var e,s;e=function(){function e(){return["ui.router","ui.bootstrap","buildbot_config","guanlecoja.ui","bbData"]}return e}(),s=function(){function e(e,s){var t,i,u,a;u="angular_dashboard",t="Angular Dashboard v2.19",s.addGroup({name:u,caption:t,icon:"user-circle",order:10}),i={group:u,caption:t},a={controller:"buildbotFriDashboardController",controllerAs:"d",templateUrl:"angular_dashboard/views/dashboard.html",name:u,url:"/"+u,data:i},e.state(a)}return e}(),angular.module("angular_dashboard",new e).config(["$stateProvider","glMenuServiceProvider",s])}.call(this),function(){var e,s=function(e,s){return function(){return e.apply(s,arguments)}};e=function(){function e(e,t,i,u){var a,d;this.$uibModal=u,this.generateBuildsMap=s(this.generateBuildsMap,this),this.onChangeBuild=s(this.onChangeBuild,this),this.onChangeBuildrequests=s(this.onChangeBuildrequests,this),this.onChangeBuildsets=s(this.onChangeBuildsets,this),_.mixin(e,i),this.data=t.open().closeOnDestroy(e),e.sourcestampsMap=this.sourcestampsMap={},e.builds=this.builds={},e.buildrequests=this.buildrequests={},this.buildrequestsMap={},this.buildsetsMap={},this.buildrequestsGetMap={},this.buildsGetMap={},e.builders=this.builders=this.data.getBuilders(),d=Math.floor((new Date).getTime()/1e3),a=d-604800,this.buildsets=this.data.getBuildsets({limit:128,order:"-bsid",submitted_at__gt:a}),this.buildsets.onChange=this.onChangeBuildsets}return e.prototype.onChangeBuildsets=function(){var e,s,t,i,u,a,d,l,r;if(this.buildsets.$resolved&&this.buildsets.length>0){for(s=function(e){var s;return s={revision:e.revision,when_timestamp:e.created_at,codebase:e.codebase,repository:e.repository,branch:e.branch},e.hasOwnProperty("patch")&&e.patch&&(s.author=e.patch.author,s.comments=e.patch.comment),s},u=this.buildsets,a=[],t=0,i=u.length;i>t;t++)e=u[t],l=e.sourcestamps,1!==l.length&&console.log("Unexpected sourcestamps for buildset "+e.bsid),d=l[0],r=d.ssid,this.sourcestampsMap.hasOwnProperty(r)||(this.sourcestampsMap[r]={change:s(d),buildsets:[]}),this.sourcestampsMap[r].buildsets.push(e.bsid),console.log(this.sourcestampsMap),this.buildrequestsGetMap[e.bsid]=this.data.getBuildrequests({buildsetid:e.bsid}),a.push(this.buildrequestsGetMap[e.bsid].onChange=this.onChangeBuildrequests);return a}},e.prototype.onChangeBuildrequests=function(){var e,s,t,i,u,a,d,l,r;d=this.buildrequestsGetMap;for(a in d)if(e=d[a],!e.$resolved)return;l=this.buildrequestsGetMap,r=[];for(u in l)i=l[u],this.buildsetsMap[u]={},this.buildsetsMap[u].pendingBuildrequests={},this.buildsetsMap[u].claimedBuildrequests={},r.push(function(){var e,a,d;for(d=[],e=0,a=i.length;a>e;e++)s=i[e],t=s.buildrequestid,s.claimed?(this.buildsGetMap[t]=this.data.getBuilds({buildrequestid:t}),this.buildsGetMap[t].onChange=this.onChangeBuild,d.push(this.buildsetsMap[u].claimedBuildrequests[t]=s)):d.push(this.buildsetsMap[u].pendingBuildrequests[t]=s);return d}.call(this));return r},e.prototype.onChangeBuild=function(){var e,s,t,i,u,a,d,l,r;l=this.buildsGetMap;for(a in l)if(e=l[a],!e.$resolved)return;r=this.buildsGetMap;for(t in r)for(i=r[t],this.buildrequestsMap[t]={},u=0,d=i.length;d>u;u++)s=i[u],this.buildrequestsMap[t][s.buildid]=s;return this.generateBuildsMap()},e.prototype.generateBuildsMap=function(){var e,s,t,i,u,a,d,l,r,n,o,h,b,c;l=this.sourcestampsMap;for(c in l)for(b=l[c],this.builds[c]={},this.buildrequests[c]={},r=b.buildsets,a=0,d=r.length;d>a;a++){u=r[a],n=this.buildsetsMap[u].claimedBuildrequests;for(i in n){t=n[i],o=this.buildrequestsMap[i];for(s in o)e=o[s],this.builds[c].hasOwnProperty(t.builderid)||(this.builds[c][t.builderid]={}),this.builds[c][t.builderid][s]=e}h=this.buildsetsMap[u].pendingBuildrequests;for(i in h)t=h[i],this.buildrequests[c].hasOwnProperty(t.builderid)||(this.buildrequests[c][t.builderid]={}),this.buildrequests[c][t.builderid][i]=t}return console.log("Number of builds: "+Object.keys(this.builds).length),console.log(this.builds)},e.prototype.selectBuild=function(e){var s;return s=this.$uibModal.open({templateUrl:"angular_dashboard/views/modal.html",controller:"dashboardModalController as modal",windowClass:"modal-big",resolve:{selectedBuild:function(){return e}}})},e}(),angular.module("angular_dashboard").controller("buildbotFriDashboardController",["$scope","dataService","resultsService","$uibModal",e])}.call(this),function(){var e;e=function(){function e(e,s,t){this.$uibModalInstance=s,this.selectedBuild=t,e.$on("$stateChangeStart",function(e){return function(){return e.close()}}(this))}return e.prototype.close=function(){return this.$uibModalInstance.close()},e}(),angular.module("angular_dashboard").controller("dashboardModalController",["$scope","$uibModalInstance","selectedBuild",e])}.call(this),angular.module("angular_dashboard").run(["$templateCache",function(e){e.put("angular_dashboard/views/dashboard.html",'<div class="container mydashboard"><table class="table"><tr><th>SourceStamp</th><th ng-repeat="builder in builders"><a ng-href="#/builders/{{ builder.builderid }}" ng-bind="builder.name"></a></th></tr><tr ng-repeat="(id, sourcestamp) in sourcestampsMap"><td><changedetails change="sourcestamp.change"><td ng-repeat="builder in builders"><a ng-repeat="(buildid, build) in builds[id][builder.builderid]"><span class="badge-status" ng-class="results2class(build, \'pulse\')" ng-click="d.selectBuild(build)">{{ build.number }}</span></a><a ng-repeat="(buildrequestid, buildrequest) in buildrequests[id][builder.builderid]" ui-sref="buildrequest({buildrequest: buildrequest.buildrequestid})"><span class="badge-status" ng-class="results2class(buildrequest, \'pulse\')"><div class="badge-inactive">{{buildrequest.buildrequestid}}</div><div class="badge-active">{{results2text(buildrequest)}}{{ buildrequest.buildrequestid }}</div></span></a></td></changedetails></td></tr></table></div>'),e.put("angular_dashboard/views/modal.html",'<!-- Show build summary for the selected build in a modal window--><div class="modal-header"><i class="fa fa-times pull-right" ng-click="modal.close()"></i><h4 class="modal-title">Build summary</h4></div><div class="modal-body"><buildsummary ng-if="modal.selectedBuild" buildid="modal.selectedBuild.buildid"></buildsummary></div>')}]);