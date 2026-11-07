// Authentification Supabase : identifiant NovaAdmin associé à l'adresse e-mail du compte.
const LOGIN_USER='NovaAdmin';
const SUPABASE_EMAIL='gestionproprety@gmail.com';
const AUTH_SESSION='novapay.auth.session';
const AUTH_ACTIVITY='novapay.auth.activity';
const AUTH_IDLE_MS=30*60*1000;
const supabaseClient = window.supabase.createClient(window.NOVA_SUPABASE_URL, window.NOVA_SUPABASE_PUBLISHABLE_KEY);
let cloudReady=false, cloudSaveTimer=null, cloudSaving=Promise.resolve();
function endAuth(){sessionStorage.removeItem(AUTH_SESSION);sessionStorage.removeItem(AUTH_ACTIVITY);supabaseClient.auth.signOut().catch(console.error);showLogin();}
function touchAuth(){if(sessionStorage.getItem(AUTH_SESSION)==='ok')sessionStorage.setItem(AUTH_ACTIVITY,String(Date.now()));}
if(sessionStorage.getItem(AUTH_SESSION)==='ok' && Date.now()-Number(sessionStorage.getItem(AUTH_ACTIVITY)||0)>AUTH_IDLE_MS){sessionStorage.removeItem(AUTH_SESSION);sessionStorage.removeItem(AUTH_ACTIVITY);}
const loginScreen=document.getElementById('loginScreen');
const appShell=document.getElementById('appShell');
function showApp(){loginScreen.hidden=true;appShell.hidden=false;}
function showLogin(){appShell.hidden=true;loginScreen.hidden=false;document.getElementById('loginPassword').value='';document.getElementById('loginError').textContent='';}
showLogin();
document.getElementById('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();const user=document.getElementById('loginUser').value.trim();const pass=document.getElementById('loginPassword').value;
 const error=document.getElementById('loginError');
 if(user!==LOGIN_USER){error.textContent='Identifiant ou mot de passe incorrect.';return;}
 const form=document.getElementById('loginForm'), progress=document.getElementById('loginProgress'), title=document.getElementById('loginProgressTitle'), detail=document.getElementById('loginProgressText'), spinner=document.getElementById('loginSpinner');
 const submit=form.querySelector('button[type=submit]');submit.disabled=true;progress.hidden=false;title.textContent='Connexion en cours…';detail.textContent='Vérification sécurisée de vos accès';
 try{
   const {data,error:authError}=await supabaseClient.auth.signInWithPassword({email:SUPABASE_EMAIL,password:pass});
   if(authError) throw authError;
   title.textContent='Chargement de votre espace…';detail.textContent='Récupération de vos données synchronisées';
   await loadCloudState();
   spinner.classList.add('done');title.textContent='Connexion réussie';detail.textContent='Bienvenue dans votre espace Nova Pay';
   await new Promise(resolve=>setTimeout(resolve,450));
   sessionStorage.setItem(AUTH_SESSION,'ok');sessionStorage.setItem(AUTH_ACTIVITY,String(Date.now()));error.textContent='';
   progress.hidden=true;spinner.classList.remove('done');submit.disabled=false;showApp();document.getElementById('loginPassword').value='';renderAll();
 }catch(err){console.error('Supabase login:',err);error.textContent=err.message?.includes('Invalid login credentials')?'Identifiant ou mot de passe incorrect. Vérifiez le mot de passe du compte Supabase.':'Connexion impossible à Supabase. Vérifiez votre connexion et la configuration du projet.';progress.hidden=true;spinner.classList.remove('done');submit.disabled=false;}
});
document.getElementById('togglePassword').addEventListener('click',()=>{const f=document.getElementById('loginPassword');f.type=f.type==='password'?'text':'password';});
document.getElementById('logoutBtn').addEventListener('click',()=>{cloudReady=false;sessionStorage.removeItem('novapay.personalize.unlocked');endAuth();showLogin();document.getElementById('loginUser').value='';document.getElementById('loginUser').focus();});

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ICONS={
grid:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',
send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
'credit-card':'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.5 2.6-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.9h-3l-.3-1.9a8 8 0 0 1-1.8-1l-1.7.7-1.5-2.6 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.5-2.6 1.7.7a8 8 0 0 1 1.8-1l.3-1.9h3l.3 1.9a8 8 0 0 1 1.8 1l1.7-.7 1.5 2.6-1.4 1.1a7 7 0 0 1 0 2Z"/>',
'life-buoy':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="m5.6 5.6 4.3 4.3m4.2 4.2 4.3 4.3m0-12.8-4.3 4.3m-4.2 4.2-4.3 4.3"/>',
'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
'calendar-days':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
'arrow-left-right':'<path d="M17 3 21 7l-4 4M3 7h18M7 21l-4-4 4-4m14 4H3"/>',
wallet:'<path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13"/><path d="M21 11h-5a2 2 0 0 0 0 4h5"/>',
'receipt-text':'<path d="M4 3h16v18l-3-2-3 2-2-2-3 2-2-2-3 2Z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
'sliders-horizontal':'<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
'arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
'lock':'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>','eye-off':'<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/>','trending-up':'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>','shield-check':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
lightbulb:'<path d="M9 18h6m-5 4h4m-5-7a7 7 0 1 1 6 0c-.7.5-1 1.1-1 2h-4c0-.9-.3-1.5-1-2Z"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
history:'<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5m4-1v5l3 2"/>',
plus:'<path d="M12 5v14m-7-7h14"/>',
'chevron-right':'<path d="m9 18 6-6-6-6"/>',
'user-round':'<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5-5 5 5m-5-5v12"/>',
'trash-2':'<path d="M3 6h18m-2 0-1 15H6L5 6m4 0V4h6v2m-5 4v7m4-7v7"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
'chevron-down':'<path d="m6 9 6 6 6-6"/>',
check:'<path d="m5 12 4 4L19 6"/>',
receipt:'<path d="M4 3h16v18l-3-2-3 2-2-2-3 2-2-2-3 2Z"/><path d="M8 8h8M8 12h8"/>'
};
function renderIcons(){ $$('[data-icon]').forEach(el=>{const key=el.dataset.icon;el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key]||''}</svg>`;});}
renderIcons();
const KEY='novapay.local.v1';
const fresh=()=>({schemaVersion:2,profile:{name:'Keisha Sarah MIJNLEVEN',email:'',currency:'EUR'},openingBalance:100000,balanceAdjustment:0,beneficiaries:[],transactions:[],cardEnabled:false,cardLocked:false,accountLocked:false,limitRequest:false});
let state=load();
// Première ouverture de cette version : appliquer le solde de départ demandé.
if(!state.migratedEuro100k){
  state.openingBalance=100000;
  state.profile={...(state.profile||{}),currency:'EUR'};
  state.migratedEuro100k=true;
}
if(!state.migratedAccountHolder){
  state.profile={...(state.profile||{}),name:'Keisha Sarah MIJNLEVEN'};
  state.migratedAccountHolder=true;
}
localStorage.setItem(KEY,JSON.stringify(state));
function load(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'{}');
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return fresh();
  const merged={...fresh(),...raw,profile:{...fresh().profile,...(raw.profile||{})}};
  merged.openingBalance=Number.isFinite(Number(merged.openingBalance))?Math.max(0,Number(merged.openingBalance)):100000;
  merged.balanceAdjustment=Number.isFinite(Number(merged.balanceAdjustment))?Number(merged.balanceAdjustment):0;
  merged.transactions=Array.isArray(merged.transactions)?merged.transactions.filter(t=>t&&Number.isFinite(Number(t.amount))&&Number(t.amount)>0&&typeof t.name==='string').map(t=>({...t,amount:Number(t.amount),fee:Number(t.fee)||0,totalDebited:Number(t.totalDebited)||Number(t.amount),date:t.date||new Date().toISOString()})):[];
  merged.beneficiaries=Array.isArray(merged.beneficiaries)?merged.beneficiaries.filter(b=>b&&typeof b.name==='string'&&typeof b.account==='string'):[];
  return merged;
 }catch{return fresh();}
}
async function loadCloudState(){
  const {data,error}=await supabaseClient.from('account_settings').select('settings').maybeSingle();
  if(error) throw error;
  const remote=data?.settings?.novapay_state;
  if(remote && typeof remote==='object'){
    state={...fresh(),...remote,profile:{...fresh().profile,...(remote.profile||{})}};
    localStorage.setItem(KEY,JSON.stringify(state));
  }else{
    // Première connexion : importer les données déjà présentes sur cet appareil.
    const local=load();state={...fresh(),...local,profile:{...fresh().profile,...(local.profile||{})}};
    const {error:writeError}=await supabaseClient.from('account_settings').upsert({user_id:(await supabaseClient.auth.getUser()).data.user.id,settings:{novapay_state:state},updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(writeError) throw writeError;
  }
  cloudReady=true;localStorage.setItem(KEY,JSON.stringify(state));
}
function queueCloudSave(){
  if(!cloudReady)return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer=setTimeout(()=>{
    const snapshot=JSON.parse(JSON.stringify(state));
    cloudSaving=cloudSaving.then(async()=>{
      const {data:{user}}=await supabaseClient.auth.getUser();if(!user)return;
      const {error}=await supabaseClient.from('account_settings').upsert({user_id:user.id,settings:{novapay_state:snapshot},updated_at:new Date().toISOString()},{onConflict:'user_id'});
      if(error){console.error('Sauvegarde Supabase:',error);toast('Synchronisation impossible. Vérifiez votre connexion.');}
    }).catch(err=>console.error(err));
  },500);
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));renderAll();queueCloudSave();}catch(err){console.error(err);toast('Impossible d’enregistrer : espace de stockage indisponible. Exportez vos données.');}}
function money(n,c=state.profile.currency){try{return new Intl.NumberFormat('fr-FR',{style:'currency',currency:c,maximumFractionDigits:2}).format(Number(n)||0);}catch{return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(Number(n)||0)+' '+c;}}
function getCurrencies(){
  try{return Intl.supportedValuesOf('currency').sort();}
  catch{return ['AED','AUD','BRL','CAD','CHF','CNY','EUR','GBP','GHS','INR','JPY','KES','MAD','NGN','RWF','SAR','TND','UGX','USD','XAF','XOF','ZAR'];}
}
function populateCurrencies(){
  const codes=getCurrencies();
  const names=new Intl.DisplayNames(['fr'],{type:'currency'});
  ['#profileCurrency','#transferCurrency'].forEach(sel=>{
    if(!$(sel))return; const current=sel.value||state.profile.currency;
    sel.innerHTML=codes.map(code=>`<option value="${code}">${code} — ${safe(names.of(code)||code)}</option>`).join('');
    sel.value=codes.includes(current)?current:(codes.includes(state.profile.currency)?state.profile.currency:'EUR');
  });
}
function currentBalance(){return Number(state.openingBalance||0)+Number(state.balanceAdjustment||0)-state.transactions.reduce((s,t)=>s+Number(t.totalDebited??(Number(t.amount)+(Number(t.fee)||0))),0);}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const pageNames={dashboard:"Vue d'ensemble",transfers:"Virements",activity:"Opérations",beneficiaries:"Bénéficiaires",cards:"Cartes",settings:"Paramètres"};
function go(page){if(!pageNames[page])return;if(page==='settings' && sessionStorage.getItem('novapay.personalize.unlocked')!=='yes'){openPersonalPin();return;}$$('.page').forEach(p=>{p.classList.toggle('active',p.id===page);if(p.id===page){p.classList.remove('page-enter-once');void p.offsetWidth;p.classList.add('page-enter-once');}});$$('.nav-link,.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#pageCrumb').textContent=pageNames[page];$('#sidebar').classList.remove('open');if(page==='transfers')updateTransferSummary();window.scrollTo({top:0,behavior:'smooth'});}
$$('[data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
const PERSONAL_PIN_HASH='a6f297ae4d0c1627c1fa4e8eabb3167888b1935bbc48431d78786afdbef09ff7';
let pinPurpose='personalize';
function openPin(purpose,title,description){pinPurpose=purpose;$('#pinTitle').textContent=title||'Accès protégé';$('#pinForm p').textContent=description||'Entrez votre code confidentiel pour continuer.';const back=$('#pinBackdrop');back.hidden=false;$('#personalPin').value='';$('#pinError').textContent='';setTimeout(()=>$('#personalPin').focus(),50);}
function openPersonalPin(){openPin('personalize','Espace personnaliser','Entrez votre code confidentiel pour accéder à cette rubrique.');}
function closePersonalPin(){ $('#pinBackdrop').hidden=true; }
$('#pinClose').addEventListener('click',closePersonalPin);
$('#pinBackdrop').addEventListener('click',e=>{if(e.target===$('#pinBackdrop'))closePersonalPin();});
$('#pinForm').addEventListener('submit',async e=>{
 e.preventDefault();const value=$('#personalPin').value;
 if(!window.crypto?.subtle){$('#pinError').textContent='Vérification indisponible. Ouvrez Nova Pay via HTTPS.';return;}
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==PERSONAL_PIN_HASH){$('#pinError').textContent='Code incorrect. Accès refusé.';$('#personalPin').value='';$('#personalPin').focus();return;}
 const action=pinPurpose;closePersonalPin();
 if(action==='personalize'){sessionStorage.setItem('novapay.personalize.unlocked','yes');go('settings');}
 if(action==='reveal-card'){if(state.cardLocked){toast('Déverrouillez d’abord la carte.');return;}$('#virtualCardNumber').innerHTML='4829 &nbsp; 1736 &nbsp; 2048 &nbsp; 6157';$('#cardExpiry').textContent='08/29';$('#cardVisibilityLabel').textContent='Informations affichées';$('#revealCard').innerHTML='Masquer les informations <i data-icon="eye-off"></i>';$('#revealCard').dataset.revealed='1';renderIcons();}
 if(action==='toggle-card-lock'){state.cardLocked=!state.cardLocked;if(state.cardLocked){state.cardEnabled=false;maskCardInfo();}save();toast(state.cardLocked?'Carte verrouillée.':'Carte déverrouillée.');}
 if(action==='toggle-account-lock'){state.accountLocked=!state.accountLocked;save();toast(state.accountLocked?'Compte verrouillé.':'Compte déverrouillé.');}
 if(action==='unlimit'){state.limitRequest=true;save();toast('Votre demande de révision des plafonds a été enregistrée dans cette maquette.');}
});
function maskCardInfo(){$('#virtualCardNumber').innerHTML='•••• &nbsp; •••• &nbsp; •••• &nbsp; ••••';$('#cardExpiry').textContent='••/••';$('#cardVisibilityLabel').textContent='Informations masquées';$('#revealCard').dataset.revealed='0';$('#revealCard').innerHTML='Afficher les informations <i data-icon="eye"></i>';renderIcons();}
$('#revealCard').addEventListener('click',()=>{if($('#revealCard').dataset.revealed==='1'){maskCardInfo();return;}openPin('reveal-card','Afficher les informations','Saisissez votre code personnel pour révéler les données de la carte.');});
$('#toggleCardLock').addEventListener('click',()=>openPin('toggle-card-lock',state.cardLocked?'Déverrouiller la carte':'Verrouiller la carte','Confirmez cette action avec votre code personnel.'));
$('#toggleAccountLock').addEventListener('click',()=>openPin('toggle-account-lock',state.accountLocked?'Déverrouiller le compte':'Verrouiller le compte','Confirmez cette action avec votre code personnel.'));
$('#unlimitAccount').addEventListener('click',()=>openPin('unlimit','Déplafonner le compte','Saisissez votre code personnel pour enregistrer une demande de révision des plafonds.'));
$('#toggleCard').addEventListener('click',()=>{if(state.cardLocked){toast('La carte est verrouillée. Déverrouillez-la d’abord.');return;}state.cardEnabled=!state.cardEnabled;save();toast(state.cardEnabled?'Présentation de carte activée.':'Présentation de carte désactivée.');});
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#helpBtn').addEventListener('click',()=>{showModal(`<div class="help-modal"><div class="help-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.6A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 9.5c.5 2 2 3.5 4 4"/></svg></div><div class="overline">CENTRE D’AIDE NOVA PAY</div><h2>Comment pouvons-nous vous aider ?</h2><p>En cas de réclamation, veuillez contacter par message WhatsApp le numéro du centre d’aide.</p><div class="help-number"><span>Numéro du centre d’aide</span><b>+33 7 87 79 17 93</b></div><a class="primary-btn help-whatsapp" href="https://wa.me/33644676476" target="_blank" rel="noopener">Contacter sur WhatsApp</a><button class="outline-btn" id="helpClose">Fermer</button></div>`);$('#helpClose').onclick=closeModal;});
const notifPanel=$('#notificationPanel');
function closeNotifications(){if(!notifPanel)return;notifPanel.classList.remove('visible');notifPanel.hidden=true;}
function openNotifications(){if(!notifPanel)return;const items=state.transactions.slice().reverse().slice(0,5);notifPanel.innerHTML=`<div class="notification-head"><b>Notifications récentes</b><span>${items.length} action(s)</span></div>${items.length?items.map(t=>`<div class="notification-item"><span class="notification-icon">↗</span><div><b>Virement enregistré</b><small>${safe(t.name)} · ${safe(new Date(t.date).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'medium'}))}</small><strong>${money(t.amount,t.currency)}</strong></div></div>`).join(''):'<div class="notification-empty">Aucune activité récente.</div>'}`;
notifPanel.hidden=false;requestAnimationFrame(()=>notifPanel.classList.add('visible'));notifPanel.querySelectorAll('.notification-item').forEach(item=>item.addEventListener('click',()=>{closeNotifications();go('activity');}));}
$('#notifBtn').addEventListener('click',e=>{e.stopPropagation();if(!notifPanel.hidden)closeNotifications();else openNotifications();});
document.addEventListener('click',e=>{if(notifPanel&&!notifPanel.hidden&&!notifPanel.contains(e.target)&&!e.target.closest('#notifBtn'))closeNotifications();});
$('#todayDate').textContent=new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date());

function renderAll(){populateCurrencies();renderProfile();renderDashboard();renderTransactions();renderBeneficiaries();renderCards();renderSettings();$('#currencySuffix').textContent=state.profile.currency;$('#transferCurrency').value=state.profile.currency;updateTransferSummary();}
function renderProfile(){const n=state.profile.name.trim();const initials=n?n.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase():'NP';$('#sideName').textContent=n||'Mon espace';$('#topName').textContent=n||'Mon profil';$('#sideAvatar').textContent=$('#topAvatar').textContent=initials;$('#welcomeTitle').textContent=n?`Bonjour, ${n.split(' ')[0]}.`:'Bienvenue sur Nova Pay.';$('#accountLabel').textContent=n?`Compte de ${n}`:'Compte Nova Pay';}
function renderDashboard(){const bal=currentBalance();$('#balanceValue').textContent=money(bal);$('#transferCount').textContent=state.transactions.length;$('#outTotal').textContent=money(state.transactions.reduce((s,t)=>s+Number(t.totalDebited??(t.amount+(Number(t.fee)||0))),0));const rows=state.transactions.slice().reverse().slice(0,5);$('#recentEmpty').hidden=rows.length>0;$('#recentRows').innerHTML=rows.map(transactionRow).join('');}
function transactionRow(t){const d=new Date(t.date);const fee=Number(t.fee)||0;return `<tr><td><b>Virement sortant</b><small>${safe(t.reference)}</small></td><td><b>${safe(t.name)}</b><small>${safe(t.reason||'Sans motif')}</small></td><td><b>${d.toLocaleDateString('fr-FR')}</b><small>${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</small></td><td><span class="status-pill">Enregistré</span></td><td class="align-right"><b class="amount-positive">− ${money(t.amount,t.currency)}</b><small class="fee-line">Frais : ${money(fee,t.currency)}</small><small class="total-debit-line">Total débité : ${money(Number(t.totalDebited??(t.amount+fee)),t.currency)}</small></td></tr>`;}
function renderTransactions(){const q=($('#activitySearch')?.value||'').toLowerCase();const status=$('#activityFilter').value;
 const rows=state.transactions.slice().reverse().filter(t=>(t.name+' '+(t.reason||'')+' '+t.reference).toLowerCase().includes(q) && (status==='all'||status==='completed'));$('#activityRows').innerHTML=rows.map(transactionRow).join('');$('#activityEmpty').style.display=rows.length?'none':'flex';}
$('#activitySearch').addEventListener('input',renderTransactions);$('#activityFilter').addEventListener('change',renderTransactions);
function renderBeneficiaries(){const grid=$('#beneficiaryGrid');$('#beneficiaryEmpty').style.display=state.beneficiaries.length?'none':'flex';grid.innerHTML=state.beneficiaries.map(b=>`<article class="beneficiary-card"><div class="beneficiary-avatar">${safe(b.name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase())}</div><b>${safe(b.name)}</b><small>${safe(b.bank||'Banque non renseignée')}</small><div class="account">${safe(b.account)}</div><div class="beneficiary-actions"><button data-use="${b.id}">Virement</button><button class="delete" data-delete="${b.id}">Supprimer</button></div></article>`).join('');$$('[data-use]',grid).forEach(btn=>btn.addEventListener('click',()=>{go('transfers');$('#recipient').value=btn.dataset.use;fillRecipient();}));$$('[data-delete]',grid).forEach(btn=>btn.addEventListener('click',()=>{if(confirm('Supprimer ce bénéficiaire de la maquette ?')){state.beneficiaries=state.beneficiaries.filter(b=>b.id!==btn.dataset.delete);save();}}));}
function renderCards(){
 $('#cardHolder').textContent=(state.profile.name||'VOTRE NOM').toUpperCase();
 $('#cardStatus').textContent=state.cardLocked?'Carte verrouillée':(state.cardEnabled?'Présentation activée':'Carte inactive');
 $('#cardStatus').classList.toggle('enabled',state.cardEnabled&&!state.cardLocked);
 $('#toggleCard').textContent=state.cardEnabled?'Désactiver la présentation':'Activer la présentation';
 $('#novaVirtualCard').classList.toggle('card-glowing',state.cardEnabled&&!state.cardLocked);
 $('#novaVirtualCard').classList.toggle('is-locked',!!state.cardLocked);
 $('#cardLockOverlay').hidden=!state.cardLocked;
 $('#toggleCardLock').textContent=state.cardLocked?'Déverrouiller':'Verrouiller';
 $('#cardLockTitle').textContent=state.cardLocked?'Déverrouiller la carte':'Verrouiller la carte';
 $('#cardLockDesc').textContent=state.cardLocked?'Réactiver la carte de présentation':'Désactive temporairement la carte';
 $('#toggleAccountLock').textContent=state.accountLocked?'Déverrouiller':'Verrouiller';
 $('#accountLockTitle').textContent=state.accountLocked?'Déverrouiller le compte':'Verrouiller le compte';
 $('#accountLockDesc').textContent=state.accountLocked?'Réautoriser les opérations dans cet espace':'Bloquer les nouvelles opérations';
 $('#unlimitAccount').textContent=state.limitRequest?'Demandée':'Demander';
 $('#accountLockBanner').hidden=!state.accountLocked;
}
function renderSettings(){$('#profileName').value=state.profile.name||'';$('#profileEmail').value=state.profile.email||'';$('#profileCurrency').value=state.profile.currency||'EUR';$('#openingBalance').value=state.openingBalance||0;}
function calculateTransferFee(amount,bank,currency){const internal=/nova\s*pay|novapay/i.test(bank||'');return Number((amount*(internal?0.002:(currency==='EUR'&&amount>1000?0.005:0.002))).toFixed(2));}
function updateTransferSummary(){$('#transferBalance').textContent=money(currentBalance());const v=Number($('#amount')?.value||0),bank=$('#recipientBank')?.value||'',fee=v>0?calculateTransferFee(v,bank,$('#transferCurrency')?.value||state.profile.currency):0;$('#transferFees').textContent=v>0?money(fee,$('#transferCurrency')?.value||state.profile.currency):'Selon montant';$('#transferTotal').textContent=v>0?money(v+fee,$('#transferCurrency')?.value||state.profile.currency):'Selon montant';}
$('#amount').addEventListener('input',updateTransferSummary);$('#recipientBank').addEventListener('input',updateTransferSummary);$('#transferCurrency').addEventListener('change',()=>{$('#currencySuffix').textContent=$('#transferCurrency').value;updateTransferSummary();});
function fillRecipient(){const b=state.beneficiaries.find(x=>x.id===$('#recipient').value);if(b){$('#recipientName').value=b.name;$('#recipientEmail').value=b.email||'';$('#recipientBank').value=b.bank;$('#recipientAccount').value=b.account;updateTransferSummary();}}
function renderRecipientOptions(){const sel=$('#recipient');sel.innerHTML='<option value="">Choisir un bénéficiaire enregistré…</option>'+state.beneficiaries.map(b=>`<option value="${b.id}">${safe(b.name)}</option>`).join('');}
$('#recipient').addEventListener('change',fillRecipient);
$('#transferForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(state.accountLocked){toast('Compte verrouillé. Déverrouillez-le avec votre code personnel.');return;}
  const name=$('#recipientName').value.trim(),email=$('#recipientEmail').value.trim(),account=$('#recipientAccount').value.trim(),bank=$('#recipientBank').value.trim(),amount=Number($('#amount').value),currency=$('#transferCurrency').value,reason=$('#transferReason').value.trim()||'Non renseigné';
  if(!name||!account||!Number.isFinite(amount)||amount<=0){toast('Complétez le bénéficiaire, le compte et le montant.');return;}
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Vérifiez l’adresse e-mail du bénéficiaire.');return;}
  if(currency!==state.profile.currency){toast('Sélectionnez la devise de votre solde ('+state.profile.currency+'). Les taux de change ne sont pas disponibles.');return;}
  const fee=calculateTransferFee(amount,bank,currency),totalDebited=Number((amount+fee).toFixed(2)),feeRate=/nova\s*pay|novapay/i.test(bank)?0.2:(currency==='EUR'&&amount>1000?0.5:0.2);
  if(totalDebited>currentBalance()){toast('Solde insuffisant pour couvrir le montant et les frais.');return;}
  showModal(`<div class="modal-eyebrow"><span class="modal-eyebrow-icon">✓</span><span>VÉRIFICATION</span></div><h2>Confirmer l’opération ?</h2><p>Vérifiez les coordonnées et le montant avant de poursuivre.</p><div class="preview-lines"><div><span>Bénéficiaire</span><b>${safe(name)}</b></div><div><span>E-mail de contact</span><b>${safe(email||'Non renseigné')}</b></div><div><span>Banque</span><b>${safe(bank||'Non renseignée')}</b></div><div><span>Compte</span><b>${safe(account)}</b></div><div><span>Motif</span><b>${safe(reason)}</b></div><div class="preview-total"><span>Montant du virement</span><b>${money(amount,currency)}</b></div><div class="preview-fee"><span>Frais Nova Pay (${feeRate.toLocaleString('fr-FR')} %)</span><b>${money(fee,currency)}</b></div><div class="preview-total"><span>Total débité</span><b>${money(totalDebited,currency)}</b></div></div><div class="modal-note"><b>À savoir</b><br>Cette action actualise les informations affichées dans votre espace.</div><div class="modal-actions"><button class="outline-btn" id="cancelModal">Retour</button><button class="primary-btn" id="confirmTransfer">Effectuer le virement</button></div>`);
  $('#cancelModal').onclick=closeModal;
  $('#confirmTransfer').onclick=()=>{
    showTransferValidation(()=>{
      const t={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),reference:'NP-'+Date.now().toString().slice(-8),name,email,account,bank,amount,fee,feeRate,totalDebited,currency,reason,date:new Date().toISOString()};
      state.transactions.push(t);
      const existing=state.beneficiaries.find(b=>b.account===account);
      if(!existing)state.beneficiaries.push({id:String(Date.now()),name,email,bank,account});
      save();
      closeModal();
      $('#transferForm').reset();
      renderRecipientOptions();
      go('dashboard');
      showSuccess(t);
    });
  };
});
function showTransferValidation(onValid){
  showModal(`<div class="transfer-pin-modal"><div class="help-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/><circle cx="12" cy="15.5" r="1"/></svg></div><div class="overline">VALIDATION SÉCURISÉE</div><h2>Confirmez avec votre code personnel</h2><p>Saisissez votre code à 4 chiffres pour valider cette opération.</p><form id="transferPinForm"><input id="transferPinInput" class="transfer-pin-input" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required aria-label="Code personnel à quatre chiffres"><div id="transferPinError" class="pin-error" role="alert"></div><div class="modal-actions"><button type="button" class="outline-btn" id="transferPinCancel">Annuler</button><button type="submit" class="primary-btn">Valider le virement</button></div></form></div>`);
  const input=$('#transferPinInput');input.focus();
  input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,4);});
  $('#transferPinCancel').onclick=closeModal;
  $('#transferPinForm').onsubmit=async e=>{
    e.preventDefault();const value=input.value;
    if(!/^\d{4}$/.test(value)){$('#transferPinError').textContent='Saisissez les 4 chiffres de votre code.';return;}
    // Contrôle local compatible navigateur et Android WebView (sans dépendance à crypto.subtle).
    // Il s'agit d'un verrou d'interface, pas d'une authentification bancaire serveur.
    if(value!=='4827'){$('#transferPinError').textContent='Code incorrect. Le virement n’a pas été validé.';input.value='';input.focus();return;}
    closeModal();onValid();
  };
}
function downloadTransferSlip(t){
  const date=new Date(t.date).toLocaleString('fr-FR',{dateStyle:'full',timeStyle:'medium'});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const html=`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Bordereau Nova Pay</title><style>
  body{font-family:Arial,sans-serif;background:#f4f6fb;color:#182238;padding:32px}.sheet{max-width:720px;margin:20px auto;background:white;padding:42px;border-radius:20px;box-shadow:0 10px 40px #17264a18}
  .brand{font-size:24px;font-weight:800;color:#3158c9}.tag{color:#6b7890;font-size:12px;letter-spacing:2px;margin-top:8px}.line{display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-bottom:1px solid #edf0f5}.line span{color:#758098}.total{font-size:22px;font-weight:800}.fee{color:#15965b;font-weight:700}.note{margin-top:28px;padding:16px;background:#f3f6ff;border-radius:12px;color:#59657c;font-size:12px;line-height:1.6}
  @media print{body{background:white;padding:0}.sheet{box-shadow:none;margin:0 auto;border-radius:0}}</style><div class="sheet"><div class="brand">NOVA PAY</div><div class="tag">BORDEREAU DE TRANSFERT</div><h1>Récapitulatif de l'opération</h1><p>${esc(date)}</p><div class="line"><span>Référence</span><b>${esc(t.reference)}</b></div><div class="line"><span>Bénéficiaire</span><b>${esc(t.name)}</b></div><div class="line"><span>E-mail du bénéficiaire</span><b>${esc(t.email||'Non renseignée')}</b></div><div class="line"><span>Établissement</span><b>${esc(t.bank||'Non renseigné')}</b></div><div class="line"><span>Compte</span><b>${esc(t.account)}</b></div><div class="line"><span>Montant</span><b>${money(t.amount,t.currency)}</b></div><div class="line"><span>Frais Nova Pay</span><b class="fee">${money(t.fee||0,t.currency)}</b></div><div class="line total"><span>Total débité</span><b>${money(t.totalDebited??(t.amount+(t.fee||0)),t.currency)}</b></div><div class="note"><b>Information importante</b><br>Ce bordereau est un récapitulatif généré par Nova Pay, il servira de preuve justificative des transactions enregistrées dans votre espace Nova Pay, merci de bien le conserver.<br><small></small></div></div></html>`;
  download('NovaPay-Bordereau-'+t.reference+'.html','text/html;charset=utf-8',html);
}
function showSuccess(t){
  showModal(`<div class="success-screen">
    <div class="success-mark"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></div>
    <div class="success-kicker">NOVA PAY · CONFIRMATION</div>
    <h2>Opération enregistrée !</h2>
    <p>Votre bordereau est prêt. Vous pouvez le télécharger et le conserver.</p>
    <div class="success-reference"><span>RÉFÉRENCE DE L'OPÉRATION</span><b>${safe(t.reference)}</b></div>
    <div class="preview-lines"><div><span>Bénéficiaire</span><b>${safe(t.name)}</b></div><div><span>Montant</span><b>${money(t.amount,t.currency)}</b></div><div><span>Frais Nova Pay</span><b class="fee-inline">${money(t.fee||0,t.currency)}</b></div><div><span>Total débité</span><b>${money(t.totalDebited??(t.amount+(t.fee||0)),t.currency)}</b></div><div><span>Horodatage</span><b>${safe(new Date(t.date).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'medium'}))}</b></div><div><span>Nouveau solde</span><b>${money(currentBalance())}</b></div></div>
    <div class="modal-note"><b>Information importante</b><br>Cette confirmation concerne votre espace Nova Pay. Aucun argent n’a été transféré vers une banque ou un bénéficiaire.</div>
    <div class="success-actions"><button class="outline-btn" id="successClose">Fermer</button><button class="outline-btn" id="successHistory">Voir l'historique</button><button class="primary-btn" id="downloadSlip">Télécharger le bordereau</button></div>
  </div>`);
  $('#downloadSlip').onclick=()=>downloadTransferSlip(t);
  $('#successClose').onclick=closeModal;
  $('#successHistory').onclick=()=>{closeModal();go('activity');};
}
function showModal(html){$('#modalContent').innerHTML=html;$('#modalBackdrop').classList.add('open');}
function closeModal(){$('#modalBackdrop').classList.remove('open');}
$('#modalClose').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
function beneficiaryModal(){showModal(`<div class="overline">CARNET DE DESTINATAIRES</div><h2>Ajouter un bénéficiaire</h2><p>Utilisez uniquement des informations pour vos essais.</p><form id="beneficiaryForm"><label for="newBenName">Nom complet</label><input id="newBenName" required maxlength="100" placeholder="Ex. Camille Dupont"><label for="newBenEmail">Adresse e-mail (facultative)</label><input id="newBenEmail" type="email" autocomplete="email" placeholder="destinataire@exemple.com"><label for="newBenBank">Banque / établissement</label><input id="newBenBank" placeholder="Ex. Banque de démonstration"><label for="newBenAccount">IBAN / compte</label><input id="newBenAccount" required maxlength="64" placeholder="Coordonnées"><div class="modal-actions"><button type="button" class="outline-btn" id="cancelModal">Annuler</button><button class="primary-btn" type="submit">Enregistrer</button></div></form>`);$('#cancelModal').onclick=closeModal;$('#beneficiaryForm').onsubmit=e=>{e.preventDefault();const name=$('#newBenName').value.trim(),account=$('#newBenAccount').value.trim(),email=$('#newBenEmail').value.trim();
 if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Vérifiez l’adresse e-mail.');return;}
 if(state.beneficiaries.some(b=>b.account===account)){toast('Ce compte existe déjà dans votre carnet.');return;}state.beneficiaries.push({id:String(Date.now()),name,email,bank:$('#newBenBank').value.trim(),account});save();renderRecipientOptions();closeModal();toast('Bénéficiaire ajouté à la maquette.');};}
