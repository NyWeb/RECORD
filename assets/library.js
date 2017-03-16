/**
 * Helper JS
 * @version     $Id: library.js 0 2013-03-03 01:58:18GMT
 * @package     NyWeb-system
 * @author      MÃ¥rten Wetterberg marten.wetterberg@nyweb.nu
 * @copyright   Copyright (C) 2009 - 2013 NyWeb AB. All rights reserved.
 */

var s = {
    legacy: !(window.addEventListener)
};

/*
 * initialize 1 = listener & body
 * initialize 2 = html
 * initialize 3 = content
 * */
var loader = {
    run: 0,
    level: {listen:[], dom:[function(){setTimeout(function(){q('body')[0].className += " loaded";}, 10)}], load:[]},

    initialize: function (level) {
        var i;

        if(1==1) {
            for (i = 0; i < loader.level.listen.length; i++) loader.level.listen[i]();
            loader.level.listen = [];
        }
        if(level=="dom"||level=="load") {
            for (i = 0; i < loader.level.dom.length; i++) loader.level.dom[i]();
            loader.level.dom = [];
        }
        if(level=="load") {
            for (i = 0; i < loader.level.load.length; i++) loader.level.load[i]();
            loader.level.load = [];
        }

        loader.run = level;
    },

    domready: function () {
        if (document.readyState === "complete") {
            setTimeout(function(){loader.initialize('load')}, 1);
        }

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", loader.checkstate, false);
            window.addEventListener("load", function(){loader.initialize('load')}, false);
        }

        else if (document.attachEvent) {
            document.attachEvent("onReadyStateChange", loader.checkstate);
            window.attachEvent("onload", function(){loader.initialize('load')});
        }
    },

    checkstate: function () {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", loader.checkstate, false);
            loader.initialize('load');
        }

        else if (document.attachEvent) {
            if (document.readyState === "complete") {
                document.detachEvent("onReadyStateChange", loader.checkstate);
                loader.initialize('load');
            }
        }
    },

    legacy: function (a, d) {
        d = document;
        b = d.createStyleSheet();

        d.querySelectorAll = function (r, c, i, j, a) {
            a = d.all;
            c = [];
            r = r.replace(/\[for\b/gi, '[htmlFor').split(',');

            for (i = r.length; i--;) {
                b.addRule(r[i], 'k:v');
                for (j = a.length; j--;) {
                    if (a[j].currentStyle.k) c.push(a[j]);
                }
                b.removeRule(0);
            }
            return c;
        };
    }
};

loader.level.listen.push(function () {listener.initialize();});
var listener = {
    initialize: function () {
        window.onresize = function () {
            responsive.go();
        };
        if (!s.legacy) window.addEventListener("popstate", function () {
            ajax.history();
        });
    }
};
loader.level.dom.push(function(){ajax.initialize();});
var ajax = {
    object: null,
    url: '',
    draw: [],
    caller: false,
    initialize: function () {
        if (window.XMLHttpRequest) ajax.object = new XMLHttpRequest();
        else if (window.ActiveXObject) ajax.object = new ActiveXObject("Microsoft.XMLHTTP");
        for (var i = 0; i < q('.ajax').length; i++) {
            q('.ajax')[i].onclick = function () {
                ajax.go(this.href + '?&format=raw');
                return false;
            };
        }
    },

    go: function (url) {
        q('body')[0].className = q('body')[0].className.replace(" loaded", '');
        ajax.url = url;
        if (ajax.object.length === 0) ajax.initialize();
        ajax.object.open("GET", url, true);
        ajax.object.onreadystatechange = function(){ajax.execute();};
        ajax.object.send(null);
    },

    execute: function () {
        if (ajax.object.readyState != 4) return;
        q('body')[0].className = q('body')[0].className.replace('loaded', "")+" loaded";
        var updatelink = !s.legacy;
        for (var i = ajax.draw.length - 1; i > 0; i--) {
            if (ajax.draw[i](ajax.object.responseText) == "nolink") updatelink = false;
        }
        if (updatelink) window.history.pushState(null, '', ajax.url.replace(/format\=raw/g, '').replace(/\&\&/g, '&').replace(/\?\&/g, "?"));
    },

    history: function () {
        //if(s.url) ajax.go(location.pathname);
    }
};

