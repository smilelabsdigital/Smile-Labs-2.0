/* Smile Labs Digital - premium Android UI. No API secrets bundled. */
'use strict';
const API_ROOT=window.location.origin;
const $=id=>document.getElementById(id);
const state={screen:'welcome',user:null,token:'',email:'',style:'whitening',shade:'A2',image:null,after:null,before:null,loading:false,adminPassword:''};
const screens=['welcome','access','dashboard','studio','results','account'];
function show(name){if(!screens.includes(name))return;state.screen=name;screens.forEach(s=>$(s).classList.toggle('is-active',s===name));$('bottomNav').classList.toggle('is-visible',!!state.user&&name!=='welcome'&&name!=='access');document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));window.scrollTo({top:0,behavior:'instant'});}
function note(id,msg){$(id).textContent=msg||'';}
function setLoading(btn,busy,msg){state.loading=busy;btn.disabled=busy;if(msg)btn.dataset.original ||= btn.textContent;btn.textContent=busy?(msg||'Please wait…'):(btn.dataset.original||btn.textContent);}
function encode(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function request(path,body,method='POST'){
 const headers={'Accept':'application/json','X-Smile-Mobile-App':'1'};
 if(body!==undefined)headers['Content-Type']='application/json';
 if(state.token)headers.Authorization=`Bearer ${state.token}`;
 const url=API_ROOT+path;
 let status,data;
 try{
  const native=window.Capacitor?.Plugins?.CapacitorHttp;
  if(native && window.Capacitor.isNativePlatform?.()){
   const r=await native.request({url,method,headers,data:body,responseType:'json',connectTimeout:20000,readTimeout:175000});
   status=r.status;data=typeof r.data==='string'?JSON.parse(r.data):r.data;
  } else {
   const r=await fetch(url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});
   status=r.status;data=await r.json();
  }
 }catch(e){throw Error('Could not connect to Smile Labs. Check your internet connection and try again.');}
 if(status>=400)throw Error(data?.error||`Request failed (${status})`);
 return data;
}
function signedIn(r){state.user=r.user;state.token=r.mobileToken||state.token;renderUser();show('dashboard');}
function renderUser(){const u=state.user;if(!u)return;$('deleteAccountSection').hidden=u.role!=='dentist';if(u.role==='dentist')$('deleteAccountEmail').textContent=u.email||'';const remaining=u.adminTester?'Unlimited':`${Math.max(0,(u.limit||0)-(u.used||0))} of ${u.limit||0}`;$('credits').textContent=remaining;$('creditNote').textContent=u.adminTester?'Administrator access — no preview limit':u.approved?'GDC approval confirmed · 30 total previews':u.role==='dentist'?'10 previews initially · 20 more after GDC approval':'One complimentary guest preview';$('welcomeUser').textContent=u.name&&u.name!=='Guest'?`Welcome, ${u.name.split(' ')[0]}. Your smile studio is ready.`:'Your complimentary AI preview is ready.';$('accountDetails').innerHTML=`<p><strong>${encode(u.name||'Guest')}</strong></p><p>${encode(u.email||'Guest access')}</p><p>Access: ${u.adminTester?'Administrator':u.role==='dentist'?'Dental professional':'Guest'}</p><p>Preview allowance: ${encode(remaining)}</p>${u.gdc?`<p>GDC: ${encode(u.gdc)} · ${u.approved?'Approved':'Awaiting manual review'}</p>`:''}`;}
function openStudio(style){if(!state.user){show('access');return;}state.style=style||state.style;const names={whitening:'Teeth Whitening',missing:'Missing Teeth',makeover:'Smile Makeover'};$('studioTitle').innerHTML=names[state.style]?.replace(/(\S+)$/,'<em>$1</em>')||names.whitening;$('shadeArea').hidden=state.style!=='whitening';note('studioNotice','');show('studio');}
$('welcomeStart').addEventListener('click',()=>show('access'));
$('welcomeSignIn').addEventListener('click',()=>{show('access');switchTab('login');});
$('topAccount').addEventListener('click',()=>show(state.user?'account':'access'));
function switchTab(tab){$('authChoice').hidden=tab!=='login';$('adminLoginForm').hidden=true;$('loginForm').hidden=true;$('registerForm').hidden=tab!=='register';$('verifyForm').hidden=true;$('tabLogin').classList.toggle('selected',tab==='login');$('tabRegister').classList.toggle('selected',tab==='register');note('authNotice','');}
$('tabLogin').addEventListener('click',()=>switchTab('login'));
$('tabRegister').addEventListener('click',()=>switchTab('register'));
$('openEmailLogin').addEventListener('click',()=>{$('authChoice').hidden=true;$('loginForm').hidden=false;note('authNotice','');});
$('openAdminLogin').addEventListener('click',()=>{$('authChoice').hidden=true;$('adminLoginForm').hidden=false;note('authNotice','');});
$('backToLoginChoice').addEventListener('click',()=>switchTab('login'));
$('backFromEmail').addEventListener('click',()=>switchTab('login'));
$('adminLoginForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]');setLoading(button,true,'Signing in…');try{const f=new FormData(form);const r=await request('/api/admin-login',{email:String(f.get('email')).trim(),password:String(f.get('password'))});form.reset();signedIn(r);note('authNotice','');}catch(err){note('authNotice',err.message);}finally{setLoading(button,false);}});