$('#addBeneficiary').addEventListener('click',beneficiaryModal);$('#emptyAddBeneficiary').addEventListener('click',beneficiaryModal);
$('#settingsForm').addEventListener('submit',e=>{e.preventDefault();const opening=Number($('#openingBalance').value);if(!Number.isFinite(opening)||opening<0){toast('Saisissez un solde initial valide.');return;}const selectedCurrency=$('#profileCurrency').value;
 if(state.transactions.length && selectedCurrency!==state.profile.currency){toast('La devise ne peut plus être changée après la première opération. Réinitialisez les données si vous souhaitez repartir dans une autre devise.');renderSettings();return;}
 state.profile.name=$('#profileName').value.trim();state.profile.email=$('#profileEmail').value.trim();state.profile.currency=selectedCurrency;
 const before=currentBalance();
 state.openingBalance=opening;
 state.balanceAdjustment=0;
 save();toast('Paramètres enregistrés localement.');});
$('#toggleBalance').addEventListener('click',()=>{const el=$('#balanceValue');const hidden=el.dataset.hidden==='1';el.dataset.hidden=hidden?'0':'1';el.textContent=hidden?money(currentBalance()):'••••••••';});

$('#exportCsv').addEventListener('click',()=>{if(!state.transactions.length){toast('Aucune opération à exporter.');return;}const lines=[['Référence','Date','Bénéficiaire','E-mail','Compte','Banque','Motif','Montant','Devise'],...state.transactions.map(t=>[t.reference,t.date,t.name,t.email,t.account,t.bank,t.reason,t.amount,t.currency])];const csv=lines.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\\r\\n');download('nova-pay-operations.csv','text/csv;charset=utf-8',csv);});
$('#backupData').addEventListener('click',()=>download('nova-pay-sauvegarde.json','application/json',JSON.stringify(state,null,2)));
function download(name,type,content){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
$('#restoreData').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||!data.profile||!Array.isArray(data.transactions)||!Array.isArray(data.beneficiaries)||!Number.isFinite(Number(data.openingBalance)))throw Error();
 state={...fresh(),...data,profile:{...fresh().profile,...data.profile}};
 state.transactions=data.transactions.filter(t=>t&&typeof t.name==='string'&&Number.isFinite(Number(t.amount))&&Number(t.amount)>0).map(t=>({...t,amount:Number(t.amount),fee:Number(t.fee)||0,totalDebited:Number(t.totalDebited)||Number(t.amount),date:t.date||new Date().toISOString()}));
 state.beneficiaries=data.beneficiaries.filter(b=>b&&typeof b.name==='string'&&typeof b.account==='string');
 state.balanceAdjustment=Number.isFinite(Number(data.balanceAdjustment))?Number(data.balanceAdjustment):0;
 save();renderRecipientOptions();toast('Sauvegarde restaurée.');}catch{toast('Fichier de sauvegarde invalide.');}e.target.value='';});
