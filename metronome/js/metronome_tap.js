var metronome = function(opts) {
    //primary variables
    var l = typeof opts.len !== "undefined" ? opts.len : 200, // length of metronome arm
        r = typeof opts.angle !== "undefined" ? opts.angle : 20, //max angle from upright
        w = 2 * l * Math.cos(r),
        tick_func = typeof opts.tick !== "undefined" ? opts.tick : function() {}, //function to call with each tick
        end_func = typeof opts.complete !== "undefined" ? opts.complete : function() {}, //function to call on completion
        playSoundW = typeof opts.sound_w !== "undefined" ? opts.sound_w : true,
        playSoundS = typeof opts.sound_s !== "undefined" ? opts.sound_s : true,
        repeats = typeof opts.repeats !== "undefined" ? opts.repeats : 999999;

     var times_text = [
        "2/2", "2/4",
        "3/2", "3/4", "3/8",
        "4/2", "4/4", "4/8",
        "5/2", "5/4", "5/8",
        "6/4", "6/8",
        "7/2", "7/4", "7/8",
        "9/4", "9/8",
        "12/4", "12/8"
    ];

	var beats_text = [
		// bpm-beats, bpm-beats, pronunciation, text, meaning
		[0, 42, "그라베", "Grave", "아주 느리게"],
		[42, 52, "라르고", "Largo", "느리게"],
		[52, 56, "라르게토", "Larghetto","라르고보다 약간 빠르게"],
		[56, 60, "아디지오", " Adagio", "적당히 느리게"],
		[60, 66, "안단테", "Andante", "알맞은 빠르기로"],
		[66, 69, "안단티노", "Andantino", "안단테보다 조금 빠르게"],
		[69, 88, "모데라토", "Moderato", "보통 빠르기"],
		[88, 120, "알레그레토", "Allegretto", "알레그로보다 조금 느리게"],
		[120, 132, "알레그로", "Allegro", "빠르게"],
		[132, 160, "비바체", "Vivace", "활기있게"],
		[160, 184, "프레스토", "Presto", "아주 빠르게"],
		[184, 9999, "프레스티시모", "Prestissimo", "아주 아주 빠르게"]
	];
	
	// initialize Raphael paper if need be        
    switch(typeof opts.paper) {
		case "string": paper = Raphael(opts.paper, w, l + 20); break;
		default: paper = Raphael(0, 0, w, l + 20); break;
    }

	// initialize audio if need be
    if (playSoundS && opts.audio_s) {
		// initialize audio
		var sound_s = document.createElement('audio');
		sound_s.setAttribute('src', opts.audio_s);
		sound_s.setAttribute('id', 'tick_s');
		document.body.appendChild(sound_s);
    }
    
    if (playSoundW && opts.audio_w) {
    	// initialize audio
    	var sound_w = document.createElement('audio');
    	sound_w.setAttribute('src', opts.audio_w);
    	sound_w.setAttribute('id', 'tick_w');
    	document.body.appendChild(sound_w);
    }
    
    // derivative variables
    var y0 = l * Math.cos(Math.PI * r / 180),
        x0 = l * Math.sin(Math.PI * r / 180),    
        y = l + 10,
        x = x0 + 10,    
        tick_count = 0;
    
    var outline = paper.path("M"+x+","+y+"l-"+x0+",-"+y0+"a"+l+","+l+" "+2*r+" 0,1 "+2*x0+",0L"+x+","+y).attr({
        fill: "#EEF",
        'stroke-width': 0    
    });
    
    var arm = paper.path("M" + x + "," + (y + 5) + "v-" + (l - 5)).attr({
        'stroke-width': 5,
        stroke: "#999"
    }).data("id", "arm");
        
    var weight = paper.path("M" + x + "," + (y-100) + "h12l-3,18h-18l-3-18h12").attr({
        'stroke-width': 0,
        fill: '#666'
    }).data("id", "weight");

    var vertex = paper.circle(x, y, 7).attr({
        'stroke-width': 0,
        fill: '#CCC'
    }).data("id", "vertex");

    var label = paper.text(x, y + 20, "").attr({
        "text-anchor": "center",
        "font-size": 14
    });

    var mn = paper.set(arm, weight);
    
    Raphael.easing_formulas.sinoid = function(n) { return Math.sin(Math.PI * n / 2) };

    function tick(obj, repeats, times) {
        //Raphael summons the callback on each of the three objects in the set, so we
        //have to only call the sound once per iteration by associating it with one of the objects.
        //doesn't matter which one
        if (obj.data("id") === "arm") {
        	var tick_end = times.split("/")[0];
        	
        	tick_count += 1;
        	
        	if (tick_count == 1) {
        		if (playSoundS) {
        			document.getElementById("tick_s").play();
        		}
        	} else {
        		if (playSoundW) {
        			document.getElementById("tick_w").play();
        		}
        	}
        	
        	if(tick_count >= tick_end) {
        		tick_count = 0;
        	}    
        }
    }    

    return {
    	screen_on_off: function(flag) {
    		$Element($$.getSingle("#screen_on_off")).$value().src = "naversearchapp://screenon?isScreenOn=" + flag;
    	},
    	decrease_bpm: function() {
    		var el = $$.getSingle('#bpm');
    		var nBpm = parseInt($Element(el).attr("value"), 10);
    		$Element(el).attr("value", (nBpm - 1));
    	},
    	increase_bpm: function() {
    		var el = $$.getSingle('#bpm');
    		var nBpm = parseInt($Element(el).attr("value"), 10);
    		$Element(el).attr("value", (nBpm + 1));
    	},
        start: function(bpm, times) {
        	tick_count = 0;
            mn.attr("transform", "R-20 " + x + "," + y);                
            
            //2 iterations per animation * 60000 ms per minute / bpm
            var interval = 120000 / bpm;

			var animationDone = function() {
				tick(this, repeats, times);
			};
			
            var ticktockAnimationParam = {
                "50%": { transform:"R20 " + x + "," + y, easing: "sinoid", callback: animationDone },
                "100%": { transform:"R-20 " + x + "," + y, easing: "sinoid", callback: animationDone }
            };
            
            //animation
			var ticktock = Raphael.animation(ticktockAnimationParam, interval).repeat(repeats / 2);
			arm.animate(ticktock);
			weight.animateWith(arm, ticktockAnimationParam, ticktock);
			
			//beat text
			for(var i = 0; i < beats_text.length; i++) {
				var min_bpm = parseInt(beats_text[i][0], 10);
				var max_bpm = parseInt(beats_text[i][1], 10);
				
				if(min_bpm < bpm && max_bpm >= bpm) {
					m.make_bpm_meaning(beats_text[i]);
					break;
				}
			}
        },
        stop: function() {
            mn.stop();
            mn.attr("transform", "R0 " + x + "," + y);
            end_func();
        },
        shapes: function() {
        	return {
        		outline: outline,
        		arm: arm,
        		weight: weight,
        		vertex: vertex        	
        	}
        },
        make_times_list: function() {
        	var el = $$.getSingle("#times");
        	var aTemp = [];
        	
        	for(var i = 0; i < times_text.length; i++) {
        		aTemp.push("<option value='" + times_text[i] + "'>" + times_text[i] + "</option>");
        	}
        	
        	$Element(el).html(aTemp.join(""));
        },
        make_bpm_meaning: function(data) {
        	var el = $$.getSingle("#beats");
        	el.innerHTML = "<div class='beats_text'>" + data[2] + "(" + data[3] + ")<br>" + data[4] +"<br>(BPM " + (data[0] == 0 ? 60 : data[0]) + " ~ " + (data[1] == 9999 ? 200 : data[1]) + ")</div>";
        },
       	init: function() {
       		// make times list
       		m.make_times_list();
       		
       		// event for [start/stop] button
        	$Fn(function(oEvent) {
        		var el = oEvent.element;
        		
        		if ($Element(el).html() === "start") {
        			$Element(el).html("stop");
        			
//        			//get values for bpm and ticks and restrict
        			var elBpm = $$.getSingle('#bpm');
                	var bpm = parseInt($Element(elBpm).attr("value"), 10);
        			
    				if (!bpm) { bpm = 60; }
    				else if (bpm > 200) { bpm = 200; }
    				else if (bpm < 30) { bpm = 30; }
    				elBpm.setAttribute("value", bpm);
    				
    				var elTimes = $$.getSingle('#times');
    				var times = $Element(elTimes).attr("value");
    				
    				m.start(bpm, times);
        		} else {
        			$Element(el).html("start");
        			m.stop();
        		}
        	}).attach($$('#startstop'), "click");
        	
        	$Fn(function(oEvent) {
        		m.decrease_bpm();
        	}).attach($$('#btn_decrease'), "click");
        	
        	$Fn(function(oEvent) {
        		m.increase_bpm();
        	}).attach($$('#btn_increase'), "click");
        }
    };
};