loader.level.dom.push(function () {gallery.initialize();});
loader.level.load.push(function(){var gall=q('.gallery');for(var i=0;i<gall.length;i++){if(!gallery.getlist(gall[i]).length)continue;var setting=gallery.setting(i);gallery.timer[i]=setTimeout(gallery.go, (setting['time']*1000),i)}});
ajax.draw.push(function () {gallery.reset();});
var gallery = {
    timer: [],
    index: [],
    item: ["li"],
    top: null,
    draw: [],
    initialize: function () {
        var gall = q('.gallery');
        for (var i = 0; i < gall.length; i++) {
            if (!gallery.getlist(gall[i]).length) continue;
            gallery.index[i] = 0;

            if (q('.bullets', gall[i]).length) {
                var bullets = q('.bullet', q('.bullets', gall[i])[0]);
                for (var l = 0; l < bullets.length; l++) {
                    bullets[l].id = i + "-index-item-" + l;
                    bullets[l].onclick = function () {
                        var index = this.id.split("-index-item-");
                        var count = index[1];
                        index = index[0];
                        gallery.clean(index, 1);
                        gallery.number(index, count);
                    };
                }
            }

            for (var ii = 0; ii < q('.left', gall[i]).length; ii++) {
                q('.left', gall[i])[ii].id = "-index-" + i;
                q('.left', gall[i])[ii].onclick = function () {
                    gallery.clean(this.id.substr(-1, 1));
                    gallery.previous(this.id.substr(-1, 1));
                };
            }

            for (ii = 0; ii < q('.right', gall[i]).length; ii++) {
                q('.right', gall[i])[ii].id = "-index-" + i;
                q('.right', gall[i])[ii].onclick = function () {
                    gallery.clean(this.id.substr(-1, 1));
                    gallery.next(this.id.substr(-1, 1));
                };
            }

            keylogger.key["key-39"] = function () {
                gallery.clean(0);
                gallery.next(0);
            };
            keylogger.key["key-37"] = function () {
                gallery.clean(0);
                gallery.previous(0);
            };
            gallery.set(i);
            if (!s.legacy) {
                gall[i].addEventListener("touchstart", function (ev) {
                    gallery.swipe(ev, 1)
                });
            }
        }

    },

    set: function (index) {
        gallery.clean(index);
        gallery.number(index, 0);
    },

    go: function (index) {
        if (!index) index = 0;
        var setting = gallery.setting(index);

        gallery.clean(index);
        gallery.next(index);

        clearTimeout(gallery.timer[index]);
        gallery.timer[index] = setTimeout(gallery.go, (setting['time'] * 1000), index);
    },

    setting: function (index) {
        var sett = [];
        if (q('.gallery')[index].getAttribute('rel')) sett = q('.gallery')[index].getAttribute('rel').split(";");
        else sett = ["time:10", "type:0"];
        var setting = [];
        for (var i = 0; i < sett.length; i++) {
            var val = sett[i].split(":");
            setting[val[0]] = val[1];
        }

        return setting;
    },

    clean: function (index) {
        var lis = gallery.getlist(q('.gallery')[index]);

        var bus = q('.bullet', q('.gallery')[index]);
        for (var i = 0; i < lis.length; i++) {
            lis[i].className = lis[i].className.replace(" active", "");
            if (bus[i]) bus[i].className = bus[i].className.replace(" current", "");
        }

        var setting = gallery.setting(index);
        clearTimeout(gallery.timer[index]);
        gallery.timer[index] = setTimeout(gallery.go, (setting['time'] * 1000), index);
    },

    next: function (index) {
        var count = gallery.getlist(q('.gallery')[index]).length;

        gallery.index[index]++;
        if (gallery.index[index] >= count) gallery.index[index] = 0;

        gallery.number(index, gallery.index[index]);
    },

    previous: function (index) {
        var count = gallery.getlist(q('.gallery')[index]).length;

        gallery.index[index]--;
        if (gallery.index[index] < 0) gallery.index[index] = count - 1;

        gallery.number(index, gallery.index[index]);
    },

    number: function (index, count) {
        gallery.getlist(q('.gallery')[index])[count].className += " active";
        if (q('.bullet', q('.gallery')[index]).length) q('.bullet', q('.gallery')[index])[count].className += " current";
        if (q('.slider', q('.gallery')[index]).length) {
            q('.focus', q('.gallery')[index])[0].setAttribute('data-scroll', count - 1);
            slider.go(0, 1);
        }

        for (i = 0; i < gallery.draw.length; i++) {
            gallery.draw[i]();
        }
    },

    reset: function () {
        gallery.timer = [];
        gallery.index = [];
        gallery.initialize();
    },

    swipe: function (e, t) {
        if (t) {
            gallery.top = parseInt(e.touches[0].pageX);
            window.addEventListener('touchmove', gallery.swipe, false);
        }
        else {
            var lnt = gallery.top - e.touches[0].pageX;
            if (Math.abs(lnt) >= 100) {
                //Need to figure out the index?
                gallery.clean(0);
                if (lnt > 0) gallery.next(0);
                else gallery.previous(0);
                window.removeEventListener('touchmove', gallery.swipe, false);
            }
        }
    },

    getlist: function (gal) {
        for (var i = 0; i < gallery.item.length; i++) {
            var propose = q(gallery.item[i], gal);
            if (propose.length) return propose;
        }

        return false;
    }
};

