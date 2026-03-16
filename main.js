const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');

const keywords = [
    '멜론',
    '유튜브뮤직',
    '유튜브프리미엄',
    '유튜브프리미엄라이트',
    '스포티파이',
    '지니뮤직',
    '플로',
    '애플뮤직'
];

searchBtn.addEventListener('click', () => {
    resultsDiv.innerHTML = '<p>뉴스 검색 중...</p>';

    const fetchPromises = keywords.map(keyword => {
        // Using Google News RSS feed. `tbs=qdr:d3` filters for the last 3 days.
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko&tbs=qdr:d3`;

        // Using a CORS proxy to bypass browser's same-origin policy.
        // This is for demonstration purposes. For production, a self-hosted proxy is recommended.
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        return fetch(proxyUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(str => new DOMParser().parseFromString(str, "text/xml"))
            .then(data => {
                const items = data.querySelectorAll("item");
                let newsHtml = `
                    <div class="category">
                        <h2>${keyword}</h2>
                `;
                if (items.length === 0) {
                    newsHtml += '<p>No result within 3 days</p>';
                } else {
                    items.forEach(item => {
                        const title = item.querySelector("title").textContent;
                        const link = item.querySelector("link").textContent;
                        const pubDate = new Date(item.querySelector("pubDate").textContent).toLocaleDateString('ko-KR');

                        newsHtml += `
                            <div class="news-item">
                                <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
                                <p>${pubDate}</p>
                            </div>
                        `;
                    });
                }
                newsHtml += '</div>';
                return newsHtml;
            })
            .catch(err => {
                console.error(`Error fetching news for ${keyword}:`, err);
                return `
                    <div class="category">
                        <h2>${keyword}</h2>
                        <p>뉴스 검색 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인하세요.</p>
                    </div>
                `;
            });
    });

    Promise.all(fetchPromises)
        .then(htmlContents => {
            resultsDiv.innerHTML = htmlContents.join('');
        });
});
