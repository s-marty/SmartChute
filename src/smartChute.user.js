// ==UserScript==
// @name            SmartChute
// @version         20.1.11
// @description     BitChute.com Enhancer. Adds missing features. Makes you feel warm.
// @license         MIT
// @author          S-Marty
// @compatible      firefox
// @compatible      chrome
// @compatible      opera
// @namespace       https://github.com/s-marty/SmartChute
// @homepageURL     https://github.com/s-marty/SmartChute
// @supportURL      https://github.com/s-marty/SmartChute/wiki
// @icon            https://raw.githubusercontent.com/s-marty/SmartChute/master/images/smartChute2.png
// @downloadURL     https://github.com/s-marty/SmartChute/raw/master/src/smartChute.user.js
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QHFFSLZ7ENUQN&source=url
// @include         /^https?://www\.bitchute\.com.*$/
// @grant           GM.getValue
// @grant           GM.setValue
// @grant           GM.info
// @grant           GM.xmlHttpRequest
// @run-at          document-end
// @noframes
// ==/UserScript==

// @compatible  Firefox, Chrome, Opera, Brave, Vivaldi
// @compatible  TamperMonkey, ViolentMonkey, Greasemonkey

/* greasyfork.org jshint syntax checking hacks */
/* jshint asi: true */
/* jshint boss: true */
/* jshint esversion: 6 */
/* jshint loopfunc: true */
/* jshint multistr: true */

/** **********************   Features   **********************
*** Accelerated Bit Chute user experience ahead
*** Floating mini video player is visible when scrolling
*** Floating mini video player position is draggable
*** Floating mini video player size is mouse resizeable
*** Download your favorite videos and posters.
*** Up to 25 playlist choices in sidebar when viewing playlists.
*** Blacklist annoying channels with one click if enabled
*** De-blacklist channels with two clicks using Smarty menu
*** Unfix top header to show only while up-scrolling
*** Hide the upper channel carousel using Smarty menu
*** Hide unsafe ads to avoid viruses or other malware
*** Hide or unhide comments section - make up your own mind  or not
*** Scrolls down to video player automatically if header is unfixed
*** Autoplay videos or not is now selectable
*** Video volume is persisted - No More 100% volume the first play
*** Theme night/day is persisted when clicking the sun/moon icon
*** Three additional night themes for your tired eyes
*** Play Next persists when clicking the "PLAYING NEXT" button
*** Persistence lasts across browser instantiations too
*** Top ten most viewed channel video playlist on video page option
*** Channel owner-created playlists displayed on video page option
*** 32 More video choices on Video watch page vs. 6
*** Unlimited video choices using "SHOW MORE" button, vs. 6
*** OpenSearch browser search to search from address or search bar
*** Rss channel feed subscribe link (Browser extension now needed)
***   All browsers have now dropped live bookmarks/rss feeds
***   The rss url format is:
***   https://www.bitchute.com/feeds/rss/channel/[CHANNEL_NAME]/
***          Smarty menu always available

***  ***  Does not & will not work well with IE and IEdge  ***/

/* Editable options */
const use_Square_Icons = true;
const hide_Donation_Bar = true;
const hide_Cookie_Notice = true;
const hide_Signup_Notice = true;
const homepage_go_to_all = true;
const BC_Debug = false;
/* End Editable options */