loader.level.dom.push(function(){readmore.initialize();});
var readmore = {
    draw: [],
    initialize: function () {
        var limiters = q('.limiters');

        for (var i = 0; i < limiters.length; i++) {
            var elements = q('.' + limiters[i].getAttribute('data-target'), limiters[i]);

            for (var l = 0; l < elements.length; l++) {
                elements[l].style.display = "none";
            }

            if (!q('.read-more', limiters[i]).length) {
                var mores = document.createElement("a");
                mores.className = "read-more";
                limiters[i].appendChild(mores);
            }

            mores = q('.read-more', limiters[i])[0];

            mores.onclick = function () {
                readmore.go(this);
            };
            readmore.go(mores);
        }
    },

    go: function (w) {
        var limiter = w.parentNode;

        var maxlength = limiter.getAttribute('data-batch');
        var elements = q('.' + limiter.getAttribute('data-target'), limiter);

        var loaded = 0;
        var skipped = 0;
        var i;

        for (i = 0; i < elements.length; i++) {
            if (maxlength <= 0) {
                skipped++;
                continue;
            }
            if (v(elements[i], 'hidden')) continue;
            loaded++;
            if (elements[i].style.display == "none") {
                elements[i].style.display = "";
                maxlength--;
            }
        }

        if (maxlength || !skipped) w.parentNode.removeChild(w);

        for (i = 0; i < readmore.draw.length; i++) {
            readmore.draw[i](Math.round(loaded / limiter.getAttribute('data-batch')));
        }
    }
};

loader.level.listen.push(function(){responsive.initialize();});
loader.level.dom.push(function(){responsive.go(1);});
ajax.draw.push(function(){responsive.go(1);});
readmore.draw.push(function(){responsive.go(1);});
var responsive = {
    width2class: {1600:'imac',1440:'ipro',1280:'iair',1024:'ipad',800:'imin',640:'ipod',0:'ipho'},
    width: [1600,1440,1280,1024,800,640,0],
    draw: [],

    initialize: function () {
        responsive.go();
    },

    go: function (force) {
        var bdy = q('body')[0];
        var wdt = bdy.offsetWidth;

        var active = '';
        var size = 0;
        var nots = [];
        var i;
        for (i = 0; i < responsive.width.length; i++) {
            var mwdt = responsive.width[i];
            var cnam = responsive.width2class[mwdt];

            if (!active && mwdt <= wdt) {
                active = cnam;
                size = mwdt;
            }

            else nots[i] = cnam;
        }

        if (active && v(bdy, active) && !force) return;

        for (i = 0; i < nots.length; i++) {
            while (v(bdy, ' ' + nots[i])) bdy.className = bdy.className.replace(' ' + nots[i], '');
        }
        bdy.className = bdy.className.replace(" " + active, "") + " " + active;

        for (i = 0; i < responsive.draw.length; i++) {
            responsive.draw[i](size);
        }
    }
};

