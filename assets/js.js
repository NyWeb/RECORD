loader.level.dom.push(function(){vinyl.initialize()});
ajax.draw.push(function(w){return vinyl.fetch(w)});
var vinyl = {
    json: {status: false, speed: 33.0000},
    lock: false,
    cache: {response: false, error: false},

    initialize: function() {
        vinyl.action();
    },

    push: function(key, value) {
        vinyl.json[key] = value;

        //Push JSON data to server
        if(!vinyl.lock) {
            vinyl.lock = true;

            string = "";
            if(vinyl.json) {
                var string = JSON.stringify(vinyl.json);
            }

            url = "/?view=saveplay&json="+string+"&format=raw";
            ajax.go(url);

            vinyl.cache.response = setTimeout(vinyl.error, 2000, "WiFi not connecting");
        }
    },

    fetch: function(w) {
        //Reset JSON data so it's not sent again
        vinyl.lock = false;

        //Remove timer
        clearTimeout(vinyl.cache.response);

        try {
            var log = JSON.parse(w);
        }

        catch(err) {
            vinyl.error("connect-error: WIFI not connecting");

            //We couldn't connect with vinyl
            return "nolink";
        }

        return "nolink";
    },

    action: function() {
        var actions = q('.action');
        for(var i=0; i<actions.length; i++) {
            if(v(actions[i], "play")) actions[i].onclick = function(){
                vinyl.push("status", true);

                var pause = q('.pause')[0];
                if(v(this, "active")) {
                    this.className = this.className.replace("active", "");
                    pause.className = pause.className.replace("active", "");
                }
                else {
                    this.className += " active";
                    if(!v(pause, "active")) pause.className += "active";
                }
            };

            if(v(actions[i], "pause")) actions[i].onclick = function(){
                vinyl.push("status", false);

                var play = q('.play')[0];
                if(v(this, "active")) {
                    this.className = this.className.replace("active", "");
                    play.className = play.className.replace("active", "");
                }
                else {
                    this.className += " active";
                    if(!v(play, "active")) play.className += "active";
                }
            };

            if(v(actions[i], "speed-33")) actions[i].onclick = function(){
                vinyl.push("speed", 33);

                var button45 = q('.speed-45')[0];
                if(v(this, "active")) {
                    this.className = this.className.replace("active", "");
                    button45.className = button45.className.replace("active", "");
                }
                else {
                    this.className += " active";
                    if(!v(button45, "active")) button45.className += "active";
                }
            };

            if(v(actions[i], "speed-45")) actions[i].onclick = function(){
                vinyl.push("speed", 45);

                var button33 = q('.speed-33')[0];
                if(v(this, "active")) {
                    this.className = this.className.replace("active", "");
                    button33.className = button33.className.replace("active", "");
                }
                else {
                    this.className += " active";
                    if(!v(button33, "active")) button33.className += "active";
                }
            };

            if(v(actions[i], "tune-up")) actions[i].onclick = function(){
                vinyl.push("speed", vinyl.json['speed']+0.001);
            };

            if(v(actions[i], "tune-down")) actions[i].onclick = function(){
                vinyl.push("speed", vinyl.json['speed']-0.001);
            };
        }
    },

    play: function(sound) {
        var audio = document.createElement("audio");
        audio.src = "/assets/"+sound+".mp3";
        audio.play();
    },

    error: function(msg) {
        if(msg&&msg!=vinyl.cache.error) {
            console.log(msg);

            vinyl.play("alarm");

            var holder = document.createElement("a");
            holder.innerHTML = msg;

            q('.error')[0].appendChild(holder);

            setTimeout(function(){q('.error')[0].removeChild(q('a', q('.error')[0])[0]); vinyl.cache.error = false;}, 2000);

            vinyl.cache.error = msg;
        }
    }
};

var plugin = {
    control: function(log) {
        if(!log) return;

        vinyl.adjust({
            left: {
                x: log['motor']["jaw"],
                y: log['motor']["throttle"]
            },
            right: {
                x: log['motor']["roll"],
                y: log['motor']["pitch"]
            }
        });
    }
};

var sensor = {
};