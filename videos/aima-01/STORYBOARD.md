# AIMA — "Tôi chỉ định làm 1 cái content thôi…"

**Logline:** Một creator muốn làm *một* content, nhưng cứ research, săn trend, nghĩ idea, viết caption, chỉnh sửa… nên khi xong thì nhìn đồng hồ: "Ủa? Hết ngày rồi?"

**World:** một góc làm việc duy nhất (bàn, màn hình, cửa sổ, đồng hồ treo tường, ly cà phê, thùng rác giấy). Bầu trời ngoài cửa sổ đi đúng theo dải màu của logo AIMA: sáng **cyan** → trưa **xanh dương** → chiều **tím** → hoàng hôn **hồng magenta** → đêm **chàm**. Phòng tối dần; ban đêm ánh sáng chính là màn hình.

**Nhân vật:** creator màu tím-lavender của AIMA, đeo tai nghe magenta/cyan (dùng rig nhân vật có sẵn trong kit, đổi màu theo nhận diện thương hiệu).

**Motif:** cái đồng hồ. Hai lần camera lao vào đồng hồ, kim quay vùn vụt (time-lapse) — khán giả thấy thời gian trôi, creator thì không. Ly cà phê và giấy vo tròn chồng chất dần. Lần cuối creator mới tự nhìn lên đồng hồ → payoff.

**Cảm xúc:** hy vọng → quyết tâm → hào hứng → suy nghĩ → choáng → mê trend → xịu → suy nghĩ → có idea! → quyết tâm → bực → quyết tâm → buồn ngủ → nhẹ nhõm → ngơ ngác → giật mình → "Ủa?"

**Shots** (24 fps, 120 bpm, 73.5 s). Các mốc A–G bên dưới là *giờ sự kiện* (event time) của căn phòng, không phải giờ của video: `TIMING` trong [video.js](video.js) kéo giãn từng đoạn lên đồng hồ video (đoạn diễn xuất và lời thoại chạy 0.48–0.8 lần, cú lia/zoom và time-lapse giữ 1), và soundtrack dùng chung bảng đó. Chỉnh nhịp ở `TIMING`, không sửa các mốc trong scene.

Phần 1 (0–38.1 s video): câu mở đầu 2.8 s, rồi câu chuyện:

```
A  0.0–3.0   [vào: iris mở trên creator]  Buổi sáng, trời cyan, 8:00. Creator quay ra camera đầy hy vọng, gồng tay quyết tâm,
             quay sang màn hình, gõ phím → màn hình sáng lên → hào hứng.
   reads: 0.0–0.8 iris mở: căn phòng buổi sáng · 0.9–1.6 quyết tâm · 1.6–2.2 quay sang, gõ phím, màn hình bật · 2.25–3.0 hào hứng
B  3.0–5.6   [camera đẩy sang màn hình]  RESEARCH: cửa sổ trình duyệt bật ra liên tục, nhanh dần, tràn khỏi màn hình.
   reads: 3.25 suy nghĩ · 3.5–4.7 tab bật pop-pop-pop · 4.8–5.6 creator choáng (mắt xoáy)
   [chuyển: camera lao vào đồng hồ, kim quay 9h→12h30, rút ra]
C  6.6–9.4   TREND: feed lướt vèo vèo, dừng ở một trend đang hot (lửa, tim bay ra) → creator mắt sao; biểu đồ trend rớt cái bụp → xịu.
   reads: 6.7–7.6 lướt feed · 7.6–8.3 trend hot, mắt sao · 8.4–8.7 trend rớt · 8.75–9.4 xịu, mây mưa
   [chuyển: camera lia trái sang thùng rác]
D  9.9–12.4  IDEA: quay mặt ra, suy nghĩ, vo giấy ném 3 lần (1 quả trượt), rồi bóng đèn idea bật!
   reads: 9.9–10.3 suy nghĩ · 10.4 / 10.9 / 11.4 ba cú ném · 11.6–12.3 idea!
   [chuyển: lao lại về bàn phím (cut on action)]
E  12.6–15.2 CAPTION: gõ ra 4 dòng, xoá sạch (bực, bốc khói), gõ lại nhanh hơn kèm emoji.
   reads: 12.7–13.6 gõ · 13.7–14.0 xoá · 13.8–14.3 bực · 14.35–15.0 gõ lại
   [chuyển: camera lao vào đồng hồ lần 2, kim quay 17h30→22h30, trời tối]
F  16.3–19.0 EDIT (ban đêm): kéo clip vào timeline, render chạy, creator gà gật; render xong ✓ → nhẹ nhõm, vươn vai.
   reads: 16.5–17.3 clip vào timeline · 17.4–18.3 render · 18.35 dấu ✓ · 18.4–19.3 vươn vai
G  19.0–23.5 [camera kéo ra toàn cảnh]  Đêm, trăng, 5 ly cà phê, đống giấy. Creator liếc lên đồng hồ: kim nhảy đúng 12:00.
             Crash zoom: giật mình, quay ra camera, ngơ ngác. Chữ "Ủa?" … "Hết ngày rồi?"
   reads: 19.4–19.9 liếc lên đồng hồ · 19.9–20.4 kim nhảy 12:00, đồng hồ rung · 20.5 giật mình (crash zoom) ·
          21.2 "Ủa?" · 21.7 "Hết ngày rồi?" · giữ đến 24.8
```

