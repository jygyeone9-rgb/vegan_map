// 디자인 확인용 샘플 데이터입니다. 실제 식당 정보가 아닙니다.
export const restaurants = [
 {id:'sample-01',name:'샘플 비건 키친',district:'성동구',neighborhood:'왕십리 인근',address:'실제 주소 입력 필요',lat:37.5618,lng:127.0386,category:'한식',status:'비건 여부 확인 필요',priceRange:'가격 확인 필요',hours:'영업시간 확인 필요',lastVerified:'정보 확인 전',description:'실제 업체가 아닌 디자인 확인용 샘플입니다. 검증된 식당 정보로 교체해 주세요.',menuIds:['m1','m2'],interviewId:'i1',naverUrl:'https://map.naver.com/p/search/비건식당%20왕십리',googleUrl:'https://www.google.com/maps/search/?api=1&query=vegan+restaurant+Wangsimni'},
 {id:'sample-02',name:'샘플 플랜트 카페',district:'광진구',neighborhood:'건대 인근',address:'실제 주소 입력 필요',lat:37.5408,lng:127.0693,category:'카페·디저트',status:'비건 여부 확인 필요',priceRange:'가격 확인 필요',hours:'영업시간 확인 필요',lastVerified:'정보 확인 전',description:'실제 업체가 아닌 디자인 확인용 샘플입니다. 실제 정보로 교체해 주세요.',menuIds:['m3'],interviewId:null,naverUrl:'https://map.naver.com/p/search/비건카페%20건대',googleUrl:'https://www.google.com/maps/search/?api=1&query=vegan+cafe+Konkuk+University'},
 {id:'sample-03',name:'샘플 그린 테이블',district:'중구',neighborhood:'을지로 인근',address:'실제 주소 입력 필요',lat:37.5662,lng:126.9911,category:'양식',status:'비건 여부 확인 필요',priceRange:'가격 확인 필요',hours:'영업시간 확인 필요',lastVerified:'정보 확인 전',description:'실제 업체가 아닌 디자인 확인용 샘플입니다. 실제 운영 형태를 확인해 등록하세요.',menuIds:['m4'],interviewId:null,naverUrl:'https://map.naver.com/p/search/비건식당%20을지로',googleUrl:'https://www.google.com/maps/search/?api=1&query=vegan+restaurant+Euljiro'}
]
export const menus = [
 {id:'m1',restaurantId:'sample-01',name:'오늘의 채소 덮밥',price:'가격 확인 필요',description:'메뉴 설명과 소스·육수 재료를 확인해 주세요.',veganStatus:'확인 필요',ingredients:'재료 확인 전',recommended:true},
 {id:'m2',restaurantId:'sample-01',name:'두부 채소 플레이트',price:'가격 확인 필요',description:'메뉴 구성과 맛, 양 등 확인된 정보를 적어 주세요.',veganStatus:'확인 필요',ingredients:'재료 확인 전',recommended:false},
 {id:'m3',restaurantId:'sample-02',name:'시그니처 음료',price:'가격 확인 필요',description:'식물성 우유와 시럽·토핑 재료를 확인해 주세요.',veganStatus:'확인 필요',ingredients:'재료 확인 전',recommended:false},
 {id:'m4',restaurantId:'sample-03',name:'플랜트 파스타',price:'가격 확인 필요',description:'면과 소스, 토핑에 동물성 재료가 포함되는지 확인해 주세요.',veganStatus:'확인 필요',ingredients:'재료 확인 전',recommended:true}
]
export const interviews = [
 {id:'i1',restaurantId:'sample-01',title:'비건 메뉴를 시작한 이유',date:'인터뷰 후 입력',interviewer:'담당자 입력',introduction:'실제 인터뷰와 공개 동의를 받은 뒤 이곳에 내용을 추가하세요.',questions:[{question:'비건 메뉴를 시작하게 된 계기는 무엇인가요?',answer:'인터뷰 답변 입력'},{question:'처음 방문하는 손님에게 추천하고 싶은 메뉴는 무엇인가요?',answer:'인터뷰 답변 입력'},{question:'메뉴를 준비하면서 중요하게 생각하는 점은 무엇인가요?',answer:'인터뷰 답변 입력'}]}
]