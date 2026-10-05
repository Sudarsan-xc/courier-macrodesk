const STORAGE_KEY="courier_support_macros_v1";
const initialMacros=[{"id": 1, "title": "Order Status Updated", "situation": "Use when the order status has been updated and you want to close the interaction politely.", "macro": "Your order status has been updated successfully.\nHave a safe trip and a wonderful day ahead!", "category": "Order Status", "keywords": ["order status", "status updated", "close interaction", "updated"]}, {"id": 2, "title": "Client at Location – Proceed with Delivery", "situation": "Use when the client is at the delivery location and the courier needs to contact them and complete the delivery.", "macro": "The client is at their location. Please call them and proceed with the delivery of the order.", "category": "Delivery", "keywords": ["client at location", "delivery", "call client", "proceed", "location"]}, {"id": 3, "title": "Delivery Confirmation", "situation": "Use when the order is marked as delivered and you need the courier to confirm that the order was handed over to the client.", "macro": "The order is showing as delivered. Could you please confirm if you’ve handed the order over to the client?", "category": "Delivery", "keywords": ["delivered", "delivery confirmation", "handed over", "handover"]}, {"id": 4, "title": "Client Unreachable – Go to Location", "situation": "Use when the client cannot be reached by phone and the courier needs to go to the client’s location and try to contact them directly.", "macro": "The client could not be reached. Please go to the client’s location and try to contact them directly. If the client is still unavailable, please wait for a few minutes in case they change their mind. Thank you for your patience and cooperation.", "category": "Client Unreachable", "keywords": ["client unreachable", "cannot reach", "go to location", "call", "wait", "unavailable"]}, {"id": 5, "title": "Client Unreachable – Wait 10 Minutes", "situation": "Use when the client cannot be reached and the courier needs to wait before taking further action.", "macro": "The client could not be reached. Please wait for 10 minutes in case they respond or change their mind. Thank you for your patience.", "category": "Client Unreachable", "keywords": ["client unreachable", "wait 10 minutes", "wait", "respond", "change mind"]}, {"id": 6, "title": "Issue Details in Chat", "situation": "Use when a courier asks Support to call instead of explaining the issue in chat.", "macro": "Please describe the issue here in the chat so we can assist you accordingly. There’s no need to call—just share the details with us here, and we’ll be happy to help.", "category": "General Support", "keywords": ["issue", "chat", "call", "describe issue", "support"]}, {"id": 7, "title": "Payment Confirmation Before Handover", "situation": "Use when the courier has not confirmed payment before handing over the order, especially when the client is having payment difficulties.", "macro": "Please make sure to confirm the payment before handing over the order to the client. In this case, kindly ask the client to complete the payment for the order now.\n\nIf the client is experiencing any issues with the payment, please contact Support for assistance before handing over the order.", "category": "Payment", "keywords": ["payment", "confirm payment", "handover", "handing over", "payment issue"]}, {"id": 8, "title": "Client Refused to Pay", "situation": "Use when the courier has already handed the order to the client but the client refuses to pay.", "macro": "Please make sure to confirm the payment before handing over the order to the client. In this case, kindly ask the client to complete the payment for the order now. If the client is experiencing any issues with the payment, please contact Support for further assistance before handing over the order.", "category": "Payment", "keywords": ["client refused to pay", "refused payment", "payment", "order handed over", "unpaid", "handover"]}, {"id": 9, "title": "Cancelled Order – Return to Hub", "situation": "Use when an order has been cancelled and should no longer be delivered.", "macro": "The order has been cancelled, so there is no need to deliver it. Please return the order to the hub. Thank you for your cooperation.", "category": "Cancelled Order", "keywords": ["cancelled", "cancelled order", "return to hub", "do not deliver", "hub"]}, {"id": 10, "title": "First-Order Promotion Not Eligible", "situation": "Use when a client registers with a new phone number but the same mobile device has previously been used to place an order.", "macro": "The first-order promotion is not applicable because an order has already been placed from this mobile device before. Even if a new number is used to register, the device has previously been used to place an order, so the promotion cannot be applied.", "category": "Promotion", "keywords": ["first order", "promotion", "not eligible", "new phone number", "mobile device", "previous order"]}, {"id": 11, "title": "Final Decision – Cannot Change", "situation": "Use when a customer asks Support to review or change a decision that has already been finalized.", "macro": "I understand this isn’t an easy situation, and I’m sorry for any inconvenience caused. However, I’m unable to change the decision, and it is final.\n\nIf you have any other questions about our service that are not related to reviewing this decision, I’ll be happy to help.", "category": "Final Decision", "keywords": ["final decision", "cannot change", "decision", "review", "final", "inconvenience"]}];
let macros=loadMacros();

