webpackJsonp([0],[,function(t,e,s){t.exports=s(2)},function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=s(3),i=(s.n(a),s(0)),n=s.n(i),r=s(4),o=s(5),c=(s(6),s(7));const u=document.getElementById("main"),l=document.getElementById("error"),h=document.getElementById("start"),m=new r.a(u),d=new o.a;n.a.UserMedia.supported?h.addEventListener("click",()=>{d.setup(m),h.classList.add("start--clicked"),function(){const t=new c.a(m);d.setAgent(t)}()}):l.classList.add("error--visible")},function(t,e){},function(t,e,s){"use strict";const a="screen--flash";e.a=class{constructor(t,e){this.elem=t,this.timeout=null}setToColor(t){this.elem.style.backgroundColor="rgba("+t.join(",")+", 1)"}flash(t=100){this.timeout&&clearTimeout(this.timeout),this.elem.classList.add(a),this.timeout=setTimeout(()=>{this.elem.classList.remove(a)},t)}}},function(t,e,s){"use strict";var a=s(0),i=s.n(a);e.a=class{setup(){return this.startTime=Date.now(),this.mic=new i.a.UserMedia,this.analyser=new i.a.Waveform(256),this.mic.connect(this.analyser),this.mic.open(),this.update(),!0}close(){this.mic.close()}setAgent(t){this.agent=t,this.agent.start()}update(){window.requestAnimationFrame(()=>{if(!this.agent)return;const t=this.analyser.getValue(),e=Date.now()-this.startTime;this.agent.update(t,e),this.update()},this)}}},function(t,e,s){"use strict";var a=s(0);s.n(a)},function(t,e,s){"use strict";var a=s(0),i=s.n(a);const n=.1;e.a=class{constructor(t){this.visuals=t,this.synth=new i.a.PolySynth(6,i.a.Synth,{oscillator:{partials:[0,2,3,4]},envelope:{attack:.5}}).toMaster()}start(){Meyda.bufferSize=256}update(t,e){Meyda.extract(["rms","chroma"],t).rms>n&&(this.visuals.flash(),this.synth.triggerAttackRelease("C4",.1))}}}],[1]);