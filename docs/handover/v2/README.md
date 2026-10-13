# 인수 보고서 v2 만들기

`report-v2.md` + `images/` → PDF. 화면 캡처는 개발 서버(`pnpm dev`)를 띄운 뒤 Playwright로 찍었고(390×844, 2배율; 지도는 820×1180·1280×800), 말로 이야기하기 화면은 2026-10-13 실제 키로 받은 전사·대답 문장을 그대로 재생해 찍었다.

```sh
cd docs/handover/v2
pandoc report-v2.md -f gfm+raw_html -t html5 --standalone --css report.css --metadata title="마음잇다 인수보고서 v2" -o report-v2.html
# <head>에 <meta charset="utf-8"> 추가, pandoc의 title-block header 제거 후
node -e "const {chromium}=require('@playwright/test');(async()=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();await p.goto('file://'+process.cwd()+'/report-v2.html');await p.evaluate(()=>document.fonts.ready);await p.pdf({path:'마음잇다_인수보고서_v2_2026-10-13.pdf',format:'A4',printBackground:true,margin:{top:'16mm',bottom:'16mm',left:'14mm',right:'14mm'}});await b.close()})()"
```