(function() {
    "use strict";

const d = document;
const name = "SmartChute";
const scriptHandler = GM.info.scriptHandler;
const isChrome = navigator.userAgent.indexOf('Chrome') !=-1;
const BC = {

    miniPlayerX: 0,
    miniPlayerY: 0,
    miniPlayerW: 0,
    miniPlayerH: 0,
    startButton: 0,
    listingsAllHeight: 0,
    listingsPopHeight: 0,
    miniSiz: {h: 0, hd: 0},
    miniPos: {x:0,y:0,xd:0,yd:0},
    origVid: {w:698,h:393,r:1.778},
    miniplayer: { x:0,y:0,w:350,h:197 },


    chuteMePlease: (e) => {

        BC.url          = window.location.href;
        BC.host         = window.location.hostname;
        BC.path         = window.location.pathname;
        BC.searchpage   = BC.url.indexOf('/search') !=-1;
        BC.watchpage    = BC.path.indexOf('/video') !=-1;
        BC.profilepage  = BC.path.indexOf('/profile/') !=-1;
        BC.channelpage  = BC.path.indexOf('/channel/') !=-1;
        BC.categorypage = BC.path.indexOf('/category/') !=-1;
        BC.playlistpage = BC.path.indexOf('/playlist/') !=-1;
        BC.homepage     = BC.url.match(/^https?:\/\/www\.bitchute\.com\/?$/);
        if (BC.watchpage && BC.url.indexOf('list=') !=-1) BC.playlist = BC.url;
        else if (BC.watchpage && qs(".sidebar-next a").href.indexOf('list=') !=-1) BC.playlist = qs(".sidebar-next a").href;
        else BC.playlist = null;

        if (!BC.loaded) {
            if (!BC.loader) {
                if (BC.loader = qs("title")) {
                    addListener(BC.loader, (e) => {
                        if (isChrome && BC.settings.hidemenubar) {
                            if (! document.activeElement.href) {window.scrollTo(0, 0)}
                        }
                        BC.chuteMePlease(e);
                    },{ childList: true });
                }
                qs("#loader-container").addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    window.stop();
                    e.target.style.display = "none";
                }, false);
            }
            if (! (BC.homepage || BC.watchpage || BC.channelpage || BC.categorypage || BC.profilepage || BC.searchpage || BC.playlistpage)) return;
            if (!BC.themes) {
                setTimeout(BC.addThemeListeners, 2000);
                if (isChrome && BC.settings.hidemenubar) {
                    window.addEventListener('beforeunload', function(e){
                      if (!document.activeElement.href){window.scrollTo(0, 0)}
                    }, false);
                }
                BC.setTheme();
                BC.setPreferencesCookie("autoplay", BC.settings.playnext);
                BC.themes = true;
            }
            if (BC.searchpage || BC.profilepage || BC.playlistpage) return;
            let style = d.createElement("style");
            style.type = "text/css";
            style.innerText = `
                .nav-tabs-list {min-width: 500px !important; width: 100%;} .sidebar-recent .video-card.active {box-shadow: 0 0 1em 0.2em #f37835; border-radius:5px;} .playlist-card.active {border-top: 1px solid #f37835bb; box-shadow: 0 2px 1em 0.2em #f37835; border-radius:5px;}
                svg.smarty-donate {float:right;cursor: pointer; color:#209227;display: block;}  svg.smarty-donate:hover {-webkit-transform:rotate(14deg) scale(1.2);-o-transform:rotate(14deg) scale(1.2);transform:rotate(14deg) scale(1.2);color:#30a247;}
                #loader-container {opacity: 0.5;} span.add-to-blacklist { position: absolute; top: 4px; left: 4px; z-index: 50; width:30px; height:30px; } a.side-toggle {cursor: pointer; }
                svg.smarty-donate {-webkit-transition: transform 0.25s ease-in, color 0.25s; -moz-transition: transform 0.25s ease-in, color 0.25s; -o-transition: transform 0.25s ease-in, color 0.25s; transition: transform 0.25s ease-in, color 0.25s;}
                span.blacklist-tooltip { position: absolute; font-size: 14px;padding: 0 4px; height: 22px; left: 2px; top: 38px; line-height: 1.6; background-color: #000 ;display:none;} #smarty_tab label:hover, #smarty_tab #blacklistedchannels span:hover {color:#ef4136;}
                #smarty_tab #blacklistedchannels span{width: 137px; max-height: 16px;cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
                span.add-to-blacklist svg {cursor: pointer;} html.noblacklist span.add-to-blacklist {display:none;} #channel-list div.item div.channel-card:hover .add-to-blacklist {opacity: 1;} .video-views, .video-duration {color: #272727; opacity: 0.8;}
                span.add-to-blacklist:hover span.blacklist-tooltip { color:#fff; display:inline; } #carousel {${BC.settings.hidecarousel ? "display:none" : "width: 100%; min-height: 210px"};} .plyr__tooltip {color: #000;}
                #carousel .hidden-md > div .channel-card:hover .action-button {opacity:1;} .channel-banner .name a.userisblacklisted {text-decoration: line-through red;} .night .video-views, .night .video-duration {color: #dbdbdb;}
                .channel-banner .name .add-to-blacklist {position: relative;left: 10px;} .channel-banner .name:hover .add-to-blacklist {opacity: 1;}
                .smartybox { position: relative; display: block; width: 100%; } .smartybox:nth-child(2) {  width: 132px; } .smartybox input[type="checkbox"], .smartybox input[type="radio"] { width: auto; opacity: 0.00000001; position: absolute; left: 0; margin-left: -20px; }
                .cbhelper, .radiohelper { top: -4px; left: -8px; display: block; cursor: pointer; user-select: none; position: absolute; } .cbhelper:before, .radiohelper:before { content: ''; position: absolute; left: 0; top: 0; margin: 6px; width: 18px; height: 18px;
                  transition: transform 0.28s ease; border-radius: 5px; border: 1px solid #4d4b4e; }
                .radiohelper:before { border-radius: 9px; } .radiohelper.r1:before { left: 48px; } .radiohelper.r2:before { left: 88px; } .radiohelper.r3:before { left: 128px; } .cbhelper:after, .radiohelper:after { content: ''; display: block; width: 10px; height: 5px;
                  border-bottom: 2px solid #7bbe72; border-left: 2px solid #7bbe72; -webkit-transform: rotate(-45deg) scale(0); -moz-transform: rotate(-45deg) scale(0); -o-transform: rotate(-45deg) scale(0); transform: rotate(-45deg) scale(0); position: absolute; top: 12px; left: 10px; }
                .radiohelper.r1:after { left: 58px; } .radiohelper.r2:after { left: 98px; } .radiohelper.r3:after { left: 138px; } .smartybox input[type="checkbox"]:checked ~ .cbhelper::before, .smartybox input[type="radio"]:checked ~ .radiohelper::before { color: #7bbe72;
                  background: linear-gradient(to bottom, #d5d1d833 0%, #93919566 100%)}
                .smartybox input[type="checkbox"]:checked ~ .cbhelper::after, .smartybox input[type="radio"]:checked ~ .radiohelper::after { -webkit-transform: rotate(-45deg) scale(1); -moz-transform: rotate(-45deg) scale(1); -ms-transform: rotate(-45deg) scale(1); transform:rotate(-45deg) scale(1); }
                .smartybox label { padding-left: 25px; cursor: pointer; } .smartybox.radios label { padding-left: 0px; } .smartybox.radios label.r1 { margin-left: 14px; color:#f0af5a !important; } .smartybox.radios label.r2 { margin-left: 18px; color: #559bcc !important; }
                .smartybox.radios label.r3 { margin-left: 18px; color:#55a47c !important; } .smartybox input[type="checkbox"]:focus + label::before, .smartybox input[type="radio"]:focus + label::before { outline: rgb(59, 153, 252) auto 5px; }
                .sidebar-recent .playlist_sidebar {margin-bottom: 14px;-webkit-transition: all 1s cubic-bezier(1, 1, 0.5, 1); -moz-transition: all 1s cubic-bezier(1, 1, 0.5, 1); transition: all 1s cubic-bezier(1, 1, 0.5, 1);}
                .sidebar-recent .playlist_sidebar.slidein {overflow: hidden; max-height: 0px !important; } .sidebar-heading.playlists {position: relative; cursor: pointer; user-select: none; }
                .sidebar-heading.playlists:after {content: ''; display: block; position: absolute; right: 6px; bottom: 15px; width: 0; height: 0; border-bottom-width: 10px; border-bottom-style: solid; border-top: 10px solid transparent; border-left: 10px solid transparent; border-right: 10px solid transparent; }
	            .sidebar-heading.playlists:after {border-bottom-color: white;} .sidebar-heading.playlists:hover:after {border-bottom-color: lightgray;} .sidebar-heading.playlists:after {-webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; transition: all 0.5s ease;}
                .sidebar-heading.playlists.slidein:after {content: ''; display: block; position: absolute; right: 6px; bottom: 5px; width: 0; height: 0; border-top-width: 10px; border-top-style: solid; border-bottom: 10px solid transparent; border-left: 10px solid transparent; border-right: 10px solid transparent; }
	            .sidebar-heading.playlists.slidein:after {border-top-color: white;} .sidebar-heading.playlists.slidein:hover:after {border-top-color: lightgray;}`;
            if (BC.settings.hidemenubar) {
                style.innerText += `
                    #nav-top-menu {position: static; width: 100%; height: 60px;} #nav-menu-buffer {height: 0px; padding-top: 0px !important;}
                    html.topNavfloat #nav-top-menu, html.tabNavfloat .tab-scroll-outer {-webkit-transition: top 0.5s ease-in-out; -moz-transition: top 0.5s ease-in-out; -o-transition: top 0.5s ease-in-out; transition: top 0.5s ease-in-out;}
                    html.topNavfloat #nav-top-menu {position: fixed;} html.tabNavfloat .tab-scroll-outer {position: fixed; width: 100%; z-index:989; background: #fff;}
                    html.tabNavfloat.night .tab-scroll-outer {background: #211f22;}
                    html.topNavfloat #nav-menu {padding-top: 60px;} html.tabNavfloat #page-detail .tab-content {margin-top: 50px;} html.tabNavfloat #page-detail #listing-trending {margin-top: -50px;} html.tabNavfloat #nav-side-menu {z-index:999;}`;
            }
            if (BC.settings.playlists || BC.settings.mvplaylist) {
                style.innerText += `
                    .mvplaylist.row, .playlist.row {width: 723px;margin-top:20px;margin-bottom:20px;} .plslider, .mvslider {width:100%;max-width: 878px; padding-left:35px;margin: auto 0px; overflow:hidden;display: inline;}
                    .mvplaylist .playlist-title, .playlist .playlist-title {display:inline-block; width: auto !important; margin: 20px 37px 10px;} #comment-frm-container {margin-top: 20px !important;}
                    .mvplaylist .playlistbt, .playlist .playlistbt {width: 30px; height: 195px; padding-top: 85px; background-color: #f3f3f3; position: absolute; z-index: 78; } .night .mvplaylist .playlistbt, .night .playlist .playlistbt {background-color: #211f22;}
                    .plslider, .mvslider {-webkit-transition: margin-left 0.25s ease-in-out; -moz-transition: margin-left 0.25s ease-in-out; -o-transition: margin-left 0.25s ease-in-out; transition: margin-left 0.25s ease-in-out;}
                    .playlistup {margin-left:693px; background: linear-gradient(to right, #BBB 0%,#DDD 100%); border-bottom-right-radius: 20px 40px; border-top-right-radius: 20px 40px;}
                    .playlistdn {background: linear-gradient(to left, #BBB 0%,#DDD 100%); border-bottom-left-radius: 20px 40px; border-top-left-radius: 20px 40px;}
                    .night .playlistup {background: linear-gradient(to right, #2c2a2d 0%,#544e53 100%);} .night .playlistdn {background: linear-gradient(to left, #2c2a2d 0%,#544e53 100%);}
                    .playlistbtn:not(.disabled):hover {background: radial-gradient(ellipse at center, #BBB 0%,#DDD 100%);} .night .playlistbtn:not(.disabled):hover {background: radial-gradient(ellipse at center, #2c2a2d 0%,#544e53 100%);}
                    .playlistbtn {cursor:pointer;width: 30px;height:195px;padding-top:85px;background-color: #ddd;text-align:center;position: absolute; z-index: 80;}
                    .playlistbtn b {cursor:pointer; user-select: none; -moz-user-select: none; -webkit-user-select: none;} .playlistbtn.disabled {cursor:default; opacity:0.3;} .playlistbtn.disabled b {color: #ddd;cursor:default;}
                    .playlist-title span {margin-left:16px;} .playlist-title span:hover {color:#ffaa00;} .video-card-published.sequence {position: absolute;bottom: 0px;right: 3px; z-index:50;} .playlist svg.fa-square {opacity: 0.4;}
                    .mvplaylist .playlist-card, .playlist .playlist-card {width: 208px;height:195px;margin: 0 5px;} .night .playlistbtn {background-color: #2c2a2d; background:}
                    .playlist-card .video-card-title {height: 52px; width: 200px; max-height: 52px; max-width: 200px; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;}
                    .playlist-card.active .video-card-title {max-height: 47px;}
                    .night .playlistbtn.disabled b {color: #2c2a2d;} @media (min-width: 768px) {.plslider, .mvslider {max-width: 660px;} .playlistup {margin-left:475px;}.mvplaylist.row, .playlist.row {width: 505px;}}
                    @media (min-width: 992px) {.plslider, .mvslider {max-width: 878px;} .playlistup {margin-left:693px;}.mvplaylist.row, .playlist.row {width: 723px;}}`;
            }
            if (hide_Donation_Bar) style.innerText += '.video-container .text-center {display: none !important;}';
            if (hide_Cookie_Notice) style.innerText += '#alert-cookie {display: none !important;}';
            if (hide_Signup_Notice) style.innerText += '#alert-signup {display: none !important;}';
            if (use_Square_Icons) style.innerText += '.channel-banner .image-container {border-radius:0px !important;}';
            if (BC.settings.hideadverts) {
                style.innerText += '.sidebar .rcad-container, .sidebar > div:not(.sidebar-video) {display:none !important;}';
                let affiliates = null;
                if (affiliates = qs('.affiliate-container')) {
                    affiliates.outerHTML = ''
                }
            }
            if (BC.settings.useminiplayer) style.innerText += 'button.plyr__control[data-plyr="pip"] {display: none !important;}';
            d.documentElement.appendChild(style);
            if (BC.settings.hidemenubar) window.addEventListener('scroll', BC.floatHeaders);
            BC.addBrowserSearch();
            BC.loaded = 1;
            debug('>>>>>>>>>>>>>> BC load <<<<<<<<<<=');
        }

        if (BC.watchpage) {
            BC.page = 'watchpage';
                /* Provide mini player */
            BC.player.api = qs('video#player');
            if (BC.player.api !== null) {
                if (!BC.player.rect) {
                    window.scrollTo(0, 0);
                    BC.player.rect = BC.player.api.getBoundingClientRect();
                }
                BC.player.api.mini_point = BC.player.rect.top + ((BC.player.rect.height / 2) + 50);
                BC.origVid = {
                  w: Math.round(BC.player.rect.width * 10) / 10,
                  h: Math.round(BC.player.rect.height * 10) / 10,
                  r: Math.round(BC.player.rect.width/BC.player.rect.height * 1000) / 1000
                };
                if (!BC.miniPlayerIni && BC.settings.useminiplayer) {
                    GM.getValue('miniplayer', "{}").then( (value) => {
                        if (value && value != '{}') {
                            BC.miniplayer = JSON.parse(value);
                            window.addEventListener("scroll", BC.miniPlayer, false);
                            d.addEventListener("fullscreenchange", () => { BC.onFullScreen()});
                            d.addEventListener("mozfullscreenchange", () => { BC.onFullScreen()});
                            d.addEventListener("webkitfullscreenchange", () => { BC.onFullScreen()});
                            let style = d.createElement("style");
                            style.type = "text/css";
                            style.innerText = `
                                html:not(.isfullscreen).s-marty-miniplayer video#player, html:not(.isfullscreen).s-marty-miniplayer .plyr__video-wrapper, html:not(.isfullscreen).s-marty-miniplayer .plyr--video {opacity: 0.94;}
                                html:not(.isfullscreen).s-marty-miniplayer .video-container .wrapper {position: fixed;z-index: 100;background-color:transparent; border:1px solid rgba(255,255,255,0.3);}
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar {display : block;cursor: move; height: 40px; left: -3px; right: 5px; top: -6px; position: absolute;z-index: 110;background-color:transparent;}
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar:hover {background-color:#000; opacity: 0.4; background-clip: padding-box; padding: 6px 0 0 6px;}
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-size {display : block;cursor: nesw-resize; width:7px; height: 7px; right: -3px; top: -3px; position: absolute;z-index: 120;background-color:transparent;}
                                html:not(.isfullscreen).s-marty-miniplayer .plyr__controls button[data-plyr="captions"], html:not(.isfullscreen).s-marty-miniplayer .plyr__controls button[data-plyr="pip"], html:not(.isfullscreen).s-marty-miniplayer .plyr__controls .plyr__menu {display : none !important;}
                                html:not(.s-marty-miniplayer) #s-marty-miniplayer-bar, html:not(.s-marty-miniplayer) #s-marty-miniplayer-size {display : none;} html:not(.isfullscreen).s-marty-miniplayer .plyr__controls imput[data-plyr="volume"] {/*max-width:12% !important; */width: 12% !important;}
                                html.isfullscreen video#player {width: 100% !important; height: !important;}`;
                            d.documentElement.appendChild(style);
                            BC.miniPlayerIni = true;
                        }
                    }).catch (error => {
                        error('miniplayer: Error in GM.getValue promise: '+ error)
                    });
                }

                BC.player.fur = qs(".video-container .wrapper");
                let bar = d.createElement("div");
                bar.setAttribute('id', 's-marty-miniplayer-bar');
                bar.addEventListener("mousedown", BC.moveMiniPlayer, true);
                let size = d.createElement("div");
                size.setAttribute('id', 's-marty-miniplayer-size');
                size.addEventListener("mousedown", BC.sizeMiniPlayer.bind(this), true);
                BC.player.fur.insertBefore(bar, BC.player.fur.firstChild);
                BC.player.fur.insertBefore(size, BC.player.fur.firstChild);
                BC.player.api.volume = BC.player.volume;
                BC.player.fur.parentNode.style = `width:${BC.origVid.w}px;height:${BC.origVid.h}px;`;

                    /* Autoplay videos */
                if (BC.player.autoplay) {
                    if (! BC.startButton) {
                        BC.startButton = qs('button[aria-label="Play"]');
                        BC.player.api.autoplay = true;
                        if (qs('.plyr__controls imput[data-plyr="volume"]')) {
                            qs('.plyr__controls imput[data-plyr="volume"]').removeAttribute('hidden'); // Volume
                            qs('.plyr__controls .plyr__volume button').removeAttribute('hidden'); // Mute
                        }
                    }
                    if (BC.player.api.paused) {
                        BC.player.api.play()
                          .catch( function(e) { BC.startButton.dispatchEvent( new MouseEvent('click', {bubbles: true, cancelable: true})) })
                    }
                }
                else {
                    BC.player.api.autoplay = false;
                    if (!BC.player.api.paused) BC.player.api.pause();
                }
                    /* Video errors */
                qs('progress.plyr__progress__buffer').style = '';
                qs('div.plyr__progress').title = '';
                if (isChrome) {
                    if (Object.is(NaN, BC.player.api.duration)) {
                        window.setTimeout(() => {
                           if (BC.player.api.readyState === 0 && Object.is(NaN, BC.player.api.duration)) { 
                                let err = null, f = '', n = parseInt(BC.player.api.children[0].attributes.dl.value);
                                try { err = Bcd.src.videos[n].error; f = Bcd.src.videos[n].url}
                                catch (e) { err = 'Undefined video error' }
                                if (err) {
                                    qs('progress.plyr__progress__buffer').style.backgroundColor = 'rgba(255,255,60,.80)';
                                    qs('div.plyr__progress').title = err;
                                    error(`media error ${err} ${f}`);
                                }
                            }
                       }, 3000)
                   }
                }
                else {
                    BC.player.api.addEventListener('error', function(e) {
                        let err = '';
                        if (BC.player.api.error) {
                            if (BC.player.api.error.code == BC.player.api.error.MEDIA_ERR_NETWORK)
                                err = 'File error';
                            else if (BC.player.api.error.code == BC.player.api.error.MEDIA_ERR_DECODE)
                                err = 'Video file is corrupt';
                            else if (BC.player.api.error.code == BC.player.api.error.MEDIA_ERR_SRC_NOT_SUPPORTED)
                                err = 'Video file is incompatable';
                        }
                        else {
                            window.setTimeout(() => {
                                let err = null, f = '', n = parseInt(e.target.attributes.dl.value);
                                try { err = Bcd.src.videos[n].error; f = Bcd.src.videos[n].url}
                                catch (e) { err = 'Undefined video error' }
                                qs('progress.plyr__progress__buffer').style.backgroundColor = 'rgba(255,255,60,.80)';
                                qs('div.plyr__progress').title = err;
                                error(`media error ${err || "undefined"} ${f}`);
                           }, 3000)
                        }
                    }, true);
                }

                BC.player.api.addEventListener('volumechange', function(e) {
                    BC.savePlayerValue('volume', (Math.round(e.target.volume / 0.01) * 0.01))
                }, false);
            }
            let sidebarnext = qs(".sidebar-next");
            let playnext = qs("label.sidebar-autoplay:not(.active)");
            if (sidebarnext && playnext) {
                playnext.addEventListener('mousedown', function(e) {
                    if (e.which===1) {
                       let checked = qs("input#autoplay-toggle").checked;
                       BC.savePlayerValue('playnext', !checked)
                    }
                }, false);
                playnext.classList.add('active')
            }
            if (BC.settings.hidecomments) setTimeout(BC.hideComments, 2000);
            if (BC.playlist) {
                BC.playlist = BC.playlist.match( /[&?]+list=([^&]*[a-z0-9_-]+)/i )[1];
                BC.addMoreRecentVideos(-1, BC.playlist);
            }
            else BC.addMoreRecentVideos(8);
            if (BC.settings.mvplaylist) BC.addMostViewedPlaylist();
            if (BC.settings.playlists) BC.addChannelPlaylists();
            if (BC.settings.useblacklist) BC.applyChannelBlacklist();
            BC.setChannelFeed('add');
            BC.addPublishDate();
        }
        else if (BC.channelpage) {
            BC.page = 'channelpage';
            if (d.cookie.indexOf('sensitivity=') !=-1 && window.location.search.indexOf('showall=1') ==-1) {
                d.cookie = "sensitivity=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            }
            let sensitivityWarning;
            if (sensitivityWarning = qs('.sensitivity-warning a')) sensitivityWarning.addEventListener('click', BC.addSensitivityCookie, false);
            if (BC.settings.useblacklist) BC.applyChannelBlacklist();
            BC.setChannelFeed('add');
        }
        else if (BC.homepage || BC.categorypage) {
            BC.page = 'homepage';
            if (BC.settings.useblacklist) {
                let listingTabs = qs('#listing-tabs.listening');
                let listingsAll = qs('#listing-all > div.row');
                let listingsPopular = qs('#listing-popular > div.row');
                BC.listingsAllHeight = Math.round(listingsAll.getBoundingClientRect().height);
                BC.listingsPopHeight = Math.round(listingsPopular.getBoundingClientRect().height);

                if (!listingTabs) {
                    qs("ul.nav-tabs-list li a[href='#listing-all']")
                      .addEventListener('click', function(e){ BC.applyBlacklist('#listing-all > div.row > div', 'all') }, false);
                    qs("ul.nav-tabs-list li a[href='#listing-popular']")
                      .addEventListener('click', function(e){ BC.applyBlacklist('#listing-popular > div.row > div', 'popular') }, false);
                    qs("ul.nav-tabs-list li a[href='#listing-trending']")
                      .addEventListener('click', function(e){ BC.applyBlacklist('div#trending-day > div.row > div,div#trending-week > div.row > div,div#trending-month > div.row > div', 'trending') }, false);
                    qs("ul.nav-tabs-list li a[href='#listing-subscribed']")
                      .addEventListener('click', function(e){ BC.navsIni('subscribedpage') }, false);

                    addListener(listingsAll, function(e) {
                        let newlistings = qs('#listing-all > div.row');
                        let newlistingsHeight = Math.round(newlistings.getBoundingClientRect().height);
                        if (BC.listingsAllHeight < newlistingsHeight) {
                            BC.listingsAllHeight = newlistingsHeight;
                            BC.applyBlacklist('#listing-all > div.row > div');
                        }
                    },{ childList: true });

                    addListener(listingsPopular, function(e) {
                        let newlistings = qs('#listing-popular > div.row');
                        let newlistingsHeight = Math.round(newlistings.getBoundingClientRect().height);
                        if (BC.listingsPopHeight < newlistingsHeight) {
                            BC.listingsPopHeight = newlistingsHeight;
                            BC.applyBlacklist('#listing-popular > div.row > div');
                        }
                    },{ childList: true });

                    qs('#listing-tabs').classList.add('listening');
                    if (!BC.settings.hidecarousel)
                        BC.applyBlacklist('#carousel #channel-list div.item > div,#carousel .hidden-md > div');
                }
            }
            if (BC.settings.hidecarousel) { // The only way to pause this thing
                if (qs('#carousel')) qs('#carousel').innerHTML = '';
            }

            if (homepage_go_to_all) {
                let preferAll = qs("ul.nav-tabs-list li a[href='#listing-all']");
                if (preferAll !== null && preferAll.parentNode.className.indexOf('active') ==-1) {
                    preferAll.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true
                    }));
                    BC.applyBlacklist('#listing-all > div.row > div', 'all');
                }
            }
            else BC.applyBlacklist('#listing-popular > div.row > div');
            BC.setChannelFeed('remove');
        }
        BC.createSmartyButton();
        BC.navsIni();
    },


    applyBlacklist: (selector, page) => {

        BC.previouslisting = selector;
        if (page) BC.navsIni();
        if (!BC.settings.useblacklist) return;
        selector = selector.split(',').join(':not([polled]), ') + ':not([polled])';
        let i,
            listings = qsa(selector);

        if (listings.length) {
            try {
                for (i = 0; i < listings.length; i++) {
                    let card = qs('.video-card-channel a, .video-trending-channel a, .channel-card a', listings[i]);
                    if (card) {
                        let href = card.getAttribute("href");
                        let channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
                        if (channel) {
                            if (BC.blacklist.find( id => id[0] == channel[1] )) {
                                listings[i].outerHTML = ''
                            }
                            else {
                                listings[i].setAttribute('polled', channel[1]);
                                let button = BC.blacklistButton();
                                let videoCard = qs('.video-card, .video-trending-image, .channel-card', listings[i]);
                                let name = qs('.channel-card-title', listings[i]);
                                name = name ? name.innerText : card.innerText;
                                videoCard.appendChild(button);
                                button.addEventListener('click', function(e){ BC.blacklistAdd(e, channel[1], name) }, true);
                            }
                        }
                    }
                }
            } catch (e) {error('applyBlacklist: '+ e)}
        }
    },


    applyChannelBlacklist: () => {
        let card = qs('.channel-banner .name a'),
            name = card.innerText;

        if (card) {
            try {
                let href = card.getAttribute("href");
                let channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
                if (channel) {
                    if (BC.blacklist.find( id => id[0] == channel[1] )) {
                        card.setAttribute('title', name +' is blacklisted ☺');
                        card.classList.add('userisblacklisted')
                    }
                    else if (! qs('.add-to-blacklist', card.parentNode)) {
                        let button = BC.blacklistButton();
                        card.parentNode.appendChild(button);
                        button.addEventListener('click', function(e){
                            BC.blacklistAdd(e, channel[1], name);
                            this.previousSibling.classList.add('userisblacklisted');
                            this.previousSibling.setAttribute('title', name +' is blacklisted ☺');
                            this.style.display = 'none';
                        }, true);
                    }
                }
            } catch (e) {error('applyChannelBlacklist: '+ e)}
        }
    },


    createSmartyButton: () => {
        let i, blacklisted, menu, smarty, colors;
        let blContent = '';
        let donate = '<svg class="smarty-donate" version="1.0" xmlns="http://www.w3.org/2000/svg" width="14pt" height="14pt" viewBox="0 0 496 512" preserveAspectRatio="xMidYMid meet"><g transform="translate(248 256)"><g transform="translate(0, 0)  scale(1, 1)  rotate(-14 7 7)">'+
            '<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm24 376v16c0 8.8-7.2 16-16 16h-16c-8.8 0-16-7.2-16-16v-16.2c-16.5-.6-32.6-5.8-46.4-15.1-8.7-5.9-10-18.1-2.3-25.2l12-11.3c5.4-5.1 13.3-5.4 19.7-1.6 6.1 3.6 12.9 5.4 19.9 5.4h45c11.3 '+
            '0 20.5-10.5 20.5-23.4 0-10.6-6.3-19.9-15.2-22.7L205 268c-29-8.8-49.2-37-49.2-68.6 0-39.3 30.6-71.3 68.2-71.4v-16c0-8.8 7.2-16 16-16h16c8.8 0 16 7.2 16 16v16.2c16.5.6 32.6 5.8 46.4 15.1 8.7 5.9 10 18.1 2.3 25.2l-12 11.3c-5.4 5.1-13.3 5.4-19.7 1.6-6.1-3.6-12.9-5.4-19.9-5.4h-45c-11.3 '+
            '0-20.5 10.5-20.5 23.4 0 10.6 6.3 19.9 15.2 22.7l72 21.9c29 8.8 49.2 37 49.2 68.6.2 39.3-30.4 71.2-68 71.4z" transform="translate(-248 -256)"></path></g></g><title>Donate to Smarty</title></svg>';
        let tabContent = `<a href="javascript:void(0)">Smarty</a><div id="smarty_tab" class="modal-content" style="display: none; position: absolute; z-index: 200;">
          <div style="width: 170px; padding: 8px; border: 1px solid #333; border-radius:3px;">${donate}
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="useblacklist2"><input name="useblacklist" id="useblacklist2" type="checkbox"${BC.settings.useblacklist ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Use Blacklist</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="hidemenubar2"><input name="hidemenubar" id="hidemenubar2" type="checkbox"${BC.settings.hidemenubar ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Scroll Menubar</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="hidecarousel2"><input name="hidecarousel" id="hidecarousel2" type="checkbox"${BC.settings.hidecarousel ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Hide Carousel</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="hidecomments2"><input name="hidecomments" id="hidecomments2" type="checkbox"${BC.settings.hidecomments ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Hide Comments</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="mvplaylist2"><input name="mvplaylist" id="mvplaylist2" type="checkbox"${BC.settings.mvplaylist ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Popular Playlist</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="playlists2"><input name="playlists" id="playlists2" type="checkbox"${BC.settings.playlists ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;All Playlists</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="useminiplayer2"><input name="useminiplayer" id="useminiplayer2" type="checkbox"${BC.settings.useminiplayer ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Use Miniplayer</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="autoplay2"><input name="autoplay" id="autoplay2" type="checkbox"${BC.player.autoplay ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Auto Play Video</label></div>
            <div class="smartybox"><label class="tabinput" style="margin-bottom: 0px;" for="hideadverts2"><input name="hideadverts" id="hideadverts2" type="checkbox"${BC.settings.hideadverts ? ' checked':''} class="tabinput"> <i class="cbhelper tabinput"></i>&nbsp;Hide Unsafe Ads</label></div>
            <div class="smartybox radios"><label class="r0" title="Night Color: Default"><input name="color" title="Night Color: None" value="none" type="radio"${BC.settings.color == 'none' ? ' checked':''}><i class="radiohelper r0 tabinput"></i>&nbsp;&nbsp;</label><span style="height:12px;width:12px">
                  &nbsp;&nbsp;<label class="r1" title="Night Color: Orange"><b>O</b>&nbsp;
            <input name="color" value="orange" type="radio"${BC.settings.color == 'orange' ? ' checked':''}><i class="radiohelper r1 tabinput"></i></label></span><span style="height:12px;width:12px;color">&nbsp;&nbsp;<label class="r2" title="Night Color: Blue"><b>B</b>&nbsp;
            <input name="color" value="blue" type="radio"${BC.settings.color == 'blue' ? ' checked':''}><i class="radiohelper r2 tabinput"></i></label></span><span style="height:12px;width:12px">&nbsp;&nbsp;<label class="r3" title="Night Color: Green"><b>G</b>&nbsp;
            <input name="color" value="green" type="radio"${BC.settings.color == 'green' ? ' checked':''}><i class="radiohelper r3 tabinput"></i></label>&nbsp;</span></div>
          </div><div id="blacklistedchannels" style="padding: 8px; border: 1px solid #333; border-radius:3px; border-top:none;/*overflow-x: hidden; width: 170px;*/"><div><em>No Blacklist</em></div></div></div>`;
        menu = qs('ul.nav-tabs-list');
        smarty = qs('#smarty_tab');

        if (smarty === null) {
            smarty = d.createElement("li");
            smarty.innerHTML = tabContent;
            menu.appendChild(smarty);
            blacklisted = qs('#blacklistedchannels');

            if (BC.settings.useblacklist) {
                if (BC.blacklist.length ) {
                    for (i = 0; i < BC.blacklist.length; i++) {
                        blContent += `<span title="Click to remove ${BC.blacklist[i][1]}" data-name="${BC.blacklist[i][0]}">${BC.blacklist[i][1]}</span>`;
                    }
                }
                else blContent = '<div><em>No Blacklist</em></div>';
            }
            else blContent = '<div><em>Blacklist Off</em></div>';
            if (blContent) blacklisted.innerHTML = blContent;

            qs('a', smarty).addEventListener('click', BC.toggleTab,true);
            qs('#useminiplayer2', smarty).addEventListener('change', function(e) {BC.toggleSettings('useminiplayer',e.target.checked)}, false);
            qs('#hidecomments2', smarty).addEventListener('change', function(e) {BC.savePlayerValue('hidecomments',e.target.checked)}, false);
            qs('#useblacklist2', smarty).addEventListener('change', function(e) {BC.toggleSettings('useblacklist',e.target.checked)}, false);
            qs('#hidecarousel2', smarty).addEventListener('change', function(e) {BC.toggleSettings('hidecarousel',e.target.checked)}, false);
            qs('#hidemenubar2', smarty).addEventListener('change', function(e) {BC.toggleSettings('hidemenubar',e.target.checked)}, false);
            qs('#hideadverts2', smarty).addEventListener('change', function(e) {BC.toggleSettings('hideadverts',e.target.checked)}, false);
            qs('#mvplaylist2', smarty).addEventListener('change', function(e) {BC.savePlayerValue('mvplaylist',e.target.checked)}, false);
            qs('#playlists2', smarty).addEventListener('change', function(e) {BC.savePlayerValue('playlists',e.target.checked)}, false);
            qs('#autoplay2', smarty).addEventListener('change', function(e) {BC.savePlayerValue('autoplay',e.target.checked)}, false);
            qs('svg').addEventListener('click', function(e) {window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QHFFSLZ7ENUQN&source=url', '_blank');}, false);
            colors = qsa('input[type=radio][name=color]', smarty);
            for (i = 0; i < colors.length; i++) {
                colors[i].addEventListener('change', function(e) {BC.toggleSettings('color',this.value)}, false);
            }
        }
        else {
            blacklisted = qs('#blacklistedchannels');
            if (BC.settings.useblacklist) {
                if (BC.blacklist.length ) {
                    for (i = 0; i < BC.blacklist.length; i++) {
                        blContent += `<span title="Click to remove ${BC.blacklist[i][1]}" data-name="${BC.blacklist[i][0]}">${BC.blacklist[i][1]}</span>`;
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
            smarty[i].addEventListener('click', BC.blacklistRemove, true);
        }
    },


    blacklistButton: () => {
        let span = d.createElement("span");

        span.className = "action-button add-to-blacklist";
        span.innerHTML = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 33 33" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,27.000000) ' +
            'scale(0.100000,-0.100000)" stroke="none"><path fill="currentColor" d="M12 258 c-17 -17 -17 -229 0 -246 17 -17 229 -17 246 0 17 17 17 229 0 246 -17 17 -229 17 -246 0z m233 -123 l0 -110 -110 0 -110 0 -3 99 c-1 55 0 106 2 113 4 11 30 13 113 11 l108 -3 0 -110z"/>' +
            '<path fill="currentColor" d="M40 217 c0 -7 16 -26 35 -42 19 -17 35 -35 35 -40 0 -6 -16 -25 -35 -42 -19 -18 -35 -37 -35 -43 0 -22 31 -8 60 29 l32 39 35 -39 c34 -37 63 -51 63 -29 0 6 -16 24 -35 41 -19 17 -35 37 -35 44 0 7 16 25 35 39 35 27 47 56 ' +
            '23 56 -7 0 -26 -16 -41 -35 -15 -19 -33 -35 -40 -35 -7 0 -25 16 -41 35 -30 35 -56 46 -56 22z"/></g></svg><span class="blacklist-tooltip">&nbsp;Blacklist&nbsp;</span>';
        return span
    },


    toggleTab: (e,pos) => {
        let close = (typeof pos != 'undefined' && pos == 'close') ? true : false,
            tab = qs('#smarty_tab');

        if (tab.style.display == 'none' && !close) {
            tab.style.display = 'block';
            d.body.addEventListener('click', function(e) {if(!e.target.classList.contains("tabinput")) {BC.toggleTab(null,'close')}} );
        }
        else {
            setTimeout(function(){tab.style.display = 'none'},200);
            d.body.removeEventListener('click', function(e) {if(!e.target.classList.contains("tabinput")) {BC.toggleTab(null,'close')}} );
        }
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    },


    blacklistAdd: (e, channel, name) => {
        let i,
            blocked = qsa('[polled="'+channel+'"]');

        for (i = 0; i < blocked.length; i++) blocked[i].innerHTML = BC.wait(blocked[i]);
        BC.blacklist.push([channel, name]);
            /* Sort by User Name*/
        BC.blacklist.sort( (a, b) => {
            let x = a[1].toUpperCase(), y = b[1].toUpperCase();
            if (x > y) return 1;
            else if (x < y) return -1;
            return 0;
        });
        GM.setValue('blacklist', JSON.stringify(BC.blacklist));
        BC.createSmartyButton();

        e.preventDefault();
        e.stopPropagation();
        return false;
    },


    blacklistRemove: (e) => {
        BC.toggleTab();
        let arr = BC.blacklist.filter(function(ele) {
            return ele[0] != e.target.getAttribute('data-name');
        });
        BC.blacklist = arr;
        BC.blacklist.sort( (a, b) => {
            let x = a[1].toUpperCase(), y = b[1].toUpperCase();
            if (x > y) return 1;
            else if (x < y) return -1;
            return 0;
        });
        GM.setValue('blacklist', JSON.stringify(BC.blacklist));
        BC.createSmartyButton();
        e.preventDefault();
        e.stopPropagation();
        return false;
    },


    wait: (o) => {
        let waiter = '<div id="loader" style="position: relative;margin: auto;left: 0;top: 90px;width: 10%;"><ul style="width: 10%;"><li></li><li></li><li></li></ul></div>',
            dim = o.getBoundingClientRect(),
            n = dim.width;

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
    },


    maxY: 0, minY: 0, lastY: 0, tabTop: 0,
    topfloat: '', tabfloat: '', upPrev: 0,
    tabNav: '', topNav: '',
    floatHeaders: (e) => {
        let spanY = 0,
            scrolled = Math.round(pageYOffset),
            up = scrolled < BC.lastY;

        if (scrolled == BC.lastY) return;
        else if (up) {
            BC.minY = scrolled;
            spanY = BC.minY - BC.maxY;
        }
        else {
            BC.maxY = scrolled;
            spanY = BC.maxY - BC.minY;
        }
        BC.lastY = scrolled;

        if (up) {
            if (!BC.upPrev) BC.maxY = BC.lastY;
            if (scrolled < BC.tabTop + 100 || spanY < -150) {
                if (BC.topfloat) {
                    if (scrolled < 1) {
                        BC.maxY = 0;
                        BC.topfloat = false;
                        BC.topNav.style.top = '';
                        d.documentElement.classList.remove("topNavfloat");
                    }
                    else if (scrolled > BC.tabTop + 99) {
                        BC.topNav.style.top = '0px';
                    }
                }
                if (BC.topfloat || scrolled < 1) {
                    if (scrolled <= BC.tabTop - 60) {
                        BC.tabfloat = false;
                        BC.tabNav.style.top = '';
                        d.documentElement.classList.remove("tabNavfloat");
                    }
                    else if (scrolled > BC.tabTop + 99) {
                        BC.tabNav.style.top = '60px';
                    }
                }
            }
        }
        else if (scrolled > BC.tabTop + 88 && spanY > 149) {
            if (BC.upPrev) BC.minY = BC.lastY;
            BC.topNav.style.top = '-160px';
            if (!BC.topfloat) {
                BC.topfloat = true;
                d.documentElement.classList.add("topNavfloat");
            }
            BC.tabNav.style.top = '-102px';
            if (!BC.tabfloat) {
                BC.tabfloat = true;
                d.documentElement.classList.add("tabNavfloat");
            }
        }
        BC.upPrev = up;
    },


    navsIni: () => {
        if (BC.settings.hidemenubar) {
            window.scrollTo(0, 0);
            BC.maxY = 0; BC.minY = 0; BC.lastY = 0; BC.tabTop = 0;
            BC.topfloat = false; BC.tabfloat = false; BC.upPrev = true;
            BC.topNav = qs('#nav-top-menu');
            BC.tabNav = qs('.tab-scroll-outer');
            d.documentElement.classList.remove("topNavfloat");
            d.documentElement.classList.remove("tabNavfloat");
            BC.topNav.style.top = '';
            if (BC.tabNav && !BC.tabTop) {
                BC.tabNav.style.top = '';
                setTimeout( function() {
                  BC.tabTop = BC.tabNav.getBoundingClientRect().top;
                  if (isChrome) setTimeout( function(){window.scrollTo(0, BC.tabTop)},1000);
                  else window.scrollTo(0, BC.tabTop);
                },1000);
            }
        } else return
    },


    toggleSettings: (arg, val) => {
        let previouslisting, carousel, advert;

        if (arg == 'useblacklist') {
            BC.savePlayerValue(arg, val);
            BC.createSmartyButton();
            if (BC.homepage) {
                if (val) {
                    if (BC.previouslisting) {
                        previouslisting = BC.previouslisting;
                        if (previouslisting.indexOf('listing') !=-1 && !BC.settings.hidecarousel)
                            BC.applyBlacklist('#carousel #channel-list div.item > div,#carousel .hidden-md > div');
                        BC.applyBlacklist(previouslisting);
                    }
                    d.documentElement.classList.remove("noblacklist");
                }
                else d.documentElement.classList.add("noblacklist");
            }
        }
        else if (arg == 'hidecarousel') {
            if (carousel = qs('#carousel')) {
                carousel.style.display = (val ? 'none' : 'block');
                if (val) carousel.innerHTML = '';
                else carousel.innerHTML = '<h3>Refresh window to start carousel</h3>';
            }
            BC.savePlayerValue(arg, val);
            BC.createSmartyButton();
        }
        else if (arg == 'hidemenubar') {
            BC.savePlayerValue(arg, val);
            BC.createSmartyButton();
        }
        else if (arg == 'hideadverts') {
            if (advert = qs('.rcad-container')) {
                advert.style.display = (val ? 'none' : 'block');
            }
            BC.savePlayerValue(arg, val);
            BC.createSmartyButton();
        }
        else if (arg == 'useminiplayer') {
            BC.savePlayerValue(arg, val);
            window.location.replace(window.location.href);
        }
        else if (arg == 'usedark') {
            if (val) d.documentElement.classList.add("night");
            else d.documentElement.classList.remove("night");
            BC.savePlayerValue(arg, val);
        }
        else if (arg == 'color') {
            BC.savePlayerValue(arg, val);
            window.location.replace(window.location.href);
        }
    },


    savePlayerValue: (arg, val) => {
        if (arg == 'volume') BC.player.volume = val;
        else if (arg == 'color') BC.settings.color = val;
        else if (arg == 'usedark') BC.settings.usedark = val;
        else if (arg == 'autoplay') BC.player.autoplay = val;
        else if (arg == 'playnext') BC.settings.playnext = val;
        else if (arg == 'playlists') BC.settings.playlists = val;
        else if (arg == 'mvplaylist') BC.settings.mvplaylist = val;
        else if (arg == 'hidemenubar') BC.settings.hidemenubar = val;
        else if (arg == 'hideadverts') BC.settings.hideadverts = val;
        else if (arg == 'useblacklist') BC.settings.useblacklist = val;
        else if (arg == 'hidecarousel') BC.settings.hidecarousel = val;
        else if (arg == 'hidecomments') BC.settings.hidecomments = val;
        else if (arg == 'useminiplayer') BC.settings.useminiplayer = val;
        GM.setValue('player', JSON.stringify({
          volume       : BC.player.volume,
          autoplay     : BC.player.autoplay,
          color        : BC.settings.color,
          playnext     : BC.settings.playnext,
          playlists    : BC.settings.playlists,
          mvplaylist   : BC.settings.mvplaylist,
          usedark      : BC.settings.usedark,
          useblacklist : BC.settings.useblacklist,
          hidecarousel : BC.settings.hidecarousel,
          hidecomments : BC.settings.hidecomments,
          hidemenubar  : BC.settings.hidemenubar,
          hideadverts  : BC.settings.hideadverts,
          useminiplayer: BC.settings.useminiplayer
        }));
    },


    miniPlayer: () => {
        let show_mini = pageYOffset > BC.player.api.mini_point,
            is_mini = d.documentElement.classList.contains("s-marty-miniplayer")

        if (!show_mini && is_mini) {
            d.documentElement.classList.remove("s-marty-miniplayer");
            BC.player.fur.style.width = '';
            BC.player.fur.style.height = '';
            BC.player.fur.style.left = '0px';
            BC.player.fur.style.bottom = '0px';
            BC.player.api.style.width = '';
            BC.player.api.style.height = BC.origVid.h +'px';
            window.dispatchEvent(new Event("resize"));
        }
        else if (show_mini && !is_mini) {
            d.documentElement.classList.add("s-marty-miniplayer");
            BC.player.fur.style.left = BC.miniplayer.x +'px';
            BC.player.fur.style.bottom = BC.miniplayer.y +'px';
            BC.player.api.style.width = BC.miniplayer.w +'px';
            BC.player.api.style.height = BC.miniplayer.h +'px';
        }
    },


    onFullScreen: (e) => {
        if (d.fullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement)
             d.documentElement.classList.add("isfullscreen");
        else d.documentElement.classList.remove("isfullscreen");
    },


    sizeMiniPlayer: (e) => {
        let miniPlayerSized = false;

        if (e.type === "mousemove") {
            BC.miniSiz.hd = e.clientY - BC.miniSiz.h;
            BC.miniSiz.h = e.clientY;
            BC.miniPlayerH -= BC.miniSiz.hd;
            if (BC.miniPlayerH < 197) BC.miniPlayerH = 197;
            if (BC.miniPlayerH > BC.origVid.h) BC.miniPlayerH = BC.origVid.h;
            if (BC.miniPlayerH + BC.miniplayer.y > window.innerHeight -15) BC.miniPlayerH = window.innerHeight - BC.miniplayer.y -15;
            BC.miniPlayerW = Math.round(BC.miniPlayerH * BC.origVid.r);

            BC.player.api.style.width = BC.miniPlayerW +'px';
            BC.player.fur.style.width = BC.miniPlayerW +'px';
            BC.player.fur.style.height = BC.miniPlayerH +'px';
            BC.player.api.style.height = BC.miniPlayerH +'px';
        }
        else if (e.type === "mouseup") {
            window.removeEventListener("mouseup", BC.sizeMiniPlayer, true);
            window.removeEventListener("mousemove", BC.sizeMiniPlayer, true);
            if (BC.miniPlayerH != BC.miniplayer.h) {
                BC.miniPlayerH = (BC.miniPlayerH < 197) ? 197 : BC.miniPlayerH;
                BC.miniplayer.h = (BC.miniPlayerH > BC.origVid.h) ? BC.origVid.h : BC.miniPlayerH;
                BC.miniplayer.w = Math.round(BC.miniPlayerH * BC.origVid.r);
                miniPlayerSized = true;
            }
        }
        else if (e.type === "mousedown") {
            BC.miniSiz.h = e.clientY;
            BC.miniPlayerH = BC.miniplayer.h;
            window.addEventListener("mouseup", BC.sizeMiniPlayer, true);
            window.addEventListener("mousemove", BC.sizeMiniPlayer, true);
        }
        if (miniPlayerSized) {
            GM.setValue('miniplayer', JSON.stringify({ x:BC.miniplayer.x,y:BC.miniplayer.y,w:BC.miniplayer.w,h:BC.miniplayer.h }));
            miniPlayerSized = false;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    },


    moveMiniPlayer: (e) => {
        let miniPlayerMoved = false;

        if (e.type === "mousemove") {
            BC.miniPos.xd = e.clientX - BC.miniPos.x;
            BC.miniPos.yd = BC.miniPos.y - e.clientY;
            BC.miniPos.x = e.clientX;
            BC.miniPos.y = e.clientY;
            BC.miniPlayerX += BC.miniPos.xd;
            BC.miniPlayerY += BC.miniPos.yd;
            if (BC.miniPlayerX < 0) BC.miniPlayerX = 0;
            if (BC.miniPlayerX + BC.miniplayer.w > window.innerWidth) BC.miniPlayerX = window.innerWidth - BC.miniplayer.w;
            if (BC.miniPlayerY < 0) BC.miniPlayerY = 0;
            if (BC.miniPlayerY + BC.miniplayer.h > window.innerHeight -15) BC.miniPlayerY = window.innerHeight - BC.miniplayer.h -15;

            BC.player.fur.style.left = BC.miniPlayerX +'px';
            BC.player.fur.style.bottom = BC.miniPlayerY +'px';
        }
        else if (e.type === "mouseup") {
            window.removeEventListener("mouseup", BC.moveMiniPlayer, true);
            window.removeEventListener("mousemove", BC.moveMiniPlayer, true);
            if (BC.miniPlayerX != BC.miniplayer.x || BC.miniPlayerY != BC.miniplayer.y) {
                BC.miniplayer.x = (BC.miniPlayerX < 0) ? 0 : BC.miniPlayerX;
                BC.miniplayer.y = (BC.miniPlayerY < 0) ? 0 : BC.miniPlayerY;
                miniPlayerMoved = true;
            }
        }
        else if (e.type === "mousedown") {
            BC.miniPos.x = e.clientX;
            BC.miniPos.y = e.clientY;
            BC.miniPlayerX = BC.miniplayer.x;
            BC.miniPlayerY = BC.miniplayer.y;
            window.addEventListener("mouseup", BC.moveMiniPlayer, true);
            window.addEventListener("mousemove", BC.moveMiniPlayer, true);
        }
        if (miniPlayerMoved) {
            GM.setValue('miniplayer', JSON.stringify({ x:BC.miniplayer.x,y:BC.miniplayer.y,w:BC.miniplayer.w,h:BC.miniplayer.h }));
            miniPlayerMoved = false;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    },


    addBrowserSearch: () => {
      	let head = qs('head'),
      	    openSearch = d.createElement('link');

      	openSearch.setAttribute('rel', 'search');
      	openSearch.setAttribute('href', location.protocol +'//github.com/s-marty/SmartChute/raw/master/inc/search.xml');
      	openSearch.setAttribute('type', 'application/opensearchdescription+xml');
      	openSearch.setAttribute('title', 'Bit Chute');
      	head.appendChild(openSearch);
    },


    setChannelFeed: (action) => {
        let rssLink, title, href, channel;
        let head = qs('head'),
            card = qs('.channel-banner .name a'),
            feed = qs('#rss_feed');

        if (action == 'remove' && feed) {
            head.removeChild(feed)
        }
        else if (action == 'add' && card) {
            title = card.innerText;
            href = card.getAttribute("href");
            channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
            if (channel) {
      	        if (feed && feed.title != title) head.removeChild(feed);
      	        else if (!feed) {
          	        rssLink = d.createElement('link');
                    rssLink.setAttribute('rel', 'alternate');
                    rssLink.setAttribute('href', `${location.protocol}//www.bitchute.com/feeds/rss/channel/${channel[1]}/`);
                    rssLink.setAttribute('type', 'application/rss+xml');
                    rssLink.setAttribute('title', title);
                    rssLink.setAttribute('id', 'rss_feed');
                    head.appendChild(rssLink);
                }
            }
        }
    },


    setPreferencesCookie: (name, value) => {
        let val, preferences = d.cookie.match(/preferences=(\{[a-z0-9_%:-]+[^;]*\})/i);
        if (preferences) {
            if (name == 'autoplay') {
                val = preferences[1].match(/theme%22:%22([a-z]+)%22/);
                d.cookie = `preferences={%22theme%22:%22${val[1]}%22%2C%22autoplay%22:${value}}; path=/`;
            }
            else if (name == 'theme') {
                val = preferences[1].match(/autoplay%22:([a-z]+)(\}|%2C)/);
                d.cookie = `preferences={%22theme%22:%22${value}%22%2C%22autoplay%22:${val[1]}}; path=/`;
            }
        }
    },


    addSensitivityCookie: (e) => {
        d.cookie = "sensitivity=true; path=/";
        return false
    },


    getCsrftoken: () => {
        let csrftoken = d.cookie.match(/csrftoken=([a-z0-9_-]+[^;]*)/i);
        return csrftoken ? csrftoken[1] : null
    },


    addPublishDate: (update = false) => {
        let u, tn, out = null;
        let vpd = qs("div.video-publish-date");

        if (vpd) {
            u = vpd.innerHTML.match(/(\d\d):(\d\d)\s(UTC)\son\s([a-zA-Z]*)\s(\d?\d)[a-z]{2},\s(\d{4})/);
            debug('dateString.match', u);
            if (u) {
                if (update) {
                    out = getPublishDate(u);
                    if (out) {
                        vpd = qs("b", vpd);
                        tn = d.createTextNode(`${out} ago`);
                        vpd.replaceChild(tn, vpd.childNodes[0]);
                    }
                }
                else {
                    vpd.style.fontSize = "12px";
                    out = getPublishDate(u);
                    if (out) {
                        vpd.innerHTML += `&nbsp;&nbsp; <b>${out} ago</b>`;
                        vpd = qs("b", vpd);
                        vpd.style.cursor = "pointer";
                        vpd.setAttribute("title", "Update this")
                        vpd.addEventListener('click', (e) => {
                            e.preventDefault();
                            BC.addPublishDate(true);
                            return false
                        }, false);
                    }
                }
            }
        }
    },


    isDark: false, isTheme: false, persistTryDT: 0,

    setTheme: () => {
        let c, theme, version, colours, style;

        if (!BC.isDark && BC.settings.usedark) {
            theme = qs('link#css-theme');
            if (theme !== null) {
                if (theme.href.indexOf('night.css') ==-1) {
                    version = theme.href.match( /\/static\/([a-z]+[0-9]+)\//i );
                    if (version !== null && version[1] !== null) {
                        BC.version = version[1];
                        theme.setAttribute('href',`/static/${BC.version}/css/theme-default-night.css`);
                    }
                    BC.isDark = true;
                }
                BC.setPreferencesCookie("theme", "night");
                d.documentElement.classList.add("night");
                BC.persistTryDT = 0;
            }
            else if (!BC.isDark && BC.persistTryDT++ < 30) {
                window.setTimeout(BC.setTheme, 1000);
            }
        }
        if (!BC.isTheme && BC.settings.color != 'none') {
            BC.isTheme = true;
            colours = {
                'orange':{dark:'#ef4136',lighter:'#f37835',lightest:'#f0af5a'},
                 'green':{dark:'#46a604',lighter:'#35c453',lightest:'#55a47c'},
                  'blue':{dark:'#2532e0',lighter:'#2567e0',lightest:'#559bcc'}
            };
            c = colours[BC.settings.color];
            style = d.createElement("style");
            style.type = "text/css";
            style.innerText = `
                .night .sidebar-heading, .night .subscribe-button, .night .btn-danger, .night #loader ul li {background-color: ${c.dark};}
                .night .sidebar-recent .video-card.active {box-shadow: 0 0 1em 0.2em ${c.lighter};} .night .nav-tabs>li.active {border-bottom-color:${c.dark};}
                .night .playlist-card.active {border-top: 1px solid ${c.lighter}bb; box-shadow: 0 2px 1em 0.2em ${c.lighter};}
                .night body, .night .video-card .video-card-text, .night .video-card .video-card-text p i, .night .notify-button,
                .night .channel-notify-button, .night .channel-videos-details, .night .channel-videos-title a, .night .channel-videos-text,
                .night .video-trending-details, .night .video-trending-title a, .night .video-trending-channel a, .night .video-trending-text,
                .night .playlist-video .details, .night .playlist-video .title a, .night .playlist-video .channel a, .night .playlist-video .description,
                .night #smarty_tab label, .night #smarty_tab #blacklistedchannels span,
                .night .video-detail-text p, .night .video-information .sharing-drop span, .night #nav-top-menu .search-box .form-control { color: ${c.lightest};}
                .night a:link, .night a:active, .night a:visited, .night a:focus, .night .scripted-link, .night #nav-top-menu .unauth-link a, .night #nav-side-menu .side-toggle,
                .night .video-card .video-card-text a, .night #nav-top-menu .user-link a, .night #day-theme a svg, .night .search-icon svg { color: ${c.lighter};}
                .night #nav-side-menu .side-toggle:hover, .night #day-theme a svg:hover, .night .search-icon svg:hover, .night #smarty_tab label:hover, .night #smarty_tab #blacklistedchannels span:hover,
                .night a:hover, .night .scripted-link:hover {color: ${c.dark} !important;}
                .night #video_download_dialog button[disabled]:not(.download_finished):not(.download_error):hover {background-color: ${c.dark} !important;}
                .night .tags ul li a, .night #show-comments {background-color: #3b383c; border-radius:5px;} .night .tags ul li a:hover {background-color: #4d484e;} .creator-monetization {color: #30a247;}
                .night .channel-banner .name a.userisblacklisted {text-decoration-color: yellow;} .night #video_download_dialog hr {background: linear-gradient(to right, #211f22 0%, ${c.dark} 50%, ${c.dark} 50%, #211f22 100%) !important;}
                .night .radiohelper::before, .night .cbhelper::before {border: 1px solid ${c.dark};}
                .night .smartybox input[type="checkbox"]:checked ~ .cbhelper::before, .night .smartybox input[type="radio"]:checked ~ .radiohelper::before {background: linear-gradient(to bottom, ${c.lightest}33 0%, ${c.dark}66 100%) !important;}`;
            d.documentElement.appendChild(style);
        }
    },


    persistTryATL: 0, buttonFound: false,

    addThemeListeners: () => {
        let toDay   = qs('#day-theme a'),
            toNight = qs('#night-theme a');

        if (toDay && toNight && !BC.buttonFound) {
            BC.buttonFound = true;
            toDay.addEventListener('click', function(e) {
                if (e.which===1)
                    BC.toggleSettings('usedark', false)
            }, false);

            toNight.addEventListener('click', function(e) {
                if (e.which===1)
                    BC.toggleSettings('usedark', true)
            }, false);
        }
        else if (BC.persistTryATL++ < 30 && !BC.buttonFound) setTimeout(BC.addThemeListeners, 1000);
    },


    persistTryHC: 0, showComments: null, commentsFrame: null, commentsUrl: '',

    hideComments: (e) => {
        let comments = qs('#disqus_thread');
        let nocomments = qs('.video-no-discussion');
        let container = qs('#comment-frm-container');
        BC.showComments = qs('#comment-frm-container > #show-comments');

        if (nocomments || BC.showComments) return;
        if (container && comments) {
            comments.style.display = 'none';
            if (BC.commentsFrame = qs('iframe', comments)) {
                BC.commentsUrl = BC.commentsFrame.getAttribute('src')
            }
            if (BC.commentsFrame && BC.commentsUrl) {
                BC.commentsFrame.setAttribute('src', 'about:blank');
            }
            else {
                if (BC.persistTryHC++ < 60 && !BC.showComments)
                    setTimeout(BC.hideComments, 1000);
                return
            }
            BC.showComments = d.createElement("div");
            BC.showComments.id = 'show-comments';
            BC.showComments.innerHTML = '<span class="scripted-link">Show Comments</span>';
            BC.showComments.style = "width:100%;height:38px;margin:0px;padding:8px;text-align:center;border-radius:5px;";
            container.insertBefore(BC.showComments, comments);
            comments.style.display = 'none';
            BC.showComments.addEventListener('click', function(e) {
                if (e.which===1) {
                    qs('#disqus_thread').style.display = 'block';
                    BC.commentsFrame.setAttribute('src', BC.commentsUrl);
                    this.style.display = 'none';
                }
            }, false);
        } else if (BC.persistTryHC++ < 30 && !BC.showComments) setTimeout(BC.hideComments, 2000);
    },


    fetchingMoreRecentVideos: 0,

    addMoreRecentVideos: (offset = -1, playlist = null) => {
        let data, link, csrf, xhr, sensitivity;
        let extend = "",
            name = null,
            showall = "";

        if (!playlist) {
            if (BC.fetchingMoreRecentVideos == offset) return;
            BC.fetchingMoreRecentVideos = offset;
            link = qs('.details .name a');
            if (link) name = link.href.match( /\/channel\/([a-z0-9_-]+)\//i );
        }
        else {
            link = `${location.protocol}//${BC.host}/playlist/${playlist}/`;
        }
        sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);
        if (name || playlist) {
            csrf = BC.getCsrftoken();
            if (scriptHandler == "Greasemonkey"){xhr = new BC.SM_XMLHttpRequest()}else{xhr = new XMLHttpRequest()}
            if (playlist) {
                data = `csrfmiddlewaretoken=${csrf}`;
                xhr.addEventListener("load", (e) => { BC.pare(e, playlist) });
                xhr.addEventListener("error", (e) => { error('XMLHttpRequest playlist videos error: '+ e) });
            }
            else {
                if (sensitivity && sensitivity[1] == 'true') showall = '?showall=1';
                if (offset >= 0) {
                    extend = "extend/";
                    offset = `&offset=${offset}`;
                }
                data = `csrfmiddlewaretoken=${csrf}&name=${name[1]}${offset}`;
                xhr.addEventListener("load", (e) => { BC.pear(e) });
                xhr.addEventListener("error", (e) => { error('XMLHttpRequest recent videos error: '+ e) });
            }
            xhr.open("POST", `${link}${extend}${showall}`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    },


    SM_XMLHttpRequest: function() {
        /* Used only under Greasemonkey due to lack of Referer header */
        this.headers = {"Referer": BC.url}
        this.listeners = {load: null, abort: null, error: null, timeout: null,
                                      progress: null, readystatechange: null};
        this.addEventListener = function(event, data) {
            if (Object.keys(this.listeners).indexOf(event) !=-1)
                this.listeners[event] = data
        }
        this.setRequestHeader = function(header, data) {
            this.headers[header] = data
        }
        this.open = function(method, url) {
            this.method = method;
            this.url = url;
        }
        this.send = function(data = null) {
            var xhr = GM.xmlHttpRequest({
                              data: data,
                               url: this.url,
                            method: this.method,
                           headers: this.headers,
                            onload: this.listeners.load,
                           onabort: this.listeners.abort,
                           onerror: this.listeners.error,
                         ontimeout: this.listeners.timeout,
                        onprogress: this.listeners.progress,
                onreadystatechange: this.listeners.readystatechange
            });
        }
    },


    pear: (e) => {
        try {
            e = typeof e.target === "undefined" ? {target: e} : e;
            let i, a1, title, pdate, card, cards, active,
                hidden, sidebar, offset, addedoffset, showmore;
            let result = JSON.parse(e.target.responseText);

            if ('undefined' !== result.success && result.success) {
                hidden = d.createElement("div");
                sidebar = qs('.sidebar-recent');
                if (sidebar) {
                    hidden.innerHTML = result.html;
                    offset = qsa('.video-card', sidebar).length;
                    cards = qsa('.channel-videos-container', hidden);
                    addedoffset = cards.length;
                    showmore = d.createElement("div");
                    showmore.className="show-more-container";
                    showmore.innerHTML = '<div class="show-more"><span>SHOW MORE</span></div>';
                    for (i = 0; i < cards.length; i++) {
                        a1 = qs('.channel-videos-image-container', cards[i]).innerHTML
                            .replace('channel-videos-image','video-card-image')
                            .replace(/_640x360/g,'_320x180');
                        title = qs('.channel-videos-title', cards[i]).innerHTML;
                        pdate = qs('.channel-videos-details span', cards[i]).innerText;
                        card = d.createElement("div");
                        card.className="video-card";
                        card.innerHTML = a1 + `
                              <div class="video-card-text">
                                <p class="video-card-title">${title}</p>
                                <p class="video-card-published">${pdate}</p>\n</div>`;
                        sidebar.appendChild(card);
                    }
                    active = qs('.active', sidebar);
                    if (active) active.classList.remove("active");
                    active = qs(`.video-card > a[href='${BC.path}']`, sidebar);
                    if (active) active.parentNode.classList.add("active");
                    if (offset == 6 && addedoffset == 25) {
                        sidebar.parentNode.appendChild(showmore);
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ BC.addMoreRecentVideos(offset+addedoffset+2) }, false);
                    }
                    else if (offset > 6 && addedoffset == 25 && qs('.show-more')) {
                        qs('.show-more').outerHTML = showmore.outerHTML;
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ BC.addMoreRecentVideos(offset+addedoffset+2) }, false);
                    }
                }
            }
            else { error('XMLHttpRequest recent videos request error') }
            BC.fetchingMoreRecentVideos = 0;
        } catch (e) { error('XMLHttpRequest recent videos parsing error: '+ e) }
    },


    pare: (e, playlist) => {
        try {
            e = typeof e.target === "undefined" ? {target: e} : e;
            let i, r, a, q, h, a1, br, title, name, icon, pchan, pdate,
                card, active, hidden, content, sidebar, cards;
            let result = JSON.parse(e.target.responseText),
                index = 0,
                seqId = 0,
                cards2 = [];

            if ('undefined' !== result.success && result.success) {
                cards = qs('.sidebar-recent');
                hidden = d.createElement("div");
                content = d.createElement("div");
                content.className = "playlist_sidebar";
                sidebar = d.createElement("h2");
                sidebar.className = "sidebar-heading playlists";
                cards.insertBefore(content, cards.firstChild);
                cards.insertBefore(sidebar, cards.firstChild);
                hidden.innerHTML = result.html;
                cards = qsa('.playlist-video div.row', hidden);
                title = qs('#playlist-title', hidden).innerText;
                name = qs('.details .name a').innerText;
                title = `${cards.length == 25 ? "First 25" : cards.length} videos from ${name}'s \"${title}\" playlist.`;
                icon = qs('.sidebar-recent h2 span');
                icon.setAttribute("data-original-title", title);
                sidebar.innerText = "Playlist Videos";
                sidebar.appendChild(icon);

                a = BC.url.match( /\/video\/([a-z0-9_-]+)\//i )[1];
                r = new RegExp (`/video/${a}/`, 'i');
                for (i = 0; i < cards.length; i++) {
                    q = qs('.image-container a', cards[i]).href;
                    if (r.test(q)) index = i;
                    cards[i].setAttribute("id", i+1);
                    cards2.push(cards[i].outerHTML);
                }

                if (index !== 0) {
                    cards = new Array(cards2.length);
                    cards2.forEach( (item, i) => {
                        h = new DOMParser().parseFromString(item, 'text/html');
                        h = qs("body > div.row", h);
                        if (i < index) cards[cards2.length - index + i] = h;
                        else cards[i - index] = h;
                    })
                }

                for (i = 0; i < cards.length; i++) {
                    if (a1 = qs('.image-container', cards[i])) {
                        a1 = a1.innerHTML
                            .replace('image','video-card-image')
                            .replace(/_640x360/g,'_320x180')
                            .replace(/<\/div>/,'')
                            .replace(/<\/a>/,'<\/div><\/a>');
                        seqId = cards[i].id;
                        title = qs('.text-container .title', cards[i]).innerHTML;
                        pchan = qs('.text-container .channel', cards[i]).innerHTML;
                        pdate = qs('.text-container .details span', cards[i]).innerText;
                        q = qs('.image-container a', cards[i]).href.match( /\/video\/([a-z0-9_-]+)\//i )[1];
                        card = d.createElement("div");
                        card.className="video-card";
                        card.setAttribute("q", q);
                        card.innerHTML = a1 + `
                              <div class="video-card-text">
                                <p class="video-card-title">${title}</p>
                                <p class="video-card-channel">${pchan}</p>
                                <p class="video-card-published">${pdate}</p>
                                <span class="video-card-published sequence">${seqId}</span>\n</div>`;
                        content.appendChild(card);
                    }
                }
                active = qs('.active', content);
                if (active) active.classList.remove("active");
                active = qs(`.video-card[q='${a}']`, content);
                if (active) active.classList.add("active");
                setTimeout(() => {content.style.maxHeight = `${content.getBoundingClientRect().height}px`;}, 1500);
                sidebar.addEventListener("click", function(e){
                    setTimeout(() => {e.target.classList.toggle("slidein");}, 750);
                    qs(".playlist_sidebar").classList.toggle("slidein");
                }, false);
            }
            else { error('XMLHttpRequest playlist videos request error') }
            BC.fetchingMoreRecentVideos = 0;
        } catch (e) { error('XMLHttpRequest playlist videos parsing error: '+ e) }
    },


    fetchingMvplaylist: !1,
    mostViewedPlaylist: {slider:null,index:0,length:0,cardWidth:function(){let o = qs('.mvplaylist').getBoundingClientRect();return (!o || !o.width ? 0 : Math.round(o.width/240))}},

    addMostViewedPlaylist: () => {
        let el, comments, parent, row, csrf, xhr, data, showall;
        let link = qs('.details .name a'),
            sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);

        if (qs('.mvplaylist.row') || BC.fetchingMvplaylist) return;
        else {
            parent = qs('.video-container');
            row = d.createElement("div");
            row.className = 'mvplaylist row';
            if (comments = qs('.comments.row')) {
                el = comments;
            }
            else {
                el = parent.children[3];
                el.className = 'comments row';
            }
            parent.insertBefore(row, el);
        }
        if (link) {
            BC.fetchingMvplaylist = 1;
            csrf = BC.getCsrftoken();
            if (scriptHandler == "Greasemonkey"){xhr = new BC.SM_XMLHttpRequest()}else{xhr = new XMLHttpRequest()}
            data = 'csrfmiddlewaretoken='+ csrf;
            showall = '';
            if (sensitivity)
                if (sensitivity[1] == 'true') showall = '?showall=1';

            xhr.addEventListener("load", (e) => { BC.peer(e) });
            xhr.addEventListener("error", (e) => { error('XMLHttpRequest most viewed error: '+ e) });
            xhr.open("POST", link + showall, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    },


    peer: (e) => {
        try {
            e = typeof e.target === "undefined" ? {target: e} : e;
            let i, hidden, html, active, cards, row, title, content,
                arrow, slider, cardActive, cds, pos, left, right;
            let result = JSON.parse(e.target.responseText);

            if ('undefined' !== result.success && result.success) {
                hidden = d.createElement("div");
                html = result.html.match(/(<div class="video-card"[^<]*?>[\s\S]*<\/div>[\s\n]*?<\/div>)[\s\n]*?<\/div>[\s\n]*?<\/div>/i);
                if (html && html[1]) {
                    hidden.innerHTML = html[1];
                    active = '';
                    cards = qsa('.video-card', hidden);
                    row = qs(".mvplaylist.row");
                    title = d.createElement("div");
                    content = d.createElement("div");
                    arrow = d.createElement("div");
                    slider = d.createElement("div");
                    BC.mostViewedPlaylist.length = cards.length;
                    BC.mostViewedPlaylist.slider = slider;
                    title.className = 'playlist-title';
                    title.innerHTML = `<h2 class="sidebar-heading">Most Viewed (${cards.length})</h2>`;
                    row.appendChild(title);
                    arrow.className = 'playlistbt';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = 'playlistdn playlistbtn disabled';
                    arrow.innerHTML = '<b>&lt;</b>';
                    content.style = 'width: 100%;margin: 0px;padding: 0px; overflow:hidden;display: inline-block; max-height: 195px;';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = `playlistup playlistbtn${cards.length > 3 ? '' : ' disabled'}`;
                    arrow.innerHTML = '<b>&gt;</b>';
                    content.appendChild(arrow);
                    slider.className = 'mvslider';

                    for (i = 0; i < cards.length; i++) {
                        cardActive = qs(`a[href='${BC.path}']`, cards[i]);
                        if (cardActive) {
                            cds = Math.round( (row.getBoundingClientRect().width - 60) / 218 );
                            pos = (i > cards.length - cds) ? cards.length - cds : i;
                            BC.mostViewedPlaylist.slider.style.marginLeft = `-${pos * 218}px`;
                            if (pos > 0) qs('.playlistdn', content).classList.remove('disabled');
                            if (pos >= cards.length - cds) qs('.playlistup', content).classList.add('disabled');
                            BC.mostViewedPlaylist.index = pos;
                            active = ' active';
                        }
                        else active = '';
                        cards[i].className += ' playlist-card'+ active;
                        cards[i].innerHTML = cards[i].innerHTML.replace(/<\/div>(?![\s\S]*<\/div>)/, '\n<span class="video-card-published sequence">'+(i+1)+'</span>\n</div>');
                        slider.appendChild(cards[i]);
                    }
                    content.appendChild(slider);
                    row.appendChild(content);

                    left = qs('.mvplaylist .playlistdn');
                    left.addEventListener("click", function(e) {
                        if (this.classList.contains('disabled')) return false;
                        if (BC.mostViewedPlaylist.index > 0) {
                            BC.mostViewedPlaylist.slider.style.marginLeft = `-${--BC.mostViewedPlaylist.index * 218}px`;
                            if (BC.mostViewedPlaylist.index <= 0) this.classList.add('disabled');
                            if (BC.mostViewedPlaylist.index < BC.mostViewedPlaylist.length + BC.mostViewedPlaylist.cardWidth()) this.nextSibling.classList.remove('disabled');
                        }
                    });
                    right = qs('.mvplaylist .playlistup');
                    right.addEventListener("click", function(e) {
                        if (this.classList.contains('disabled')) return false;
                        if (BC.mostViewedPlaylist.index <= BC.mostViewedPlaylist.length - BC.mostViewedPlaylist.cardWidth()) {
                            BC.mostViewedPlaylist.slider.style.marginLeft = `-${++BC.mostViewedPlaylist.index * 218}px`;
                            if (BC.mostViewedPlaylist.index + BC.mostViewedPlaylist.cardWidth() >= BC.mostViewedPlaylist.length) this.classList.add('disabled');
                            if (BC.mostViewedPlaylist.index > 0) this.previousSibling.classList.remove('disabled');
                        }
                    });
                }
            }
            else { error('XMLHttpRequest most viewed request error') }
            BC.fetchingMvplaylist = !1;
        } catch (e) { error('XMLHttpRequest most viewed parsing error: '+ e) }
    },


    playlists: {}, fetchingPlaylists: !1,

    addChannelPlaylists: () => {
        let csrf, xhr, data, showall;
        let link = qs('.details .owner a');

        if (BC.fetchingPlaylists) return;
        BC.fetchingPlaylists = 1;
        if (link) {
            csrf = BC.getCsrftoken();
            if (scriptHandler == "Greasemonkey"){xhr = new BC.SM_XMLHttpRequest()}else{xhr = new XMLHttpRequest()}
            data = 'csrfmiddlewaretoken='+ csrf;
            showall = '';
            xhr.addEventListener("load", (e) => { BC.addPlaylist(e) });
            xhr.addEventListener("error", (e) => { error('XMLHttpRequest most viewed error: '+ e) });
            xhr.open("POST", link, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    },


    playAll: null,
    addPlaylist: (e) => {
        try {
            e = typeof e.target === "undefined" ? {target: e} : e;
            let link, plName, xhr, m, re, el, row, comments, parent, csrf, data;
            let i = 0,
                result = JSON.parse(e.target.responseText);

            if ('undefined' !== result.success && result.success) {
                parent = qs('.video-container');
                csrf = BC.getCsrftoken();
                data = 'csrfmiddlewaretoken='+ csrf;
                re = /class="playlist-card">[\n\s]+<a href="([a-zA-Z0-9\/_-]+)"[\s\S]*?(?!<\/a)+<div class="title">(.*)<\/div>/g
                do {
                    m = re.exec(result.html);
                    if (m) {
                        if (scriptHandler == "Greasemonkey"){xhr = new BC.SM_XMLHttpRequest()}else{xhr = new XMLHttpRequest()}
                        plName = 'pl'+ m[1].substr(10, 12);
                        BC.playlists[plName] = {item:i++,slider:null,index:0,length:0,cardWidth:function(){let o = qs('#'+ plName +'.playlist').getBoundingClientRect();return (!o || !o.width ? 0 : Math.round(o.width/240))}};
                        row = qs('#'+plName+'.playlist.row');
                        if (!row) {
                            row = d.createElement("div");
                            row.className = 'playlist row';
                            row.setAttribute('id', plName);
                            if (comments = qs('.comments.row')) {
                                el = comments;
                            }
                            else {
                                if (BC.settings.mvplaylist)
                                    el = parent.children[4];
                                else el = parent.children[3];
                                el.className = 'comments row';
                            }
                            parent.insertBefore(row, el);
                        }
                        link = location.protocol +"//"+ BC.host + m[1];

                        xhr.addEventListener("load", (e) => { BC.pier(e) });
                        xhr.addEventListener("error", (e) => { error('XMLHttpRequest most viewed error: '+ e) });
                        xhr.open("POST", link, true);
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        xhr.send(data);
                    }
                } while (m);
            }
            else {
                error('XMLHttpRequest profile page request error');
                BC.fetchingPlaylists = !1;
            }
        } catch (e) { error('XMLHttpRequest profile page parsing error: '+ e) }
    },


    pier: (e) => {
        try {
            e = typeof e.target === "undefined" ? {target: e} : e;
            let i, a1, pdate, link, hidden, html, card, cards, active,
                showMore, plName, row, title, content, arrow, slider,
                href, pos, cds, play, cardActive, left, right;
            let result = JSON.parse(e.target.responseText);

            if ('undefined' !== result.success && result.success) {
                if (!BC.playAll) {
                    BC.playAll = result.html.match( /<span class="fa-layers">.*<\/span>/ );
                    if (BC.playAll) BC.playAll = BC.playAll[0].replace('<span', '<span title="Play All"')
                }
                link = result.canonical.match( /.*\/playlist\/([a-z0-9_-]+)\//i );
                hidden = d.createElement("div");
                html = result.html.match(/(<div .* class="playlist-video"[^<]*?>[\s\S]*<\/div>[\s\n]*?<\/div>)[\s\n]*?<\/div>[\s\n]*?<\/div>/i);
                if (html && html[1]) {
                    hidden.innerHTML = html[1];
                    active = '';
                    plName = 'pl'+ link[1];
                    cards = qsa('.playlist-video > div.row', hidden);
                    showMore = qs('.show-more-container .show-more:not(.hidden)', hidden);
                    row = qs("#"+ plName +'.row');
                    title = d.createElement("div");
                    content = d.createElement("div");
                    arrow = d.createElement("div");
                    slider = d.createElement("div");
                    BC.playlists[plName].length = cards.length;
                    BC.playlists[plName].slider = slider;
                    title.className = 'playlist-title';

                    title.innerHTML = `<h2 class="sidebar-heading">${result.title} (${cards.length})${BC.playAll}</h2>`;
                    row.appendChild(title);
                    if (BC.playAll) {
                        href = qs('a', cards[0]).href.match( /(\/video\/[a-z0-9_-]+\/).*/i )[1];
                        qs('span', title).addEventListener("click", (e) => {
                            window.location.href = `${href}?list=${link[1]}&randomize=false`
                        });
                    }

                    arrow.className = 'playlistbt';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = `playlistdn playlistbtn ${plName} disabled`;
                    arrow.innerHTML = '<b>&lt;</b>';
                    content.style = 'width: 100%;margin: 0px;padding: 0px; overflow:hidden;display: inline-block; max-height: 195px;';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = `playlistup playlistbtn ${plName + (cards.length > 3 ? '' : ' disabled')}`;
                    arrow.innerHTML = '<b>&gt;</b>';
                    content.appendChild(arrow);
                    slider.className = 'plslider';

                    for (i = 0; i < cards.length; i++) {
                        if (a1 = qs('.image-container', cards[i])) {
                            a1 = a1.innerHTML
                                .replace('image','video-card-image')
                                .replace(/_640x360/g,'_320x180')
                                .replace(/<\/div>/,'')
                                .replace(/<\/a>/,'<\/div><\/a>');
                            title = qs('.text-container .title', cards[i]).innerHTML;
                            pdate = qs('.text-container .details span', cards[i]).innerText;
                            card = d.createElement("div");
                            card.className="video-card";
                            card.innerHTML = a1 + `
                                  <div class="video-card-text">
                                    <p class="video-card-title">${title}</p>
                                    <p class="video-card-published">${pdate}</p>
                                    <span class="video-card-published sequence">${i+1}</span>\n</div>`;

                            play = qs("a", card).getAttribute("href");
                            cardActive = play.indexOf(BC.path) !=-1;
                            if (cardActive) {
                                cds = Math.round( (row.getBoundingClientRect().width - 60) / 218 );
                                pos = (i > cards.length - cds) ? cards.length - cds : i;
                                BC.playlists[plName].slider.style.marginLeft = `-${pos * 218}px`;
                                if (pos > 0) qs(`.playlistdn.${plName}`, content).classList.remove('disabled');
                                if (pos >= cards.length - cds) qs(`.playlistup.${plName}`, content).classList.add('disabled');
                                BC.playlists[plName].index = pos;
                                active = ' active';
                            }
                            else active = '';
                            card.className += ' playlist-card'+ active;
                            slider.appendChild(card);
                        }
                    }
                    content.appendChild(slider);
                    row.appendChild(content);

                    left = qs('.playlistdn.'+ plName);
                    left.addEventListener("click", function(e) {
                        if (this.classList.contains('disabled')) return false;
                        if (BC.playlists[plName].index > 0) {
                            BC.playlists[plName].slider.style.marginLeft = `-${--BC.playlists[plName].index * 218}px`;
                            if (BC.playlists[plName].index <= 0) this.classList.add('disabled');
                            if (BC.playlists[plName].index < BC.playlists[plName].length + BC.playlists[plName].cardWidth()) this.nextSibling.classList.remove('disabled');
                        }
                    });
                    right = qs('.playlistup.'+ plName);
                    right.addEventListener("click", function(e) {
                        if (this.classList.contains('disabled')) return false;
                        if (BC.playlists[plName].index <= BC.playlists[plName].length - BC.playlists[plName].cardWidth()) {
                            BC.playlists[plName].slider.style.marginLeft = `-${++BC.playlists[plName].index * 218}px`;
                            if (BC.playlists[plName].index + BC.playlists[plName].cardWidth() >= BC.playlists[plName].length) this.classList.add('disabled');
                            if (BC.playlists[plName].index > 0) this.previousSibling.classList.remove('disabled');
                        }
                    });
                }
            }
            else { error('XMLHttpRequest playlists request error') }
            BC.fetchingPlaylists = !1;
        } catch (e) { error('XMLHttpRequest playlists parsing error: '+ e) }
    },


    init: function() {
        return new Promise( resolve => {
            let settings = {volume:0.5,autoplay:true,color:"none",playnext:false,usedark:true,playlists:true,mvplaylist:true,
                            useblacklist:true,hidecarousel:false,hidecomments:false,hidemenubar:true,hideadverts:true,useminiplayer:true};
            GM.getValue('player', "{}").then( value => {
                if (value && value != '{}') {
                    let player = Object.assign({}, settings, JSON.parse(value));
                    BC.url = null;
                    BC.host = null;
                    BC.path = null;
                    BC.loaded = !1;
                    BC.loader = null;
                    BC.themes = null;
                    BC.blacklist = [];
                    BC.page = 'homepage';
                    BC.previouslisting = '';
                    BC.miniPlayerIni = false;
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
                        mvplaylist   : player.mvplaylist,
                        hideadverts  : player.hideadverts,
                        hidemenubar  : player.hidemenubar,
                        useblacklist : player.useblacklist,
                        hidecarousel : player.hidecarousel,
                        hidecomments : player.hidecomments,
                        useminiplayer: player.useminiplayer
                    }
                    GM.getValue('blacklist', "[]").then( value => {
                        BC.blacklist = JSON.parse(value);
                        let err = qs("#page-bar .page-title");
                            /* Server Error */
                        if (!err || (err && !err.innerText.match(/.*((server)+\serror)+$/i))) {
                            debug('>>>>>>>>>>>>>> BC init <<<<<<<<<<=');
                            resolve(true);
                        }
                    }).catch ( e => {
                        error('S_marty: Error in promise loading blacklist: '+ e);
                    });
                }
                else {
                        /* Install Database */
                    GM.setValue('blacklist', '[]');
                    GM.setValue('player', JSON.stringify(settings));
                    GM.setValue('miniplayer', "{ \"x\":0,\"y\":0,\"w\":350,\"h\":197 }");
                    window.location.replace(window.location.href);
                }
            }).catch ( e => {
                error('S_marty: Error in promise loading dB: '+ e);
            });
        });
    }
};


const Bcd = {

    link: null,
    dialog: null,
    loader: null,
    tooltip: null,
    unloader: null,
    playerAPI: null,
    videoButtons: 0,
    videoSources: 0,
    downloadIndex: -1,
    download_poster: false,
    src: {videos: []},
    downloads: [],


    flattenTitle: (t, title = "") => {

        t = t.replace(/\s?\[mirrored\]/i, "");
        t = t.replace(/(?=\W{3,})/g, "");
        t = t.replace(/\s?["'\[\(\{]*Re.{0,3}upload(ed)?["':\]\)\}]*\s?/i, "");
        [...t].forEach(n => {
    	    if ( /[^\\/:\*\?'"<>@\|]+/.test(n) ) title += n;
        });
        while (title[0] === "." || title[0] === " ") {title = title.slice(1)}
        while (title.slice(-1) === "." || title.slice(-1) === " ") {title = title.slice(0, -1)}
        title = title.trim();
        if (/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i.test(title)) title = "Video_" + title;

        return title;
    },


    load: (e, vid) => {
        let style, br;
        let menu = qs(".video-actions .action-list");

        debug(`>>>>>>>>>>>>>> Bcd load <<<<<<<<<<= ${e}:`, vid);

        if (! qs("#downloadLink")) {
            Bcd.link = d.createElement("a");
            Bcd.link.setAttribute("id", "downloadLink");
            Bcd.link.setAttribute("title", "");
            Bcd.link.setAttribute("data-original-title", "Download");
            Bcd.link.setAttribute("data-placement", "bottom");
            Bcd.link.setAttribute("data-toggle", "tooltip");
            Bcd.link.className = "disabled";
            Bcd.link.innerHTML = Bcd.icon;
            menu.insertBefore(Bcd.link, menu.firstChild);

            Bcd.link.addEventListener('mouseover', function(e) {
                Bcd.tooltip = d.createElement("div");
                Bcd.tooltip.className = "tooltip fade bottom";
                Bcd.tooltip.setAttribute("id", "tooltip94008");
                Bcd.tooltip.setAttribute("role", "tooltip");
                br = Bcd.link.getBoundingClientRect();
                Bcd.tooltip.style.top = br.bottom + window.scrollY +"px";
                Bcd.tooltip.style.left = br.left + window.scrollX + ((br.right - br.left) / 2) - 36 +"px";
                Bcd.tooltip.innerHTML = '<div class="tooltip-arrow"></div><div class="tooltip-inner">Download</div>';
                Bcd.tooltip.style.display = "block";
                qs("body").appendChild(Bcd.tooltip);
                Bcd.tooltip.classList.add('in');
            }, false);

            Bcd.link.addEventListener('mouseout', function(e) {
                Bcd.tooltip.classList.remove('in');
                window.setTimeout( function(e) {
                    qs("#tooltip94008").outerHTML = "";
                }, 150);
            }, false);

            Bcd.link.addEventListener('click', (e) => {
                e.preventDefault();

                if (Bcd.dialog) {
                    Bcd.toggle_download_dialog();
                    return
                }
            }, false);
        }

        if (! qs("style#video_download")) {
            style = d.createElement("style");
            style.id = "video_download";
            style.type = "text/css";
            style.innerText = `
                    a#downloadLink.disabled {pointer-events: none; opacity: 0.3; cursor: default}
                    .video-information .video-actions a.download_started {color: #eeee00;}
                    .video-information .video-actions a.download_finished {color: #00ee00;}
                    .video-information .video-actions a.download_error {color: #ee0000;}

                    #video_download_dialog {width: 400px; border: 2px solid #5F5F5F; border-radius: 6px; position: absolute;
                      z-index: 99000; background-color: #ddd;}
                    html.night #video_download_dialog {background-color: #211f22; border-color: #aaa;}
                    #video_download_dialog h2 {text-align: center;}
                    #video_download_dialog h4 {padding: 6px; text-align: center; text-shadow: 1px 1px #A1A1A1;}
                    #video_download_dialog .download_poster {background-color: transparent;}
                    #video_download_dialog .download_poster img {border: 1px solid #5F5F5F; width: 160px; height: 90px; margin-left: 18px;}
                    #video_download_dialog .poster_saveas {position: relative; right: 92px; text-align: center; float: right; top: 14px; font-size: 1em;}
                    html.night #video_download_dialog .download_poster img {border-color: #aaa;}
                    #video_download_dialog button {font-size: 13px; color: #000; border-radius: 4px;
                      margin: 4px; right: 10px; position: absolute;-webkit-border-radius: 4;  -moz-border-radius: 4; border: 2px solid #555;}
                    #video_download_dialog button[disabled] {opacity: 0.5;}
                    #video_download_dialog .download_dialog_close_button {color: #990000; background-color: #aaa; top: -16px; right: -16px;
                      position: absolute; width: 32px; height: 32px; border-radius: 16px; border: 2px solid #555; cursor: pointer;
                      font-size: 24px; font-weight: bold; text-align: center; vertical-align: middle; line-height: 28px;}
                    #video_download_dialog .download_dialog_close_button:hover {background-color: #ddd; border-color: #222;}
                    #video_download_dialog .download_videos {background-color: transparent;}
                    #video_download_dialog hr {height: 1px; width: 80%; margin: 20px auto; border: none;
                      background: linear-gradient(to right, #BFBDBD 10%, #000 50%, #000 50%, #BFBDBD 90%);}
                    html.night #video_download_dialog hr {background: linear-gradient(to right, #000 0%, #BFBDBD 50%, #BFBDBD 50%, #000 100%);}
                    #video_download_dialog .download_videos div {background-color: transparent;}
                    #video_download_dialog .download_videos div.download_progress {margin: 2px 0px 2px 16px;}
                    #video_download_dialog .download_videos div.download_details {height: 50px; width: 188px; max-width: 200px; float: left;
                      padding: 6px; margin-left: 10px;}
                    #video_download_dialog button.download_error {background-color: #ff0000 !important;}
                    #video_download_dialog button.download_cancel {background-color: #aaaa22;}
                    #video_download_dialog button.download_finished {background-color: #8efc8e !important;}
                    #video_download_dialog button:not([disabled]):hover {color: #ffffff;}`;
            d.documentElement.appendChild(style);
        }
        Bcd.downloadDialog(vid);
    },


    downloadDialog: (vid) => {
        let downloadVideos, hr, newVid;

        Bcd.dialog = qs("#video_download_dialog");
        debug(`Building downloadDialog (${Bcd.videoButtons})`)

        if (Bcd.dialog) {
            downloadVideos = qs(".download_videos", Bcd.dialog);

            if (downloadVideos) {
                hr = d.createElement("hr");
                newVid = d.createElement("div");
                newVid.style.height = "54px";
                newVid.style.margin = "0px 0px 20px 0px";
                newVid.innerHTML = `
                    <div class="download_details v${Bcd.videoButtons}">
                      <div id="loader" style="position: relative;margin: auto;left: 0;top: 100%;">
                      <ul style="width: 10%;"><li></li><li></li><li></li><li></li><li></li></ul></div>
                    </div>
                    <div style="width: 180px; height: 26px;">
                      <button class="btn-danger download_video_only v${Bcd.videoButtons}" bid="v${Bcd.videoButtons}">Video Only</button><br />
                    </div>
                    <div style="width: 180px; height: 26px;">
                      <button class="btn-danger download_video_and_poster v${Bcd.videoButtons}" bid="v${Bcd.videoButtons}">Video &amp; Poster</button>
                    </div>
                    <div class="download_progress v${Bcd.videoButtons}"></div>`;

                downloadVideos.insertBefore(newVid, downloadVideos.firstChild);
                downloadVideos.insertBefore(hr, downloadVideos.firstChild);

                qs("button.download_video_only.v"+ Bcd.videoButtons, Bcd.dialog).addEventListener('click', (e) => {
                    e.preventDefault();
                    let t = e.target;
                    let vb = t.getAttribute("bid");
                    if (!t.classList.contains("download_cancel")) {
                        let i = Bcd.saveToDisk(vid, false);
                        debug('download_video: '+i);
                        if (i[0] === null) return;
                        t.classList.add("download_cancel");
                        t.setAttribute("downloadid", i[0]);
                        t.innerText = "Cancel "+ t.innerText;
                        qs(".download_video_and_poster."+ vb, Bcd.dialog).disabled = "disabled";
                    } else {
                        let dl = Bcd.downloads[parseInt(t.getAttribute("downloadid"))];
                        dl[1].abort();
                        msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                        t.classList.remove("download_cancel");
                        t.removeAttribute("style");
                        t.removeAttribute("downloadid");
                        t.innerText = t.innerText.substr(7);
                        qs(".download_progress."+ vb, Bcd.dialog).innerHTML = "";
                        if (qs("button.download_poster_only", Bcd.dialog).className == "btn-danger download_poster_only") {
                            qs(".download_video_and_poster."+ vb, Bcd.dialog).removeAttribute("disabled");
                        }
                        if (! qs("button.download_cancel", Bcd.dialog)) {
                            Bcd.link.classList.remove("download_started");
                        }
                    }
                });
                qs("button.download_video_and_poster.v"+ Bcd.videoButtons, Bcd.dialog).addEventListener('click', (e) => {
                    e.preventDefault();
                    let t = e.target;
                    let vb = t.getAttribute("bid");
                    if (!t.classList.contains("download_cancel")) {
                        let i = Bcd.saveToDisk(vid, Bcd.src.poster);
                        debug('download_video_and_poster: '+i);
                        if (i[0] === null || i[1] === null) return;
                        t.classList.add("download_cancel");
                        t.setAttribute("downloadid", i[0]+'-'+i[1]);
                        t.innerText = "Cancel "+ t.innerText;
                        qs("button.download_poster_only", Bcd.dialog).disabled = "disabled";
                        qs("button.download_video_only."+ vb, Bcd.dialog).disabled = "disabled";
                        qs("button.download_poster_only", Bcd.dialog).setAttribute("downloadid", i[1]);
                        qs("button.download_poster_only", Bcd.dialog).classList.add("download_cancel");
                        qs("button.download_video_only."+ vb, Bcd.dialog).setAttribute("downloadid", i[0]);
                        qsa("button.download_video_and_poster:not(."+ vb +")", Bcd.dialog).forEach( (b) => {
                            b.setAttribute("disabled", "disabled");
                        })
                    } else {
                        let p, v;
                        let ids = t.getAttribute("downloadid").split('-');
                        let dl = Bcd.downloads[parseInt(ids[0])];
                        dl[1].abort();
                        msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                        dl = Bcd.downloads[parseInt(ids[1])];
                        if (qs("button.download_poster_only.download_cancel", Bcd.dialog)) {
                            dl[1].abort();
                            msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                        }
                        t.classList.remove("download_cancel");
                        t.removeAttribute("style");
                        t.removeAttribute("downloadid");
                        t.innerText = t.innerText.substr(7);
                        qs(".download_progress."+ vb, Bcd.dialog).innerHTML = "";
                        if (qsa("button.download_poster_only.download_finished,"+
                               "button.download_poster_only.download_error", Bcd.dialog).length)
                        {
                            t.disabled = "disabled";
                            if (! qs("button.download_cancel", Bcd.dialog)) {
                                Bcd.link.classList.replace("download_started", "download_finished");
                            }
                        }
                        else {
                            if (p = qs('button.download_poster_only', Bcd.dialog)) {
                                p.classList.remove("download_cancel");
                                p.removeAttribute("disabled");
                                p.removeAttribute("downloadid");
                            }
                            qsa("button.download_video_and_poster:not(."+ vb +")", Bcd.dialog).forEach( (b) => {
                                b.removeAttribute("disabled");
                            })
                            if (! qs("button.download_cancel", Bcd.dialog)) {
                                Bcd.link.classList.remove("download_started");
                            }
                        }
                        if (v = qs('button.download_video_only[downloadid="'+ids[0]+'"]', Bcd.dialog)) {
                            v.removeAttribute("disabled")
                            v.removeAttribute("downloadid");
                        }
                    }
                });
            }
        }
        else {
            Bcd.dialog = d.createElement("div");
            Bcd.dialog.setAttribute("id", "video_download_dialog");
            Bcd.dialog.innerHTML = `
                <div class="download_poster">
                  <h2 class="download_smarty">Smarty Video Download</h2>
                  <h4 class="download_title">${Bcd.flattenTitle(d.title)}</h4>
                  <img alt="- No Poster -" src="${Bcd.src.poster.url}" title="${Bcd.src.poster.width} x ${Bcd.src.poster.height}"
                       onerror="this.nextElementSibling.style.visibility='hidden'; this.onerror=''; this.title=''">
                  <button class="btn-danger download_poster_only">Poster Only</button>
                  <div class="poster_saveas hidden">Try:<br />right-click<br />Save Image As...</div>
                </div>
                <div class="download_videos">
                  <hr />
                  <div style="height: 54px; margin: 0px 0px 20px 0px;">
                    <div class="download_details v0">
                      <div id="loader" style="position: relative;margin: auto;left: 0;top: 100%;">
                      <ul style="width: 10%;"><li></li><li></li><li></li><li></li><li></li></ul></div>
                    </div>
                    <div style="width: 180px; height: 26px;">
                      <button class="btn-danger download_video_only v0" bid="v0">Video Only</button><br />
                    </div>
                    <div style="width: 180px; height: 26px;">
                      <button class="btn-danger download_video_and_poster v0" bid="v0">Video &amp; Poster</button>
                    </div>
                    <div class="download_progress v0"></div>
                  </div>
                </div>
                <div class="download_dialog_close_button" title="Close">X</div>`;
            Bcd.dialog.style.display = "none";
            qs("body").appendChild(Bcd.dialog);

            qs("button.download_poster_only", Bcd.dialog).addEventListener('click', (e) => {
                e.preventDefault();
                let t = e.target;
                if (!t.classList.contains("download_cancel")) {
                    let i = Bcd.saveToDisk(false, Bcd.src.poster);
                    debug('download_poster: '+i);
                    if (i[1] === null) return;
                    t.classList.add("download_cancel");
                    t.setAttribute("downloadid", i[1]);
                    t.innerText = "Cancel "+ t.innerText;
                    qsa("button.download_video_and_poster", Bcd.dialog).forEach( (b) => {
                        b.setAttribute("disabled", "disabled");
                    })
                } else {
                    let dl = Bcd.downloads[parseInt(t.getAttribute("downloadid"))];
                    dl[1].abort();
                    msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                    t.classList.remove("download_cancel");
                    t.removeAttribute("style");
                    t.removeAttribute("downloadid");
                    t.innerText = t.innerText.substr(7);
                    qsa("button.download_video_and_poster", Bcd.dialog).forEach( (b) => {
                        let cn = "button.download_video_only."+ b.getAttribute("bid");
                        if (! qs(cn, Bcd.dialog).classList.contains("download_cancel") &&
                            ! qs(cn, Bcd.dialog).classList.contains("download_finished"))
                        { b.removeAttribute("disabled"); }
                    })
                    if (! qs("button.download_cancel", Bcd.dialog)) {
                        Bcd.link.classList.remove("download_started");
                    }
                }
            });

            qs("button.download_video_only.v0", Bcd.dialog).addEventListener('click', (e) => {
                e.preventDefault();
                let t = e.target;
                if (!t.classList.contains("download_cancel")) {
                    let i = Bcd.saveToDisk(vid, false);
                    debug('download_video: '+i);
                    if (i[0] === null) return;
                    t.classList.add("download_cancel");
                    t.setAttribute("downloadid", i[0]);
                    t.innerText = "Cancel "+ t.innerText;
                    qs(".download_video_and_poster.v0", Bcd.dialog).disabled = "disabled";
                } else {
                    let dl = Bcd.downloads[parseInt(t.getAttribute("downloadid"))];
                    dl[1].abort();
                    msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                    t.classList.remove("download_cancel");
                    t.removeAttribute("style");
                    t.removeAttribute("downloadid");
                    t.innerText = t.innerText.substr(7);
                    qs(".download_progress.v0", Bcd.dialog).innerHTML = "";
                    if (qs("button.download_poster_only", Bcd.dialog).className == "btn-danger download_poster_only") {
                        qs(".download_video_and_poster.v0", Bcd.dialog).removeAttribute("disabled");
                    }
                    if (! qs("button.download_cancel", Bcd.dialog)) {
                        Bcd.link.classList.remove("download_started");
                    }
                }
            });
            qs("button.download_video_and_poster.v0", Bcd.dialog).addEventListener('click', (e) => {
                e.preventDefault();
                let t = e.target;
                if (!t.classList.contains("download_cancel")) {
                    let i = Bcd.saveToDisk(vid, Bcd.src.poster);
                    debug('download_video_and_poster: '+i);
                    if (i[0] === null || i[1] === null) return;
                    t.classList.add("download_cancel");
                    t.setAttribute("downloadid", i[0]+'-'+i[1]);
                    t.innerText = "Cancel "+ t.innerText;
                    qs("button.download_poster_only", Bcd.dialog).disabled = "disabled";
                    qs("button.download_video_only.v0", Bcd.dialog).disabled = "disabled";
                    qs("button.download_poster_only", Bcd.dialog).setAttribute("downloadid", i[1]);
                    qs("button.download_poster_only", Bcd.dialog).classList.add("download_cancel");
                    qs("button.download_video_only.v0", Bcd.dialog).setAttribute("downloadid", i[0]);
                    qsa("button.download_video_and_poster:not(.v0)", Bcd.dialog).forEach( (b) => {
                        b.setAttribute("disabled", "disabled");
                    })
                } else {
                    let p, v;
                    let ids = t.getAttribute("downloadid").split('-');
                    let dl = Bcd.downloads[parseInt(ids[0])];
                    dl[1].abort();
                    msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                    dl = Bcd.downloads[parseInt(ids[1])];
                    if (qs("button.download_poster_only.download_cancel", Bcd.dialog)) {
                        dl[1].abort();
                        msg(`Download Canceled: ${dl[0].name} (${dl[0].n} of ${dl[0].t})`);
                    }
                    t.classList.remove("download_cancel");
                    t.removeAttribute("style");
                    t.removeAttribute("downloadid");
                    t.innerText = t.innerText.substr(7);
                    qs(".download_progress.v0", Bcd.dialog).innerHTML = "";
                    if (qsa("button.download_poster_only.download_finished,"+
                            "button.download_poster_only.download_error", Bcd.dialog).length)
                    {
                        t.disabled = "disabled";
                        if (! qs("button.download_cancel", Bcd.dialog)) {
                            Bcd.link.classList.replace("download_started", "download_finished");
                        }
                    }
                    else {
                        if (p = qs('button.download_poster_only', Bcd.dialog)) {
                            p.classList.remove("download_cancel");
                            p.removeAttribute("disabled");
                            p.removeAttribute("downloadid");
                        }
                        qsa("button.download_video_and_poster:not(.v0)", Bcd.dialog).forEach( (b) => {
                            b.removeAttribute("disabled");
                        })
                        if (! qs("button.download_cancel", Bcd.dialog)) {
                            Bcd.link.classList.remove("download_started");
                        }
                    }
                    if (v = qs('button.download_video_only[downloadid="'+ids[0]+'"]', Bcd.dialog)) {
                        v.removeAttribute("disabled")
                        v.removeAttribute("downloadid");
                    }
                }
            });

            qs(".download_dialog_close_button", Bcd.dialog).addEventListener('click', (e) => {
                e.preventDefault();
                Bcd.toggle_download_dialog();
                return false
            });
            qs(".download_dialog_close_button", Bcd.dialog).addEventListener('mouseover', (e) => {
                Bcd.animate({
                  duration: 400,
                  timing: function(timeFraction) {
                    return Math.pow(timeFraction, 2);
                  },
                  draw: function(progress) {
                    e.target.style.borderTopRightRadius = 16 + (progress * 6) + 'px';
                    e.target.style.borderBottomLeftRadius = 16 - (progress * 16) + 'px';
                  }
                });
            });
            qs(".download_dialog_close_button", Bcd.dialog).addEventListener('mouseout', (e) => {
                Bcd.animate({
                  duration: 300,
                  timing: function back(timeFraction) {
                    return Math.pow(timeFraction, 2)
                  }.bind(2.0),
                  draw: function(progress) {
                    e.target.style.borderBottomLeftRadius = progress * 16 + 'px';
                    e.target.style.borderTopRightRadius = 22 - (progress * 6) + 'px';
                  }
                });
            });
            Bcd.link.classList.remove("disabled");
        }
        (function (vb) {
            return new Promise( (resolve) => {
                try {
                  var url = Bcd.src.videos[vb].url;
                  var valid = true;
                  var response = "";
                  var request = new XMLHttpRequest();

                  if ('withCredentials' in request) {
                    request.addEventListener('progress', function(e) {
                      if (e.total && valid) {
                          request.abort();
                          valid = false;
                          debug('Size request progress', e);
                          resolve({size: e.total, vb: vb});
                      }
                      else {
                          if (request.status !== 0) {
                              var err = `Error: ${request.status} ${request.statusText}`;
                              Bcd.src.videos[vb].error = err;
                              valid = false;
                              request.abort();
                              qs(".download_details.v"+ vb, Bcd.dialog).innerHTML = err;
                          }
                      }
                    });
                    request.addEventListener('error', function() {
                      error('Size request Error', request.status);
                      qs(".download_details.v"+ vb, Bcd.dialog).innerHTML = "";
                    });
                    request.open('GET', url, true);
                    request.responseType = "blob";
                    request.send();
                  }
                } catch (e) {
                  error('Size Promise Error', e);
                }
            })
        }) (Bcd.videoButtons).then( (blob) => {
          let dims = "",
              type = Bcd.src.videos[blob.vb].type,
              size = Bcd.prettyBytes(blob.size),
              width = Bcd.src.videos[blob.vb].width,
              height = Bcd.src.videos[blob.vb].height;

          if (type && type.indexOf('video/') !=-1) {
              type = type.slice(type.lastIndexOf('/') +1);
              type = type[0].toUpperCase() + type.slice(1);
          }

          if (width && height) {
              dims = `<br />&nbsp;&nbsp;${width} x ${height}`;
          }
          qs(".download_details.v"+ blob.vb, Bcd.dialog).innerHTML = `${type} ${size}${dims}`;
          debug('videoButtons Blob response:', blob);
        });
        Bcd.videoButtons += 1;
    },


    toggle_download_dialog: () => {
        if (Bcd.dialog.style.display == "none") {
            Bcd.dialog.style.overflow = "hidden";
            Bcd.dialog.style.top = window.scrollY + 60 +"px";
            Bcd.dialog.style.left = window.innerWidth - 500 +"px";
            Bcd.dialog.style.display ='block';
            Bcd.dialog.style.height ='auto';

            Bcd.animate({
              duration: 400,
              timing: function(timeFraction) {
                return Math.pow(timeFraction, 2);
              },
              draw: function(progress) {
                Bcd.dialog.style.width = progress * 400 + 'px';
                if (progress === 1) {
                    Bcd.dialog.style.overflow = 'visible';
                }
              }
            });
        }
        else {
            let height = Bcd.dialog.getBoundingClientRect().height;
            Bcd.dialog.style.overflow = "hidden";

            Bcd.animate({
              duration: 500,
              timing: function back(x, timeFraction) {
                return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x)
              }.bind(null, 2.8),
              draw: function(progress) {
                Bcd.dialog.style.width = 400 - (progress * 400) + 'px';
                Bcd.dialog.style.height = height - (progress * height) + 'px';
                if (progress === 1) {
                    Bcd.dialog.style.display ='none';
                    Bcd.dialog.style.overflow = 'visible';
                }
              }
            });
        }
    },


    buttonDone: (button, state = "finished", txt = "Done") => {
        button.classList.replace("download_cancel", `download_${state}`);
        button.removeAttribute("downloadid");
        button.removeAttribute("style");
        button.disabled = "disabled";
        button.innerText = txt;
    },


    saveToDisk: (asVideo = false, asPoster = false) => {

        // Reset icon color
        Bcd.link.classList.remove('download_error', 'download_finished');
        Bcd.link.classList.add('download_started');

        let el, ext, title, total, button;
        let abo = "",
            dlp = [],
            ab0 = null,
            ab1 = null,
            update = [],
            progress = [],
            mos = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            downloadURLs = ((url, name, type, n, t, dli, ab) => {

            msg('Download Started:', name, `(${n} of ${t})`);

            Bcd.downloads[dli]    = [];
            Bcd.downloads[dli][0] = {name: name, n: n, t: t};
            Bcd.downloads[dli][1] = SmartyDownload({

                id: dli,
                url: url,
                name: name,
                type: type,
                onload: () => {
                    msg(`Download Complete: ${name} (${n} of ${t})`);
                    // single video, single image
                    if (! ab) {
                        if (button = qs(`button.download_video_only[downloadid="${dli}"]`, Bcd.dialog)) {
                            Bcd.buttonDone(button);
                            if (dlp[dli]) dlp[dli].innerHTML = "";
                        } else if (button = qs(`button.download_poster_only[downloadid="${dli}"]`, Bcd.dialog)) {
                            Bcd.buttonDone(button);
                        }
                    }
                    //  ab as video or image
                    else {
                        if (button = qs(`button.download_poster_only[downloadid="${dli}"]`, Bcd.dialog)) {
                            Bcd.buttonDone(button);
                        } else if (button = qs(`button.download_video_and_poster[downloadid="${ab}"]`, Bcd.dialog)) {
                            Bcd.buttonDone(button);
                            if (dlp[dli]) dlp[dli].innerHTML = "";
                        }
                    }
                    if (qsa("button.download_cancel", Bcd.dialog).length === 0) {
                        Bcd.link.classList.replace('download_started', 'download_finished');
                    }
                },
                onprogress: (dl) => {
                    debug(`Download Progress ${dli}:`, dl);

                    if (progress[dli] && dlp[dli]) {
                        if ((update[dli]++ % 10 === 0) || dl.loaded == dl.total) {
                            let now = new Date(),
                                pct = Math.round(dl.loaded / dl.total * 100),
                                rate = dl.loaded / (now - progress[dli]) * 1000,
                                finish = Math.round((dl.total - dl.loaded)/ dl.loaded * (now - progress[dli])),
                                crt = `${Math.round(dl.loaded / dl.total * 1000) / 10}.0`;

                            crt = crt.slice(0, crt.indexOf(".") + 2);
                            //debug('Round (dl.total - dl.loaded: '+(dl.total - dl.loaded)+') / dl.loaded: '+dl.loaded+' * (now - progress: '+(now - progress[dli])+'), yeilds: '+finish)
                            finish = new Date(now - finish);
                            finish = getPublishDate([ [], [finish.getUTCHours()], [finish.getUTCMinutes()], ["UTC"], [mos[finish.getUTCMonth()]], [finish.getUTCDate()], [finish.getUTCFullYear()], [finish.getUTCSeconds()] ]);
                            el.style.background = `linear-gradient(to right, #30a247 ${pct - 10}%, #8efc8e ${pct}%, #ed7f5d 0%, #ed7f5d 100%)`;
                            dlp[dli].innerHTML = `<b>${crt}%</b> =&gt; ${Bcd.prettyBytes(dl.loaded)} of ${Bcd.prettyBytes(dl.total)} (${Bcd.prettyBytes(rate)}/s) in ${finish}`;
                        }
                    }
                    else if (dl.total !=-1 && dl.lengthComputable) {
                        el = qs(`button.download_cancel[downloadid="${ab ? ab : dli}"]`, Bcd.dialog);
                        if (el && ! el.classList.contains("download_poster_only")) {
                            progress[dli] = new Date();
                            update[dli] = 0;
                            dlp[dli] = qs(".download_progress."+ (el.getAttribute("bid")), Bcd.dialog);
                        }
                    }
                    else if (dl.total ==-1) {
                    }
                },
                onerror: (dl) => {
                    button = qs(`button.download_cancel[downloadid="${ab ? ab : dli}"]`, Bcd.dialog);
                    if (! dl.error) {
                        msg(`Download Canceled: ${name} (${n} of ${t})`);
                        if (button) {
                            button.dispatchEvent( new MouseEvent('click', {
                                bubbles: true,
                                cancelable: true
                            }));
                        }
                        if (qsa("button.download_cancel", Bcd.dialog).length === 0) {
                            Bcd.link.classList.remove('download_started');
                        }
                        if (qsa("button.download_finished", Bcd.dialog).length) {
                            Bcd.link.classList.add('download_finished');
                        }
                    }
                    else {
                        error(`SmartyDownload (${dli})`, dl.error);
                        msg(`Download Canceled: ${name} (${n} of ${t})`);
                        Bcd.link.classList.replace('download_started', 'download_error');
                        if (dl.ext && ["mp4","ogg","webm"].indexOf(dl.ext) ==-1) {
                            button = qs("button.download_poster_only", Bcd.dialog);
                            qs(".download_poster .poster_saveas", Bcd.dialog).classList.remove("hidden")
                        }
                        if (button) {
                            Bcd.buttonDone(button, "error", "Error");
                        }
                    }

                    return
                },
                ontimeout: () => {
                    error(`SmartyDownload: ${name} (${n} of ${t}) has timed out`);
                    Bcd.link.classList.replace('download_started', 'download_error');

                    return
                },
                onabort: () => {
                    debug(`SmartyDownload: ${name} (${n} of ${t}) has been aborted`)

                    return
                }
            })
        })
        title = Bcd.flattenTitle(d.title);
        total = (asVideo && asPoster) ? 2 : 1;
        if (asVideo) {
            ab0 = ++Bcd.downloadIndex;
            abo = asPoster ? `${ab0}-${ab0 + 1}` : '';
            ext = asVideo.url.slice(asVideo.url.lastIndexOf('.'));
            downloadURLs(asVideo.url, title + ext, asVideo.type, 1, total, ab0, abo);
        }
        if (asPoster) {
            ab1 = ++Bcd.downloadIndex;
            abo = asVideo ? `${ab1 - 1}-${ab1}` : '';
            ext = asPoster.url.slice(asPoster.url.lastIndexOf('.'));
            downloadURLs(asPoster.url, title + ext, asPoster.type, total, total, ab1, abo);
        }

        return [ab0, ab1]
    },


    init: (e) => {
        let ext, source, torrent;

        debug('>>>>>>>>>>>>>> Bcd init <<<<<<<<<<=', e);

        if (Bcd.playerAPI = qs("video#player")) {
            Bcd.videoSources = 0;
            Bcd.src = {videos: []};

            if (qs("title") && ! Bcd.loader) {
                addListener(qs("title"), function(e) {
                  Bcd.init("loader");
                },{ childList: true });
                Bcd.loader = true;
            }

            if (! Bcd.unloader) {
                window.addEventListener('beforeunload', (e) => {
                    try {
                        let vdl = qs("#video_download_dialog");
                        let svd = qs("style#video_download");
                        if (vdl) vdl.parentNode.removeChild(vdl);
                        if (svd) svd.parentNode.removeChild(svd);
                    } catch (e) {}
                }, false);
                Bcd.unloader = true;
            }
            Bcd.downloads = [];
            Bcd.videoButtons = 0;
            Bcd.downloadIndex = -1;
            Bcd.download_poster = false;

            if (Bcd.dialog) {
                Bcd.dialog.parentNode.removeChild(Bcd.dialog);
                Bcd.dialog = null;
            }

            if (window.webtorrent) {
                torrent = window.webtorrent.torrents[0];
                torrent.on('ready', () => {
                    source = torrent.urlList[0];
                    Bcd.addSource({src: source, type: "torrent"});
                })
            }
            if (source = qs("source:not([dl])", Bcd.playerAPI)) {
                Bcd.addSource(source);
            }

            addListener(Bcd.playerAPI, function(e) {
                Bcd.addSource(e.target);
            },{ childList: true, subtree: true });

            Bcd.playerAPI.addEventListener('loadedmetadata', function(e) {
                let width = e.target.videoWidth,
                    height = e.target.videoHeight,
                    curSrc = e.target.currentSrc;

                debug("loadedmetadata Bcd.src.videos: ", Bcd.src.videos);
                Bcd.src.videos.forEach( (v, i) => {
                    debug("url = curSrc ? "+ (v.url == curSrc) +" url: "+v.url);
                    if (v.url == curSrc) {
                        v.width = width;
                        v.height = height;
                        if (Bcd.dialog) {
                            if (qs(".download_details.v"+ i, Bcd.dialog).innerText.indexOf(" x ") ==-1 &&
                              ! qs(".download_details.v"+ i +" ul", Bcd.dialog))
                            {
                                let dims = `<br />&nbsp;&nbsp;${width} x ${height}`;
                                qs(".download_details.v"+ i, Bcd.dialog).innerHTML += dims;
                                debug("Bcd.dialog dimensions added");
                            }
                        }
                    }
                })
            });
        }
        else if (window.location.pathname.indexOf('/video') !=-1) {
            if (e == "timed") {
                let err = qs("#page-bar .page-title");
                    /* Server Error */
                if (err && err.innerText.match(/.*((server)+\serror)+$/i)) return
            }
            window.setTimeout(Bcd.init, 250, "timed")
        }
    },


    addSource: (source = null) => {
        let vid, ext, s, poster, postersize;

        if (!Bcd.download_poster) {
            if (Bcd.playerAPI.poster) {
                poster = {url: null, type: null, width: 0, height: 0};
                poster.url = new URL(Bcd.playerAPI.poster);
                poster.url = poster.url.href;
                if (postersize = poster.url.match(/_(\d+)x(\d+)\./)) {
                    poster.width = postersize[1];
                    poster.height = postersize[2];
                }
                poster.type = qs('meta[property="og:image:type"]').content || "image/jpeg";
                Bcd.src.poster = poster;
                Bcd.download_poster = true
            }
        }
        if (source && source.src) {
            ext = source.src.slice(source.src.lastIndexOf('.'));
            s = new URL(source.src);
            if (source.type == "torrent") source.type = "video/mp4 (torrent)";
            else source.setAttribute("dl", Bcd.videoSources);
            vid = {ext: ext, url: s.href, type: source.type, width: 0, height: 0, error: null};
            Bcd.src.videos.push(vid);
            debug(`Video source found: ${source.type}, ${s.href}`);
            Bcd.load("source", vid);
            Bcd.videoSources += 1
        }
    },


    animate: ({timing, draw, duration}) => {
      let start = performance.now();

      requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;
        let progress = timing(timeFraction);
        draw(progress);
        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }
      });
    },


    prettyBytes: (bytes=0) => {
        let crt,
            i = 0,
            b = parseInt(bytes),
            g = [' B',' kB',' mB',' gB',' tB'];
        if (b < 1) return '0.00 B';
        do {
            b /= 1024;
            i+=1
        } while (b >= 1024)
        crt = `${Math.round(b * 10) /10}.0`;
        crt = crt.slice(0, crt.indexOf(".") + 2);
        return crt + g[i]
    },


    icon: '<svg class="svg-inline--fa fa-w-18 action-icon fa-fw" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="0.55in" height="0.55in">'+
    '<path fill="currentColor" stroke="currentColor" stroke-width="2" d="M 0.17,37.33 C 3.00,37.11 4.50,44.67 4.83,47.39 4.83,47.39 45.33,47.39 45.33,47.39 45.33,47.39 45.58,37.19 49.61,36.83 '+
    '48.11,43.44 47.30,46.66 47.17,49.72 47.17,49.72 21.39,49.61 21.39,49.61 21.39,49.61 5.50,28.81 5.50,28.81 5.50,28.81 15.31,28.81 15.31,28.81 16.06,6.12 29.50,2.19 42.38,0.62 33.50,4.62 '+
    '23.10,9.76 24.28,28.89 24.28,28.89 34.25,28.88 34.25,28.88 34.25,28.88 18.61,49.67 18.61,49.67 18.61,49.67 3.00,49.67 3.00,49.67 3.22,49.67 1.33,42.56 0.06,37.28M 40.31,-1.94" /></svg>'
};


    const xhrRequest = function(opt) {
        var xhr = null;
        var saveAs = function(blob, name) {
            return new Promise((resolve, reject) => {
                var url;
                var success = 0;
                var w = window;
                var a = d.createElementNS("http://www.w3.org/1999/xhtml", "a");
                const removeLink = (a, url) => {setTimeout(() => {(w.URL || w.webkitURL || w).revokeObjectURL(url);}, 20000)}
                if ("download" in a) {
                    success = 1;
                    (url = (w.URL || w.webkitURL || w).createObjectURL(blob), setTimeout(function() {
                        a.href = url;
                        a.download = name;
                        a.dispatchEvent(new MouseEvent('click'));
                        removeLink(a, url);
                        debug('download saveAs 1, linkclick');
                        resolve();
                    }))
                }
                else if ("application/octet-stream" === blob.type && w.FileReader) {
                    success = 1;
                    var fr = new FileReader;
                    fr.onloadend = function() {
                        var f = fr.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                        w.open(f, "_blank") || (w.location.href = f);
                        debug('download saveAs 2, FileReader');
                        resolve();
                    };
                    fr.readAsDataURL(blob);
                }
                else {
                    success = 1;
                    url = (w.URL || w.webkitURL || w).createObjectURL(blob);
                    "application/octet-stream" === blob.type ?
                                       w.location.href = url :
                                       w.open(url, "_blank") || (w.location.href = url);
                    removeLink(a, url);
                    debug('download saveAs 3, w.open');
                    resolve();
                }
                if (!success) reject()
            })
        }

        var getFile = function () {
            xhr = new XMLHttpRequest();
            let abort = xhr.abort;
            abort = abort.bind(xhr);
            xhr.timeout = opt.timeout;
            xhr.onerror = (function() {
                if (xhr.readyState === 4 && xhr.status === 0 && xhr.response === null) {
                    let ext = opt.url.slice(opt.url.lastIndexOf('.') + 1);
                    opt.onerror({error: "Possible Cross-Origin Request Block", ext: `${ext}`})
                } else opt.onerror
            });
            xhr.onabort = opt.onabort;
            xhr.ontimeout = opt.ontimeout;
            xhr.onprogress = opt.onprogress;
            xhr.onload = (e) => {
                e = e.target;
                if (e.status == 200 || e.status == 304 && e.readyState == 4) {
                    let type = e.response.type || opt.type || 'application/octet-stream';
                    let blob = new Blob([e.response], { type: type });
                    saveAs(blob, (opt.name || "download")).then( (val) => {
                        debug('saveAs Success');
                        opt.onload();
                    }).catch( (val) => {
                        opt.onerror({error: `saveAs( "${opt.name}" ) Failed`});
                    });
                }
                else opt.onerror({error: `${e.status}: ${e.statusText}`});
            }

            xhr.open('GET', opt.url, true);
            xhr.responseType = 'blob';
            xhr.send();
            return {abort: abort}
        }
        return getFile()
    }


    const SmartyDownload = function(params) {return xhrRequest(params);}


    const getPublishDate = (u = []) => {
        let now, days, scs, mis, hrs, dys, wks, yrs, utc, sec;
        let out = "",
            mos = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        if (u.length) {
            utc = u[3];
            now = new Date();
            sec = typeof u[7] !== 'undefined';
            dys = now.getUTCDate() - parseInt(u[5]);
            hrs = now.getUTCHours() - parseInt(u[1]);
            mis = now.getUTCMinutes() - parseInt(u[2]);
            yrs = now.getUTCFullYear() - parseInt(u[6]);
            mos = now.getUTCMonth() - mos.indexOf(String(u[4]));
            scs = sec ? now.getUTCSeconds() - parseInt(u[7]) : now.getUTCSeconds();
            days = new Date(now.getUTCFullYear(), now.getUTCMonth(), 0).getDate();

            if (mis < 0) {hrs -= 1; mis += 60;}
            if (hrs < 0) {dys -= 1; hrs += 24;}
            if (dys < 0) {mos -= 1; dys += days;}
            if (mos < 0) {yrs -= 1; mos += 12;}
            if (yrs < 0) {yrs = 0;}

            if (yrs) {
                out = `${yrs === 1 ? "a" : yrs} year${yrs > 1 ? 's' : ''}`;
                if (mos > 0) out += `, ${mos} month${mos > 1 ? 's' : ''}`;
            }
            else if (mos > 0) {
                out = `${mos} month${mos > 1 ? 's' : ''}`;
                if (dys > 6) {
                    wks = parseInt(dys / 7);
                    out += `, ${wks === 1 ? "a" : wks} week${wks > 1 ? 's' : ''}`;
                }
                else if (dys > 0) out += `, ${dys === 1 ? "a" : dys} day${dys > 1 ? 's' : ''}`;
            }
            else if (dys > 0) {
                if (dys > 6) {
                    wks = parseInt(dys / 7);
                    out = `${wks === 1 ? "a" : wks} week${wks > 1 ? 's' : ''}`;
                    if (dys % 7 > 0) out += `, ${dys % 7} day${dys % 7 > 1 ? 's' : ''}`;
                }
                else if (dys > 0) {
                    out = `${dys === 1 ? "a" : dys} day${dys > 1 ? 's' : ''}`;
                    if (hrs > 0) out += `, ${hrs} hour${hrs > 1 ? 's' : ''}`;
                }
            }
            else if (hrs > 0) {
                out = `${hrs === 1 ? "an" : hrs} hour${hrs > 1 ? 's' : ''}`;
                if (mis > 0) out += `, ${mis} minute${mis > 1 ? 's' : ''}`;
            }
            else if (mis > 0 || (! sec && scs > 30)) {
                if (scs > 30) mis += 1;
                if (mis < 60) out = `${mis === 1 ? "a" : mis} minute${mis > 1 ? 's' : ''}`;
                else out = "an hour";
            }
            else if (scs > 0) out = `${scs} second${scs > 1 ? 's' : ''}`;
            else out = "a moment";

            return out
        }
    }

    const qs = (selector, el=document) => el.querySelector(selector);

    const qsa = (selector, el=document) => el.querySelectorAll(selector);

    const addListener = (target, fn, config) => {
        var cfg = Object.assign({}, {attributes:!1, childList:!1,
                          characterData:!1, subtree:!1}, config);
        var observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => { fn(mutation) })});
        observer.observe(target, cfg);
        return observer
    }

    const msg = function() {console.log(`\u2139\ufe0f %c[${name}] ${Array.prototype.slice.call(arguments).join(" ")}`, "font-weight: 600; color: #0B149E; text-shadow: 1px 1px #DDD;");}

    const error = function() {console.error(`[${name}] ${Array.prototype.slice.call(arguments).join(" ")}`);}

    const debug = function() {
        if (BC_Debug) {
            let n, m = "";
            for (n in arguments) {
                if (typeof arguments[n] === "object" || typeof arguments[n] === "array") {
                    m += "%o";
                    console.log(`\ud83d\udd28 %c[${name}] ${m}`, "font-weight: 400; color: #853f02; text-shadow: 1px 1px #DDD;", arguments[n]);
                    return;
                } else m += arguments[n] + " ";
            }
            console.log(`\ud83d\udd28 %c[${name}] ${m}`, "font-weight: 400; color: #BC5802; text-shadow: 1px 1px #DDD;");
        }
    }

      /* Not in Frames or Cloudflare error pages */
    if (window.self == window.top && !qs("#cf-error-details")) {
        BC.init().then( results => {
            if(results) BC.chuteMePlease();
            else console.error('S_marty: Error initialising SmartChute');
        });
        Bcd.init("orig")
    }

}) ();