Phần mở đầu (0–2.8 s video): căn phòng buổi sáng, iris mở, caption "Tôi chỉ định làm 1 cái content thôi…" + giọng creator.

**Phần 2: giới thiệu AIMA** (mốc của M là giờ sự kiện tính từ match cut; giờ video ở bảng giọng đọc):

```
P  38.1–43.7 [chuyển: brush wipe tím/hồng]  Card logo AIMA + "Trợ lý AI cho Content Marketing / AI Content Marketing Co-pilot".
             Cuối shot logo phình to ra giữa khung → match cut vào màn hình máy tính đang hiện logo.
M  43.7–68.0 Sáng hôm sau, cùng căn phòng, trời cyan, 8:00. Camera kéo ra từ màn hình. AIMA làm từng việc:
             1.0  Bắt trend tự động theo ngành hàng (trend tự xếp hạng, cái hợp nhất được ✓)
             3.3  Ý tưởng · Kịch bản · Caption · Hashtag (3 thẻ tự điền + nút CTA)
             7.2  Facebook · TikTok · Instagram · Threads (1 nội dung tách thành 4 phiên bản)
             10.9 Lên lịch · Tự đăng bài · Đo hiệu quả (lịch đăng + biểu đồ đi lên)
             13.5 "Tất cả trong một luồng làm việc": creator đeo kính râm ngả lưng; camera kéo ra
             15.0 liếc đồng hồ: 9:00 → giật mình → "Ơ… Mới 9 giờ sáng?" (vần với "Ủa? Hết ngày rồi?") → cười
E  68.0–73.5 [chuyển: brush wipe cyan/xanh]  Logo + "Làm content, nhẹ tênh." + "Trợ lý AI cho creator & doanh nghiệp nhỏ". Fade về giấy.
```

## Âm thanh

`audio/soundtrack.m4a` do `audio/make_audio.py` tạo (dùng `tools/audiokit.py`, cần numpy + ffmpeg), khớp từng mốc với cảnh qua cùng bảng `TIMING`:
nhạc tự tổng hợp theo nhịp 120 bpm (lo-fi ban ngày → pad buồn ngủ ban đêm → im bặt ở crash zoom → riser → nhạc sáng cho AIMA),
hiệu ứng (pop, gõ phím, tích tắc, chuông nửa đêm, scratch, ném giấy…), và giọng đọc tiếng Việt.

Giọng đọc (`audio/vo/`, tạo bằng `tools/make_vo.py` với VieNeu-TTS offline từ `audio/lines.tsv`; creator = Ngọc Huyền, người dẫn = Hải Đăng;
"content" đọc là "còn ten", "idea" → "ai đia", "research" → "rì sớt", "AIMA" → "ai ma"). Mỗi câu cách câu trước ít nhất 0.55 s,
không câu nào lấn qua chỗ chuyển cảnh. Thay bằng bản thu của bạn: lưu thành `audio/vo/<id>.wav` (xoá dòng đó khỏi `vo/manifest.json`).

| id | giọng | câu | lúc (video) |
|---|---|---|---|
| c_hook | creator | Tôi chỉ định làm một cái content thôi… | 0.45 |
| c_research | creator | Research tí đã… | 6.95 |
| c_trend / c_trend2 | creator | Ối, trend này hot nè! / Ơ… hết hot rồi. | 12.14 / 14.39 |
| c_idea / c_idea2 | creator | Nghĩ idea… nghĩ idea… / A, có rồi! | 16.33 / 19.59 |
| c_caption | creator | Xoá! Viết lại! | 22.66 |
| c_edit / c_done | creator | Edit nốt… render nữa là xong… / Xong! | 25.74 / 28.48 |
| c_punch1 / c_punch2 | creator | Ủa? / Hết ngày rồi? (mỗi câu đi cùng một dòng chữ) | 32.06 / 33.06 |
| n_1 | người dẫn | Đừng để một cái content ngốn trọn cả ngày của bạn. | 34.81 |
| n_2 | người dẫn | AIMA, trợ lý AI cho content marketing. | 39.96 |
| n_3 … n_6 | người dẫn | Tự động bắt trend theo ngành hàng. / Gợi ý ý tưởng, viết kịch bản, caption và hashtag. / Tối ưu riêng cho Facebook, TikTok, Instagram và Threads. / Lên lịch, tự đăng bài và đo hiệu quả. | 44.98 / 48.14 / 52.59 / 57.22 |
| n_7 | người dẫn | Tất cả, trong một luồng làm việc. | 60.77 |
| c_morning1 / c_morning2 | creator | Ơ… / Mới chín giờ sáng? | 64.30 / 65.15 |
| n_8 | người dẫn | AIMA. Làm content, nhẹ tênh. | 68.81 |

**Chữ trên hình:** câu mở đầu, hai câu "Ủa? Hết ngày rồi?" / "Ơ… Mới 9 giờ sáng?", các caption tính năng của AIMA, và logo + tagline. Mọi nội dung trên màn hình máy tính (tab, feed, caption, timeline, app AIMA) là nét vẽ, không có chữ.
