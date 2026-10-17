import json
import os
from datetime import date
from urllib.parse import quote_plus
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'output', 'pdf')
OUT_PATH = os.path.join(OUT_DIR, 'vegan_seoul_unpriced_menus_2026-10-17.pdf')
os.makedirs(OUT_DIR, exist_ok=True)

def load(name):
    with open(os.path.join(ROOT, 'src', 'data', f'{name}.json'), encoding='utf-8') as f:
        return json.load(f)

restaurants = load('restaurants')
menus = load('menus')
enrichments = load('menu-enrichments')
closed = {item['restaurantId'] for item in load('closed-restaurants')}
enriched_ids = {item['id'] for item in enrichments}
enriched_places = {item['priceVerification']['restaurantId'] for item in enrichments}
active = [r for r in restaurants if r['id'] not in closed]
by_restaurant = {r['id']: r for r in active}
unpriced = [m for m in menus if m['restaurantId'] in by_restaurant and m['id'] not in enriched_ids]
groups = {}
for menu in unpriced:
    groups.setdefault(menu['restaurantId'], []).append(menu)

searched_ids = {r['id'] for r in active if r['id'] not in enriched_places}
searched_ids.update({'seoul-246', 'seoul-261', 'seoul-212', 'seoul-180'})

search_notes = {
    'seoul-074': ('을지로 장소 소개 페이지에 1인 예상가만 있고 등록된 파스타별 가격은 확인되지 않았습니다.', 'https://www.joonggan.com/place/877485094?from=%2Farea%2Feuljiro_chungmuro%2Fall'),
    'seoul-116': ('동일 지점 블로그에 포케와 요거트 가격은 있으나 지도 메뉴 목록의 메뉴명과 일치하지 않아 적용하지 않았습니다.', 'https://notes3442.tistory.com/13'),
    'seoul-142': ('동일 지점 메뉴 페이지에 다른 오트 음료와 비건 디저트 가격이 있으나 현재 목록의 정확한 메뉴 구성과 일치하지 않아 적용하지 않았습니다.', 'https://www.diningcode.com/profile.php?rid=VLoSBL8A4hB2'),
    'seoul-180': ('블랙 레몬 파스타는 가격 출처를 찾아 등록했습니다. 남은 메뉴는 이름이 다른 수프 가격만 확인되어 제외했습니다. 폐점 여부는 뽈레와 최신 다이닝코드 표기가 달라 방문 전 확인이 필요합니다.', 'https://www.diningcode.com/profile.php?rid=zSXf6aUIm0eG'),
    'seoul-182': ('공식 메뉴 페이지에는 두부 메뉴 설명은 있으나 가격이 표시되지 않았고, 제3자 가격 목록의 다른 메뉴 가격은 등록 메뉴와 달라 적용하지 않았습니다.', 'https://www.meatnsalad.com/menus'),
    'seoul-212': ('테이블링에서 코스 2개의 등록 가격을 찾아 입력했습니다. 남은 피자 메뉴는 가격을 찾지 못했습니다. 영업 여부 표기가 디렉터리마다 달라 방문 전 확인이 필요합니다.', 'https://www.tabling.co.kr/place/677cce4566de5f06988296a1'),
    'seoul-217': ('이번 주 메뉴 가격이 고정되지 않은 것으로 표시되어 특정 가격을 입력하지 않았습니다.', 'https://www.diningcode.com/profile.php?rid=lCI1waUnElnv'),
    'seoul-230': ('지점 메뉴 가격 목록은 있으나 등록된 콩불고기채식김밥 가격은 별도 확인되지 않았습니다.', 'https://www.diningcode.com/profile.php?rid=eWVbkLcnAqnf'),
    'seoul-231': ('같은 주소의 과거 블로그 메뉴판은 찾았지만 게시물이 오래되어 현재 가격으로 옮기지 않았습니다.', 'https://www.keyzard.cc/daka1122/nb/223052670643'),
    'seoul-246': ('음료 메뉴 2개는 지점 가격 정보를 찾아 입력했습니다. 비건 카카오 브라우니 가격은 확인되지 않았습니다.', 'https://www.diningcode.com/profile.php?rid=d8w36JQStS7w'),
    'seoul-261': ('판매자 페이지에서 카카오라떼와 계절 스무디 가격을 찾아 입력했습니다. 샌드위치 가격은 확인되지 않았습니다.', 'https://www.daangn.com/kr/local-profile/%EA%B3%B5%EC%A0%95%EB%AC%B4%EC%97%AD%EC%9C%A0%EA%B8%B0%EB%86%8D%EC%B9%B4%ED%8E%98ka-gi47rjaqjwpt/'),
    'seoul-282': ('동일 지점 리뷰에는 다른 브런치 메뉴 가격만 있어 목록의 파스타·샌드위치 메뉴에 적용하지 않았습니다.', 'https://www.diningcode.com/profile.php?rid=9ojati23Vi5D'),
}

