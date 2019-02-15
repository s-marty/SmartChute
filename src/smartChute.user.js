// ==UserScript==
// @name            Smart Chute
// @version         19.2.1
// @description     BitChute.com Enhancer. Makes you feel warm.
// @license         MIT
// @compatible      firefox
// @compatible      chrome
// @namespace       https://github.com/s-marty/SmartChute
// @homepageURL     https://github.com/s-marty/SmartChute
// @supportURL      https://github.com/s-marty/SmartChute/wiki
// @icon            https://raw.githubusercontent.com/s-marty/SmartChute/master/images/smartChute.png
// @downloadURL     https://github.com/s-marty/SmartChute/raw/master/src/smartChute.user.js
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QHFFSLZ7ENUQN&source=url
// @include         /^https?://www\.bitchute\.com/.*$/
// @run-at          document-end
// @grant           GM.getValue
// @grant           GM.setValue
// @noframes
// ==/UserScript==


/** **********************   Features   **********************
*** Accelerated Bit Chute user experience ahead
*** Floating mini video player is visible when scrolling
*** Floating mini video player position is draggable
*** Floating mini video player size is mouse resizeable
*** Blacklist annoying channels with one click if enabled
*** De-blacklist channels with two clicks using Smarty menu
*** Unfix top header to show only while up-scrolling
*** Hide the upper channel carousel using Smarty menu
*** Hide unsafe ads to avoid viruses or other malware
*** Hide or unhide comments section - make up your own mind  or not
*** Scrolls down to video player automatically if header is unfixed
*** Autoplay videos or not is now selectable
*** Video volume is remembered - No More 100% volume the first play
*** Theme night/day is remembered when clicking the sun/moon icon
*** Three additional night themes for your tired eyes
*** Play Next is remembered when clicking the "PLAYING NEXT" button
*** Remembering lasts across browser instantiations too
*** Top ten most viewed channel video playlist on video page
*** 32 More video choices on Video watch page vs. 6
*** Unlimited video choices using "SHOW MORE" button, vs. 6
***          Smarty menu always available

***  ***  Does not & will not work well with IE and IEdge  ***/

// Editable options
var hide_Cookie_Notice = true;
var hide_Donation_Bar = true;
// End Editable options