loader.level.dom.push(function (){sticky.initialize();});
var sticky = {
    top: [],

    initialize: function () {
        if (q('.sticky').length) {
            scroll.draw.push(function () {
                sticky.go();
            });
        }
    },

    go: function () {
        var sticks = q('.sticky');
        for(var i=0; i<sticks.length; i++) {
            var body = q('body')[0];

            var query = sticks[i].getAttribute('data-class')?sticks[i].getAttribute('data-class'):"sticking";

            if(sticky.top[i] && window.scrollY < sticky.top[i] && v(body, query)) {
                body.className = body.className.replace(' '+query, '');
            }

            else {
                var stick = absolute.initialize(sticks[i], true);
                var top = (sticks[i].getAttribute('data-bottom')?(stick['y']+sticks[i].offsetHeight-body.offsetHeight):stick['y']);

                if (window.scrollY >= top && !v(body, query) && (window.scrollY+body.offsetHeight<body.scrollHeight) && (top > 0/*||window.scrollY*/)) {
                    sticky.top[i] = top;
                    body.className += " "+query;
                }
            }
        }
    }
};

loader.level.load.push(function () {scroll.initialize();
});
var scroll = {
    draw: [],
    initialize: function () {
        window.onscroll = function () {
            scroll.go();
        };
        scroll.go();
    },

    go: function () {
        for (var i = scroll.draw.length - 1; i > -1; i--) {
            scroll.draw[i]();
        }
    }
};

var cookie = {
    create: function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },

    read: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    erase: function (name) {
        cookie.create(name, "", -1);
    }
};

var absolute = {
    initialize: function (w, noscroll, target) {
        if (!target) target = document;

        var position = [];
        position['x'] = 0;
        position['y'] = noscroll ? 0 : -q('body', target)[0].scrollTop;

        if (w.offsetParent) {
            while (w.offsetParent) {
                position['x'] += w.offsetLeft - w.scrollLeft;
                position['y'] += w.offsetTop - w.scrollTop;
                w = w.offsetParent;
            }
        }
        else if (w.x || w.y) {
            position['x'] += w.x;
            position['y'] += w.y;
        }

        return position;
    }
};

loader.level.dom.push(function () {carousel.initialize();});
var carousel = {
    timer: [],

    initialize: function () {
        var carousels = q('.carousel');
        for (var i = 0; i < carousels.length; i++) {
            var items = q('.item', carousels[i]);
            for (var ii = 0; ii < items.length; ii++) {
                items[ii].id = i + "-index-item-" + ii;
                items[ii].onclick = function () {
                    var index = this.id.split("-index-item-");
                    var count = index[1];
                    index = index[0];
                    carousel.go(index, count);
                };
            }
            carousel.go(i, 0);
        }
    },

    go: function (index, count) {
        clearTimeout(carousel.timer[index]);

        var object = q('.carousel')[index];

        //Get premises
        var width = object.offsetWidth;
        var height = object.offsetHeight;

        var items = q('.item', object);

        //If we're past our limit
        var length = items.length;

        if (length <= count) count = 0;

        var address_width = (width - items[count].offsetWidth) / 2;
        var address_height = (height - items[count].offsetHeight) / 2;

        for (var i = 0; i < items.length; i++) {
            //Get degree
            var offset = i - count;
            if (offset < 0) offset += length;
            var degree = 360 / length * offset;

            //Get cosine position
            var x = Math.round(Math.sin(degree / 180 * Math.PI) * address_width);
            var y = Math.round(Math.cos(degree / 180 * Math.PI) * address_height);

            //Set values
            items[i].style.top = (y + address_height) + "px";
            items[i].style.left = (x + address_width) + "px";

            //Set class-name + a 10-sized agent at what position he's at
            items[i].className = "item distance-" + Math.round(Math.abs(degree - 180) / 18);
        }
        items[count].className += " active";

        carousel.timer[index] = setTimeout(carousel.go, object.getAttribute("data-transition") * 1000, index, count + 1);
    }
};