FONT = r'C:\Windows\Fonts\malgun.ttf'
FONT_BOLD = r'C:\Windows\Fonts\malgunbd.ttf'
pdfmetrics.registerFont(TTFont('Malgun', FONT))
pdfmetrics.registerFont(TTFont('Malgun-Bold', FONT_BOLD))
pdfmetrics.registerFontFamily('Malgun', normal='Malgun', bold='Malgun-Bold', italic='Malgun', boldItalic='Malgun-Bold')

green = colors.HexColor('#43573f')
ink = colors.HexColor('#263128')
muted = colors.HexColor('#677164')
pale = colors.HexColor('#f2f4ed')
line = colors.HexColor('#dfe4d9')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleKo', fontName='Malgun-Bold', fontSize=22, leading=30, textColor=green, spaceAfter=8))
styles.add(ParagraphStyle(name='SubKo', fontName='Malgun', fontSize=10, leading=16, textColor=muted, spaceAfter=8))
styles.add(ParagraphStyle(name='H1Ko', fontName='Malgun-Bold', fontSize=14, leading=20, textColor=green, spaceBefore=12, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name='H2Ko', fontName='Malgun-Bold', fontSize=9.3, leading=13, textColor=ink, spaceBefore=5, spaceAfter=1, keepWithNext=True))
styles.add(ParagraphStyle(name='BodyKo', fontName='Malgun', fontSize=8.5, leading=12, textColor=ink, spaceAfter=4))
styles.add(ParagraphStyle(name='SmallKo', fontName='Malgun', fontSize=7.1, leading=9, textColor=muted))
styles.add(ParagraphStyle(name='TableKo', fontName='Malgun', fontSize=7.6, leading=10, textColor=ink))
styles.add(ParagraphStyle(name='LinkKo', fontName='Malgun', fontSize=7.3, leading=10, textColor=green, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CellHeadKo', fontName='Malgun-Bold', fontSize=7.2, leading=9, textColor=colors.white, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='CenterKo', fontName='Malgun', fontSize=8, leading=11, textColor=ink, alignment=TA_CENTER))

PAGE_W, PAGE_H = A4
LEFT, RIGHT, TOP, BOTTOM = 14 * mm, 14 * mm, 20 * mm, 16 * mm

class Report(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM,
                         title='VEGAN SEOUL 메뉴 가격 미확인 목록', author='VEGAN SEOUL')
        frame = Frame(LEFT, BOTTOM, PAGE_W - LEFT - RIGHT, PAGE_H - TOP - BOTTOM, id='body')
        self.addPageTemplates(PageTemplate(id='main', frames=[frame], onPage=self.draw_page))

    def draw_page(self, canvas, doc):
        canvas.saveState()
        if doc.page > 1:
            canvas.setStrokeColor(line)
            canvas.line(LEFT, PAGE_H - 12 * mm, PAGE_W - RIGHT, PAGE_H - 12 * mm)
            canvas.setFont('Malgun-Bold', 7.5)
            canvas.setFillColor(green)
            canvas.drawString(LEFT, PAGE_H - 9 * mm, 'VEGAN SEOUL  |  가격 미확인 메뉴')
        canvas.setStrokeColor(line)
        canvas.line(LEFT, 11 * mm, PAGE_W - RIGHT, 11 * mm)
        canvas.setFont('Malgun', 7)
        canvas.setFillColor(muted)
        canvas.drawString(LEFT, 7 * mm, '자료 확인일: 2026-10-17  |  정보는 방문 전 매장에 재확인해 주세요')
        canvas.drawRightString(PAGE_W - RIGHT, 7 * mm, f'{doc.page}')
        canvas.restoreState()

def P(text, style='BodyKo'):
    return Paragraph(text, styles[style])

def link(url, label):
    return f'<link href="{escape(url, {chr(34): "&quot;"})}" color="#43573f"><u>{label}</u></link>'

def query_links(restaurant, menu):
    query = f"{restaurant['name']} {restaurant['address']} {menu['name']} 가격 메뉴"
    google = 'https://www.google.com/search?q=' + quote_plus(query)
    naver = 'https://search.naver.com/search.naver?query=' + quote_plus(query)
    return google, naver

def station_line(restaurant):
    details = restaurant.get('stationDetails') or []
    if not details:
        return '가까운 역: 미수록'
    bits = []
    for s in details[:3]:
        dist = f"{s['distanceMeters']}m" if s['distanceMeters'] < 1000 else f"{s['distanceMeters'] / 1000:.1f}km"
        bits.append(f"{escape(s['name'])} {dist} ({escape(', '.join(s['lines']))})")
    return '가까운 역: ' + ' · '.join(bits) + ' <font color="#677164">(직선거리)</font>'

def venue_block(restaurant_id, items, checked):
    r = by_restaurant[restaurant_id]
    status = ('가격이 확인된 메뉴 없음 · ' if restaurant_id not in enriched_places else '일부 메뉴 가격 등록 · ')
    status += ('지점·메뉴명 기준 재검색 완료, 일치하는 가격 미확인' if checked else '아직 개별 재검색 전, 아래 검색 링크에서 가격 확인')
    title = P(f"{escape(r['name'])} <font size='7' color='#677164'>| {escape(r['district'])} · {escape(r['category'])}</font>", 'H2Ko')
    address = P(f"{escape(r['address'])}<br/>{station_line(r)}<br/><font color='#8a5b35'>{escape(status)}</font>", 'SmallKo')
    rows = [[P('메뉴', 'CellHeadKo'), P('네이버 검색', 'CellHeadKo'), P('Google 검색', 'CellHeadKo')]]
    for m in items:
        naver, google = query_links(r, m)[1], query_links(r, m)[0]
        rows.append([P(escape(m['name']), 'TableKo'), P(link(naver, '열기 ↗'), 'LinkKo'), P(link(google, '열기 ↗'), 'LinkKo')])
    table = Table(rows, colWidths=[104 * mm, 28 * mm, 35 * mm], repeatRows=1, hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), green),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('LINEBELOW', (0, 0), (-1, 0), 0.4, green),
        ('LINEBELOW', (0, 1), (-1, -1), 0.35, line),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    blocks = [title, address, table]
    note = search_notes.get(restaurant_id)
    if note:
        text, url = note
        blocks.append(P(f"<b>확인 메모:</b> {escape(text)} {link(url, '참고한 결과 ↗')}", 'SmallKo'))
    blocks.append(Spacer(1, 5))
    return KeepTogether(blocks)

story = []
story.append(Spacer(1, 20 * mm))
story.append(P('VEGAN SEOUL', 'SmallKo'))
story.append(P('가격을 확인하지 못한<br/>식당과 메뉴 목록', 'TitleKo'))
story.append(P('서울 비건 한 끼 지도 · 가격 정보 재검색 보조자료', 'SubKo'))
story.append(HRFlowable(width='100%', thickness=1, color=green, spaceBefore=3, spaceAfter=12))

zero_price_groups = {rid: items for rid, items in groups.items() if rid not in enriched_places}
partial_groups = {rid: items for rid, items in groups.items() if rid in enriched_places}
zero_menu_count = sum(len(v) for v in zero_price_groups.values())
partial_menu_count = sum(len(v) for v in partial_groups.values())

summary = [
    [P('전체 미확인', 'CenterKo'), P('가격 자료가 전혀 없는 곳', 'CenterKo'), P('일부 가격만 있는 곳', 'CenterKo')],
    [P(f'<b>{len(groups)}곳 · {len(unpriced)}개 메뉴</b>', 'CenterKo'), P(f'<b>{len(zero_price_groups)}곳 · {zero_menu_count}개 메뉴</b>', 'CenterKo'), P(f'<b>{len(partial_groups)}곳 · {partial_menu_count}개 메뉴</b>', 'CenterKo')],
]
summary_table = Table(summary, colWidths=[58 * mm] * 3, rowHeights=[10 * mm, 14 * mm])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), pale), ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BOX', (0, 0), (-1, -1), 0.5, line), ('INNERGRID', (0, 0), (-1, -1), 0.35, line),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(summary_table)
story.append(Spacer(1, 10))
story.append(P('<b>이번 점검 결과</b> 281곳의 영업 목록 중 출처와 연결된 메뉴 가격은 330개, 가격이 등록되지 않은 메뉴는 485개입니다. 그중 30곳은 가격이 표시된 메뉴가 하나도 없어 지점명·메뉴명으로 웹 재검색을 했지만, 메뉴와 지점이 모두 맞는 가격을 찾지 못했습니다. 일부 가격만 등록된 210곳의 나머지 메뉴도 이 파일에 모두 넣었습니다.', 'BodyKo'))
story.append(P('<b>목록 읽는 법</b> 1) 가격 정보가 전혀 없는 30곳은 “재검색 완료”로 표시했습니다. 2) 일부 메뉴에 가격이 있는 210곳은 “개별 재검색 전”으로 표시했습니다. 검색 결과가 다른 메뉴이거나 지점이 불분명하거나 오래된 가격은 지도에 입력하지 않았습니다. 메뉴별 네이버·Google 링크를 눌러 현재 가격표를 확인하거나 매장에 문의해 주세요.', 'BodyKo'))
story.append(P('<b>가격 출처 메모</b> 플랫폼·블로그에 표시된 가격은 매장 공식 가격으로 보증되지 않습니다. 지도에는 출처 종류와 확인일을 표시합니다. 천년식향과 몽크스부처 도산은 가격 정보가 있는 메뉴도 있으나 영업 여부가 디렉터리별로 엇갈려 방문 전 확인을 권합니다.', 'BodyKo'))
story.append(P('<b>가까운 역</b> 서울교통빅데이터플랫폼의 2026-10-15 갱신 역 좌표로 계산한 직선거리입니다. 도보 경로 거리와 다를 수 있습니다.', 'BodyKo'))
story.append(P(f"생성일 2026-10-17 · 전체 {len(unpriced)}개 메뉴 / {len(groups)}곳 · 가격 출처가 생기면 지도 정보에 반영해 주세요.", 'SmallKo'))
story.append(PageBreak())

