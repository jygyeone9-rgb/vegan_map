"""Import the supplied 2025 Seoul handbook. Requires pdfplumber for this offline task only.

Usage: python scripts/import-handbook.py --pdf /path/to/handbook.pdf
The checked-in location manifest is reviewed separately; this script makes no network requests.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ID = 'seoul-handbook-2025'
SOURCE_URL = 'https://fsi.seoul.go.kr/front/M0000070/board/view.do?atcSn=2283'
TYPES = {'V': 'vegan', 'L': 'lacto', 'O': 'ovo', 'LO': 'lacto-ovo'}
TYPE_NAMES = {'V': '비건', 'L': '락토', 'O': '오보', 'LO': '락토오보'}


def extract(pdf_path):
    records = []
    with pdfplumber.open(pdf_path) as pdf:
        for index, page in enumerate(pdf.pages):
            if index < 11:
                continue
            for side in range(2):
                half = page.crop((page.width / 2 * side, 0, page.width / 2 * (side + 1), page.height))
                text = (half.extract_text() or '').replace('채채식식', '채식').replace('가가능능', '가능')
                # No.197 has overlapping 가능/전문 text in the PDF text layer.
                # Visual review of printed p.79 confirms the visible label is 전문.
                text = text.replace('가전능문', '전문')
                headings = list(re.finditer(r'(?m)^(\d{2,3}) (.+?) 채식\s*\n(가능|전문)', text))
                for position, heading in enumerate(headings):
                    end = headings[position + 1].start() if position + 1 < len(headings) else len(text)
                    body = text[heading.end():end].strip()
                    lines = [re.sub(r'(인인스스타타그그램램|바바로로가가기기|인스타그램|홈페이지|블로그|바로가기)', '', line).strip() for line in body.splitlines()]
                    address_line = next(i for i, line in enumerate(lines) if line.startswith('서울'))
                    phone_line = next(i for i in range(address_line + 1, len(lines)) if re.match(r'^(?:0\d|1\d{3}-|-$)', lines[i]))
                    items = []
                    for line in lines[phone_line + 1:]:
                        if re.match(r'^(V|L|O|LO) ', line):
                            for match in re.finditer(r'(?:^|\s)(LO|V|L|O)\s+(.+?)(?=\s+(?:LO|V|L|O)\s+|$)', line):
                                items.append({'tag': match[1], 'name': match[2].strip()})
                    records.append({
                        'number': int(heading[1]), 'name': heading[2], 'venue': heading[3],
                        'address': ' '.join(lines[address_line:phone_line]), 'phone': lines[phone_line],
                        'pdfPage': index + 1, 'printedPage': index * 2 - 2 + side, 'menus': items,
                    })
    records.sort(key=lambda record: record['number'])
    if len(records) != 300 or [record['number'] for record in records] != list(range(1, 301)):
        raise ValueError('Expected each handbook restaurant number 1–300 exactly once')
    if sum(len(record['menus']) for record in records) != 841:
        raise ValueError('Menu count differs from reviewed handbook import (841); review before writing')
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pdf', required=True, type=Path)
    args = parser.parse_args()
    locations = json.loads((ROOT / 'scripts/handbook-locations.json').read_text(encoding='utf-8'))
    records = extract(args.pdf)
    restaurants, menus = [], []
    for record in records:
        number = record['number']
        location = locations[str(number)]
        if location['name'] != record['name']:
            raise ValueError(f'Location identity does not match PDF record {number}')
        restaurant_id = f'seoul-{number:03}'
        district = re.search(r'서울(?:특별시)? ([가-힣]+구)', record['address'])[1]
        neighborhood = location['neighborhood']
        source = {'sourceId': SOURCE_ID, 'pdfPage': record['pdfPage'], 'printedPage': record['printedPage'], 'recordNumber': number}
        verification = {'status': 'documented', 'method': '서울시 핸드북 표기', 'checkedAt': None, 'sourceUrl': SOURCE_URL, **source}
        restaurants.append({
            'id': restaurant_id, 'isSample': False, 'name': record['name'], 'branch': '',
            'district': district, 'neighborhood': neighborhood, 'stations': [],
            'nearHanyang': district == '성동구' and any(area in neighborhood for area in ['행당', '왕십리', '성수']),
            'address': record['address'], 'phone': '' if record['phone'] == '-' else record['phone'],
            'lat': location['lat'], 'lng': location['lng'], 'location': location['provenance'],
            'category': location['category'], 'venueType': 'specialist' if record['venue'] == '전문' else 'options',
            'hours': '자료 미수록 · 방문 전 확인', 'closedDays': '자료 미수록 · 방문 전 확인',
            'description': f"서울시 채식음식점 지도에 수록된 {district}의 채식 {record['venue']} {location['category']}입니다. 메뉴 유형은 2025년 10월 조사 자료의 표기를 따릅니다.",
            'verification': verification,
            'links': {'naver': '', 'google': '', 'website': location.get('website', ''), 'instagram': location.get('instagram', '')},
        })
        for index, item in enumerate(record['menus'], 1):
            notes = '비건 메뉴로 주문할 때 육수·소스·토핑과 변경 사항을 매장에 확인해 주세요.' if item['tag'] == 'V' else '유제품·달걀 등 섭취 기준과 육수·소스·토핑을 매장에 확인해 주세요.'
            if number == 64:
                notes = '핸드북에 비건 메뉴 조정 가능으로 안내되어 있습니다. 주문 전 변경 사항을 요청해 주세요.'
            menus.append({
                'id': f'{restaurant_id}-m{index:02}', 'restaurantId': restaurant_id, 'name': item['name'],
                'price': None, 'description': f"핸드북에서 {TYPE_NAMES[item['tag']]}({item['tag']}) 유형으로 소개한 메뉴입니다. 상세 구성과 조리법은 자료에 수록되어 있지 않습니다.",
                'ingredients': [], 'dietTypes': [], 'documentedDietType': TYPES[item['tag']],
                'sourceTag': item['tag'], 'available': None,
                'photoUrl': '', 'photoAlt': '', 'photoConsent': False,
                'orderNotes': notes, 'crossContact': 'unknown',
                'verification': {**verification, 'ingredientNotes': 'PDF에 채식 유형만 표기 · 전체 재료, 육수·소스·조미료는 개별 재확인 필요'},
            })
    source = {
        'id': SOURCE_ID, 'title': '서울시 채식음식점 지도',
        'publisher': '서울시 시민건강국 식품정책과', 'editor': '한국비건진흥원',
        'publishedMonth': '2025-11', 'surveyMonth': '2025-10',
        'url': SOURCE_URL, 'editorUrl': 'https://k-vegan.org/?page_id=4337&uid=644&mod=document&pageid=1',
        'sha256': hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        'restaurantCount': len(restaurants), 'menuCount': len(menus),
        'notice': '2025년 10월 조사 자료입니다. 현재 영업·판매 여부와 재료는 방문 전 확인해 주세요. PDF의 채식 전문 분류는 완전 비건 전문점 인증이 아닙니다.',
        'dietLegend': {'V': 'vegan', 'L': 'lacto', 'O': 'ovo', 'LO': 'lacto-ovo'},
        'missingDietTypes': ['pesco'],
    }
    for name, data in [('restaurants', restaurants), ('menus', menus), ('handbook-source', source)]:
        (ROOT / f'src/data/{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Imported {len(restaurants)} restaurants and {len(menus)} menus')


if __name__ == '__main__':
    main()