const $=id=>document.getElementById(id);
const form=$("macroForm"), search=$("search");

function loadMacros(){
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMacros;
  }catch(e){return initialMacros}
}
function saveMacros(){localStorage.setItem(STORAGE_KEY,JSON.stringify(macros))}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function normalize(s){return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function nextId(){return Date.now()}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}

function renderCategories(){
  const current=$("categoryFilter").value;
  const cats=[...new Set(macros.map(m=>m.category).filter(Boolean))].sort();
  $("categoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
  if(cats.includes(current)) $("categoryFilter").value=current;
}
function scoreMacro(m,q){
  if(!q)return 1;
  const terms=normalize(q).split(/\s+/).filter(Boolean);
  const title=normalize(m.title), situation=normalize(m.situation), body=normalize(m.macro), keys=normalize((m.keywords||[]).join(" ")), cat=normalize(m.category);
  return terms.reduce((score,t)=>{
    if(title.includes(t))score+=10;
    if(keys.includes(t))score+=8;
    if(cat.includes(t))score+=5;
    if(situation.includes(t))score+=4;
    if(body.includes(t))score+=2;
    return score;
  },0);
}
function getMatches(){
  const q=search.value.trim(), cat=$("categoryFilter").value;
  return macros.map(m=>({...m,_score:scoreMacro(m,q)}))
    .filter(m=>(!q||m._score>0)&&(!cat||m.category===cat))
    .sort((a,b)=>b._score-a._score||a.title.localeCompare(b.title));
}
function renderResults(){
  const matches=getMatches();
  $("resultCount").textContent=`${matches.length} found`;
  $("results").innerHTML=matches.map(m=>`
    <article class="macro-card">
      <div class="macro-top"><div class="macro-title">${escapeHtml(m.title)}</div>${m.category?`<span class="tag">${escapeHtml(m.category)}</span>`:""}</div>
      ${m.situation?`<div class="situation">${escapeHtml(m.situation)}</div>`:""}
      <div class="response-label">READY-TO-SEND RESPONSE</div>
      <div class="macro-text">${escapeHtml(m.macro)}</div>
      <div class="card-actions"><button class="copy" onclick="copyMacro(${m.id})">Copy response</button><button onclick="editMacro(${m.id})">Edit</button></div>
    </article>`).join("");
  $("emptyState").classList.toggle("hidden",matches.length!==0);
}
function renderManage(){
  $("macroCount").textContent=macros.length;
  $("manageList").innerHTML=macros.slice().sort((a,b)=>a.title.localeCompare(b.title)).map(m=>`
    <div class="manage-item"><div class="manage-item-title">${escapeHtml(m.title)}</div>
    <div class="manage-meta">${escapeHtml(m.category||"Uncategorized")}</div>
    <div class="item-actions"><button class="edit" onclick="editMacro(${m.id})">Edit / Update</button><button class="delete" onclick="deleteMacro(${m.id})">Delete</button></div></div>`).join("");
}
function render(){renderCategories();renderResults();renderManage()}
function clearForm(){
  form.reset();$("macroId").value="";$("formTitle").textContent="Add Macro";$("saveBtn").textContent="Save Macro";
}
function editMacro(id){
  const m=macros.find(x=>x.id===id);if(!m)return;
  $("macroId").value=m.id;$("title").value=m.title;$("category").value=m.category||"";
  $("situation").value=m.situation||"";$("macro").value=m.macro||"";$("keywords").value=(m.keywords||[]).join(", ");
  $("formTitle").textContent="Update Macro";$("saveBtn").textContent="Update Macro";
  window.scrollTo({top:0,behavior:"smooth"});$("title").focus();
}
function deleteMacro(id){
  const m=macros.find(x=>x.id===id);if(!m)return;
  if(!confirm(`Delete "${m.title}"?`))return;
  macros=macros.filter(x=>x.id!==id);saveMacros();render();toast("Macro deleted");
}
async function copyMacro(id){
  const m=macros.find(x=>x.id===id);if(!m)return;
  try{await navigator.clipboard.writeText(m.macro);toast("Macro copied to clipboard")}
  catch(e){const ta=document.createElement("textarea");ta.value=m.macro;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Macro copied")}
}
form.addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("macroId").value;
  const data={title:$("title").value.trim(),category:$("category").value.trim(),situation:$("situation").value.trim(),macro:$("macro").value.trim(),keywords:$("keywords").value.split(",").map(x=>x.trim()).filter(Boolean)};
  if(!data.title||!data.macro)return;
  if(id){
    const i=macros.findIndex(x=>String(x.id)===String(id));macros[i]={...macros[i],...data};
    toast("Macro updated");
  }else{
    macros.push({id:nextId(),...data});toast("Macro added");
  }
  saveMacros();clearForm();render();
});
$("cancelBtn").onclick=clearForm;$("newBtn").onclick=()=>{clearForm();$("title").focus()};
search.addEventListener("input",renderResults);
search.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();renderResults();}});
$("clearSearch").onclick=()=>{search.value="";renderResults();search.focus()};
$("categoryFilter").onchange=renderResults;
$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(macros,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="courier-support-macros.json";a.click();URL.revokeObjectURL(a.href);toast("Macros exported");
};
$("importFile").onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const imported=JSON.parse(reader.result);
      if(!Array.isArray(imported))throw new Error();
      macros=imported.map((m,i)=>({...m,id:m.id||Date.now()+i}));
      saveMacros();render();toast("Macros imported");
    }catch(err){alert("Invalid macro JSON file.")}
    e.target.value="";
  };reader.readAsText(file);
};
const resetBtn=$("resetBtn");
if(resetBtn) resetBtn.onclick=()=>{
  if(!confirm("Reset all local changes and restore the original example macros?"))return;
  macros=JSON.parse(JSON.stringify(initialMacros));saveMacros();clearForm();render();toast("Original macros restored");
};
render();

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active-view"));
  $(btn.dataset.view).classList.add("active-view");
  $("pageTitle").textContent=btn.dataset.view==="manageView"?"Manage Macros":"Macro Search";
}));
$("newTopBtn").onclick=()=>{document.querySelector('[data-view="manageView"]').click();clearForm();$("title").focus()};
document.querySelectorAll(".quick-row button").forEach(b=>b.onclick=()=>{search.value=b.dataset.query;document.querySelector('[data-view="searchView"]').click();renderResults();});
search.addEventListener("keydown",e=>{if(e.key==="Escape"){search.value="";renderResults();}});
function renderSideCategories(){
  const cats=[...new Set(macros.map(m=>m.category).filter(Boolean))].sort();
  $("sideCategories").innerHTML=cats.map(c=>`<button class="side-cat" onclick="search.value='';$('categoryFilter').value=${JSON.stringify(c)};document.querySelector('[data-view="searchView"]').click();renderResults()">› ${escapeHtml(c)}</button>`).join("");
}
const oldRender=render;
render=()=>{oldRender();renderSideCategories()};


render();