responsive.draw.push(function(size){appmenu.initialize(size);});
var appmenu = {
    size: ['ipho','ipod'],
    draw: [],
    initialize: function (size) {
        var menu = q('.app-style');
        if (!menu.length) return;

        var valid = false;
        for(var i=0;i<appmenu.size.length;i++) {
            if(responsive.width2class[size]==appmenu.size[i]) valid = true;
        }

        if(!valid) {
            for(i=0;i<menu.length;i++) {
                menu[i].onclick = false;
            }
        }
        else {
            for (i=0; i < menu.length; i++) {
                menu[i].onclick = function () {
                    appmenu.go(this);
                };
            }
        }
    },

    go: function (w) {
        if (q('.app-menu').length) return appmenu.close();

        var object = document.createElement("ul");
        object.className = "app-menu";
        object.innerHTML = w.innerHTML;

        appmenu.attach(object);

        closer = document.createElement("li");
        closer.className = "close";
        closer.onclick = function () {
            appmenu.close();
        };
        object.appendChild(closer);

        q('body')[0].appendChild(object);
        q('body')[0].style.overflow = "hidden";
        if(v(q('body')[0], 'menu-runner')) q('body')[0].className = q('body')[0].className.replace("menu-runner", "");
        setTimeout(function(){q('body')[0].className += " menu-runner";}, 10);

        for (i = 0; i < appmenu.draw.length; i++) {
            appmenu.draw[i]();
        }

        return "";
    },

    attach: function (object) {
        lis = q('li', object);
        for (var i = 0; i < lis.length; i++) {
            if (q('ul', lis[i]).length) {
                subs = lis[i].childNodes;
                subs[0].onclick = function () {
                    var ul = q('ul', this.parentNode)[0];
                    if (v(ul, 'open')) {
                        ul.className = ul.className.replace('open', '');
                        return true;
                    }
                    else ul.className += " open";
                    return false;
                };
            }
        }
    },

    close: function () {
        q('.app-menu')[0].parentNode.removeChild(q('.app-menu')[0]);
        q('body')[0].style.overflow = "";
    }
};

loader.level.dom.push(function(){slider.initialize();});
loader.level.load.push(function(){var sliders = q('.slider');for(var i=0; i<sliders.length; i++){slider.execute(sliders[i].getAttribute("data-time"), i);}});
var slider = {
    dir: [],
    caller: [],
    touch: false,
    timer: [],

    initialize: function () {
        var sliders = q('.slider');

        for (var i = 0; i < sliders.length; i++) {
            sliders[i].setAttribute("data-id", i);

            var focus2 = q('.focus', sliders[i])[0];

            var boxes = q('.box', focus2);

            var style = boxes[0].currentStyle || window.getComputedStyle(boxes[0]);

            var marginandborder = parseInt(style.marginLeft) + parseInt(style.marginRight) + parseInt(style.borderLeftWidth) + parseInt(style.borderRightWidth);

            focus2.style.width = (boxes.length * (boxes[0].offsetWidth + marginandborder)) + "px";

            slider.dir[i] = 1;

            var arrows = q('.arrow', sliders[i]);
            for (var ii = 0; ii < arrows.length; ii++) {
                arrows[ii].setAttribute("data-id", i);
                arrows[ii].onmouseover = function () {
                    clearTimeout(slider.timer[this.getAttribute("data-id")])
                };
                arrows[ii].onmouseout = function () {
                    slider.execute(q('.slider')[this.getAttribute("data-id")].getAttribute("data-time"), this.getAttribute("data-id"))
                };
                arrows[ii].onclick = function () {
                    slider.go(this.getAttribute("data-id"), (v(this, 'left') ? -1 : 1));
                    clearTimeout(slider.timer[this.getAttribute("data-id")])
                };
            }

            sliders[i].addEventListener("touchstart", function (ev) {
                slider.caller = this.getAttribute("data-id");
                slider.swipe(ev, 1);
            });
        }
    },

    swipe: function (e, t) {
        if (t) {
            slider.touch = e.touches[0].pageX;
            window.addEventListener('touchmove', slider.swipe, false);
        }
        else {
            var lnt = slider.touch - e.touches[0].pageX;
            if (Math.abs(lnt) >= 100) {
                slider.go(slider.caller, lnt > 0 ? 1 : -1);
                window.removeEventListener('touchmove', slider.swipe, false);
            }
        }
    },

    go: function (i, vdir) {
        if (!vdir) vdir = slider.dir[i];

        focus2 = q('.focus', q('.slider')[i])[0];

        screenwidth = focus2.parentNode.offsetWidth;

        gridsize = q('.box', focus2)[0].offsetWidth + (10 * 2);

        focuswidth = focus2.offsetWidth;

        if (focus2.offsetWidth < screenwidth) return "";

        newscroll = (focus2.getAttribute("data-scroll") * 1.00) + (vdir * 1.00);

        focus2.setAttribute("data-scroll", newscroll);

        proposedleft = newscroll * gridsize * -1;

        if (vdir == 1 && (proposedleft + focuswidth) < (screenwidth)) {
            slider.dir[i] = -1;
            return slider.go(i);
        }

        else if (vdir == -1 && proposedleft > 0) {
            slider.dir[i] = 1;
            return slider.go(i);
        }

        focus2.style.left = proposedleft + "px";

        clearTimeout(slider.timer[i]);
        slider.execute(q('.slider')[0].getAttribute("data-time"), i);

        return false;
    },

    execute: function (time, i) {
        slider.timer[i] = setTimeout(function (i) {
            slider.go(i)
        }, ((time ? time : 4) * 1000), i);
    }
};

