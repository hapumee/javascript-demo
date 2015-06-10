/**
 * @fileOverview [메트로놈]
 * keyword : 메트로놈
 *
 * @name        nhn.mobile.search.Metronome.js
 * @class       nhn.mobile.search.Metronome
 *                      메트로놈 Class
 * @update  2014.08.08
 */
 
typeof window.nhn == 'undefined' && (window.nhn = {});
nhn.mobile = nhn.mobile || {};
nhn.mobile.search = nhn.mobile.search || {};
 
nhn.mobile.search.Metronome = $Class({
    /**
     * nhn.mobile.search.FamilyEventEnvelope 클래스의 인스턴스 생성
     *
     * @constructs
     * @param {HTMLElement} elContainer 기준 엘리먼트
     * @param {HashTable} htOption 옵션 정보
     */
    $init : function(elContainer, htOption) {
        this._initVar(elContainer, htOption);   // Variable 정의
        this._assignElement();          // Element 설정
        this._attachEvent();            // 이벤트 바인딩
        this._makeSlider();                     // 템포 조절 슬라이드 바 생성 (this._oSlider)
        this._makeAudio();                      // Beep 오디오 생성
        this._setScreenOnOff();         // 화면유지 기능 설정
    },
   
    // Variable 정의
    // @param {HTMLElement} elContainer 기준 엘리먼트
    // @param {HashTable} htOption 옵션 정보
    _initVar : function(elContainer, htOption) {
        this._elContainer = elContainer;
        this._htOption = htOption;
       
        this._bPlaySoundW = (typeof htOption.sound_w !== "undefined") ? htOption.sound_w : true;
        this._bPlaySoundS = (typeof htOption.sound_s !== "undefined") ? htOption.sound_s : true;
        this._nRepeats = (typeof htOption.repeats !== "undefined") ? htOption.repeats : 999999;
        this._bScreenOn = htOption.screen_on || false;  // 화면유지 기능 (true = 화면 켜짐 유지 | false = 화면 켜짐 유지하지 않음)
       
        this._MAX_BPM = 208;
        this._MIN_BPM = 40;
        this._DEFAULT_BPM = 120;
       
        this._aTimes = ["0","2","3","4","5","6"];
        this._sDefaultTimes = "4";
        this._nTickCount = 0;
    },
   
    // Element 설정
    _assignElement : function() {
        this._elTimes = $$.getSingle("._times", this._elContainer);
        this._elStartStop = $$.getSingle("._startstop", this._elContainer);
        this._elBpm = $$.getSingle("._bpm", this._elContainer);
        this._elMetronomeContainer = $$.getSingle("._metronome_container", this._elContainer);
        this._elBeats = $$.getSingle("._beats", this._elContainer);
        this._elBtnBpmDecrease = $$.getSingle("._btn_bpm_decrease", this._elContainer);
        this._elBtnBpmIncrease = $$.getSingle("._btn_bpm_increase", this._elContainer);
        this._elIFrame = $$.getSingle("._screen_on_off", this._elContainer);
        this._elArrow = $$.getSingle("._arrow", this._elContainer);
        this._elDescription = $$.getSingle("._description", this._elContainer);
        this._elArrow = $$.getSingle("._arrow", this._elContainer);
        this._elDescLayer = $$.getSingle("._desc_layer", this._elContainer);
        this._elBtnTimesIncrease = $$.getSingle("._btn_times_increase", this._elContainer);
        this._elBtnTimesDecrease = $$.getSingle("._btn_times_decrease", this._elContainer);
    },
   
    // 이벤트 바인딩
    _attachEvent : function() {
        $Fn(this._onClickStartStop, this).attach(this._elStartStop, "click");
        $Fn(this._onIncreaseBpm, this).attach(this._elBtnBpmIncrease, "click");
        $Fn(this._onDecreaseBpm, this).attach(this._elBtnBpmDecrease, "click");
        $Fn(this._onIncreaseTimes, this).attach(this._elBtnTimesIncrease, "click");
        $Fn(this._onDecreaseTimes, this).attach(this._elBtnTimesDecrease, "click");
        $Fn(this._showDescription, this).attach(this._elDescription, "click");
    },
   
    // 템포 조절 슬라이드 바 생성
    _makeSlider : function() {
        var self = this;
       
        this._oSlider = new jindo.m.Slider('_slider',{
                 nMinValue : 40,
                 nMaxValue : 208,
                 bVertical : false,
                 nDefaultValue : 40
        }).attach({
                'beforeChange' : function(oCustomEvt) {
                        var nBefore = oCustomEvt.nValue;
                        var nPos = Math.round(oCustomEvt.nValue);
                        oCustomEvt.nAdjustValue = nPos;
                },
                'change' : function(oCustomEvt){
                        $Element(self._elBpm).html(oCustomEvt.nAdjustValue);
            }
        });
    },
   
    // Beep 오디오 생성
    _makeAudio : function() {
        // initialize audio if need be
        if (this._bPlaySoundS && this._htOption.audio_s) {
            // initialize audio
            var elSoundS = document.createElement('audio');
            elSoundS.setAttribute('src', this._htOption.audio_s);
            elSoundS.setAttribute('id', 'tick_s');
            document.body.appendChild(elSoundS);
        }
       
        if (this._bPlaySoundW && this._htOption.audio_w) {
            // initialize audio
            var elSoundW = document.createElement('audio');
            elSoundW.setAttribute('src', this._htOption.audio_w);
            elSoundW.setAttribute('id', 'tick_w');
            document.body.appendChild(elSoundW);
        }
    },
   
    // 화면유지 기능 설정
    _setScreenOnOff : function() {
        this._elIFrame.src = "naversearchapp://screenon?isScreenOn=" + this._bScreenOn;
    },
       
    // 시작/중지 버튼 클릭 시
    _onClickStartStop : function(we) {
        var el = we.element;
       
        if ($Element(el).html() === "▶") {
           $Element(el).html("■");
                       
            //get values for bpm and ticks and restrict
            var nBpm = parseInt($Element(this._elBpm).html(), 10);
                       
            if (!nBpm) { nBpm = this._DEFAULT_BPM; }
            else if (nBpm > this._MAX_BPM) { nBpm = this._MAX_BPM; }
            else if (nBpm < this._MIN_BPM) { nBpm = this._MIN_BPM; }
            this._elBpm.setAttribute("value", nBpm);

            this._start(nBpm);
        } else {
            $Element(el).html("▶");
            this._stop();
        }
    },
   
    // Beep 재생
    _start : function(nBpm) {
        this._nTickCount = 0;
       
        //60000 ms per minute / bpm
        var nInterval = 60000 / nBpm;
       
        //beep animation
        var sTimes = $Element(this._elTimes).attr("value");
        var nTick = sTimes.split("/")[0];
               
        this._makeBeep(nTick);
               
        if(window._INTERVAL) {
            this._stop();
        }
       
        var self = this;
       
        window._INTERVAL = setInterval(function() {
            self._tick(nTick);
        }, nInterval);
    },
   
    // Beep 중지
    _stop : function() {
        clearInterval(window._INTERVAL);
    },
   
    _makeBeep: function(tick) {
        var aTemp = [];
       
        for(var i = 0; i < tick; i++) {
            aTemp.push("<div class='metronome' id='metr_seq_"+(i+1)+"'></div>");
        }
       
        $Element(this._elMetronomeContainer).html(aTemp.join(""));
    },
   
    // Beep을 표시하고 사운드를 재생함
    _tick : function(nTickEnd) {
        this._nTickCount += 1;
       
        // beep display
        for(var i = 0; i < nTickEnd; i++) {
            var elBeep = $$.getSingle("#metr_seq_"+(i+1));
            $Element(elBeep).removeClass("flash");
        }
               
        var el = $$.getSingle("#metr_seq_"+this._nTickCount);
        $Element(el).addClass("flash");
               
                // beep sound
        if (this._nTickCount == 1) {
            if (this._bPlaySoundS && el) {
                document.getElementById("tick_s").play();
            }
        } else {
            if (this._bPlaySoundW && el) {
                document.getElementById("tick_w").play();
            }
        }
       
        if(this._nTickCount >= nTickEnd) {
            this._nTickCount = 0;
        }
    },
   
    // 템포 증가
    _onIncreaseBpm: function(we) {
        we.stop();
       
        var nBpm = parseInt($Element(this._elBpm).html(), 10);
        $Element(this._elBpm).html(nBpm + 1);
       
        this._oSlider.setValue(nBpm + 1);
    },
       
    // 템포 감소
    _onDecreaseBpm: function(we) {
        we.stop();
       
        var nBpm = parseInt($Element(this._elBpm).html(), 10);
        $Element(this._elBpm).html(nBpm - 1);
       
        this._oSlider.setValue(nBpm - 1);
    },
   
    // 비트 증가
    _onIncreaseTimes : function(we) {
        we.stop();
       
        var sTimes = $Element(this._elTimes).attr("value");
        var nIndex = $A(this._aTimes).indexOf(sTimes);
       
        if(nIndex == this._aTimes.length - 1) {
            return;
        }
       
        var sNextTImes = this._aTimes[nIndex+1];
       
        $Element(this._elTimes).attr("value", sNextTImes);
    },
       
        // 비트 감소
    _onDecreaseTimes : function(we) {
        we.stop();
       
        var sTimes = $Element(this._elTimes).attr("value");
        var nIndex = $A(this._aTimes).indexOf(sTimes);
       
        if(nIndex == 0) {
            return;
        }
       
        var sNextTImes = this._aTimes[nIndex-1];
       
        $Element(this._elTimes).attr("value", sNextTImes);
    },
       
    // 빠르기말 참고 버튼 클릭 시 빠르기말 설명 레이어 노출
    _showDescription : function() {
        if($Element(this._elArrow).html() == "▼") {
            $Element(this._elArrow).html("▲");
            this._elDescLayer.style.display = "block";
        } else {
            $Element(this._elArrow).html("▼");
            this._elDescLayer.style.display = "none";
        }
    }
}).extend(jindo.m.Component);