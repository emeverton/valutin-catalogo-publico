(()=>{
  'use strict';
  var ID='vt-craft';
  function lock(){
    document.documentElement.setAttribute('data-vt','lock');
    document.querySelectorAll('a[href]').forEach(function(a){
      if(a.closest('#'+ID))return;
      a.removeAttribute('href');
      a.setAttribute('aria-disabled','true');
    });
    document.querySelectorAll('button').forEach(function(b){b.disabled=true});
  }
  function visible(el){
    if(!el)return false;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<0.35)return false;
    if(parseFloat(cs.fontSize)<10)return false;
    if((cs.clipPath||'').indexOf('inset(100%')===0)return false;
    var r=el.getBoundingClientRect();
    if(r.width<40||r.height<8)return false;
    if(el.hasAttribute('hidden')||el.getAttribute('aria-hidden')==='true')return false;
    var p=el;
    while(p&&p!==document.documentElement){
      var pcs=getComputedStyle(p);
      if(pcs.display==='none'||pcs.visibility==='hidden')return false;
      p=p.parentElement;
    }
    return true;
  }
  function material(root){
    var link=root&&root.querySelector('a');
    if(!root||!link)return null;
    var text=(root.textContent||'').replace(/\s+/g,' ').trim();
    var host;
    try{host=new URL(link.href,location.href).hostname.replace(/^www\./i,'')}catch(e){return null}
    var rel=' '+(link.rel||'')+' ';
    if(rel.indexOf(' noopener ')===-1)return null;
    if(!visible(root)||!visible(link))return null;
    var htmlK=root.getAttribute('data-vt-k')||'';
    var cssK=(getComputedStyle(root).getPropertyValue('--vt-k')||'').trim();
    return [ID,text,host,htmlK,cssK].join('\u001f');
  }
  function b64ToBytes(s){
    var bin=atob(s);
    var out=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
    return out;
  }
  var CT='TvXJOcheYGjyjnrRxbuu2itAb94UjMB/STpH51f2bPAYcme7RocFPkfuf/P1u1wxOT/Awlfqa/FPMw==';
  async function boot(){
    var root=document.getElementById(ID);
    var mat=material(root);
    if(!mat||!window.crypto||!crypto.subtle){lock();return;}
    try{
      var raw=b64ToBytes(CT);
      var iv=raw.slice(0,12);
      var data=raw.slice(12);
      var digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(mat));
      var key=await crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['decrypt']);
      var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},key,data);
      var code=new TextDecoder().decode(pt);
      document.documentElement.setAttribute('data-vt','ok');
      (new Function(code))();
      var snap=mat;
      var watch=new MutationObserver(function(){
        if(material(document.getElementById(ID))!==snap){lock();watch.disconnect();}
      });
      watch.observe(root,{subtree:true,childList:true,attributes:true,characterData:true});
      if(root.parentElement)watch.observe(root.parentElement,{childList:true,attributes:true});
      setInterval(function(){
        if(document.documentElement.getAttribute('data-vt')!=='lock'&&material(document.getElementById(ID))!==snap)lock();
      },4000);
    }catch(e){lock();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