story.append(P('A. 가격 정보가 전혀 없는 식당', 'H1Ko'))
story.append(P(f'{len(zero_price_groups)}개 지점의 {zero_menu_count}개 메뉴입니다. 각 지점의 메뉴와 주소를 다시 검색했습니다. 검색 결과에 가격이 있더라도 메뉴명이나 지점이 맞지 않으면 가격을 옮기지 않았습니다.', 'SubKo'))
for rid in sorted(zero_price_groups, key=lambda k: (by_restaurant[k]['district'], by_restaurant[k]['name'])):
    story.append(venue_block(rid, zero_price_groups[rid], checked=True))

story.append(PageBreak())
story.append(P('B. 일부 메뉴 가격만 확인된 식당', 'H1Ko'))
story.append(P(f'{len(partial_groups)}개 지점의 가격 미확인 메뉴 {partial_menu_count}개입니다. 각 메뉴명과 주소로 바로 검색할 수 있습니다. 이 메뉴들은 이번 재검색에서 모두 가격 출처를 검토하지 않았으므로 “없음”이 아니라 “추가 확인 필요”로 봐 주세요.', 'SubKo'))
for rid in sorted(partial_groups, key=lambda k: (by_restaurant[k]['district'], by_restaurant[k]['name'])):
    story.append(venue_block(rid, partial_groups[rid], checked=False))

doc = Report(OUT_PATH)
doc.build(story)
print(json.dumps({
    'path': OUT_PATH,
    'bytes': os.path.getsize(OUT_PATH),
    'activeRestaurants': len(active),
    'unpricedRestaurants': len(groups),
    'unpricedMenus': len(unpriced),
    'zeroPriceRestaurants': len(zero_price_groups),
    'zeroPriceMenus': zero_menu_count,
    'partiallyPricedRestaurants': len(partial_groups),
    'partiallyPricedMenus': partial_menu_count,
}, ensure_ascii=False))
