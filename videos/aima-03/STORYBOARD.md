# AIMA #3: "Trend này đang viral… nhưng brand mình làm gì với nó?"

Bài **TikTok 3 · Problem** trong [kế hoạch truyền thông](../../context/aima/campaign.md): skit / storytelling. "Creator
thấy một trend hot, rất muốn bắt trend nhưng lo không hợp brand/audience → càng nghĩ càng bí." Chưa giới thiệu sản phẩm;
chỉ có logo nhỏ ký tên kênh ở cuối. Video dọc 1080×1920, 24 fps, 120 bpm, 39.4 s.

**Logline:** Lướt trúng một điệu nhảy đang viral, creator muốn bắt trend liền, nhưng nghĩ mãi không ra cách cho cây nến
thơm của brand mình "nhảy" theo; tới lúc quay lại thì ai cũng làm trend đó rồi: "Thấy trend thì dễ… Biến thành content
mới khó!"

**World:** căn phòng chung của series ([../_aima/set.js](../_aima/set.js)), cùng creator. Lần này trên bàn có thêm sản
phẩm của brand: một hũ nến thơm màu tím của thương hiệu, đang cháy. Bắt đầu lúc 14:00 trời xanh; kết thúc lúc gần 18:00
trời tím hồng (trend cũng "lặn" theo).

**Motif:** ngọn lửa. Ngọn nến trên bàn cháy suốt video; biểu tượng ngọn lửa "hot" cạnh video viral sáng lên, rồi tắt
phụt khi trend đã cũ. Trong bong bóng suy nghĩ 1, cây nến nhảy theo trend và tắt lửa.

**Shots** (giờ video; `TIMING` ở [video.js](video.js), âm thanh dùng chung):

```
A  0–3.3     [iris mở]  Caption hai dòng "Trend này đang viral…" / "…nhưng brand mình làm gì với nó?". Creator lướt
             feed, chán. Vuốt 3 video; video thứ 3 là điệu nhảy: ngọn lửa bật, tim bay, cột view vọt lên.
B  3.3–8.1   [camera tiến vào bàn]  Giật mình → mắt sao: "Ơ! Trend này đang viral nè!". Giơ nắm tay: "Bắt trend liền
             thôi!". Quay ra, ngẩng lên.
C  8.1–24.4  [camera lùi lên khung suy nghĩ]  Ba bong bóng suy nghĩ, mỗi cái một cách gắn trend vào brand:
             1 (8.3–12.9) cây nến nhảy theo nhịp… nghiêng, đổ, tắt lửa, khói: "Nến thơm mà nhảy… kỳ kỳ." → nhăn mặt.
             2 (13.3–18.0) quét sơn neon lên màu tím của brand (bảng màu brand bên cạnh): "Đổi màu cho bắt mắt?…"
               rồi dấu X đỏ đóng xuống: "Không giống brand mình." → mây mưa.
             [18.2: camera lao vào đồng hồ, kim quay 14:30 → 17:00, rút ra]
             3 (20.0–24.2) bốn khách hàng nhỏ hiện ra nhìn cây nến, mỗi người một dấu "?": "Mà khách của mình… có
               thích không ta?" → lo lắng. Mỗi bong bóng vỡ "bụp" khi bị gạt bỏ.
D  24.4–29.6 [quay lại laptop]  Vuốt feed: video nào cũng cùng một điệu nhảy, rồi cả lưới 6 bản sao nhảy đồng loạt;
             ngọn lửa "hot" tắt, cột view tụt. Giật mình → buồn: "Ủa… ai cũng làm trend này rồi?"
E  29.6–34.4 [quay ra camera, crash zoom 30.1, nhạc tắt]  "Thấy trend thì dễ…" … "Biến thành content mới khó!"
             (chữ + giọng; câu trong product.md: "Thấy trend và biến trend thành content là hai chuyện khác nhau").
OUTRO 34.4–39.4 [brush wipe]  Creator giơ tay hỏi: "Có ai từng nghĩ mãi, tới lúc trend hết hot chưa?", rồi logo AIMA nhỏ.
```

## Lời thoại (giọng creator: Thái Sơn; giờ video bắt đầu)

| id | câu | lúc |
|---|---|---|
| e_hook | Ơ! Trend này đang viral nè! | 3.6 |
| e_go | Bắt trend liền thôi! | 6.3 |
| e_try1 | Nến thơm mà nhảy... kỳ kỳ. | 9.7 |
| e_try2 | Đổi màu cho bắt mắt?... Không giống brand mình. | 13.9 |
| e_try3 | Mà khách của mình... có thích không ta? | 21.3 |
| e_late | Ủa... ai cũng làm trend này rồi? | 27.0 |
| e_punch1 / e_punch2 | Thấy trend thì dễ... / Biến thành content mới khó! | 30.25 / 31.9 |
| e_ask | Có ai từng nghĩ mãi, tới lúc trend hết hot chưa? | 34.85 |

Giờ đặt câu dựa trên độ dài ước lượng của giọng VieNeu; sau khi chạy `tools/make_vo.py`, `audio/make_audio.py` in bảng
cue và đánh dấu câu nào sát câu trước. Nếu có, chỉnh giờ trong `place_vo` (hoặc thêm điểm neo vào `TIMING.story`).

**Chữ trên hình:** caption tiêu đề, "Thấy trend thì dễ…" / "Biến thành content mới khó!", câu hỏi cuối và logo. Feed,
bong bóng suy nghĩ, bảng màu và khách hàng là nét vẽ, không có chữ.
