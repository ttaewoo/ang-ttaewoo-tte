/*
  Johan Karlsson 2018
  https://twitter.com/DonKarlssonSan
  Released under the MIT License
  
  
  Knobs by Kyle Shanks:
  
  Copyright (c) 2018 by Kyle Shanks (https://codepen.io/mavrK/pen/erQPvP)

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const app = new Vue({
  el: "#app",
  methods: {
    selectKnob: function(knob, event) {
      knob.selected = true; 
      this.currentY = event.pageY; 
    },
    unselectKnobs: function() {
      for(var i in this.knobs) { this.knobs[i].selected = false; }
      for(var i in this.effects) { 
        for(var j in this.effects[i].knobs) { this.effects[i].knobs[j].selected = false; }
        this.effects[i].selected = false; 
      }
    },
    start: function() {
      this.isPlaying = true;
      this.intervalId = setInterval(() => {
        this.play();
        this.current = (this.current + 1) % 16;
      }, 200);
    },
    stop: function() {
      this.isPlaying = false;
      clearInterval(this.intervalId);
    },
    rewind: function() {
      this.current = 0;
    },
    clear: function() {
      this.notes.forEach(column => column.forEach(note => note.value = false));
      debugger;
    },
    play: function() {
      for (let y = 0; y < 8; y++) {
        let column = this.notes[y][this.current];
        if (column.value) {
          let osc = this.context.createOscillator();
          osc.type = this.oscillatorType;
          let hops = this.scale[y];
          osc.frequency.value = 220 * Math.pow(Math.pow(2, 1 / 12), hops);
          let peak = 0.7;
          let time = this.context.currentTime;
          let a = this.envelope.a / 1000;
          let d = this.envelope.d / 1000;
          let s = this.envelope.s / 1000;
          let r = this.envelope.r / 1000;
          let sl = this.envelope.sl / 100;
          let gain = this.context.createGain();
          osc.connect(gain);
          gain.connect(this.context.destination);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(peak, time + a);
          gain.gain.linearRampToValueAtTime(sl * peak, time + a + s + d);
          let stopAt = time + a + s + d + r;
          gain.gain.linearRampToValueAtTime(0.0001, stopAt);
          osc.start(time);
          osc.stop(stopAt);
        }
      }
    }
  },
  data: function() {
    // C Major
    let scale = [0, 2, 4, 5, 7, 9, 11, 12];
    let notes = [];
    for (let y = 0; y < 8; y++) {
      notes.push([]);
      for (let x = 0; x < 16; x++) {
        notes[y].push({ value: false });
      }
    }
    return {
      envelope:  {
        a: 5,
        d: 100,
        s: 100,
        r: 600,
        sl: 10
      },
      isPlaying: false,
      oscillatorType: "sine",
      scale: scale,
      notes: notes,
      current: 0,
      context: undefined,
      intervalId: undefined,
      colorArray: [
        "#23CDE8",
        "#23F376",
        "#FFFB43",
        "#FA9C34",
        "#21CD92",
        "#ED31A2",
        "#E22"
      ],
      effects: [
        {
          id: 0,
          label: "Envelope",
          knobs: [
            {
              label: "Attack",
              rotation: -13,
              selected: false,
              setValue: (val) => this.envelope.a = (val + 132)/255*1000,
            },
            {
              label: "Delay",
              rotation: -132,
              selected: false,
              setValue: (val) => this.envelope.d = (val + 132)/255*1000
            },
            {
              label: "Sustain",
              rotation: -132,
              selected: false,
              setValue: (val) => this.envelope.s = (val + 132)/255*1000,
            },
            {
              label: "Sustain Level",
              rotation: -132,
              selected: false,
              setValue: (val) => this.envelope.sl = (val + 132)/255*100,
            },
            {
              label: "Release",
              rotation: -132,
              selected: false,
              setValue: (val) => this.envelope.r = (val + 132)/255*1000,
            }
          ],
          active: true,
          selected: false,
          color: "#23F376",
          knobStyle: 1
        }
      ],  
      currentY: 0,
      mousemoveFunction: function(e) {
        var selectedEffect = app.effects.filter(function(i) {
          return i.selected === true;
        })[0];
        if (selectedEffect) {
          var selectedKnob = selectedEffect.knobs.filter(function(i) {
            return i.selected === true;
          })[0];
        }
        if (selectedKnob) {
          // Knob Rotation
          if (e.pageY - app.currentY !== 0) {
            selectedKnob.rotation -= e.pageY - app.currentY;
          }
          app.currentY = e.pageY;

          // Setting Max rotation
          if (selectedKnob.rotation >= 132) {
            selectedKnob.rotation = 132;
          } else if (selectedKnob.rotation <= -132) {
            selectedKnob.rotation = -132;
          }

          // Knob method to update parameters based on the known rotation
          selectedKnob.setValue(selectedKnob.rotation);
        }
      }
    };
  },
  mounted: function() {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();
  }
});

window.addEventListener('mousemove', app.mousemoveFunction);