loader.level.listen.push(function () {keylogger.initialize();});
var keylogger = {
    key: [],
    initialize: function () {
        if ('legacy' in s && !s.legacy) window.addEventListener("keyup", keylogger.go, false);
    },

    go: function (code) {
        code = code.keyCode;
        if ("key-" + code in keylogger.key) keylogger.key["key-" + code](code);
    }
};

loader.level.dom.push(function () {twitter.initialize();});
var twitter = {
    initialize: function () {
        var feed = q(".twitter-feed");

        for (var i = 0; i < feed.length; i++) {
            twitter.fetch(feed[i].getAttribute("data-user"), i);
        }
    },

    fetch: function (a) {
        var c = document.createElement("script");
        c.type = "text/javascript";
        c.src = "http://cdn.syndication.twimg.com/widgets/timelines/377741631606120448?&lang=en&callback=twitter.go&suppress_response_codes=true&rnd=" + Math.random() + "&override_name=" + a + "&override_type=user&with_replies=false&count=50";
        document.getElementsByTagName("head")[0].appendChild(c);
    },

    go: function (a) {
        var b = document.createElement("div");
        b.innerHTML = a.body;

        var feed = q('.twitter-feed');

        for (var i = 0; i < feed.length; i++) {
            var total = feed[i].getAttribute("data-length") ? feed[i].getAttribute("data-length") : 1;
            if (q('a', b)[0].href.toUpperCase().indexOf(feed[i].getAttribute("data-user").toUpperCase()) !== -1) {
                var entries = q(".e-entry-title", b);
                for (var ii = 0; ii < entries.length; ii++) {
                    if (feed[i].getAttribute("data-hashtag") && entries[ii].innerHTML.toUpperCase().indexOf(feed[i].getAttribute("data-hashtag").toUpperCase()) !== -1) {
                        feed[i].innerHTML = entries[ii].innerHTML;
                        break;
                    }
                    else if (total-- > 0) {
                        var element = document.createElement("div");
                        element.innerHTML = entries[ii].innerHTML;
                        feed[i].appendChild(element);
                    }
                }
            }
        }
    }
};

loader.level.dom.push(function () {toggle.initialize();});
var toggle = {
    initialize: function () {
        toggler = q(".toggler");
        for (var i = 0; i < toggler.length; i++) {
            toggler[i].onclick = function () {
                toggle.go(this)
            };
        }
    },

    go: function (w) {
        var target = w.parentNode.parentNode;

        if (v(target, 'inactive')) {
            target.className = target.className.replace("inactive", "") + " active";
        }
        else {
            target.className = target.className.replace("active", "") + " inactive";
        }
    }
};

loader.level.dom.push(function () {tab.initialize()});
var tab = {
    initialize: function () {
        if (!q('.do-tab').length) return;

        doers = q('.do-tab');
        for (var i = 0; i < doers.length; i++) {
            tabdoer = q('li', doers[i]);

            for (var ii = 0; ii < tabdoer.length; ii++) {
                tabdoer[ii].onclick = function () {
                    tab.go(this)
                };
            }
        }
    },

    go: function (w) {
        target = w.getAttribute("data-target");

        tabholder = q('.hold-tab', w.parentNode.parentNode);

        for (var i = 0; i < tabholder.length; i++) {
            if (tabholder[i].id == target) tabholder[i].className = tabholder[i].className.replace(" active", "") + " active";
            else tabholder[i].className = tabholder[i].className.replace(" active", "");
        }

        tabdoer = q('li', q('.do-tab', w.parentNode.parentNode)[0]);

        for (i = 0; i < tabdoer.length; i++) {
            if (tabdoer[i] == w) tabdoer[i].className = tabdoer[i].className.replace(" active", "") + " active";
            else tabdoer[i].className = tabdoer[i].className.replace("active", "");
        }
    }
};

