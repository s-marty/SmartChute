// ==UserScript==
// @name            SmartChute
// @version         19.11.30
// @description     BitChute.com Enhancer. Adds missing features. Makes you feel warm.
// @license         MIT
// @author          S-Marty
// @compatible      firefox
// @compatible      chrome
// @compatible      opera
// @namespace       https://github.com/s-marty/SmartChute
// @homepageURL     https://github.com/s-marty/SmartChute
// @supportURL      https://github.com/s-marty/SmartChute/wiki
// @icon            https://raw.githubusercontent.com/s-marty/SmartChute/master/images/smartChute.png
// @downloadURL     https://github.com/s-marty/SmartChute/raw/master/src/smartChute.user.js
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QHFFSLZ7ENUQN&source=url
// @include         /^https?://(www|search)\.bitchute\.com/.*$/
// @run-at          document-end
// @grant           GM.getValue
// @grant           GM.setValue
// @noframes
// ==/UserScript==

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
var use_Square_Icons = true;
var hide_Donation_Bar = true;
var hide_Cookie_Notice = true;
var hide_Signup_Notice = true;
var homepage_go_to_all = true;
/* End Editable options */

(function() {
    "use strict";

    var BC = {};
    var d = document;
    var miniPlayerX = 0;
    var miniPlayerY = 0;
    var miniPlayerW = 0;
    var miniPlayerH = 0;
    var previousOpacity = 0;
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
        BC.playlist     = BC.url.indexOf('list=') !=-1;
        BC.searchpage   = BC.url.indexOf('/search') !=-1;
        BC.watchpage    = BC.path.indexOf('/video') !=-1;
        BC.profilepage  = BC.path.indexOf('/profile/') !=-1;
        BC.channelpage  = BC.path.indexOf('/channel/') !=-1;
        BC.categorypage = BC.path.indexOf('/category/') !=-1;
        BC.playlistpage = BC.path.indexOf('/playlist/') !=-1;
        BC.homepage     = BC.url == location.protocol +"//"+ BC.host +"/";

        if (!BC.loaded) {
            if (!BC.loader) {
                if (BC.loader = qs("#loader-container")) {
                    addListener(BC.loader, function(e) {
                        if (e.target.style.opacity == 0.5 && previousOpacity != 0.5 && e.target.style.display == 'block') chuteMePlease(e)
                        previousOpacity = e.target.style.opacity
                    },{ attributes : true, attributeFilter : ['style'] });
                }
            }
            if (! (BC.homepage || BC.watchpage || BC.channelpage || BC.categorypage || BC.profilepage || BC.searchpage || BC.playlistpage)) return;
            if (!BC.themes) {
                setTimeout(addThemeListeners, 2000);
                if (isChrome && BC.settings.hidemenubar) {
                    window.addEventListener('beforeunload', function(e){
                      if (!document.activeElement.href){window.scrollTo(0, 0)}
                    }, false);
                }
                setTheme();
                setPreferencesCookie("autoplay", BC.settings.playnext);
                BC.themes = true;
            }
            if (BC.searchpage || BC.profilepage || BC.playlistpage) return;
            let style = d.createElement("style");
            style.type = "text/css";
            style.innerText = '\
                    .nav-tabs-list {min-width: 500px !important; width: 100%;} .sidebar-recent .video-card.active {border: 1px solid #f37835; border-radius:5px;}svg.smarty-donate:hover {-webkit-transform:rotate(14deg);transform:rotate(14deg);color:#30a247;}\
                    .playlist-card.active {border: 1px solid #f37835; border-radius:5px;}\
                    #loader-container {opacity: 0.5;} span.add-to-blacklist { position: absolute; top: 4px; left: 4px; z-index: 50; width:30px; height:30px; } a.side-toggle {cursor: pointer; } svg.smarty-donate {float:right;cursor: pointer; color:#209227;}\
                    svg.smarty-donate {-webkit-transition: transform 0.25s ease-in, color 0.25s; -moz-transition: transform 0.25s ease-in, color 0.25s; -o-transition: transform 0.25s ease-in, color 0.25s; transition: transform 0.25s ease-in, color 0.25s;}\
                    span.blacklist-tooltip { position: absolute; font-size: 14px;padding: 0 4px; height: 22px; left: 2px; top: 38px; line-height: 1.6; background-color: #000 ;display:none;} #smarty_tab label:hover, #smarty_tab #blacklistedchannels span:hover {color:#ef4136;}\
                    span.add-to-blacklist svg {cursor: pointer;} html.noblacklist span.add-to-blacklist {display:none;} #channel-list div.item div.channel-card:hover .add-to-blacklist {opacity: 1;}\
                    span.add-to-blacklist:hover span.blacklist-tooltip { color:#fff; display:inline; } #carousel {'+(BC.settings.hidecarousel ? "display:none" : "width: 100%; min-height: 210px" )+';}\
                    #carousel .hidden-md > div .channel-card:hover .action-button {opacity:1;} .channel-banner .name a.userisblacklisted {text-decoration: line-through red;}\
                    .channel-banner .name .add-to-blacklist {position: relative;left: 10px;} .channel-banner .name:hover .add-to-blacklist {opacity: 1;}';
            if (BC.settings.hidemenubar) {
                style.innerText += '\
                    #nav-top-menu {position: static; width: 100%; height: 60px;} #nav-menu-buffer {height: 0px; padding-top: 0px !important;}\
                    html.topNavfloat #nav-top-menu, html.tabNavfloat .tab-scroll-outer {-webkit-transition: top 0.5s ease-in-out; -moz-transition: top 0.5s ease-in-out; -o-transition: top 0.5s ease-in-out; transition: top 0.5s ease-in-out;}\
                    html.topNavfloat #nav-top-menu {position: fixed;} html.tabNavfloat .tab-scroll-outer {position: fixed; width: 100%; z-index:989; background: #fff;}\
                    html.tabNavfloat.night .tab-scroll-outer {background: #211f22;}\
                    html.topNavfloat #nav-menu {padding-top: 60px;} html.tabNavfloat #page-detail .tab-content {margin-top: 50px;} html.tabNavfloat #page-detail #listing-trending {margin-top: -50px;} html.tabNavfloat #nav-side-menu {z-index:999;}';
            }
            if (BC.settings.playlists || BC.settings.mvplaylist) {
                style.innerText += '\
                    .mvplaylist.row, .playlist.row {width: 723px;margin-top:20px;margin-bottom:20px;} .plslider, .mvslider {width:100%;max-width: 878px; padding-left:35px;margin: auto 0px; overflow:hidden;display: inline;}\
                    .mvplaylist .playlist-title, .playlist .playlist-title {display:inline-block; width: auto !important; margin: 20px 37px 10px;} #comment-frm-container {margin-top: 20px !important;}\
                    .plslider, .mvslider {-webkit-transition: margin-left 0.25s ease-in-out; -moz-transition: margin-left 0.25s ease-in-out; -o-transition: margin-left 0.25s ease-in-out; transition: margin-left 0.25s ease-in-out;}\
                    .playlistup {margin-left:693px;} .playlistbtn {cursor:pointer;width: 30px;height:195px;padding-top:85px;background-color: #ddd;text-align:center;position: absolute; z-index: 80;}\
                    .playlistbtn b {cursor:pointer;} .playlistbtn.disabled {cursor:default;} .playlistbtn.disabled b {color: #ddd;cursor:default;}\
                    .playlist-title span {margin-left:16px;} .playlist-title span:hover {color:#ffaa00;} .video-card-published.sequence {position: absolute;bottom: 0px;right: 3px; z-index:50;}\
                    .mvplaylist .playlist-card, .playlist .playlist-card {width: 208px;height:195px;margin: 0 5px;} .playlist-card .video-card-title {height: 52px;} .night .playlistbtn {background-color: #2c2a2d;}\
                    .night .playlistbtn.disabled b {color: #2c2a2d;} @media (min-width: 768px) {.plslider, .mvslider {max-width: 660px;} .playlistup {margin-left:475px;}.mvplaylist.row, .playlist.row {width: 505px;}}\
                    @media (min-width: 992px) {.plslider, .mvslider {max-width: 878px;} .playlistup {margin-left:693px;}.mvplaylist.row, .playlist.row {width: 723px;}}';
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
            d.documentElement.appendChild(style);
            if (BC.settings.hidemenubar) window.addEventListener('scroll', floatHeaders);
            addBrowserSearch();
            BC.loaded = 1;
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
                            let style = d.createElement("style");
                            style.type = "text/css";
                            style.innerText = '\
                                html:not(.isfullscreen).s-marty-miniplayer video#player, html:not(.isfullscreen).s-marty-miniplayer .plyr__video-wrapper {opacity: 0.97;}\
                                html:not(.isfullscreen).s-marty-miniplayer .video-container .wrapper {position: fixed;z-index: 100;background-color:transparent;\
                                border:1px solid rgba(255,255,255,.3);box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.4)}\
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar {display : block;cursor: move; height: 40px; left: -3px; right: 5px; top: -6px; position: absolute;z-index: 110;background-color:transparent;}\
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-bar:hover {background-color:#000; opacity: 0.4; background-clip: padding-box; padding: 6px 0 0 6px;}\
                                html:not(.isfullscreen).s-marty-miniplayer #s-marty-miniplayer-size {display : block;cursor: nesw-resize; width:7px; height: 7px; right: -3px; top: -3px; position: absolute;z-index: 120;background-color:transparent;}\
                                html:not(.isfullscreen).s-marty-miniplayer .plyr__controls button[data-plyr="captions"], html:not(.isfullscreen).s-marty-miniplayer .plyr__controls button[data-plyr="pip"], html:not(.isfullscreen).s-marty-miniplayer .plyr__controls .plyr__menu {display : none !important;}\
                                html:not(.s-marty-miniplayer) #s-marty-miniplayer-bar, html:not(.s-marty-miniplayer) #s-marty-miniplayer-size {display : none;} html:not(.isfullscreen).s-marty-miniplayer .plyr__volume {/*max-width:12% !important; */width: 12% !important;}\
                                html.isfullscreen video#player {width: 100% !important; height: !important;}';
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
                            if (BC.player.api.readyState < 3) {
                                BC.player.api.addEventListener('canplay', function(e) {BC.player.api.play();}, false);
                                //User must click the first video now
                            }
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
            }
            let sidebarnext = qs(".sidebar-next");
            let playnext = qs("label.sidebar-autoplay:not(.active)");
            if (sidebarnext && playnext) {
                playnext.addEventListener('mousedown', function(e) {
                    if (e.which===1) {
                       let checked = qs("input#autoplay-toggle").checked;
                       savePlayerValue('playnext', !checked)
                    }
                }, false);
                playnext.classList.add('active')
            }
            if (BC.settings.hidecomments) setTimeout(hideComments, 2000);
            if (BC.playlist) {
                let playlistId = BC.url.match( /[&?]+list=([^&]*[a-z0-9_-]+)/i )[1];
                addMoreRecentVideos(8, playlistId);
            }
            else {
                addMoreRecentVideos(8);
                if (BC.settings.mvplaylist) addMostViewedPlaylist();
                if (BC.settings.playlists) addChannelPlaylists();
            }
            if (BC.settings.useblacklist) applyChannelBlacklist();
            setChannelFeed('add');
        }
        else if (BC.channelpage) {
            BC.page = 'channelpage';
            if (d.cookie.indexOf('sensitivity=') !=-1 && window.location.search.indexOf('showall=1') ==-1) {
                d.cookie = "sensitivity=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            }
            let sensitivityWarning;
            if (sensitivityWarning = qs('.sensitivity-warning a')) sensitivityWarning.addEventListener('click', addSensitivityCookie, false);
            if (BC.settings.useblacklist) applyChannelBlacklist();
            setChannelFeed('add');
        }
        else if (BC.homepage || BC.categorypage) {
            BC.page = 'homepage';
            let listingTabs = qs('#listing-tabs.listening');
            let listingsAll = qs('#listing-all > div.row');
            let listingsPopular = qs('#listing-popular > div.row');

            if (!listingTabs) {
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
                },{ childList: true });

                addListener(listingsPopular, function(e) {
                    if (BC.settings.useblacklist) {
                        let newlistings = qs('#listing-popular > div.row');
                        let newlistingsHeight = Math.round(newlistings.getBoundingClientRect().height);
                        if (listingsPopHeight != newlistingsHeight) {
                            listingsPopHeight = newlistingsHeight;
                            applyBlacklist('#listing-popular > div.row > div');
                        }
                    }
                },{ childList: true });

                qs('#listing-tabs').classList.add('listening');
            }
            if (BC.settings.useblacklist) {
                listingsAllHeight = Math.round(listingsAll.getBoundingClientRect().height);
                listingsPopHeight = Math.round(listingsPopular.getBoundingClientRect().height);

                if (!BC.settings.hidecarousel)
                    applyBlacklist('#carousel #channel-list div.item > div,#carousel .hidden-md > div');
            }
            if (BC.settings.hidecarousel) { // The only way to pause this thing
                if (qs('#carousel')) qs('#carousel').innerHTML = '';
            }

            if (homepage_go_to_all) {
                let preferAll = qs("ul.nav-tabs-list li a[href='#listing-all']");
                if (preferAll !== null && preferAll.parentNode.className.indexOf('active') ==-1) {
                    var click = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true
                    });
                    preferAll.dispatchEvent(click);
                }
            }
            else applyBlacklist('#listing-popular > div.row > div');
            setChannelFeed('remove');
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
                    let card = listings[i].querySelector('.video-card-channel a, .video-trending-channel a, .channel-card a');
                    if (card) {
                        let href = card.getAttribute("href");
                        let channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
                        if (channel) {
                            if (BC.blacklist.find( id => id[0] == channel[1] )) {
                                listings[i].outerHTML = ''
                            }
                            else {
                                listings[i].setAttribute('polled', channel[1]);
                                let button = blacklistButton();
                                let videoCard = listings[i].querySelector('.video-card, .video-trending-image, .channel-card');
                                let name = listings[i].querySelector('.channel-card-title');
                                name = name ? name.innerText : card.innerText;
                                videoCard.appendChild(button);
                                button.addEventListener('click', function(e){ blacklistAdd(e, channel[1], name) }, true);
                            }
                        }
                    }
                }
            } catch (e) {console.error('applyBlacklist: '+ e)}
        }
    }

    function applyChannelBlacklist() {
        let card = qs('.channel-banner .name a');
        let name = card.innerText;
        if (card) {
            try {
                let href = card.getAttribute("href");
                let channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
                if (channel) {
                    if (BC.blacklist.find( id => id[0] == channel[1] )) {
                        card.setAttribute('title', name +' is blacklisted ☺');
                        card.classList.add('userisblacklisted')
                    }
                    else if (! card.parentNode.querySelector('.add-to-blacklist')) {
                        let button = blacklistButton();
                        card.parentNode.appendChild(button);
                        button.addEventListener('click', function(e){
                            blacklistAdd(e, channel[1], name);
                            this.previousSibling.classList.add('userisblacklisted');
                            this.previousSibling.setAttribute('title', name +' is blacklisted ☺');
                            this.style.display = 'none';
                        }, true);
                    }
                }
            } catch (e) {console.error('applyChannelBlacklist: '+ e)}
        }
    }

    function createSmartyButton() {
        let i;
        let blacklisted;
        let blContent = '';
        let donate = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg class="smarty-donate" version="1.0" xmlns="http://www.w3.org/2000/svg" width="14pt" height="14pt" viewBox="0 0 496 512" preserveAspectRatio="xMidYMid meet"><g transform="translate(248 256)"><g transform="translate(0, 0)  scale(1, 1)  rotate(-14 7 7)">'+
            '<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm24 376v16c0 8.8-7.2 16-16 16h-16c-8.8 0-16-7.2-16-16v-16.2c-16.5-.6-32.6-5.8-46.4-15.1-8.7-5.9-10-18.1-2.3-25.2l12-11.3c5.4-5.1 13.3-5.4 19.7-1.6 6.1 3.6 12.9 5.4 19.9 5.4h45c11.3 0 20.5-10.5 20.5-23.4 0-10.6-6.3-19.9-15.2-22.7L205 268c-29-8.8-49.2-37-49.2-68.6 0-39.3 30.6-71.3 68.2-71.4v-16c0-8.8 '+
            '7.2-16 16-16h16c8.8 0 16 7.2 16 16v16.2c16.5.6 32.6 5.8 46.4 15.1 8.7 5.9 10 18.1 2.3 25.2l-12 11.3c-5.4 5.1-13.3 5.4-19.7 1.6-6.1-3.6-12.9-5.4-19.9-5.4h-45c-11.3 0-20.5 10.5-20.5 23.4 0 10.6 6.3 19.9 15.2 22.7l72 21.9c29 8.8 49.2 37 49.2 68.6.2 39.3-30.4 71.2-68 71.4z" transform="translate(-248 -256)"></path></g></g><title>Donate to Smarty</title></svg>';
        let tabContent = '<a href="javascript:void(0)">Smarty</a><div id="smarty_tab" class="modal-content" style="display: none; position: absolute; z-index: 200;">'+
              '<div style="width: 170px; padding: 8px; border: 1px solid #333; border-radius:3px;">'+
                '<input name="useblacklist" id="useblacklist2" type="checkbox"'+(BC.settings.useblacklist ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="useblacklist2">&nbsp;Use Blacklist</label>'+donate+'<br>'+
                '<input name="hidemenubar" id="hidemenubar2" type="checkbox"'+(BC.settings.hidemenubar ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidemenubar2">&nbsp;Scroll Menubar</label><br>'+
                '<input name="hidecarousel" id="hidecarousel2" type="checkbox"'+(BC.settings.hidecarousel ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidecarousel2">&nbsp;Hide Carousel</label><br>'+
                '<input name="hidecomments" id="hidecomments2" type="checkbox"'+(BC.settings.hidecomments ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hidecomments2">&nbsp;Hide Comments</label><br>'+
                '<input name="mvplaylist" id="mvplaylist2" type="checkbox"'+(BC.settings.mvplaylist ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="mvplaylist2">&nbsp;Popular Playlist</label><br>'+
                '<input name="playlists" id="playlists2" type="checkbox"'+(BC.settings.playlists ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="playlists2">&nbsp;All Playlists</label><br>'+
                '<input name="autoplay" id="autoplay2" type="checkbox"'+(BC.player.autoplay ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="autoplay2">&nbsp;Auto Play Video</label><br>'+
                '<input name="hideadverts" id="hideadverts2" type="checkbox"'+(BC.settings.hideadverts ? ' checked':'')+'> <label style="margin-bottom: 0px;" for="hideadverts2">&nbsp;Hide Unsafe Ads</label><br>'+
                '<input name="color" title="Night Color: None" value="none" type="radio"'+(BC.settings.color == 'none' ? ' checked':'')+'>&nbsp;&nbsp;<span style="height:12px;width:12px;background-color:#211f22;color:#f0af5a">&nbsp;&nbsp;<b>O</b>&nbsp;'+
                '<input name="color" title="Night Color: Orange" value="orange" type="radio"'+(BC.settings.color == 'orange' ? ' checked':'')+'></span><span style="height:12px;width:12px;background-color:#211f22;color:#559bcc">&nbsp;&nbsp;<b>B</b>&nbsp;'+
                '<input name="color" title="Night Color: Blue" value="blue" type="radio"'+(BC.settings.color == 'blue' ? ' checked':'')+'></span><span style="height:12px;width:12px;background-color:#211f22;color:#55a47c">&nbsp;&nbsp;<b>G</b>&nbsp;'+
                '<input name="color" title="Night Color: Green" value="green" type="radio"'+(BC.settings.color == 'green' ? ' checked':'')+'>&nbsp;</span><br>'+
              '</div><div id="blacklistedchannels" style="padding: 8px; border: 1px solid #333; border-radius:3px; border-top:none;"><div><em>No Blacklist</em></div></div></div>';
        let menu = qs('ul.nav-tabs-list');
        let smarty = qs('#smarty_tab');

        if (smarty === null) {
            smarty = d.createElement("li");
            smarty.innerHTML = tabContent;
            menu.appendChild(smarty);
            blacklisted = qs('#blacklistedchannels');

            if (BC.settings.useblacklist) {
                if (BC.blacklist.length ) {
                    for (i = 0; i < BC.blacklist.length; i++) {
                        blContent += '<span style="cursor:pointer" title="Click to remove '+
                          BC.blacklist[i][1] +'" data-name="'+BC.blacklist[i][0]+'">'+ (blacklistName(BC.blacklist[i][1])) +'</span><br>';
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
            smarty.querySelector('#mvplaylist2').addEventListener('change', function(e) {savePlayerValue('mvplaylist',e.target.checked)}, false);
            smarty.querySelector('#playlists2').addEventListener('change', function(e) {savePlayerValue('playlists',e.target.checked)}, false);
            smarty.querySelector('#autoplay2').addEventListener('change', function(e) {savePlayerValue('autoplay',e.target.checked)}, false);
            smarty.querySelector('svg').addEventListener('click', function(e) {window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QHFFSLZ7ENUQN&source=url', '_blank');}, false);
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
                          BC.blacklist[i][1] +'" data-name="'+BC.blacklist[i][0]+'">'+ (blacklistName(BC.blacklist[i][1])) +'</span><br>';
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
            '23 56 -7 0 -26 -16 -41 -35 -15 -19 -33 -35 -40 -35 -7 0 -25 16 -41 35 -30 35 -56 46 -56 22z"/></g></svg><span class="blacklist-tooltip">&nbsp;Blacklist&nbsp;</span>';
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

    function blacklistAdd(e, channel, name) {
        let i;
        let blocked = qsa('[polled="'+channel+'"]');

        for (i = 0; i < blocked.length; i++) blocked[i].innerHTML = wait(blocked[i]);
        BC.blacklist.push([channel, name]);
        BC.blacklist.sort();
        GM.setValue('blacklist', JSON.stringify(BC.blacklist));
        createSmartyButton();

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function blacklistRemove(e) {
        toggleTab();
        let arr = BC.blacklist.filter(function(ele){
            return ele[0] != e.target.getAttribute('data-name');
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
                if (topfloat || scrolled < 1) {
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
                            applyBlacklist('#carousel #channel-list div.item > div,#carousel .hidden-md > div');
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
                else carousel.innerHTML = '<h3>Refresh window to start carousel</h3>';
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
            window.location.replace(window.location.href);
        }
    }

    function savePlayerValue(arg, val) {
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
          hideadverts  : BC.settings.hideadverts
        }));
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

    function addBrowserSearch() {
      	let head = qs('head');
      	let openSearch = d.createElement('link');

      	openSearch.setAttribute('rel', 'search');
      	openSearch.setAttribute('href', location.protocol +'//github.com/s-marty/SmartChute/raw/master/inc/search.xml');
      	openSearch.setAttribute('type', 'application/opensearchdescription+xml');
      	openSearch.setAttribute('title', 'Bit Chute');
      	head.appendChild(openSearch);
    }

    function setChannelFeed(action) {
        let head = qs('head');
        let card = qs('.channel-banner .name a');
        let feed = qs('#rss_feed');

        if (action == 'remove' && feed) {
            head.removeChild(feed)
        }
        else if (action == 'add' && card) {
            let title = card.innerText;
            let href = card.getAttribute("href");
            let channel = href.match( /\/channel\/([a-z0-9_-]+)\//i );
            if (channel) {
      	        if (feed && feed.title != title) head.removeChild(feed);
      	        else if (!feed) {
          	        let rssLink = d.createElement('link');
                    rssLink.setAttribute('rel', 'alternate');
                    rssLink.setAttribute('href', location.protocol +'//www.bitchute.com/feeds/rss/channel/' + channel[1] + '/');
                    rssLink.setAttribute('type', 'application/rss+xml');
                    rssLink.setAttribute('title', title);
                    rssLink.setAttribute('id', 'rss_feed');
                    head.appendChild(rssLink);
                }
            }
        }
    }

    function setPreferencesCookie(name, value) {
        let val, preferences = d.cookie.match(/preferences=(\{[a-z0-9_%:-]+[^;]*\})/i);
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

    function addSensitivityCookie(e) {
        d.cookie = "sensitivity=true; path=/";
        return false
    }

    function getCsrftoken() {
        let csrftoken = d.cookie.match(/csrftoken=([a-z0-9_-]+[^;]*)/i);
        return csrftoken ? csrftoken[1] : null
    }

    var isDark = false;
    var isTheme = false;
    var persistTryDT = 0;
    function setTheme() {
        if (!isDark && BC.settings.usedark) {
            let theme = qs('link#css-theme');
            if (theme !== null) {
                if (theme.href.indexOf('night.css') ==-1) {
                    let version = theme.href.match( /\/static\/([a-z]+[0-9]+)\//i );
                    if (version !== null && version[1] !== null) {
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
            let colours = {
                'orange':{dark:'#ef4136',lighter:'#f37835',lightest:'#f0af5a'},
                 'green':{dark:'#46a604',lighter:'#35c453',lightest:'#55a47c'},
                  'blue':{dark:'#2532e0',lighter:'#2567e0',lightest:'#559bcc'}
            };
            let style = d.createElement("style");
            style.type = "text/css";
            style.innerText = '\
                .night .sidebar-heading, .night .subscribe-button, .night .btn-danger, .night #loader ul li {background-color: '+colours[BC.settings.color].dark+';}\
                .night .playlist-card.active, .night .sidebar-recent .video-card.active {border: 1px solid '+colours[BC.settings.color].lighter+';} .night .nav-tabs>li.active {border-bottom-color:'+colours[BC.settings.color].dark+';}\
                .night body, .night .video-card .video-card-text, .night .video-card .video-card-text p i, .night .notify-button, \
                .night .channel-notify-button, .night .channel-videos-details, .night .channel-videos-title a, .night .channel-videos-text, \
                .night .video-trending-details, .night .video-trending-title a, .night .video-trending-channel a, .night .video-trending-text, \
                .night .playlist-video .details, .night .playlist-video .title a, .night .playlist-video .channel a, .night .playlist-video .description, \
                .night #smarty_tab label, .night #smarty_tab #blacklistedchannels span, \
                .night .video-detail-text p, .night .video-information .sharing-drop span, .night #nav-top-menu .search-box .form-control { color: '+colours[BC.settings.color].lightest+';}\
                .night a:link, .night a:active, .night a:visited, .night a:focus, .night .scripted-link, .night #nav-top-menu .unauth-link a, .night #nav-side-menu .side-toggle,\
                .night .video-card .video-card-text a, .night #nav-top-menu .user-link a, .night #day-theme a svg, .night .search-icon svg { color: '+colours[BC.settings.color].lighter+';}\
                .night #nav-side-menu .side-toggle:hover, .night #day-theme a svg:hover, .night .search-icon svg:hover, .night #smarty_tab label:hover, .night #smarty_tab #blacklistedchannels span:hover, \
                .night a:hover, .night .scripted-link:hover {color: '+colours[BC.settings.color].dark+' !important;}\
                .night .tags ul li a, .night #show-comments {background-color: #3b383c; border-radius:5px;} .night .tags ul li a:hover {background-color: #4d484e;} .creator-monetization {color: #30a247;}\
                .night .channel-banner .name a.userisblacklisted {text-decoration-color: yellow;}';
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
    var commentsFrame = null;
    var commentsUrl = '';
    function hideComments(e) {
        let comments = qs('#disqus_thread');
        let nocomments = qs('.video-no-discussion');
        let container = qs('#comment-frm-container');
        showComments = qs('#comment-frm-container > #show-comments');

        if (nocomments || showComments) return;
        if (container && comments) {
            comments.style.display = 'none';
            if (commentsFrame = comments.querySelector('iframe')) {
                commentsUrl = commentsFrame.getAttribute('src')
            }
            if (commentsFrame && commentsUrl) {
                commentsFrame.setAttribute('src', 'about:blank');
            }
            else {
                if (persistTryHC++ < 60 && !showComments)
                    setTimeout(hideComments, 1000);
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
                    commentsFrame.setAttribute('src', commentsUrl);
                    this.style.display = 'none';
            }, false);
        } else if (persistTryHC++ < 30 && !showComments) setTimeout(hideComments, 2000);
    }

    var fetchingMoreRecentVideos = 0;
    function addMoreRecentVideos(offset, playlistId) {
        if (fetchingMoreRecentVideos == offset) return;
        fetchingMoreRecentVideos = offset;
        let playlist = typeof playlistId != 'undefined' ? playlistId : false;
        let data, name = null;
        let link = qs('.details .name a');
        if (link) name = link.href.match( /\/channel\/([a-z0-9_-]+)\//i );
        if (playlist) {
            link = location.protocol +"//"+ BC.host +"/playlist/"+ playlist +"/";
        }
        let sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);
        if (qs('.show-more')) qs('.show-more').classList.add("hidden");
        if (name) {
            let csrf = getCsrftoken();
            let xhr = new XMLHttpRequest();
            let showall = '';
            if (playlist) {
                data = 'csrfmiddlewaretoken='+csrf+'&offset='+offset;
                xhr.addEventListener("load", function (e) { pare(e) });
                xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest playlist videos error: '+ e) });
            }
            else {
                if (sensitivity)
                    if (sensitivity[1] == 'true') showall = '?showall=1';
                data = 'csrfmiddlewaretoken='+csrf+'&name='+name[1]+'&offset='+offset;
                xhr.addEventListener("load", function (e) { pear(e) });
                xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest recent videos error: '+ e) });
            }
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
            fetchingMoreRecentVideos = 0;
        } catch (e) { console.error('XMLHttpRequest recent videos parsing error: '+ e) }
    }

    function pare(e) {
        try {
            let i, a1, a, title, pchan, pdate, card, active;
            let result = JSON.parse(e.target.responseText);
            if ('undefined' != result.success && result.success) {
                let hidden = d.createElement("div");
                hidden.style.display = "none";
                let sidebar = qs('.sidebar-recent');
                if (sidebar) {
                    hidden.innerHTML = result.html;
                    let offset = sidebar.querySelectorAll('.video-card').length;
                    let cards = hidden.querySelectorAll('.playlist-video');
                    let addedoffset = cards.length;
                    let showmore = d.createElement("div");
                    showmore.className="show-more-container";
                    showmore.innerHTML = '<div class="show-more"><span>SHOW MORE</span></div>';
                    let playlistId = BC.url.match( /[&?]+list=([^&]*[a-z0-9_-]+)/i )[1];
                    let randomize = BC.url.indexOf('randomize=true') !=-1 ? 'true' : 'false';

                    for (i = 0; i < cards.length; i++) {
                        if (a1 = cards[i].querySelector('.image-container')) {
                            a = a1.querySelector('a');
                            a.href = a.href +'?list='+ playlistId +'&randomize='+ randomize;
                            a1 = a1.innerHTML
                                .replace('image','video-card-image')
                                .replace(/_640x360/g,'_320x180')
                                .replace(/<\/div>/,'')
                                .replace(/<\/a>/,'<\/div><\/a>');
                            title = cards[i].querySelector('.text-container .title').innerHTML;
                            pchan = cards[i].querySelector('.text-container .channel').innerHTML;
                            pdate = cards[i].querySelector('.text-container .details span').innerText;
                            card = d.createElement("div");
                            card.className="video-card";
                            card.innerHTML = a1 +
                               '\n<div class="video-card-text">\n' +
                                   '<p class="video-card-title">'+title+'</p>\n' +
                                   '<p class="video-card-channel">'+pchan+'</p>\n' +
                                   '<p class="video-card-published">'+pdate+'</p>\n</div>';
                            sidebar.appendChild(card);
                        }
                    }
                    active = sidebar.querySelector('.active');
                    if (active) active.classList.remove("active");
                    active = sidebar.querySelector(".video-card > a[href='"+BC.url+"']");
                    if (active) active.parentNode.classList.add("active");
                    if (offset == 6 && addedoffset == 25) {
                        sidebar.parentNode.appendChild(showmore);
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ addMoreRecentVideos(offset+addedoffset+2, playlistId) }, false);
                    }
                    else if (offset > 6 && addedoffset == 25 && qs('.show-more')) {
                        qs('.show-more').outerHTML = showmore.outerHTML;
                        qs('.show-more').classList.remove("hidden");
                        qs('.show-more').addEventListener("click", function(e){ addMoreRecentVideos(offset+addedoffset+2, playlistId) }, false);
                    }
                }
            }
            else { console.error('XMLHttpRequest playlist videos request error') }
            fetchingMoreRecentVideos = 0;
        } catch (e) { console.error('XMLHttpRequest playlist videos parsing error: '+ e) }
    }

    var fetchingMvplaylist = !1;
    var mostViewedPlaylist = {slider:null,index:0,length:0,cardWidth:function(){let o = qs('.mvplaylist').getBoundingClientRect();return (!o || !o.width ? 0 : Math.round(o.width/240))}};
    function addMostViewedPlaylist() {
        let link = qs('.details .name a');
        let sensitivity = d.cookie.match(/sensitivity=((true)|(false))/i);

        if (qs('.mvplaylist.row') || fetchingMvplaylist) return;
        else {
            let el, comments;
            let parent = qs('.video-container');
            let row = d.createElement("div");
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
        fetchingMvplaylist = 1;
        if (link) {
            let csrf = getCsrftoken();
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
                    let active = '';
                    let cards = hidden.querySelectorAll('.video-card');
                    let row = qs(".mvplaylist.row");
                    let title = d.createElement("div");
                    let content = d.createElement("div");
                    let arrow = d.createElement("div");
                    let slider = d.createElement("div");
                    mostViewedPlaylist.length = cards.length;
                    mostViewedPlaylist.slider = slider;
                    title.className = 'playlist-title';
                    title.innerHTML = '<h2 class="sidebar-heading">Most Viewed ('+ cards.length +')</h2>';
                    row.appendChild(title);

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
                        let cardActive = cards[i].querySelector("a[href='"+BC.path+"']");
                        if (cardActive) {
                            mostViewedPlaylist.slider.style.marginLeft = '-'+ (i * 218) +'px';
                            if (i > 0) content.querySelector('.playlistdn').classList.remove('disabled');
                            if (i+1 == cards.length) content.querySelector('.playlistup').classList.add('disabled');
                            mostViewedPlaylist.index = i;
                            active = ' active';
                        }
                        else active = '';
                        cards[i].className += ' playlist-card'+ active;
                        cards[i].innerHTML = cards[i].innerHTML.replace(/<\/div>(?![\s\S]*<\/div>)/, '\n<span class="video-card-published sequence">'+(i+1)+'</span>\n</div>');
                        slider.appendChild(cards[i]);
                    }
                    content.appendChild(slider);
                    row.appendChild(content);

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
                        if (mostViewedPlaylist.index <= mostViewedPlaylist.length - mostViewedPlaylist.cardWidth()) {
                            mostViewedPlaylist.slider.style.marginLeft = '-'+ (++mostViewedPlaylist.index * 218) +'px';
                            if (mostViewedPlaylist.index + mostViewedPlaylist.cardWidth() >= mostViewedPlaylist.length) this.classList.add('disabled');
                            if (mostViewedPlaylist.index > 0) this.previousSibling.classList.remove('disabled');
                        }
                    });
                }
            }
            else { console.error('XMLHttpRequest most viewed request error') }
            fetchingMvplaylist = !1;
        } catch (e) { console.error('XMLHttpRequest most viewed parsing error: '+ e) }
    }

    var playlists = {};
    var fetchingPlaylists = !1;
    function addChannelPlaylists() {
        let link = qs('.details .owner a');

        if (fetchingPlaylists) return;
        fetchingPlaylists = 1;
        if (link) {
            let csrf = getCsrftoken();
            let xhr = new XMLHttpRequest();
            let data = 'csrfmiddlewaretoken='+csrf;
            let showall = '';

            xhr.addEventListener("load", function (e) { addPlaylist(e) });
            xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest most viewed error: '+ e) });
            xhr.open("POST", link, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    }

    var playAll = null;
    function addPlaylist(e) {
        try {
            let link, plName, xhr, m, re, i = 0;
            let result = JSON.parse(e.target.responseText);

            if ('undefined' != result.success && result.success) {
                let el, row, comments;
                let parent = qs('.video-container');
                let csrf = getCsrftoken();
                let data = 'csrfmiddlewaretoken='+csrf;
                re = /class="playlist-card">[\n\s]+<a href="([a-zA-Z0-9\/_-]+)"[\s\S]*?(?!<\/a)+<div class="title">(.*)<\/div>/g
                do {
                    m = re.exec(result.html);
                    if (m) {
                        xhr = new XMLHttpRequest();
                        plName = 'pl'+ m[1].substr(10, 12);
                        playlists[plName] = {item:i++,slider:null,index:0,length:0,cardWidth:function(){let o = qs('#'+ plName +'.playlist').getBoundingClientRect();return (!o || !o.width ? 0 : Math.round(o.width/240))}};
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

                        xhr.addEventListener("load", function (e) { pier(e) });
                        xhr.addEventListener("error", function (e) { console.error('XMLHttpRequest most viewed error: '+ e) });
                        xhr.open("POST", link, true);
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        xhr.send(data);
                    }
                } while (m);
            }
            else {
                console.error('XMLHttpRequest profile page request error');
                fetchingPlaylists = !1;
            }
        } catch (e) { console.error('XMLHttpRequest profile page parsing error: '+ e) }
    }

    function pier(e) {
        try {
            let i, a1, pdate, card
            let result = JSON.parse(e.target.responseText);
            if ('undefined' != result.success && result.success) {
                if (!playAll) {
                    playAll = result.html.match( /<span class="fa-layers">.*<\/span>/ );
                    if (playAll) playAll = playAll[0].replace('<span', '<span title="Play All"')
                }
                let link = result.canonical.match( /.*\/playlist\/([a-z0-9_-]+)\//i );
                let hidden = d.createElement("div");
                hidden.style.display = "none";
                let html = result.html.match(/(<div .* class="playlist-video"[^<]*?>[\s\S]*<\/div>[\s\n]*?<\/div>)[\s\n]*?<\/div>[\s\n]*?<\/div>/i);
                if (html && html[1]) {
                    hidden.innerHTML = html[1];
                    let active = '';
                    let plName = 'pl'+ link[1];
                    let cards = hidden.querySelectorAll('.playlist-video');
                    let showMore = hidden.querySelector('.show-more-container .show-more:not(.hidden)');
                    let row = qs("#"+ plName +'.row');
                    let title = d.createElement("div");
                    let content = d.createElement("div");
                    let arrow = d.createElement("div");
                    let slider = d.createElement("div");
                    playlists[plName].length = cards.length;
                    playlists[plName].slider = slider;
                    title.className = 'playlist-title';

                    title.innerHTML = '<h2 class="sidebar-heading">'+ result.title +' ('+ cards.length +')'+ playAll +'</h2>';
                    row.appendChild(title);
                    if (playAll) {
                        let href = cards[0].querySelector('a').href;
                        title.querySelector('span').addEventListener("click", function (e) {
                            window.location.href = href +'?list='+ link[1] +'&randomize=false'
                        });
                    }

                    arrow.className = 'playlistdn playlistbtn '+ plName +' disabled';
                    arrow.innerHTML = '<b>&lt;</b>';
                    content.style = 'width: 100%;margin: 0px;padding: 0px; overflow:hidden;display: inline-block; max-height: 195px;';
                    content.appendChild(arrow);
                    arrow = d.createElement("div");
                    arrow.className = 'playlistup playlistbtn '+ plName + (cards.length > 3 ? '' : ' disabled');
                    arrow.innerHTML = '<b>&gt;</b>';
                    content.appendChild(arrow);
                    slider.className = 'plslider';

                    for (i = 0; i < cards.length; i++) {
                        if (a1 = cards[i].querySelector('.image-container')) {
                            a1 = a1.innerHTML
                                .replace('image','video-card-image')
                                .replace(/_640x360/g,'_320x180')
                                .replace(/<\/div>/,'')
                                .replace(/<\/a>/,'<\/div><\/a>');
                            title = cards[i].querySelector('.text-container .title').innerHTML;
                            pdate = cards[i].querySelector('.text-container .details span').innerText;
                            card = d.createElement("div");
                            card.className="video-card";
                            card.innerHTML = a1 +
                               '\n<div class="video-card-text">\n' +
                                   '<p class="video-card-title">'+title+'</p>\n' +
                                   '<p class="video-card-published">'+pdate+'</p>\n' +
                                   '<span class="video-card-published sequence">'+(i+1)+'</span>\n</div>';

                            let link = card.querySelector("a").getAttribute("href");
                            let cardActive = link.indexOf(BC.path) !=-1;
                            if (cardActive) {
                                playlists[plName].slider.style.marginLeft = '-'+ (i * 218) +'px';
                                if (i > 0) content.querySelector('.playlistdn.'+ plName).classList.remove('disabled');
                                if (i+1 == cards.length) content.querySelector('.playlistup.'+ plName).classList.add('disabled');
                                playlists[plName].index = i;
                                active = ' active';
                            }
                            else active = '';
                            card.className += ' playlist-card'+ active;
                            slider.appendChild(card);
                        }
                    }
                    content.appendChild(slider);
                    row.appendChild(content);

                    let left = qs('.playlistdn.'+ plName);
                    left.addEventListener("click", function (e) {
                        if (this.classList.contains('disabled')) return false;
                        if (playlists[plName].index > 0) {
                            playlists[plName].slider.style.marginLeft = '-'+ (--playlists[plName].index * 218) +'px';
                            if (playlists[plName].index <= 0) this.classList.add('disabled');
                            if (playlists[plName].index < playlists[plName].length + playlists[plName].cardWidth()) this.nextSibling.classList.remove('disabled');
                        }
                    });
                    let right = qs('.playlistup.'+ plName);
                    right.addEventListener("click", function (e) {
                        if (this.classList.contains('disabled')) return false;
                        if (playlists[plName].index <= playlists[plName].length - playlists[plName].cardWidth()) {
                            playlists[plName].slider.style.marginLeft = '-'+ (++playlists[plName].index * 218) +'px';
                            if (playlists[plName].index + playlists[plName].cardWidth() >= playlists[plName].length) this.classList.add('disabled');
                            if (playlists[plName].index > 0) this.previousSibling.classList.remove('disabled');
                        }
                    });
                }
            }
            else { console.error('XMLHttpRequest playlists request error') }
            fetchingPlaylists = !1;
        } catch (e) { console.error('XMLHttpRequest playlists parsing error: '+ e) }
    }

    function qs(selector) { return document.querySelector(selector) }

    function qsa(selector) { return document.querySelectorAll(selector) }

    function addListener(target, fn, config) {
        // jshint ignore:start
        var cfg = {...{attributes:!1, childList:!1, characterData:!1, subtree:!1}, ...config};
        // jshint ignore:end
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) { fn(mutation) })});
        observer.observe(target, cfg);
        return observer
    }

    function init(e) {
        let settings = "{\"volume\":0.5,\"autoplay\":true,\"color\":\"none\",\"playnext\":false,\"usedark\":true,\"playlists\":true,\"mvplaylist\":true,"+
                        "\"useblacklist\":true,\"hidecarousel\":false,\"hidecomments\":false,\"hidemenubar\":true,\"hideadverts\":true}";
        GM.getValue('player', "{}").then(function (value) {
            if (value && value != '{}') {
                // jshint ignore:start
                let player = {...settings, ...JSON.parse(value)};
                // jshint ignore:end
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
                    hidecomments : player.hidecomments
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
                GM.setValue('blacklist', '[]');
                GM.setValue('player', settings);
                GM.setValue('miniplayer', JSON.stringify({ x:0,y:0,w:350,h:197 }));
                window.location.replace(window.location.href);
            }
        }).catch (error => {
            console.error('S_marty: Error in promise loading dB: '+ error)
        });
    }

      /* Not in Frames */
    if (window.self == window.top) init();

}) ();
