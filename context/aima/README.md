# AIMA: tóm tắt cho agent

**AIMA** (đọc là "ai ma") = **AI Content Marketing Co-pilot**: nền tảng dùng AI hỗ trợ trọn quy trình content
marketing, cho **creator độc lập** và **doanh nghiệp nhỏ/siêu nhỏ (Micro/SMEs)**.

- **Làm gì:** bắt trend theo ngành hàng → gợi ý idea, viết kịch bản, caption, hashtag, CTA → tối ưu riêng cho từng nền
  tảng (Facebook, TikTok, Instagram, Threads) → lên lịch, tự đăng, đo hiệu quả và gợi ý cải thiện.
- **Lời hứa:** cả quy trình làm content trong **một luồng làm việc**: tiết kiệm thời gian, giảm chi phí nhân sự, bớt
  quá tải/kiệt sức vì sáng tạo (content burnout).
- **Vai trò:** một "trợ lý" ngồi cạnh creator. AI không làm thay, **người dùng vẫn kiểm soát và quyết định nội dung**.
- **Gói:** Free, Plus (199k), Pro (499k). Gói trả phí thêm tự động đăng bài và hạn mức token cao hơn.
- **Ngôn ngữ:** tiếng Việt, giọng gần gũi của creator (xem [brand.md](brand.md)).

| file | khi nào đọc |
|---|---|
| [product.md](product.md) | viết lời thoại/caption về tính năng, nỗi đau của người dùng, so sánh gói |
| [brand.md](brand.md) | màu, logo, font, tagline, cách đọc tên, giọng đọc, tông giọng |
| [campaign.md](campaign.md) | video này thuộc giai đoạn nào, chủ đề gì, đã làm gì rồi |

## Quy tắc cho video về AIMA

- Bám đúng các giai đoạn truyền thông: **Awareness → Problem → Solution → Product → Conversion**
  ([campaign.md](campaign.md)). Video Awareness/Problem kể nỗi đau, chưa cần bán; từ Solution mới giới thiệu AIMA.
- Nhân vật chính là một **creator**: người xem phải thấy mình trong đó (research mãi, trend hot nhưng không biết dùng,
  mở 7 tool cho 1 content, viết rồi xoá, cạn pin).
- Chỉ nói những tính năng có trong [product.md](product.md). Giá chỉ nhắc ở video Conversion.
- CTA chuẩn: "Truy cập landing page AIMA" (Solution) · "Đăng ký dùng thử" (Solution/Product) · "Nâng cấp gói phù hợp"
  (Conversion). Tài liệu gốc chưa có URL landing page; đừng tự đặt.
- Từ tiếng Anh đọc theo [tools/voice/pronunciation.tsv](../../tools/voice/pronunciation.tsv) (AIMA → ai ma, content → còn ten, …).

## Video đã làm

Video dọc 1080×1920 cho TikTok, dùng chung căn phòng, creator, chữ và phần kết của series trong
[videos/_aima/set.js](../../videos/_aima/set.js). Video Awareness/Problem kết bằng một câu hỏi cho khán giả và logo AIMA nhỏ,
không giới thiệu tính năng. Từ Solution trở đi (aima-05 …), phần kết là CTA và logo lớn
(`AIMA.outro(..., { q: [CTA 2 dòng], logoH: 260 })`), và AIMA hiện trên laptop bằng `AIMA.app()`.

| video | bài trong kế hoạch | ghi chú |
|---|---|---|
| [videos/aima-01](../../videos/aima-01/) | TikTok 1 · Awareness · "Tôi chỉ định làm 1 cái content thôi…" | 60.9 s; kịch bản "30 phút là xong" → nửa đêm; kết: "Bạn mất bao lâu cho 1 cái content?" |
| [videos/aima-02](../../videos/aima-02/) | TikTok 2 · Awareness · "Mở laptop ra… và không biết đăng gì." | 39.4 s; kết: "Có ai cũng từng bị đứng hình như vậy không?" |
| [videos/aima-03](../../videos/aima-03/) | TikTok 3 · Problem · "Trend này đang viral… nhưng brand mình làm gì với nó?" | 39.4 s; brand = hũ nến thơm trên bàn; chốt: "Thấy trend thì dễ… Biến thành content mới khó!"; kết: "Có ai từng nghĩ mãi, tới lúc trend hết hot chưa?" |
| [videos/aima-04](../../videos/aima-04/) | TikTok 4 · Problem · "POV: Mở 7 tab để làm 1 cái content" | 31.4 s; chốt: "Chuyển tab… còn nhiều hơn làm content!"; kết: "Bạn đang mở bao nhiêu tab vậy?" |
| [videos/aima-05](../../videos/aima-05/) | TikTok 5 · Solution · "POV: Làm 1 content nhưng mở 7 cái app." | 33.6 s; tung hứng 7 app → "ước gì có một đứa ngồi kế bên" → AIMA mở ra; CTA: landing page |
| [videos/aima-06](../../videos/aima-06/) | TikTok 6 · Solution · "Một trend vào AIMA thì chuyện gì xảy ra?" | 28.0 s; demo hoạt hình, cùng trend + nến của #3; CTA: landing page, đăng ký dùng thử |
| [videos/aima-07](../../videos/aima-07/) | TikTok 7 · Product · "Lần đầu dùng AIMA thì bắt đầu từ đâu?" | 29.6 s; 4 bước có caption đánh số; CTA: đăng ký dùng thử |
| [videos/aima-08](../../videos/aima-08/) | TikTok 8 · Conversion · "Dùng Free rồi, vậy nâng cấp để làm gì?" | 32.2 s; 3 thẻ gói (chỉ giá + tự đăng bài + token cao hơn); CTA: nâng cấp gói phù hợp |
