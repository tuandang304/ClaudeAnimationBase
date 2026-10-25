# AIMA #4: "POV: Mở 7 tab để làm 1 cái content"

Bài **TikTok 4 · Problem** trong [kế hoạch truyền thông](../../context/aima/campaign.md): POV / fast-cut skit. Bảng gốc
chép trùng nội dung bài 3 cho bài này, nên video đi theo **chủ đề** của bài (và bài Threads 4 cùng ngày): "TikTok tìm trend
→ ChatGPT brainstorm → Notes viết → Canva thiết kế → CapCut chỉnh → Meta đăng → Analytics xem số liệu. Chuyển tool nhiều
hơn là tập trung sáng tạo." Không gọi tên app thật (không chữ, không logo): mỗi tab là một màu và một kiểu màn hình.
Chưa giới thiệu sản phẩm; chỉ có logo nhỏ ở cuối. Video dọc 1080×1920, 24 fps, 120 bpm, 31.4 s.

**Logline:** "Làm một cái content thôi" nghĩa là mở bảy cái tab, mỗi tab một việc; đến lúc cần lại cái caption thì
không biết nó nằm ở tab nào, lật tab tới mức laptop treo, và ngẩng lên đã là hoàng hôn.

**World:** căn phòng chung của series ([../_aima/set.js](../_aima/set.js)), cùng creator. 9:00 sáng trời cyan, laptop mở
một tab trắng. Kết thúc lúc gần 18:00 trời tím hồng.

**Motif:** thanh tab trên màn hình. Mỗi tab mới bật vào thanh (một chấm màu riêng), dày dần; trong cơn loạn, tab mở thêm
tới 16 cái, mỗi cái co lại thành một mẩu.

**Shots** (giờ video; `TIMING` ở [video.js](video.js), âm thanh dùng chung):

```
A  0–3.6     [iris mở]  Caption hai dòng "POV: Mở 7 tab" / "để làm 1 cái content". Creator quyết tâm: "Làm một cái
             content thôi. Bắt đầu!", quay sang laptop (một tab trắng, ô tìm kiếm).
B  3.6–15.2  [camera vào khung bàn, đẩy dần]  Bảy tab, mỗi 1.55 s một tab: bấm → tab bật lên thanh → màn hình đổi:
             1 feed video (điệu nhảy) "Tìm trend…" · 2 khung chat, bóng đèn "Nghĩ idea…" · 3 trang ghi chú vàng đang gõ
             "Viết caption…" · 4 bảng vẽ thiết kế "Thiết kế ảnh…" · 5 timeline dựng video "Dựng video…" · 6 lịch đăng bài
             "Lên lịch đăng…" · 7 biểu đồ "Xem số liệu…". Mặt chuyển dần: hào hứng → bình thường → lo.
C  15.2–21.0 "Ơ… cái caption nãy để tab nào ta?" (bối rối, mắt đảo). 17.6: lật tab, nhanh dần (0.38 s → 0.08 s một
             lần), tab mới cứ mở thêm, camera lao vào màn hình và rung. 20.6: laptop treo (vòng xoay), bốc khói; creator
             chóng mặt.
D  21.0–26.6 [kéo ra: kim đồng hồ quay vùn vụt tới hoàng hôn]  Quay ra camera. 22.5 crash zoom, nhạc tắt: "Chuyển tab…"
             … "còn nhiều hơn làm content!" (chữ + giọng).
OUTRO 26.6–31.4 [brush wipe]  Creator giơ tay hỏi: "Bạn đang mở bao nhiêu tab vậy?", rồi logo AIMA nhỏ.
```

## Lời thoại (giọng creator: Thái Sơn; giờ video bắt đầu)

| id | câu | lúc |
|---|---|---|
| f_hook | Làm một cái content thôi. Bắt đầu! | 0.9 |
| f_t1 … f_t7 | Tìm trend… / Nghĩ idea… / Viết caption… / Thiết kế ảnh… / Dựng video… / Lên lịch đăng… / Xem số liệu… | 3.9, 5.45, 7.0, 8.55, 10.1, 11.65, 13.2 |
| f_lost | Ơ... cái caption nãy để tab nào ta? | 15.2 |
| f_punch1 / f_punch2 | Chuyển tab... / còn nhiều hơn làm content! | 22.65 / 23.9 |
| f_ask | Bạn đang mở bao nhiêu tab vậy? | 27.05 |

Giờ đặt câu dựa trên độ dài ước lượng của giọng VieNeu (mỗi câu tên tab phải ngắn hơn ~0.8 s để còn 0.6 s nghỉ trước tab
sau); `audio/make_audio.py` in bảng cue và đánh dấu câu nào sát câu trước. Nếu có, giãn `TIMING.tabs` trong video.js.

**Chữ trên hình:** caption tiêu đề, "Chuyển tab…" / "còn nhiều hơn làm content!", câu hỏi cuối và logo. Tab, các màn hình
công cụ là nét vẽ, không có chữ, không logo app thật.