$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button[type=submit]');setLoading(btn,true,'Sending code…');try{const email=new FormData(e.currentTarget).get('email').trim();await request('/api/login',{email});state.email=email;$('verifyHint').textContent=`We've sent a 6-digit code to ${email}.`;$('verifyForm').hidden=false;$('loginForm').hidden=true;$('registerForm').hidden=true;note('authNotice','');}catch(err){note('authNotice',err.message);}finally{setLoading(btn,false);}});
$('registerForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button[type=submit]');setLoading(btn,true,'Registering…');try{const f=new FormData(e.currentTarget),payload={role:'dentist',name:f.get('name'),email:f.get('email'),gdc:f.get('gdc'),phone:f.get('phone'),clinic:f.get('clinic'),address:f.get('address'),terms:!!f.get('terms'),imageAcknowledgement:!!f.get('imageAcknowledgement')};await request('/api/register',payload);state.email=payload.email;$('verifyHint').textContent=`Enter the verification code sent to ${state.email}.`;$('verifyForm').hidden=false;$('loginForm').hidden=true;$('registerForm').hidden=true;note('authNotice','');}catch(err){note('authNotice',err.message);}finally{setLoading(btn,false);}});
$('verifyForm').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button[type=submit]');setLoading(btn,true,'Verifying…');try{const r=await request('/api/verify',{email:state.email,code:new FormData(e.currentTarget).get('code')});signedIn(r);}catch(err){note('authNotice',err.message);}finally{setLoading(btn,false);}});
$('guestStart').addEventListener('click',async e=>{const btn=e.currentTarget;setLoading(btn,true,'Opening studio…');try{const r=await request('/api/guest',{});signedIn(r);}catch(err){note('authNotice',err.message);}finally{setLoading(btn,false);}});
document.querySelectorAll('[data-treatment]').forEach(b=>b.addEventListener('click',()=>openStudio(b.dataset.treatment)));
document.querySelectorAll('[data-shade]').forEach(b=>b.addEventListener('click',()=>{state.shade=b.dataset.shade;document.querySelectorAll('[data-shade]').forEach(x=>x.classList.toggle('selected',x===b));}));
$('backDashboard').addEventListener('click',()=>show('dashboard'));
$('backStudio').addEventListener('click',()=>show('studio'));
$('backAccount').addEventListener('click',()=>show(state.user?'dashboard':'welcome'));
function photoAllowed(){if(!$('photoConsent').checked){note('studioNotice','Please tick the photo consent box before uploading.');return false;}return true;}
$('takePhoto').addEventListener('click',()=>{if(photoAllowed())$('cameraInput').click();});
$('choosePhoto').addEventListener('click',()=>{if(photoAllowed())$('fileInput').click();});
async function loadPhoto(file){if(!file||!photoAllowed())return;if(file.size>7*1024*1024){note('studioNotice','Maximum photo size is 7 MB.');return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){note('studioNotice','Please use a JPG, PNG or WebP photo.');return;}
 const reader=new FileReader();reader.onload=()=>{state.image=reader.result;state.after=null;$('uploadPreview').innerHTML='<img alt="Selected smile photo" src="'+state.image+'">';note('studioNotice','Photo ready. Generate your preview when you are ready.');};reader.onerror=()=>note('studioNotice','Could not read this photograph.');reader.readAsDataURL(file);}
$('cameraInput').addEventListener('change',e=>{loadPhoto(e.target.files[0]);e.target.value='';});
$('fileInput').addEventListener('change',e=>{loadPhoto(e.target.files[0]);e.target.value='';});
$('photoConsent').addEventListener('change',e=>{if(!e.target.checked){state.image=null;state.after=null;$('uploadPreview').innerHTML='<span>✧</span><p>Your photograph will appear here</p>';note('studioNotice','Consent withdrawn. The selected photo has been cleared.');}});
$('generate').addEventListener('click',async e=>{if(!photoAllowed())return;if(!state.image){note('studioNotice','Please add a photograph first.');return;}if(!state.user){show('access');return;}
const btn=e.currentTarget;setLoading(btn,true,'Creating your preview…');note('studioNotice','Generating a cosmetic simulation. This may take a minute.');try{const r=await request('/api/generate',{image:state.image,style:state.style,shade:state.shade,consent:true,photoConsentVersion:'v1-cosmetic-preview'});state.user=r.user;state.before=state.image;state.after=r.image;renderUser();['beforeImg','sliderBefore'].forEach(id=>$(id).src=state.before);['afterImg','sliderAfter'].forEach(id=>$(id).src=state.after);setRange(50);show('results');}catch(err){note('studioNotice',err.message);}finally{setLoading(btn,false);}});
function setRange(n){const k=Math.max(0,Math.min(100,Number(n)||0));$('sliderMask').style.clipPath=`inset(0 ${100-k}% 0 0)`;$('sliderLine').style.left=`${k}%`;$('compareRange').value=k;}
$('compareRange').addEventListener('input',e=>setRange(e.target.value));
$('newPreview').addEventListener('click',()=>{state.image=null;state.after=null;$('photoConsent').checked=false;$('uploadPreview').innerHTML='<span>✧</span><p>Your photograph will appear here</p>';note('studioNotice','');show('dashboard');});
$('share').addEventListener('click',async()=>{if(!state.after)return;try{const bin=atob(state.after.split(',')[1]);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const file=new File([bytes],'smile-labs-preview.png',{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Smile Labs cosmetic preview'});else{const a=document.createElement('a');a.href=state.after;a.download='smile-labs-preview.png';a.click();}}catch(e){if(e.name!=='AbortError')alert('Saving is unavailable on this device.');}});
$('accountSignout').addEventListener('click',async()=>{try{await request('/api/logout',{});}catch(e){/* continue local logout */}state.user=null;state.token='';state.image=null;state.before=null;state.after=null;$('photoConsent').checked=false;switchTab('login');show('welcome');});
// Deletion is separate from ordinary sign-out; it requires an email OTP.
$('showDeleteAccount').addEventListener('click',()=>{if(state.user?.role!=='dentist')return;$('deleteAccountFlow').hidden=false;note('deleteNotice','');});
$('cancelDelete').addEventListener('click',()=>{$('deleteAccountFlow').hidden=true;$('confirmDeleteForm').hidden=true;note('deleteNotice','');});
$('sendDeleteCode').addEventListener('click',async e=>{
 if(state.user?.role!=='dentist'||!state.user.email)return;
 const btn=e.currentTarget;setLoading(btn,true,'Sending…');
 try{const r=await request('/api/account/delete-request',{email:state.user.email});$('confirmDeleteForm').hidden=false;note('deleteNotice',r.message+' Please check your inbox.');}
 catch(err){note('deleteNotice',err.message);}finally{setLoading(btn,false);}
});
$('confirmDeleteForm').addEventListener('submit',async e=>{
 e.preventDefault();if(state.user?.role!=='dentist')return;
 const form=e.currentTarget,code=new FormData(form).get('code');
 if(!confirm('Permanently delete your Smile Labs Digital account? This cannot be undone.'))return;
 const btn=form.querySelector('button[type=submit]');setLoading(btn,true,'Deleting…');
 try{
  const r=await request('/api/account/delete-confirm',{email:state.user.email,code});
  if(!r.deleted)throw Error('The server did not confirm deletion.');
  state.user=null;state.token='';state.email='';state.image=null;state.before=null;state.after=null;state.adminPassword='';
  $('photoConsent').checked=false;$('deleteAccountFlow').hidden=true;form.reset();form.hidden=true;
  switchTab('login');show('welcome');alert('Your account has been deleted.');
 }catch(err){note('deleteNotice',err.message);}finally{setLoading(btn,false);}
});
$('adminForm').addEventListener('submit',async e=>{e.preventDefault();const p=new FormData(e.currentTarget).get('password');try{const r=await request('/api/admin',{password:p});state.adminPassword=p;renderAdmin(r);note('accountNotice','');}catch(err){note('accountNotice',err.message);}});
function renderAdmin(r){const box=$('adminList');box.replaceChildren();const title=document.createElement('p');title.textContent=`${r.users?.length||0} accounts · ${r.events?.length||0} recent activities`;box.append(title);(r.users||[]).filter(u=>u.role==='dentist').forEach(u=>{const row=document.createElement('div');row.className='admin-row';row.innerHTML=`<strong>${encode(u.name)} · GDC ${encode(u.gdc)}</strong>${encode(u.email)}<br>${encode(u.clinic||'')} · ${u.approved?'Approved':'Pending manual GDC check'}<br>${u.used||0} uses`;const button=document.createElement('button');button.className='outline';button.textContent=u.approved?'Revoke approval':'Approve +20 previews';button.addEventListener('click',async()=>{if(!u.approved&&!confirm(`Have you manually verified GDC ${u.gdc} for ${u.name}?`))return;try{const r=await request('/api/admin',{password:state.adminPassword,id:u.id,action:u.approved?'reject':'approve'});renderAdmin(r);}catch(err){note('accountNotice',err.message);}});row.append(button);box.append(row);});}
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.nav==='studio')openStudio(state.style);else show(b.dataset.nav);}));
show('welcome');
// Browser sessions use HttpOnly, same-origin cookies, not localStorage.
// Restore an existing verified or guest session after a page refresh.
(async function restoreBrowserSession(){
 try{
  const r=await request('/api/status',undefined,'GET');
  if(r?.user?.verified){state.user=r.user;renderUser();show('dashboard');}
 }catch(e){/* Welcome remains available when offline or signed out. */}
})();
