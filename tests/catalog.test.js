import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, getDietTypes, getPhotoUrl, searchCatalog, publicInterviews, safeUrl } from '../src/lib/catalog.js';
import { readFileSync } from 'node:fs';
const restaurant = { id:'r1',name:'테스트 식당',branch:'본점',district:'성동구',neighborhood:'행당',stations:['한양대역'],category:'한식',venueType:'options',nearHanyang:true };
const verified = { status:'verified',checkedAt:'2026-10-16',method:'업체 공식 답변',sourceUrl:'https://example.com/evidence' };
const menu = { id:'m1',restaurantId:'r1',name:'콩 덮밥',ingredients:['콩'],price:9000,dietTypes:['vegan'],available:true,verification:verified };
const search = (filters={}, items=[menu], stories=[], favorites=[]) => searchCatalog([restaurant],items,stories,{...defaults,...filters},favorites);
test('restaurant, menu, ingredient and station searches', () => {
  for (const query of ['테스트','콩','한양대역',' 행당 ']) assert.equal(search({query}).length,1);
  assert.equal(search({query:'없는 메뉴'}).length,0);
});
test('diet and price must match the same menu', () => {
  const items = [{...menu,price:16000},{...menu,id:'m2',dietTypes:['ovo'],price:8000}];
  assert.equal(search({diet:'vegan',price:'10000'},items).length,0);
  assert.equal(search({diet:'ovo',price:'10000'},items).length,1);
});