$('#resetData').addEventListener('click',()=>{if(confirm('Effacer toutes les données Nova Pay stockées sur cet appareil ? Cette action est irréversible.')){state=fresh();save();renderRecipientOptions();$('#balanceValue').dataset.hidden='0';go('dashboard');toast('Données locales réinitialisées.');}});
renderRecipientOptions();renderAll();
['pointerdown','keydown','touchstart'].forEach(evt=>document.addEventListener(evt,touchAuth,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&sessionStorage.getItem(AUTH_SESSION)==='ok'&&Date.now()-Number(sessionStorage.getItem(AUTH_ACTIVITY)||0)>AUTH_IDLE_MS)endAuth();});
if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}


/* Micro-interactions tactiles : retour visuel immédiat sur les actions */
document.addEventListener('pointerdown',event=>{
 const target=event.target.closest('button,.quick-card,.tool-row');
 if(!target||target.disabled)return;
 target.classList.add('is-pressed');
 if(target.matches('button,.quick-card')){
  const rect=target.getBoundingClientRect();
  const size=Math.max(rect.width,rect.height)*1.45;
  const dot=document.createElement('span');
  dot.className='ripple-dot';
  dot.style.width=dot.style.height=size+'px';
  dot.style.left=(event.clientX-rect.left-size/2)+'px';
  dot.style.top=(event.clientY-rect.top-size/2)+'px';
  target.appendChild(dot);
  dot.addEventListener('animationend',()=>dot.remove(),{once:true});
 }
 if(navigator.vibrate && target.matches('.primary-btn,.login-submit,.nav-link,.mobile-nav button'))navigator.vibrate(7);
},{passive:true});
['pointerup','pointercancel','pointerleave'].forEach(type=>document.addEventListener(type,event=>{
 const target=event.target.closest?.('.is-pressed');
 if(target)target.classList.remove('is-pressed');
},{passive:true}));
document.addEventListener('click',event=>{
 const action=event.target.closest('button');
 if(action && action.type!=='submit' && action.dataset.page)action.setAttribute('aria-current','page');
});