loader.level.dom.push(function () {slowscroll.initialize()});
var slowscroll = {
    top: 0,
    initialize: function () {
        var scrolls = q('.slow-scroll');

        for (var i = 0; i < scrolls.length; i++) {
            scrolls[i].onclick = function () {
                slowscroll.top = q('body')[0].scrollTop;
                if(!this.href) this.href = this.getAttribute("data-href");
                var tag = this.href.split("#");
                slowscroll.go(tag[1], 0);
                window.location.hash = tag[1];
                return false;
            };
        }
    },

    go: function (tagg, step) {
        var total = 100;

        var poss = absolute.initialize(q('-' + tagg)[0], 1);

        var offset = (poss['y'] - slowscroll.top);

        var percent = step / total;

        var agent = (-Math.pow(percent, 2)) + (2 * percent);

        q('body')[0].scrollTop = (offset * (percent * agent)) + slowscroll.top;

        if (step < total) setTimeout(slowscroll.go, 10, tagg, step + 1);
    }
};

loader.level.dom.push(function () {filter.initialize();});
var filter = {
    draw: [function(){readmore.initialize();}],
    initialize: function () {
        var filters = q('.filter-cta');

        if (!filters.length) return;

        for (var i = 0; i < filters.length; i++) {
            filters[i].onchange = function () {
                filter.go();
            };
        }

        if (q('-string').length) q('-string')[0].onkeyup = function () {
            filter.go();
        };
    },

    go: function () {
        var matches = [];
        var possibles = [];
        var names = [];

        var filters = q('.filter-cta');

        var oid = -1;

        var i, subjects, valid, inter;

        for (i = 0; i < filters.length; i++) {
            var inttarg = filters[i].getAttribute("data-target");

            if (!inttarg) continue;

            if (names[oid] != inttarg) {
                oid++;
                names[oid] = inttarg;
                possibles[oid] = [];
                matches[oid] = [];
            }


            if (filters[i].checked) matches[oid][matches[oid].length] = filters[i].value;
            possibles[oid][possibles[oid].length] = filters[i].value;
        }

        for (i = 0; i < matches.length; i++) {
            if (!matches[i].length) matches[i] = "reset";
        }

        if (q("-string").length) var string = q("-string")[0].value;

        subjects = q('.filter-subject');
        for (i = 0; i < subjects.length; i++) {
            valid = 0;
            for (var im = 0; im < matches.length; im++) {
                inter = 1;
                if (matches[im] == "reset") valid += inter;
                else {
                    for (var ii = 0; ii < matches[im].length; ii++) {
                        if (subjects[i].getAttribute('data-filter-' + names[im]).indexOf("|" + matches[im][ii] + "|") !== -1) {
                            valid += inter;
                            inter = 0;
                        }
                    }
                }
            }
            if (string) {
                //Split up words
                var words = string.toUpperCase().split(" ");

                //Count hits
                var hits = 0;
                for(var il = 0; il < words.length; il++) {
                    if(subjects[i].getAttribute("data-filter-cleartext").toUpperCase().indexOf(words[il])!==-1) hits++;
                }

                //If not every word matches
                if(hits!=words.length) valid--;
            }
            if (valid == matches.length) subjects[i].className = subjects[i].className.replace("hidden", "");
            else subjects[i].className = subjects[i].className.replace(" hidden", "") + " hidden";
        }

        for (i = 0; i < filter.draw.length; i++) {
            filter.draw[i]();
        }
    }
};

