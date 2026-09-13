import { readFile } from 'node:fs/promises';
import { before, after, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
let env;
const identity = uid => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } }).firestore();
const listing = (uid, status = 'pending') => ({ userId: uid, title: 'Phone', description: 'Used phone', price: 100, images: ['https://example.com/a.jpg'], viewsCount: 0, isVip: false, isTop: false, isPostedToTelegram: false, status, seller: {id:uid,isVerified:false}, createdAt:'2026-09-13' });
const old = {id:'one',sender:'buyer',text:'Original',timestamp:'2026-09-13T00:00:00Z'};
before(async () => { env = await initializeTestEnvironment({ projectId:'demo-oldisotti', firestore:{ rules:await readFile('firestore.rules','utf8'),host:'127.0.0.1',port:8080 } }); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async ctx => {
  const db=ctx.firestore();
  await setDoc(doc(db,'platform_settings/global_config'),{autoApproveListings:false});
  await setDoc(doc(db,'listings/phone'),listing('seller','active'));
  await setDoc(doc(db,'listings/private'),listing('seller'));
  await setDoc(doc(db,'conversations/chat'),{buyerId:'buyer',sellerUserId:'seller',listingId:'phone',messages:[old],lastUpdated:old.timestamp});
 });
});
test('moderation forbids direct active creation but allows pending',async()=>{
 const db=identity('buyer');
 await assertFails(setDoc(doc(db,'listings/new'),listing('buyer','active')));
 await assertSucceeds(setDoc(doc(db,'listings/new'),listing('buyer')));
});
test('private listing readable only by its owner',async()=>{
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'listings/private')));
 await assertFails(getDoc(doc(identity('buyer'),'listings/private')));
 await assertSucceeds(getDoc(doc(identity('seller'),'listings/private')));
 await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'listings/phone')));
});
test('owner cannot self-approve pending or grant VIP',async()=>{
 const db=identity('seller');
 await assertFails(updateDoc(doc(db,'listings/private'),{status:'active'}));
 await assertFails(updateDoc(doc(db,'listings/phone'),{isVip:true}));
 await assertSucceeds(updateDoc(doc(db,'listings/phone'),{status:'sold'}));
});
test('valid message append succeeds; editing history or impersonation fails',async()=>{
 const db=identity('buyer'), chat=doc(db,'conversations/chat');
 const next={...old,id:'two',text:'Next'};
 await assertFails(updateDoc(chat,{messages:[{...old,text:'Forged'},next]}));
 await assertFails(updateDoc(chat,{messages:[old,{...next,sender:'seller'}]}));
 await assertSucceeds(updateDoc(chat,{messages:[old,next]}));
});
test('stranger cannot read chat or append',async()=>{
 const chat=doc(identity('stranger'),'conversations/chat');
 await assertFails(getDoc(chat));
 await assertFails(updateDoc(chat,{messages:[old,{...old,id:'two'}]}));
});
test('anonymous users cannot create listings',async()=>{
 const db=env.authenticatedContext('anon',{firebase:{sign_in_provider:'anonymous'}}).firestore();
 await assertFails(setDoc(doc(db,'listings/new'),listing('anon')));
});
