<!DOCTYPE html>
<!-- 宣告使用 HTML5；DOCTYPE 是文件類型宣告，不需要結束標籤。 -->
<html lang="zh-Hant">
<!-- html 包住整份文件；lang="zh-Hant" 表示主要使用繁體中文。 -->
<head>
    <!-- head 放網頁資訊；這些資訊不會直接成為頁面中的報導文字。 -->
    <meta charset="UTF-8">
    <!-- UTF-8 可正確處理中文；meta 是空元素，不寫結束標籤。 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- viewport 讓行動裝置使用裝置寬度；不代表固定寬度的圖片會自動縮小。 -->
    <meta name="description" content="走進東協廣場與舊城街區，認識小東南亞、綠川水岸與異國風情，透過清單、表格、照片和影片閱讀城市故事。。">
    <!-- description 提供網頁摘要；author 標示作者。 -->
    <meta name="author" content="陳薇予">
    <title>東協廣場報導｜台中城裡的小東南亞</title>
    <!-- title 顯示在瀏覽器分頁；與 body 中的 h1 用途不同。 -->
</head>

<body>
    <!--
        第四次作業：一頁式東協廣場報導。
        本範例僅使用 HTML，保留瀏覽器預設呈現，不加入 CSS 或 JavaScript。
        註解使用「小於符號、驚嘆號、兩個連字號」開始，並以兩個連字號及大於符號結束。
        註解不會顯示於網頁，但讀者可從原始碼看見，因此不要放私人資料。
        使用一致的四個空格縮排；成對標籤都明確寫出結束標籤。
    -->

    <!-- header 是頁首；id="top" 是下方「回到頁首」連結的目的地。 -->
    <header id="top">
        <!-- h1 是本頁主標題；h2 用於各章節，依內容階層選用標題。 -->
        <h1>東協廣場：台中城裡的小東南亞</h1>
        <p>從綠川水岸到異國街巷，一起閱讀台中的城市記憶。。</p>
        <!-- time 的 datetime 以標準日期格式提供機器可讀的日期。 -->
        <p>作者：HTML 課程示範作者｜報導整理日期：<time datetime="2026-10-07">2026 年 10 月 7 日</time></p>
        <p><small>本文為資料整理型教學報導，非現場採訪紀錄。</small></p>
    </header>

    <!-- nav 表示導覽區；href="#名稱" 會跳到本頁相同 id 的元素。 -->
    <nav aria-label="報導目錄">
        <h2>報導目錄</h2>
        <ul>
            <li><a href="#intro">東協簡介</a></li>
            <li><a href="#highlights">景點特色與散步順序</a></li>
            <li><a href="#table">景點比較表</a></li>
            <li><a href="#photo">東協廣場照片</a></li>
            <li><a href="#video">影音報導</a></li>
            <li><a href="#sources">資料來源</a></li>
        </ul>
    </nav>

    <!-- hr 表示內容主題的分隔，也是沒有結束標籤的空元素。 -->
    <hr>

    <!-- main 包住本頁主要內容；article 表示可獨立閱讀的完整報導。 -->
    <main>
        <article aria-label="東協廣場專題報導">
            <!-- section 將報導分成有標題的章節；同一頁中的 id 不可重複。 -->
            <section id="intro">
                <h2>一、東協簡介</h2>
                <!-- p 表示段落；strong 強調重要資訊，不用來取代標題。 -->
                <p>
                    東協廣場位於台中市舊城中心，前身為第一市場（第一廣場），隨著移工與新住民的聚落發展，成為感受東南亞異國文化與歷史變遷的重要地點。周邊結合綠川水岸步道、東南亞超市與道地美食攤位，讓人能在台中生活中體驗說走就走的微出國氛圍。

                </p>
                <p>
                    區內最具代表性的特色是多元文化匯聚的「小東南亞」街區。無論是周邊的綠川河岸風光，還是大樓內豐富的異國商店，這裡交織出台中獨特的包容與熱情。
                    
                </p>
                <p>
                    從綠川水岸的輕快漫步到東協廣場的美味探索，台中就像一份充滿驚喜的異國旅遊筆記。本篇以景點整理與建議散步順序，介紹這座充滿異國風情的舊城地標。
                </p>
                <!-- br 僅用於同段文字中需要的換行；不要用很多 br 製造間距。 -->
                <p>東協地址：臺中市中區繼光里綠川西街135號。<br>閱讀重點：異國文化、綠川水岸、東南亞美食與微出國體驗。</p>
            </section>

            <section id="highlights">
                <h2>二、景點特色與散步順序</h2>
                <h3>值得留意的三個特色</h3>
                <!-- ul 是無序清單；li 是個別項目，適合不分先後的資訊。 -->
                <ul>
                    <li><strong>多元文化：</strong>東協廣場匯聚了泰國、越南、印尼等多元東南亞文化與商品。</li>
                    <li><strong>水岸風景：</strong>綠川水岸與舊城街道交織出新舊共融的景觀魅力。</li>
                    <li><strong>異國美食：</strong>周邊與大樓內的道地小吃，提供最直接的舌尖體驗。</li>
                </ul>

                <h3>建議散步順序</h3>
                <p>以下是本報導規劃的散步建議，並非官方指定路線。</p>
                <!-- ol 是有序清單；瀏覽器會依 li 的排列產生編號。 -->
                <ol>
                    <li>漫步綠川水岸：感受舊城區的水岸風光與歷史街景。</li>
                    <li>走進東協廣場：探索異國超市，採購獨特的東南亞零食與生活用品。</li>
                    <li>走訪周邊巷弄：品嚐熱騰騰的道地泰式酸辣湯或東南亞特色美食。</li>
                    <li>沿途快閃紀錄：拍照打卡、享受微出國的異國氛圍。</li>
                </ol>
            </section>

            <section id="table">
                <h2>三、景點比較表</h2>
                <!--
                    table 用於呈現資料，不用來排版整個網頁。
                    本作業維持純 HTML，表格沒有額外的框線樣式。
                    不使用已過時的 border、cellpadding、cellspacing 屬性。
                -->
                <table border="1">
                    <!-- caption 是表格標題，放在 table 內最前面。 -->
                    <caption>台中東協廣場三處景點的特色與觀察重點</caption>
                    <!-- thead 包住表頭；tr 是一橫列；th 是標題儲存格。 -->
                    <thead>
                        <tr>
                            <!-- scope="col" 表示這個 th 是整欄的標題。 -->
                            <th scope="col">景點名稱</th>
                            <th scope="col">主要特色</th>
                            <th scope="col">建議觀察重點</th>
                        </tr>
                    </thead>
                    <!-- tbody 包住資料列；td 是一般資料儲存格。 -->
                    <tbody>
                        <tr>
                            <!-- scope="row" 表示這個 th 是本列的標題。 -->
                            <th scope="row">東協廣場</th>
                            <td>匯聚多元東南亞商品的文化地標</td>
                            <td>異國超市商品與大樓空間的文化融合</td>
                        </tr>
                        <tr>
                            <th scope="row">綠川水岸</th>
                            <td>貫穿舊城區的親水景觀步道</td>
                            <td>河岸綠化景觀與周邊街巷風貌</td>
                        </tr>
                        <tr>
                            <th scope="row">異國美食街</th>
                            <td>提供道地泰國、越南等南洋料理</td>
                            <td>傳統道地食材與異國餐飲文化</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section id="photo">
                <h2>四、東協廣場照片</h2>
                <!-- figure 將圖片與圖說組成一個單位；figcaption 是圖說。 -->
                <figure>
                    <!--
                        img 是空元素，不寫 /img 結束標籤。
                        src 指定圖片網址；本範例使用外部圖片，需要連線才能載入。
                        alt 描述照片內容，圖片未載入時或使用螢幕閱讀器時仍可理解。
                        width 控制顯示寬度；未指定 height，瀏覽器依原圖比例顯示。
                    -->
                    <img
                        src="https://travel.taichung.gov.tw/image/31543/1024x768"
                        alt="東協廣場照片"
                        width="480">
                    <figcaption>
                        東協廣場是台中火車站附近的重要地標。
                        圖片來源：<a href="https://travel.taichung.gov.tw/zh-tw/attractions/intro/73">大玩台中景點頁</a>。
                    </figcaption>
                </figure>
            </section>

            <section id="video">
                <h2>五、影音報導</h2>
                <p>透過下方影片認識東協廣場的異國風情，再比較影片畫面與本文介紹的景點。</p>
                <!--
                    iframe 將 YouTube 播放器嵌入本頁，需要明確的結束標籤。
                    src 使用 /embed/影片ID，不是一般的 /watch?v=影片ID 網址。
                    width、height 設定播放器尺寸；title 說明嵌入內容。
                    allow 開放所列功能；allowfullscreen 允許全螢幕播放。
                    referrerpolicy 保留跨站來源資訊；仍須由瀏覽器提供有效來源。
                    直接開本機檔案時，YouTube 可能因缺少 HTTP Referer 而出現錯誤 153。
                    若發生此情況，請用本機 HTTP 伺服器預覽，或使用下方原始影片連結。
                    播放也取決於網路、YouTube 及發布者的嵌入設定。
                -->
                <iframe
                    width="480"
                    height="270"
                    src="https://youtu.be/luI6Fb2seRQ?si=8FihSr5tWSD3emZX"
                    title="東協廣場介紹影片"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
                <!-- a 提供一般影片連結；播放器無法播放時仍能前往 YouTube。 -->
                <p>
                    若播放器無法播放，請
                    <a href="https://youtu.be/luI6Fb2seRQ?si=8FihSr5tWSD3emZX" target="_blank" rel="noopener noreferrer">在 YouTube 觀看東協廣場介紹影片（另開分頁）</a>。
                </p>
                <p><small>影片為外部作者發布的歷史介紹，現場狀況請以最新官方資訊為準。</small></p>
            </section>

            <section id="sources">
                <h2>六、資料來源</h2>
                <p>本報導依下列資料整理，散步順序與觀察建議由示範作者規劃。</p>
                <!--
                    target="_blank" 另開分頁；rel 保護開啟新頁面的關聯。
                    網址中的 & 在 HTML 原始碼中寫成 &amp;。
                -->
                <ul>
                    <li><a href="https://www.verse.com.tw/article/taichung-tourism" target="_blank" rel="noopener noreferrer">台中東協廣場：歡迎光臨台灣小東南亞</a></li>
                    <li><a href="https://travel.taichung.gov.tw/zh-tw/attractions/intro/73" target="_blank" rel="noopener noreferrer">大玩台中景點頁（含圖片來源）</a></li>
                    <li><a href="https://youtu.be/luI6Fb2seRQ?si=oCtTGVldyEUCCcqu" target="_blank" rel="noopener noreferrer">YouTube：台中東協廣場介紹影片</a></li>
                </ul>
                <p><small>資料整理日期：2026 年 10 月 14 日。</small></p>
            </section>
        </article>
    </main>

    <hr>
    <!-- footer 是頁尾；來源與作者標示應依自己的作品修改。 -->
    <footer>
        <p>第四次 HTML 作業範例｜東協廣場報導</p>
        <p><a href="#top">回到頁首</a></p>
    </footer>
</body>
</html>