test('price range filters use inclusive bounds and apply to one menu', () => {
  const items = [{...menu,id:'cheap',price:8000},{...menu,id:'mid',price:12000},{...menu,id:'high',price:18000}];
  assert.equal(search({priceMin:'8000',priceMax:'12000'},items).flatMap(r=>r.menus).length,2);
  assert.equal(search({priceMin:'12000',priceMax:'12000'},items).flatMap(r=>r.menus).length,1);
  assert.equal(search({priceMin:'13000',priceMax:'17000'},items).length,0);
  assert.equal(search({priceMin:'15000',priceMax:'10000'},items).length,0);
  assert.equal(search({diet:'vegan',priceMin:'10000',priceMax:'13000'},items).flatMap(r=>r.menus).length,1);
  assert.equal(search({priceMin:'10000'},[{...menu,price:null}]).length,0);
  assert.equal(search({priceMin:'10000'},[{...menu,priceVerification:{qualifier:'from'}}]).length,0);
});
test('pending, unavailable and unknown-price menus cannot match unsafe filters', () => {
  assert.equal(search({diet:'vegan'},[{...menu,verification:{...verified,status:'pending'}}]).length,0);
  assert.equal(search({diet:'vegan'},[{...menu,verification:{...verified,sourceUrl:''}}]).length,0);
  assert.equal(search({price:'10000'},[{...menu,price:null}]).length,0);
  assert.equal(search({diet:'vegan'},[{...menu,available:false}]).length,0);
});
test('district, station, category, venue, campus and favorite filters compose', () => {
  assert.equal(search({district:'성동구',station:'한양대역',category:'한식',venue:'options',hanyang:true,favorites:true},[menu],[],['r1']).length,1);
  assert.equal(search({favorites:true}).length,0);
  assert.equal(search({station:'왕십리역'}).length,0);
});
test('only consented published interviews appear and qualify filters', () => {
  const story={id:'i1',restaurantId:'r1',status:'published',consent:true,date:'2026-10-16'};
  assert.equal(publicInterviews([story,{...story,consent:false},{...story,status:'draft'}]).length,1);
  assert.equal(search({interview:true},[menu],[{...story,consent:false}]).length,0);
  assert.equal(search({interview:true},[menu],[story]).length,1);
});
test('external links reject script and insecure protocols', () => {
  for (const url of ['javascript:alert(1)','http://example.com','',null]) assert.equal(safeUrl(url),'');
  assert.equal(safeUrl('https://example.com/place'),'https://example.com/place');
});
const documented = { ...menu, dietTypes:[], documentedDietType:'vegan', sourceTag:'V', available:null, verification:{status:'documented',sourceId:'seoul-handbook-2025',sourceUrl:'https://example.com/handbook',pdfPage:12,printedPage:20,checkedAt:null} };
test('PDF classification is searchable without pretending ingredients were rechecked', () => {
  assert.deepEqual(getDietTypes(documented),['vegan']);
  assert.equal(search({diet:'vegan'},[documented]).length,1);
  assert.equal(search({diet:'vegan',verifiedOnly:true},[documented]).length,0);
  assert.equal(search({verifiedOnly:true},[menu]).length,1);
});
test('unsubstantiated or mismatched PDF tags cannot qualify diet filters', () => {
  assert.deepEqual(getDietTypes({...documented,sourceTag:'L'}),[]);
  assert.deepEqual(getDietTypes({...documented,verification:{...documented.verification,sourceId:'made-up'}}),[]);
  assert.deepEqual(getDietTypes({...documented,sourceTag:undefined}),[]);
  assert.equal(search({diet:'pesco'},[documented]).length,0);
});
test('missing or unapproved menu photos resolve to no image', () => {
  assert.equal(getPhotoUrl(documented),'');
  const photo={photoConsent:true,photoUrl:'https://example.com/menu.jpg',photoSourceUrl:'https://example.com/source',photoAlt:'콩 덮밥'};
  assert.equal(getPhotoUrl(photo),'https://example.com/menu.jpg');
  assert.equal(getPhotoUrl({...photo,photoConsent:false}),'');
  assert.equal(getPhotoUrl({...photo,photoSourceUrl:''}),'');
});
const data = file => JSON.parse(readFileSync(new URL(`../src/data/${file}.json`,import.meta.url),'utf8'));
test('all 300 handbook restaurants, 25 districts and original menu classifications survive import', () => {
  const restaurants=data('restaurants'), menus=data('menus');
  assert.equal(restaurants.length,300);
  assert.equal(new Set(restaurants.map(r=>r.district)).size,25);
  assert.equal(menus.filter(m=>m.verification.sourceId==='seoul-handbook-2025').length,841);
  assert.equal(menus.length,869);
  assert.equal(restaurants.filter(r=>r.venueType==='specialist').length,119);
  assert.equal(restaurants.filter(r=>r.venueType==='options').length,181);
  assert.equal(restaurants.filter(r=>r.isSample).length,0);
  const counts={};for(const m of menus)for(const type of getDietTypes(m))counts[type]=(counts[type]||0)+1;
  assert.deepEqual(counts,{vegan:791,lacto:42,'lacto-ovo':9,ovo:2});
  assert.equal(searchCatalog(restaurants,menus,[],{...defaults,diet:'ovo'}).flatMap(r=>r.menus).length,2);
  assert.equal(searchCatalog(restaurants,menus,[],{...defaults,diet:'pesco'}).length,0);
  assert.equal(searchCatalog(restaurants,menus,[],{...defaults,price:'10000'}).length,0);
});
test('conflicting menu evidence removes Hongmilmil and Reuonyong from the vegan filter', () => {
  const menu=data('menus').find(m=>m.id==='seoul-076-m01');
  assert.equal(menu.verification.status,'recheck');
  assert.equal(getDietTypes(menu).includes('vegan'),false);
});
test('five source-labeled vendor menu records are searchable without ingredient verification', () => {
  const menus=data('menus').filter(m=>m.verification.status==='listed');
  assert.equal(menus.length,5);
  assert.ok(menus.every(m=>getDietTypes(m).includes('vegan')&&m.dietTypes.length===0));
  assert.equal(searchCatalog(data('restaurants'),menus,[],{...defaults,diet:'vegan'}).length,5);
  assert.equal(searchCatalog(data('restaurants'),menus,[],{...defaults,verifiedOnly:true}).length,0);
});
test('the handbook vegetarian specialist category does not become a fully vegan certification', () => {
  const r=data('restaurants').find(r=>r.id==='seoul-227');
  assert.equal(r.venueType,'specialist');
  assert.ok(data('menus').filter(m=>m.restaurantId===r.id).some(m=>getDietTypes(m).includes('lacto')));
});
test('verified current location updates are reflected consistently', () => {
  for (const id of ['seoul-167','seoul-172']) {
    const r=data('restaurants').find(r=>r.id===id);
    assert.equal(r.location.status,'matched');
    assert.equal(r.address,r.location.address);
    assert.ok(r.location.note);
  }
});