loader.level.dom.push(function () {menutoggle.initialize();});
var menutoggle = {
    initialize: function() {
        var uls = q('.toggle');
        for(var i=0; i<uls.length; i++) {
            if(uls[i].tagName!="UL") continue;
            var lis = q('li', uls[i]);
            for(var ii=0; ii<lis.length; ii++) {
                if(q('ul', lis[ii]).length) {
                    nodes = lis[ii].childNodes;
                    if(nodes[0].tagName=="SPAN"||nodes[0].tagName=="A") nodes[0].onclick = function(){return menutoggle.go(this)};
                }
            }
        }
    },

    go: function(w) {
        //Validate if we have a toggle
        var valid = !v(w.parentNode, "current");

        //Get top-level UL
        var worker = w.parentNode.parentNode;
        while(worker.parentNode.parentNode.tagName=="UL") worker = worker.parentNode.parentNode;

        //Clean out all currents
        var currents = q('.current', worker);
        for(var i=0; i<currents.length; i++) currents[i].className = currents[i].className.replace("current", "");

        if(valid) worker = w.parentNode;
        else worker = w.parentNode.parentNode.parentNode;
        //All the way up to top
        while(worker.tagName=="LI") {
            worker.className += " current";
            worker = worker.parentNode.parentNode;
        }

        //Return to not click
        return false;
    }
};

loader.level.dom.push(function () {imageupload.initialize()});
var imageupload = {
    object: null,
    initialize: function () {
        var uploader = q(".uploader");

        if(uploader.length) {
            for (i = 0; i < uploader.length; i++) {
                uploader[i].onchange = function () {
                    imageupload.go(this)
                };
            }

            var deleters = q('.delete-image');
            for (var l = 0; l < deleters.length; l++) {
                deleters[l].onclick = function () {
                    this.parentNode.removeChild(q('img', this.parentNode)[0]);
                    q('.holder', this.parentNode)[0].value = "";
                };
            }
        }
    },

    go: function (w) {
        var uploader = document.createElement('input');
        uploader.type = "file";
        uploader.name = w.name;
        uploader.onchange = function () {
            imageupload.go(this)
        };

        imageupload.object = w.parentNode;
        imageupload.object.appendChild(uploader);
        imageupload.object.className += " loading";

        var frm = document.createElement("form");
        frm.method = "post";
        frm.target = "fileupload";
        frm.enctype = "multipart/form-data";
        frm.className = "form-upload";
        frm.action = (imageupload.object.getAttribute("data-path")?imageupload.object.getAttribute("data-path"):"")+"/?view=upload"+(imageupload.object.getAttribute("data-url")?imageupload.object.getAttribute("data-url"):"");
        frm.style.display = "none";

        if (!q('-fileupload').length) {
            var ifrme = document.createElement("iframe");
            ifrme.name = "fileupload";
            frm.appendChild(ifrme);
        }

        frm.appendChild(w);

        q('body')[0].appendChild(frm);
        q('.form-upload')[q('.form-upload').length - 1].submit();
    },

    recieve: function (w, a, exif) {
        q(".holder", imageupload.object)[0].value = w;
        if(exif) q(".exif", imageupload.object)[0].value = exif;
        while (q('.form-upload').length) q('.form-upload')[0].parentNode.removeChild(q('.form-upload')[0]);

        imageupload.object.className = imageupload.object.className.replace(" loading", "");
        if (!q("img", imageupload.object).length) {
            var img = document.createElement("img");
            imageupload.object.appendChild(img);
        }

        q("img", imageupload.object)[0].src = a+w;
    }
};

/* DOM query selector string in object */
function q(a, d) {
    if (!d) d = document;
    if (d && !d.querySelectorAll) loader.legacy(a, d);
    switch (a.substr(0, 1)) {
        case "#":
            return d.getElementById(a.substr(1));
        case ".":
            return d.querySelectorAll(a);
        case "-":
            return d.getElementsByName(a.substr(1));
        default:
            return d.getElementsByTagName(a);
    }
}

/* Classname has substring */
function v(z, g) {
    return z.className.indexOf(g) != -1;
}

/*Create element*/
function g(tag, cname, inner, url, src, click, type, hover) {
    /*var e = document.createElement(tag);
     if(cname) e.className = cname;
     if(inner) e.innerHTML = inner;
     if(url) e.href = url;
     if(src) e.src = src;
     if(click) e.onclick = click;
     if(hover) e.onmouseover = hover;
     if(type) e.type = type;
     return e;*/
}

/*Get DOMREADY*/
loader.domready();