(function() {
    "use strict";

    var BC = {}
    var d = document;
    var miniPlayerX = 0;
    var miniPlayerY = 0;
    var miniPlayerW = 0;
    var miniPlayerH = 0;
    var listingsAllHeight = 0;
    var listingsPopHeight = 0;
    var miniSiz = {h:0,hd:0};
    var miniPos = {x:0,y:0,xd:0,yd:0};
    var origVid = {w:698,h:393,r:1.778};
    var miniplayer = { x:0,y:0,w:350,h:197 };
    var isChrome = navigator.userAgent.indexOf('Chrome') !=-1;

    function chuteMePlease(e) {

        BC.url          = window.location.href;
        BC.host         = window.location.hostname;
        BC.path         = window.location.pathname;
        BC.watchpage    = BC.path.indexOf('/video') !=-1;
        BC.searchpage   = BC.path.indexOf('/search/') !=-1;
        BC.profilepage  = BC.path.indexOf('/profile/') !=-1;
        BC.channelpage  = BC.path.indexOf('/channel/') !=-1;
        BC.categorypage = BC.path.indexOf('/category/') !=-1;
        BC.homepage     = BC.url == location.protocol +"//"+ BC.host +"/";

        if (!BC.loaded) {
            var loader;
            if (loader = qs("#loader-container")) {
                addListener(loader, function(e) {
                    if (e.target.style.opacity == 0.5 && e.target.style.display == 'block') chuteMePlease(e)
                },{ subtree: false, childList: false, attributes : true, attributeFilter : ['style'] });
            }
            if (! (BC.homepage || BC.watchpage || BC.channelpage || BC.categorypage || BC.profilepage || BC.searchpage)) return;
            if (hide_Cookie_Notice) hideCookieNotice();
            setTimeout(addThemeListeners, 2000);
            if (isChrome && BC.settings.hidemenubar) {
                window.addEventListener('beforeunload', function(e){
                  if (!document.activeElement.href){window.scrollTo(0, 0)}
                }, false);
            }
            setTheme();
            setPreferencesCookie("autoplay", BC.settings.playnext);
            if (BC.searchpage || BC.profilepage) return;
            let style       = d.createElement("style");
            style.type      = "text/css";
            style.innerText = '.nav-tabs-list {min-width: 500px !important; width: 100%;} .sidebar-recent .video-card.active {border: 1px solid #f37835; border-radius: 5px; }' +
                              '#loader-container {opacity: 0.5;} span.add-to-blacklist { position: absolute; top: 4px; left: 4px; z-index: 50; width:30px; height:30px; } a.side-toggle {cursor: pointer; }' +
                              'span.blacklist-tooltip { position: absolute; font-size: 14px;width: 60px; height: 22px; left: 2px; top: 38px; line-height: 1.6; background-color: #000 ;display:none; }' +
                              'span.add-to-blacklist svg { cursor: pointer; } html.noblacklist span.add-to-blacklist {display:none; } #channel-list div.item div.channel-card:hover .add-to-blacklist {opacity: 1; }' +
                              'span.add-to-blacklist:hover span.blacklist-tooltip { color:#fff; display:inline; } #carousel {'+(BC.settings.hidecarousel ? "display:none" : "width: 100%; min-height: 210px" )+';}';
            if (BC.settings.hidemenubar) {
                style.innerText += '#nav-top-menu {position: static; width: 100%; height: 60px;} #nav-menu-buffer {height: 0px; padding-top: 0px !important;; } ' +
                                   'html.topNavfloat #nav-top-menu, html.tabNavfloat .tab-scroll-outer {-webkit-transition: top 0.5s ease-in-out; -moz-transition: top 0.5s ease-in-out; -o-transition: top 0.5s ease-in-out; transition: top 0.5s ease-in-out;}' +
                                   'html.topNavfloat #nav-top-menu {position: fixed; /*background: #211f22 !important;*/ } html.tabNavfloat .tab-scroll-outer {position: fixed; width: 100%; z-index:989; background: #fff; } ' +
                                   'html.tabNavfloat.night .tab-scroll-outer {background: #211f22; }' +
                                   'html.topNavfloat #nav-menu {padding-top: 60px; } html.tabNavfloat #page-detail .tab-content {margin-top: 50px; } html.tabNavfloat #page-detail #listing-trending {margin-top: -50px; } html.tabNavfloat #nav-side-menu {z-index:999; }';
            }
            if (BC.settings.playlists) {
                style.innerText += '\
                    .mvplaylist.row {margin-top:20px;margin-bottom:20px;} .mvplaylist .mvslider {width:100%;max-width: 878px; padding-left:35px;margin: auto 0px; overflow:hidden;display: inline;}\
                    .mvplaylist .mvslider {-webkit-transition: margin-left 0.25s ease-in-out; -moz-transition: margin-left 0.25s ease-in-out; -o-transition: margin-left 0.25s ease-in-out; transition: margin-left 0.25s ease-in-out;}\
                    .mvplaylist .playlistup {margin-left:693px;} .mvplaylist .playlistbtn {cursor:pointer;width: 30px;height:195px;padding-top:85px;background-color: #ddd;text-align:center;position: absolute; z-index: 80;}\
                    .mvplaylist .playlistbtn b {cursor:pointer;} .mvplaylist .playlistbtn.disabled {cursor:default;} .mvplaylist .playlistbtn.disabled b {color: #ddd;cursor:default;}\
                    .mvplaylist .playlist-card {width: 208px;height:195px;margin: 0 5px;} .mvplaylist .playlist-card .video-card-title {height: 52px;} .night .mvplaylist .playlistbtn {background-color: #2c2a2d;}\
                    .night .mvplaylist .playlistbtn.disabled b {color: #2c2a2d;} @media (min-width: 768px) {.mvplaylist .mvslider {max-width: 660px;} .mvplaylist .playlistup {margin-left:475px;}}\
                    @media (min-width: 992px) {.mvplaylist .mvslider {max-width: 878px;} .mvplaylist .playlistup {margin-left:693px;}}';
            }
            if (BC.settings.hideadverts) {
                style.innerText += '.sidebar .rcad-container {display:none !important;}';
            }
            if (hide_Donation_Bar) {
                style.innerText += '.video-container .text-center { display: none !important; }';
            }
            d.documentElement.appendChild(style);
            if (BC.settings.hidemenubar) window.addEventListener('scroll', floatHeaders);
            BC.loaded = 1;
        }

        if (BC.watchpage) {
            BC.page = 'watchpage';
                /* Provide mini player */
            BC.player.api = qs('video#player');
            if (BC.player.api != null) {
                if (!BC.player.rect) {
                    window.scrollTo(0, 0);
                    BC.player.rect = BC.player.api.getBoundingClientRect();
                }
                BC.player.api.mini_point = BC.player.rect.top + ((BC.player.rect.height / 2) + 50);
                origVid = {
                  w: Math.round(BC.player.rect.width * 10) / 10,
                  h: Math.round(BC.player.rect.height * 10) / 10,
                  r: Math.round(BC.player.rect.width/BC.player.rect.height * 1000) / 1000
                };
                if (!BC.miniPlayerIni) {
                    GM.getValue('miniplayer', "{}").then(function (value) {
                        if (value && value != '{}') {
                            miniplayer = JSON.parse(value);
                            window.addEventListener("scroll", miniPlayer, false);
                            d.addEventListener("fullscreenchange", () => { onFullScreen()});
                            d.addEventListener("mozfullscreenchange", () => { onFullScreen()});
                            d.addEventListener("webkitfullscreenchange", () => { onFullScreen()});
                            let style       = d.createElement("style");
                            style.type      = "text/css";
                            style.innerText = 'html:not(.isfullscreen).s-marty-miniplayer video#player, html:not(.isfullscreen).s-marty-miniplayer .plyr__video-wrapper {opacity: 0.97;}' +
                              'html:not(.isfullscreen).s-marty-miniplayer .video-container .wrapper {position: fixed;z-index: 100;background-color:transparent;' +
                              'border:1px solid rgba(255,255,255,.3);box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.4)}' +
                              'html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar {display : block;cursor: move; height: 40px; left: -3px; right: 5px; top: -6px; position: absolute;z-index: 110;background-color:transparent;}' +
                              'html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar:hover {background-color:#000; opacity: 0.4; background-clip: padding-box; padding: 6px 0 0 6px;}' +
                              'html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-size {display : block;cursor: nesw-resize; width:7px; height: 7px; right: -3px; top: -3px; position: absolute;z-index: 120;background-color:transparent;}' +
                              'html:not(.s-marty-miniplayer) #s-marty-miniplayer-bar, html:not(.s-marty-miniplayer) #s-marty-miniplayer-size {display : none;} html:not(.isfullscreen).s-marty-miniplayer .plyr__volume {max-width:12% !important;}' +
                              'html.isfullscreen video#player {width: 100% !important; height: !important;}';
                            d.documentElement.appendChild(style);
                            BC.miniPlayerIni = true;
                        }
                    }).catch (error => {
                        console.error('miniplayer: Error in GM.getValue promise: '+ error)
                    });
                }

                BC.player.fur = qs(".video-container .wrapper");
                let bar = d.createElement("div");
                bar.setAttribute('id', 's-marty-miniplayer-bar');
                bar.addEventListener("mousedown", moveMiniPlayer, true);
                let size = d.createElement("div");
                size.setAttribute('id', 's-marty-miniplayer-size');
                size.addEventListener("mousedown", sizeMiniPlayer.bind(this), true);
                BC.player.fur.insertBefore(bar, BC.player.fur.firstChild);
                BC.player.fur.insertBefore(size, BC.player.fur.firstChild);
                BC.player.api.volume = BC.player.volume;
                BC.player.fur.parentNode.style = 'width:'+origVid.w+'px;height:'+origVid.h+'px;'

                    /* Autoplay videos */
                if (BC.player.autoplay && BC.player.api.paused) {
                    BC.player.api.setAttribute('autoplay', '');
                    qs('.plyr__controls .plyr__volume').removeAttribute('hidden');
                    qs('.plyr__controls button[data-plyr="mute"]').removeAttribute('hidden');
                        /* Promises Promises */
                    var playPromise = BC.player.api.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function() {
                        }).catch(function(error) {
                            //User must click the first video now
                        });
                    }
                }
                else if (!BC.player.autoplay && !BC.player.api.paused) {
                    BC.player.api.removeAttribute('autoplay');
                    BC.player.api.pause();
                }

                BC.player.api.addEventListener('volumechange', function(e) {
                    savePlayerValue('volume', (Math.round(e.target.volume / 0.01) * 0.01))
                }, false);

                let playnext = qs("label.sidebar-autoplay");
                playnext.addEventListener('mousedown', function(e) {
                    if (e.which===1) {
                       let checked = qs("input#autoplay-toggle").checked;
                       savePlayerValue('playnext', !checked)
                    }
                }, false);
            }
            if (BC.settings.hidecomments) setTimeout(hideComments, 2000);
            addMoreRecentVideos(8);
            if (BC.settings.playlists) addMostViewedPlaylist();
        }
        else if (BC.channelpage) {
            BC.page = 'channelpage';
            if (d.cookie.indexOf('sensitivity=') !=-1 && window.location.search.indexOf('showall=1') ==-1) {
                d.cookie = "sensitivity=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            }
            let sensitivityWarning;
            if (sensitivityWarning = qs('.sensitivity-warning a'))
                sensitivityWarning.addEventListener('click', addSensitivityCookie, false);
        }
        else if (BC.homepage || BC.categorypage) {
            BC.page = 'homepage';
            let listingsAll = qs('#listing-all > div.row');
            let listingsPopular = qs('#listing-popular > div.row');

            if (!BC.listenersIni) {
                qs("ul.nav-tabs-list li a[href='#listing-all']")
                  .addEventListener('click', function(e){ applyBlacklist('#listing-all > div.row > div', 'all') }, false);
                qs("ul.nav-tabs-list li a[href='#listing-popular']")
                  .addEventListener('click', function(e){ applyBlacklist('#listing-popular > div.row > div', 'popular') }, false);
                qs("ul.nav-tabs-list li a[href='#listing-trending']")
                  .addEventListener('click', function(e){ applyBlacklist('div#trending-day > div.row > div,div#trending-week > div.row > div,div#trending-month > div.row > div', 'trending') }, false);
                qs("ul.nav-tabs-list li a[href='#listing-subscribed']")
                  .addEventListener('click', function(e){ navsIni('subscribedpage') }, false);

                addListener(listingsAll, function(e) {
                    if (BC.settings.useblacklist) {
                        let newlistings = qs('#listing-all > div.row');
                        let newlistingsHeight = Math.round(newlistings.getBoundingClientRect().height);
                        if (listingsAllHeight != newlistingsHeight) {
                            listingsAllHeight = newlistingsHeight;
                            applyBlacklist('#listing-all > div.row > div');
                        }
                    }
                }),{ childList: true, subtree: false, characterData: false, attributes : false };

                addListener(listingsPopular, function(e) {
                    if (BC.settings.useblacklist) {
                        let newlistings = qs('#listing-popular > div.row');
                        let newlistingsHeight = Math.round(newlistings.getBoundingClientRect().height);
                        if (listingsPopHeight != newlistingsHeight) {
                            listingsPopHeight = newlistingsHeight;
                            applyBlacklist('#listing-popular > div.row > div');
                        }
                    }
                }),{ childList: true, subtree: false, characterData: false, attributes : false };

                BC.listenersIni = true;
            }
            if (BC.settings.useblacklist) {
                listingsAllHeight = Math.round(listingsAll.getBoundingClientRect().height);
                listingsPopHeight = Math.round(listingsPopular.getBoundingClientRect().height);

                if (!BC.settings.hidecarousel)
                    applyBlacklist('#channel-list div.item > div');
            }
            if (BC.settings.hidecarousel) { // The only way to pause this thing
                if (qs('#carousel')) qs('#carousel').innerHTML = '';
            }
            applyBlacklist('#listing-all > div.row > div');
        }
        createSmartyButton();
        navsIni(BC.page);
    };

    function applyBlacklist(selector, page) {
        BC.previouslisting = selector;
        if (page) navsIni(page);
        if (!BC.settings.useblacklist) return;
        selector = selector.split(',').join(':not([polled]), ') + ':not([polled])';
        let i,
            listings = qsa(selector);
        if (listings.length) {
            try {
                for (i = 0; i < listings.length; i++) {
                    let href = listings[i].querySelector('.video-card-channel a, .video-trending-channel a, .channel-card a');
                    if (href) {
                        href = href.getAttribute("href");
                        let channel = href.match( /\/channel\/([a-z0-9_\-]+)\//i );
                        if (channel != null && channel[1] != null) {
                            if (BC.blacklist.includes(channel[1])) {
                                listings[i].outerHTML = ''
                            }
                            else {
                                listings[i].setAttribute('polled', channel[1]);
                                let button = blacklistButton();
                                let videoCard = listings[i].querySelector('.video-card, .video-trending-image, .channel-card');
                                videoCard.appendChild(button);
                                button.addEventListener('click', function(e){ blacklistAdd(e, channel[1]) }, true);
                            }
                        }
                    }
                }
            }
            catch (e) {console.error(e)}
        }
    }

    function createSmartyButton() {
        let i;
        let blacklisted;
        let blContent = '';
        let tabContent = '<a href="javascript:void(0)">Smarty</a><div id="smarty_tab" class="modal-content" style="display: none; position: absolute; z-index: 200;">'+
              '<div style="width: 170px; padding: 8px; border: 1px solid #333; border-radius:3px;">'+
                '<input name="useblacklist" id="useblacklist2" type="checkbox"'+(BC.settings.useblacklist ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="useblacklist2">&nbsp;Use Blacklist</label><br>'+
                '<input name="hidemenubar" id="hidemenubar2" type="checkbox"'+(BC.settings.hidemenubar ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidemenubar2">&nbsp;Scroll Menubar</label><br>'+
                '<input name="hidecarousel" id="hidecarousel2" type="checkbox"'+(BC.settings.hidecarousel ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidecarousel2">&nbsp;Hide Carousel</label><br>'+
                '<input name="hidecomments" id="hidecomments2" type="checkbox"'+(BC.settings.hidecomments ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidecomments2">&nbsp;Hide Comments</label><br>'+
                '<input name="playlists" id="playlists2" type="checkbox"'+(BC.settings.playlists ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="playlists2">&nbsp;Show Playlist</label><br>'+
                '<input name="autoplay" id="autoplay2" type="checkbox"'+(BC.player.autoplay ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="autoplay2">&nbsp;Auto Play Video</label><br>'+
                '<input name="hideadverts" id="hideadverts2" type="checkbox"'+(BC.settings.hideadverts ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hideadverts2">&nbsp;Hide Unsafe Ads</label><br>'+
                '<input name="color" title="Night Color: None" value="none" type="radio"'+(BC.settings.color == 'none' ? ' checked':'')+'>&nbsp;&nbsp;<span style="height:12px;width:12px;background-color:#211f22;color:#f0af5a">&nbsp;&nbsp;<b>O</b>&nbsp;'+
                '<input name="color" title="Night Color: Orange" value="orange" type="radio"'+(BC.settings.color == 'orange' ? ' checked':'')+'></span><span style="height:12px;width:12px;background-color:#211f22;color:#559bcc">&nbsp;&nbsp;<b>B</b>&nbsp;'+
                '<input name="color" title="Night Color: Blue" value="blue" type="radio"'+(BC.settings.color == 'blue' ? ' checked':'')+'></span><span style="height:12px;width:12px;background-color:#211f22;color:#55a47c">&nbsp;&nbsp;<b>G</b>&nbsp;'+
                '<input name="color" title="Night Color: Green" value="green" type="radio"'+(BC.settings.color == 'green' ? ' checked':'')+'>&nbsp;</span><br>'+
              '</div><div id="blacklistedchannels" style="padding: 8px; border: 1px solid #333; border-radius:3px; border-top:none;"><div><em>No Blacklist</em></div></div></div>';
        let menu = qs('ul.nav-tabs-list');
        let smarty = qs('#smarty_tab');

        if (smarty == null) {
            smarty = d.createElement("li");
            smarty.innerHTML = tabContent;
            menu.appendChild(smarty);
            blacklisted = qs('#blacklistedchannels');

            if (BC.settings.useblacklist) {
                if (BC.blacklist.length ) {
                    for (i = 0; i < BC.blacklist.length; i++) {
                        blContent += '<span style="cursor:pointer" title="Click to remove '+
                          BC.blacklist[i] +'">'+ (blacklistName(BC.blacklist[i])) +'</span><br>';
                    }
                }
                else blContent = '<div><em>No Blacklist</em></div>';
            }
            else blContent = '<div><em>Blacklist Off</em></div>';
            if (blContent) blacklisted.innerHTML = blContent;

            smarty.querySelector('a').addEventListener('click', toggleTab,true);
            smarty.querySelector('#useblacklist2').addEventListener('change', function(e) {toggleSettings('useblacklist',e.target.checked)}, false);
            smarty.querySelector('#hidecarousel2').addEventListener('change', function(e) {toggleSettings('hidecarousel',e.target.checked)}, false);
            smarty.querySelector('#hidecomments2').addEventListener('change', function(e) {savePlayerValue('hidecomments',e.target.checked)}, false);
            smarty.querySelector('#hidemenubar2').addEventListener('change', function(e) {toggleSettings('hidemenubar',e.target.checked)}, false);
            smarty.querySelector('#hideadverts2').addEventListener('change', function(e) {toggleSettings('hideadverts',e.target.checked)}, false);
            smarty.querySelector('#playlists2').addEventListener('change', function(e) {savePlayerValue('playlists',e.target.checked)}, false);
            smarty.querySelector('#autoplay2').addEventListener('change', function(e) {savePlayerValue('autoplay',e.target.checked)}, false);
            let colors = smarty.querySelectorAll('input[type=radio][name=color]');
            for (i = 0; i < colors.length; i++) {
                colors[i].addEventListener('change', function(e) {toggleSettings('color',this.value)}, false);
            }
        }
        else {
            blacklisted = qs('#blacklistedchannels');
            if (BC.settings.useblacklist) {
                if (BC.blacklist.length ) {
                    for (i = 0; i < BC.blacklist.length; i++) {
                        blContent += '<span style="cursor:pointer" title="Click to remove '+
                          BC.blacklist[i] +'">'+ (blacklistName(BC.blacklist[i])) +'</span><br>';
                    }
                }
                else blContent = '<div><em>No Blacklist</em></div>';
            }
            else blContent = '<div><em>Blacklist Off</em></div>';
            blacklisted.innerHTML = blContent;
        }
        if (BC.blacklist.length > 14 && BC.settings.useblacklist) {
            blacklisted.style.height = '280px';
            blacklisted.style.overflowY = 'scroll';
        }
        else {
            blacklisted.style.height = 'auto';
            blacklisted.style.overflowY = 'visible';
        }
        menu.parentNode.style.overflow = 'visible';
        smarty = qsa('#blacklistedchannels > span');
        for (i = 0; i < smarty.length; i++) {
            smarty[i].addEventListener('click', blacklistRemove, true);
        }
    }

    function blacklistName(s) { return s.length < 25 ? s : s.substr(0, 24) +'…' }

    function blacklistButton() {
        let span = d.createElement("span");

        span.className = "action-button add-to-blacklist";
        span.innerHTML = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 33 33" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,27.000000) ' +
            'scale(0.100000,-0.100000)" stroke="none"><path fill="currentColor" d="M12 258 c-17 -17 -17 -229 0 -246 17 -17 229 -17 246 0 17 17 17 229 0 246 -17 17 -229 17 -246 0z m233 -123 l0 -110 -110 0 -110 0 -3 99 c-1 55 0 106 2 113 4 11 30 13 113 11 l108 -3 0 -110z"/>' +
            '<path fill="currentColor" d="M40 217 c0 -7 16 -26 35 -42 19 -17 35 -35 35 -40 0 -6 -16 -25 -35 -42 -19 -18 -35 -37 -35 -43 0 -22 31 -8 60 29 l32 39 35 -39 c34 -37 63 -51 63 -29 0 6 -16 24 -35 41 -19 17 -35 37 -35 44 0 7 16 25 35 39 35 27 47 56 ' +
            '23 56 -7 0 -26 -16 -41 -35 -15 -19 -33 -35 -40 -35 -7 0 -25 16 -41 35 -30 35 -56 46 -56 22z"/></g></svg><span class="blacklist-tooltip">&nbsp;Blacklist</span>';
        return span
    }

    function toggleTab(e,pos) {
        let close = typeof pos != 'undefined' && pos == 'close' ? true : false;
        let tab = qs('#smarty_tab');

        if (tab.style.display == 'none' && !close) {
            tab.style.display = 'block';
            d.body.addEventListener('click', function(e) {toggleTab(null,'close')} );
        }
        else {
            setTimeout(function(){tab.style.display = 'none'},200);
            d.body.removeEventListener('click', function(e) {toggleTab(null,'close')} );
        }
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function blacklistAdd(e, channel) {
        var i;
        BC.blacklist.push(channel);
        BC.blacklist.sort();
        GM.setValue('blacklist', JSON.stringify(BC.blacklist));
        createSmartyButton();
        let blocked = qsa('[polled="'+channel+'"]');
        for (i = 0; i < blocked.length; i++) blocked[i].innerHTML = wait(blocked[i]);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function blacklistRemove(e) {
        toggleTab();
        let arr = BC.blacklist.filter(function(ele){
            return ele != e.target.innerText;
        });
        BC.blacklist = arr;
        BC.blacklist.sort();
        GM.setValue('blacklist', JSON.stringify(BC.blacklist));
        createSmartyButton();
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function wait(o) {
        var waiter = '<div id="loader" style="position: relative;margin: auto;left: 0;top: 90px;width: 10%;"><ul style="width: 10%;"><li></li><li></li><li></li></ul></div>';
        var dim = o.getBoundingClientRect();
        var n = dim.width;
        o.style.padding = '0';
        o.style.width = n +'px';
        o.style.height = dim.height +'px';

        setTimeout(function() {
            o.style = '-webkit-transition: width 1s ease-out; -moz-transition: width 1s ease-out; -o-transition: width 1s ease-out; transition: width 1s ease-out; width:0%;';
            setTimeout(function() {
                o.outerHTML = '';
            }, 900)
        }, 500);
        return waiter;
    }

    var maxY, minY, lastY, tabTop;
    var topfloat, tabfloat, upPrev;
    var tabNav, topNav;
    function floatHeaders(e) {
        let spanY = 0;
        let scrolled = Math.round(pageYOffset);
        let up = scrolled < lastY;

        if (scrolled == lastY) return;
        else if (up) {
            minY = scrolled;
            spanY = minY - maxY;
        }
        else {
            maxY = scrolled;
            spanY = maxY - minY;
        }
        lastY = scrolled;

        if (up) {
            if (!upPrev) maxY = lastY;
            if (scrolled < tabTop + 100 || spanY < -150) {
                if (topfloat) {
                    if (scrolled < 1) {
                        maxY = 0;
                        topfloat = false;
                        topNav.style.top = '';
                        d.documentElement.classList.remove("topNavfloat");
                    }
                    else if (scrolled > tabTop + 99) {
                        topNav.style.top = '0px';
                    }
                }
                if (topfloat) {
                    if (scrolled <= tabTop - 60) {
                        tabfloat = false;
                        tabNav.style.top = '';
                        d.documentElement.classList.remove("tabNavfloat");
                    }
                    else if (scrolled > tabTop + 99) {
                        tabNav.style.top = '60px';
                    }
                }
            }
        }
        else if (scrolled > tabTop + 88 && spanY > 149) {
            if (upPrev) minY = lastY;
            topNav.style.top = '-160px';
            if (!topfloat) {
                topfloat = true;
                d.documentElement.classList.add("topNavfloat");
            }
            tabNav.style.top = '-102px';
            if (!tabfloat) {
                tabfloat = true;
                d.documentElement.classList.add("tabNavfloat");
            }
        }
        upPrev = up;
    }

    function navsIni(page) {
        if (BC.settings.hidemenubar) {
            window.scrollTo(0, 0);
            maxY = 0; minY = 0; lastY = 0; tabTop = 0;
            topfloat = false; tabfloat = false; upPrev = true;
            topNav = qs('#nav-top-menu');
            tabNav = qs('.tab-scroll-outer');
            d.documentElement.classList.remove("topNavfloat");
            d.documentElement.classList.remove("tabNavfloat");
            topNav.style.top = '';
            if (tabNav && !tabTop) {
                tabNav.style.top = '';
                setTimeout( function(){
                  tabTop = tabNav.getBoundingClientRect().top;
                  if (isChrome) setTimeout( function(){window.scrollTo(0, tabTop)},1000);
                  else window.scrollTo(0, tabTop);
                },1000);
            }
        } else return
    }

    function toggleSettings(arg, val) {
        if (arg == 'useblacklist') {
            savePlayerValue(arg, val);
            createSmartyButton();
            if (BC.homepage) {
                if (val) {
                    if (BC.previouslisting) {
                        let previouslisting = BC.previouslisting;
                        if (previouslisting.indexOf('listing') !=-1 && !BC.settings.hidecarousel)
                            applyBlacklist('#channel-list div.item > div');
                        applyBlacklist(previouslisting);
                    }
                    d.documentElement.classList.remove("noblacklist");
                }
                else d.documentElement.classList.add("noblacklist");
            }
        }
        else if (arg == 'hidecarousel') {
            let carousel;
            if (carousel = qs('#carousel')) {
                carousel.style.display = (val ? 'none' : 'block');
                if (val) carousel.innerHTML = '';
                else carousel.innerHTML = '<h2>Refresh window to start carousel</h2>';
            }
            savePlayerValue(arg, val);
            createSmartyButton();
        }
        else if (arg == 'hidemenubar') {
            savePlayerValue(arg, val);
            createSmartyButton();
        }
        else if (arg == 'hideadverts') {
            let advert;
            if (advert = qs('.rcad-container')) {
                advert.style.display = (val ? 'none' : 'block');
            }
            savePlayerValue(arg, val);
            createSmartyButton();
        }
        else if (arg == 'usedark') {
            if (val) d.documentElement.classList.add("night");
            else d.documentElement.classList.remove("night");
            savePlayerValue(arg, val);
        }
        else if (arg == 'color') {
            savePlayerValue(arg, val);
            window.location.href = window.location.href;
        }
    }

    function savePlayerValue(arg, val) {
        if (arg == 'volume') BC.player.volume = val;
        else if (arg == 'autoplay') BC.player.autoplay = val;
        else if (arg == 'color') BC.settings.color = val;
        else if (arg == 'playnext') BC.settings.playnext = val;
        else if (arg == 'playlists') BC.settings.playlists = val;
        else if (arg == 'usedark') BC.settings.usedark = val;
        else if (arg == 'useblacklist') BC.settings.useblacklist = val;
        else if (arg == 'hidecarousel') BC.settings.hidecarousel = val;
        else if (arg == 'hidecomments') BC.settings.hidecomments = val;
        else if (arg == 'hidemenubar') BC.settings.hidemenubar = val;
        else if (arg == 'hideadverts') BC.settings.hideadverts = val;
        GM.setValue('player', JSON.stringify({
          volume       : BC.player.volume,
          autoplay     : BC.player.autoplay,
          color        : BC.settings.color,
          playnext     : BC.settings.playnext,
          playlists    : BC.settings.playlists,
          usedark      : BC.settings.usedark,
          useblacklist : BC.settings.useblacklist,
          hidecarousel : BC.settings.hidecarousel,
          hidecomments : BC.settings.hidecomments,
          hidemenubar  : BC.settings.hidemenubar,
          hideadverts  : BC.settings.hideadverts
        }));
    }

    var persistTryHCC = 0;
    function hideCookieNotice(e) {
        BC.cookies = qs('#alert-cookie');
        if (BC.cookies != null) {
            BC.cookies.style.display = 'none';
            persistTryHCC = 0;
        }
        else if (persistTryHCC++ < 30) window.setTimeout(hideCookieNotice, 1000);
    }

    function miniPlayer() {
        let show_mini = pageYOffset > BC.player.api.mini_point;
        let is_mini = d.documentElement.classList.contains("s-marty-miniplayer")

        if (!show_mini && is_mini) {
            d.documentElement.classList.remove("s-marty-miniplayer");
            BC.player.fur.style.width = '';
            BC.player.fur.style.height = '';
            BC.player.fur.style.left = '0px';
            BC.player.fur.style.bottom = '0px';
            BC.player.api.style.width = '';
            BC.player.api.style.height = origVid.h +'px';
            window.dispatchEvent(new Event("resize"));
        }
        else if (show_mini && !is_mini) {
            d.documentElement.classList.add("s-marty-miniplayer");
            BC.player.fur.style.left = miniplayer.x +'px';
            BC.player.fur.style.bottom = miniplayer.y +'px';
            BC.player.api.style.width = miniplayer.w +'px';
            BC.player.api.style.height = miniplayer.h +'px';
        }
    }

    function onFullScreen(e) {
        if (d.fullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement)
             d.documentElement.classList.add("isfullscreen");
        else d.documentElement.classList.remove("isfullscreen");
    }

    function sizeMiniPlayer(e) {
        let miniPlayerSized = false;

        if (e.type === "mousemove") {
            miniSiz.hd = e.clientY - miniSiz.h;
            miniSiz.h = e.clientY;
            miniPlayerH -= miniSiz.hd;
            if (miniPlayerH < 197) miniPlayerH = 197;
            if (miniPlayerH > origVid.h) miniPlayerH = origVid.h;
            if (miniPlayerH + miniplayer.y > window.innerHeight -15) miniPlayerH = window.innerHeight - miniplayer.y -15;
            miniPlayerW = Math.round(miniPlayerH * origVid.r);

            BC.player.api.style.width = miniPlayerW +'px';
            BC.player.fur.style.width = miniPlayerW +'px';
            BC.player.fur.style.height = miniPlayerH +'px';
            BC.player.api.style.height = miniPlayerH +'px';
        }
        else if (e.type === "mouseup") {
            window.removeEventListener("mouseup", sizeMiniPlayer, true);
            window.removeEventListener("mousemove", sizeMiniPlayer, true);
            if (miniPlayerH != miniplayer.h) {
                miniPlayerH = (miniPlayerH < 197) ? 197 : miniPlayerH;
                miniplayer.h = (miniPlayerH > origVid.h) ? origVid.h : miniPlayerH;
                miniplayer.w = Math.round(miniPlayerH * origVid.r);
                miniPlayerSized = true;
            }
        }
        else if (e.type === "mousedown") {
            miniSiz.h = e.clientY;
            miniPlayerH = miniplayer.h;
            window.addEventListener("mouseup", sizeMiniPlayer, true);
            window.addEventListener("mousemove", sizeMiniPlayer, true);
        }
        if (miniPlayerSized) {
            GM.setValue('miniplayer', JSON.stringify({ x:miniplayer.x,y:miniplayer.y,w:miniplayer.w,h:miniplayer.h }));
            miniPlayerSized = false;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function moveMiniPlayer(e) {
        let miniPlayerMoved = false;

        if (e.type === "mousemove") {
            miniPos.xd = e.clientX - miniPos.x;
            miniPos.yd = miniPos.y - e.clientY;
            miniPos.x = e.clientX;
            miniPos.y = e.clientY;
            miniPlayerX += miniPos.xd;
            miniPlayerY += miniPos.yd;
            if (miniPlayerX < 0) miniPlayerX = 0;
            if (miniPlayerX + miniplayer.w > window.innerWidth) miniPlayerX = window.innerWidth - miniplayer.w;
            if (miniPlayerY < 0) miniPlayerY = 0;
            if (miniPlayerY + miniplayer.h > window.innerHeight -15) miniPlayerY = window.innerHeight - miniplayer.h -15;

            BC.player.fur.style.left = miniPlayerX +'px';
            BC.player.fur.style.bottom = miniPlayerY +'px';
        }
        else if (e.type === "mouseup") {
            window.removeEventListener("mouseup", moveMiniPlayer, true);
            window.removeEventListener("mousemove", moveMiniPlayer, true);
            if (miniPlayerX != miniplayer.x || miniPlayerY != miniplayer.y) {
                miniplayer.x = (miniPlayerX < 0) ? 0 : miniPlayerX;
                miniplayer.y = (miniPlayerY < 0) ? 0 : miniPlayerY;
                miniPlayerMoved = true;
            }
        }
        else if (e.type === "mousedown") {
            miniPos.x = e.clientX;
            miniPos.y = e.clientY;
            miniPlayerX = miniplayer.x;
            miniPlayerY = miniplayer.y;
            window.addEventListener("mouseup", moveMiniPlayer, true);
            window.addEventListener("mousemove", moveMiniPlayer, true);
        }
        if (miniPlayerMoved) {
            GM.setValue('miniplayer', JSON.stringify({ x:miniplayer.x,y:miniplayer.y,w:miniplayer.w,h:miniplayer.h }));
            miniPlayerMoved = false;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function setPreferencesCookie(name, value) {
        let val, preferences = d.cookie.match(/preferences=(\{[a-z0-9_%:\-]+[^;]*\})/i);
        if (preferences) {
            if (name == 'autoplay') {
                val = preferences[1].match(/theme%22:%22([a-z]+)%22/);
                d.cookie = "preferences={%22theme%22:%22"+val[1]+"%22%2C%22autoplay%22:"+value+"}; path=/";
            }
            else if (name == 'theme') {
                val = preferences[1].match(/autoplay%22:([a-z]+)(\}|%2C)/);
                d.cookie = "preferences={%22theme%22:%22"+value+"%22%2C%22autoplay%22:"+val[1]+"}; path=/";
            }
        }
    }

    var isDark = false;
    var isTheme = false;
    var persistTryDT = 0;
    function setTheme() {
        if (!isDark && BC.settings.usedark) {
            let theme = qs('link#css-theme');
            if (theme != null) {
                if (theme.href.indexOf('night.css') ==-1) {
                    let version = theme.href.match( /\/static\/([a-z]+[0-9]+)\//i );
                    if (version != null && version[1] != null) {
                        BC.version = version[1];
                        theme.setAttribute('href','/static/'+ BC.version +'/css/theme-default-night.css');
                    }
                    isDark = true;
                }
                setPreferencesCookie("theme", "night");
                d.documentElement.classList.add("night");
                persistTryDT = 0;
            }
            else if (!isDark && persistTryDT++ < 30) {
                window.setTimeout(setTheme, 1000);
            }
        }
        if (!isTheme && BC.settings.color != 'none') {
            isTheme = true;
            let colours = {'orange':{light:'#ef4136',lighter:'#f37835',lightest:'#f0af5a'},
                            'green':{light:'#46a604',lighter:'#35c453',lightest:'#55a47c'},
                             'blue':{light:'#2532e0',lighter:'#2567e0',lightest:'#559bcc'}};
            let style       = d.createElement("style");
            style.type      = "text/css";
            style.innerText = '.night .sidebar-heading, .night .subscribe-button, .night .btn-danger, .night #loader ul li {background-color: '+colours[BC.settings.color].light+';}'+
                              '.night a:hover, .night .scripted-link:hover {color: '+colours[BC.settings.color].light+' !important;} .night .nav-tabs>li.active {border-bottom-color:'+colours[BC.settings.color].light+';}' +
                              '.night body, .night .video-card .video-card-text, .night .video-card .video-card-text p i, .night .notify-button, ' +
                              '.night .channel-notify-button, .night .channel-videos-details, .night .channel-videos-title a, .night .channel-videos-text, ' +
                              '.night .video-trending-details, .night .video-trending-title a, .night .video-trending-channel a, .night .video-trending-text, ' +
                              '.night .playlist-video .details, .night .playlist-video .title a, .night .playlist-video .channel a, .night .playlist-video .description, ' +
                              '.night .video-detail-text p, .night .video-information .sharing-drop span, .night .search-box .form-control { color: '+colours[BC.settings.color].lightest+'; }' +
                              '.night a:link, .night a:active, .night a:visited, .night a:focus, .night .scripted-link, .night #nav-top-menu .unauth-link a, ' +
                              '.night .video-card .video-card-text a, .night #nav-top-menu .user-link a, #day-theme a svg { color: '+colours[BC.settings.color].lighter+'; }' +
                              '.night .tags ul li a, .night #show-comments {background-color: #3b383c; border-radius:5px;} .night .tags ul li a:hover {background-color: #4d484e;} .creator-monetization {color: #30a247;}';
            d.documentElement.appendChild(style);
        }
    }

    var persistTryATL = 0;
    var buttonFound = false;
    function addThemeListeners() {
        let toDay   = qs('#day-theme a');
        let toNight = qs('#night-theme a');

        if (toDay && toNight && !buttonFound) {
            buttonFound = true;
            toDay.addEventListener('click', function(e) {
                if (e.which===1)
                    toggleSettings('usedark', false)
            }, false);

            toNight.addEventListener('click', function(e) {
                if (e.which===1)
                    toggleSettings('usedark', true)
            }, false);
        }
        else if (persistTryATL++ < 30 && !buttonFound) setTimeout(addThemeListeners, 1000);
    }

    var persistTryHC = 0;
    var showComments = null;
    function hideComments(e) {
        let comments = qs('#disqus_thread');
        let nocomments = qs('.video-no-discussion');
        let container = qs('#comment-frm-container');

        if (nocomments) return;
        if (container && comments) {
            if (comments.childNodes.length > 1) { /* is loading */
                comments.style.display = 'none';
                if (persistTryHC++ < 30 && !showComments)
                    setTimeout(hideComments, 2000);
                return
            }
            showComments = d.createElement("div");
            showComments.id = 'show-comments';
            showComments.innerHTML = '<span class="scripted-link">Show Comments</span>';
            showComments.style = "width:100%;height:38px;margin:0px;padding:8px;text-align:center;border-radius:5px;";
            container.insertBefore(showComments, comments);
            comments.style.display = 'none';
            showComments.addEventListener('click', function(e) {
                if (e.which===1)
                    qs('#disqus_thread').style.display = 'block';
                    this.style.display = 'none';
            }, false);
        } else if (persistTryHC++ < 30 && !showComments) setTimeout(hideComments, 2000);
    }

    function addSensitivityCookie(e) {
        d.cookie = "sensitivity=true; path=/";
        return false;
    }

    function addMoreRecentVideos(offset) {
        let name = null;
        let link = qs('.details .name a');
        let sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);
        let csrftoken = d.cookie.match(/csrftoken=([a-z0-9_\-]+[^;]*)/i);
        if (link) name = link.href.match( /\/channel\/([a-z0-9_\-]+)\//i );
        if (qs('.show-more')) qs('.show-more').classList.add("hidden");
        if (csrftoken && name) {
            let csrf = csrftoken[1];
            let xhr = new XMLHttpRequest();
            let data = 'csrfmiddlewaretoken='+csrf+'&name='+name[1]+'&offset='+offset;
            let showall = '';
            if (sensitivity)
                if (sensitivity[1] == 'true') showall = '?showall=1';
            xhr.addEventListener("load", function (e) { pear(e) });
            xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest recent videos error: '+ e) });
            xhr.open("POST", link +'extend/'+ showall, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    }

    function pear(e) {
        try {
            let i, a1, title, pdate, card, active;
            let result = JSON.parse(e.target.responseText);
            if ('undefined' != result.success && result.success) {
                let hidden = d.createElement("div");
                hidden.style.display = "none";
                let sidebar = qs('.sidebar-recent');
                if (sidebar) {
                    hidden.innerHTML = result.html;
                    let offset = sidebar.querySelectorAll('.video-card').length;
                    let cards = hidden.querySelectorAll('.channel-videos-container');
                    let addedoffset = cards.length;
                    let showmore = d.createElement("div");
                    showmore.className="show-more-container";
                    showmore.innerHTML = '<div class="show-more"><span>SHOW MORE</span></div>';
                    for (i = 0; i < cards.length; i++) {
                        a1 = cards[i].querySelector('.channel-videos-image-container').innerHTML
                            .replace('channel-videos-image','video-card-image')
                            .replace(/_640x360/g,'_320x180');
                        title = cards[i].querySelector('.channel-videos-title').innerHTML;
                        pdate = cards[i].querySelector('.channel-videos-details span').innerText;
                        card = d.createElement("div");
                        card.className="video-card";
                        card.innerHTML = a1 +
                           '\n<div class="video-card-text">\n' +
                               '<p class="video-card-title">'+title+'</p>\n' +
                               '<p class="video-card-published">'+pdate+'</p>\n</div>';
                        sidebar.appendChild(card);
                    }
                    active = sidebar.querySelector('.active');
                    if (active) active.classList.remove("active");
                    active = sidebar.querySelector(".video-card > a[href='"+BC.path+"']");
                    if (active) active.parentNode.classList.add("active");
                    if (offset == 6 && addedoffset == 25) {
                        sidebar.parentNode.appendChild(showmore);
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ addMoreRecentVideos(offset+addedoffset+2) }, false);
                    }
                    else if (offset > 6 && addedoffset == 25 && qs('.show-more')) {
                        qs('.show-more').outerHTML = showmore.outerHTML;
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ addMoreRecentVideos(offset+addedoffset+2) }, false);
                    }
                }
            }
            else { console.error('XMLHttpRequest recent videos request error') }
        } catch (e) { console.error('XMLHttpRequest recent videos parsing error: '+ e) }
    }

    var mostViewedPlaylist = {slider:null,index:0,length:0,cardWidth:function(){let o = qs('.mvplaylist').getBoundingClientRect();return (!o || !o.width ? 0 : Math.round(o.width/240))}};
    function addMostViewedPlaylist() {
        let link = qs('.details .name a');
        let sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);
        let csrftoken = d.cookie.match(/csrftoken=([a-z0-9_\-]+[^;]*)/i);

        if (qs('.mvplaylist')) return;
        if (csrftoken && link) {
            let csrf = csrftoken[1];
            let xhr = new XMLHttpRequest();
            let data = 'csrfmiddlewaretoken='+csrf;
            let showall = '';
            if (sensitivity)
                if (sensitivity[1] == 'true') showall = '?showall=1';

            xhr.addEventListener("load", function (e) { peer(e) });
            xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest most viewed error: '+ e) });
            xhr.open("POST", link + showall, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    }

    function peer(e) {
        try {
            let i;
            let result = JSON.parse(e.target.responseText);

            if ('undefined' != result.success && result.success) {
                let hidden = d.createElement("div");
                hidden.style.display = "none";
                let html = result.html.match(/(<div class="video-card"[^<]*?>[\s\S]*<\/div>[\s\n]*?<\/div>)[\s\n]*?<\/div>[\s\n]*?<\/div>/i);
                if (html && html[1]) {
                    hidden.innerHTML = html[1];
                    let cards = hidden.querySelectorAll('.video-card');
                    let row = d.createElement("div");
                    let most = d.createElement("div");
                    let content = d.createElement("div");
                    let arrow = d.createElement("div");
                    let slider = d.createElement("div");
                    mostViewedPlaylist.length = cards.length;
                    mostViewedPlaylist.slider = slider;
                    row.className = 'mvplaylist row';
                    most.style = "width: 146px;margin: 20px 37px 10px;";
                    most.innerHTML = '<h2 class="sidebar-heading">Most Viewed</h2>';
                    row.appendChild(most);

                    arrow.className = 'playlistdn playlistbtn disabled';
                    arrow.innerHTML = '<b>&lt;</b>';
                    content.style = 'width: 100%;margin: 0px;padding: 0px; overflow:hidden;display: inline-block; max-height: 195px;';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = 'playlistup playlistbtn'+ (cards.length > 3 ? '' : ' disabled');
                    arrow.innerHTML = '<b>&gt;</b>';
                    content.appendChild(arrow);
                    slider.className = 'mvslider';
                    for (i = 0; i < cards.length; i++) {
                        cards[i].className += ' playlist-card';
                        slider.appendChild(cards[i]);
                    }
                    content.appendChild(slider);
                    row.appendChild(content);
                    let parent = qs('.video-container');
                    parent.insertBefore(row, parent.children[3]);

                    let left = qs('.mvplaylist .playlistdn');
                    left.addEventListener("click", function (e) {
                        if (this.classList.contains('disabled')) return false;
                        if (mostViewedPlaylist.index > 0) {
                            mostViewedPlaylist.slider.style.marginLeft = '-'+ (--mostViewedPlaylist.index * 218) +'px';
                            if (mostViewedPlaylist.index <= 0) this.classList.add('disabled');
                            if (mostViewedPlaylist.index < mostViewedPlaylist.length + mostViewedPlaylist.cardWidth()) this.nextSibling.classList.remove('disabled');
                        }
                    });
                    let right = qs('.mvplaylist .playlistup');
                    right.addEventListener("click", function (e) {
                        if (this.classList.contains('disabled')) return false;
                        if (mostViewedPlaylist.index < mostViewedPlaylist.length - mostViewedPlaylist.cardWidth()) {
                            mostViewedPlaylist.slider.style.marginLeft = '-'+ (++mostViewedPlaylist.index * 218) +'px';
                            if (mostViewedPlaylist.index + mostViewedPlaylist.cardWidth() >= mostViewedPlaylist.length) this.classList.add('disabled');
                            if (mostViewedPlaylist.index > 0) this.previousSibling.classList.remove('disabled');
                        }
                    });
                }
            }
            else { console.error('XMLHttpRequest most viewed request error') }
        } catch (e) { console.error('XMLHttpRequest most viewed parsing error: '+ e) }
    }

    function qs(selector) { return document.querySelector(selector) }

    function qsa(selector) { return document.querySelectorAll(selector) }

    function addListener(target, fn, config) {
        var cfg = (typeof config != 'object') ? {
            attributes: true, childList: true, characterData: true, subtree: true
        } : config;
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {  fn(mutation)  })});
        observer.observe(target, cfg);
        return observer
    }

    function init(e) {
        let settings = "{\"volume\":0.5,\"autoplay\":true,\"color\":\"none\",\"playnext\":false,\"usedark\":true,\"playlists\":true,"+
                        "\"useblacklist\":true,\"hidecarousel\":false,\"hidecomments\":false,\"hidemenubar\":true,\"hideadverts\":true}";
        GM.getValue('player', "{}").then(function (value) {
            if (value && value != '{}') {
                let player = {...settings, ...JSON.parse(value)};
                BC.loaded = !1;
                BC.api = null;
                BC.fur = null;
                BC.url = null;
                BC.host = null;
                BC.path = null;
                BC.cookies = null;
                BC.homepage = false;
                BC.watchpage = false;
                BC.channelpage = false;
                BC.listenersIni = false;
                BC.miniPlayerIni = false;
                BC.previouslisting = '';
                BC.page = 'homepage';
                BC.blacklist = [];
                BC.player = {
                    api     : null,
                    fur     : null,
                    rect    : null,
                    volume  : player.volume,
                    autoplay: player.autoplay
                }
                BC.settings = {
                    color        : player.color,
                    usedark      : player.usedark,
                    playnext     : player.playnext,
                    playlists    : player.playlists,
                    useblacklist : player.useblacklist,
                    hidecarousel : player.hidecarousel,
                    hidecomments : player.hidecomments,
                    hidemenubar  : player.hidemenubar,
                    hideadverts  : player.hideadverts
                }
                GM.getValue('blacklist', "[]").then(function (value) {
                    BC.blacklist = JSON.parse(value);
                    chuteMePlease();
                }).catch (error => {
                    console.error('S_marty: Error in promise loading blacklist: '+ error)
                });
            }
            else {
                    /* Install Database */
                GM.setValue('miniplayer', JSON.stringify({ x:0,y:0,w:350,h:197 }));
                GM.setValue('player', settings);
                GM.setValue('blacklist', '[]');
                window.location.href = window.location.href;
            }
        }).catch (error => {
            console.error('S_marty: Error in promise loading dB: '+ error)
        });
    }

      /* Not in Frames */
    if (window.self == window.top) init();

}) ();
