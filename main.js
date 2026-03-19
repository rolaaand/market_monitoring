const searchBtn = document.getElementById('search-btn');
const resultsDiv = document.getElementById('results');
const searchDateDiv = document.getElementById('search-date');

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

/**
 * Fetches RSS feed using a CORS proxy and parses the XML.
 * @param {string} keyword The keyword to search for.
 * @returns {Promise<Object>} Object containing keyword and items.
 */
async function fetchRSS(keyword) {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        
        const items = Array.from(xmlDoc.querySelectorAll("item")).map(item => ({
            title: item.querySelector("title")?.textContent || "No Title",
            link: item.querySelector("link")?.textContent || "#",
            pubDate: item.querySelector("pubDate")?.textContent || "",
            source: item.querySelector("source")?.textContent || "Unknown Source"
        })).slice(0, 5); // Limit to top 5 news items per keyword

        return { keyword, items };
    } catch (err) {
        console.error(`Error fetching RSS for ${keyword}:`, err);
        return { keyword, items: [], error: true };
    }
}

/**
 * Renders the results to the DOM.
 * @param {Array} results Array of result objects.
 */
function renderResults(results) {
    resultsDiv.innerHTML = results.map(res => {
        let newsHtml = `
            <section class="keyword-card">
                <div class="card-header">
                    <h2>${res.keyword}</h2>
                    <span class="status-badge ${res.items.length > 0 ? 'active' : 'empty'}">
                        ${res.items.length > 0 ? '최신 뉴스' : '데이터 없음'}
                    </span>
                </div>
                <div class="news-list">
        `;

        if (res.error) {
            newsHtml += '<p class="error-msg">데이터를 가져오는 중 오류가 발생했습니다.</p>';
        } else if (res.items.length === 0) {
            newsHtml += '<p class="no-data">최근 24시간 내 뉴스가 없습니다.</p>';
        } else {
            res.items.forEach(item => {
                const formattedDate = new Date(item.pubDate).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit'
                });
                newsHtml += `
                    <article class="news-item">
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                            <h3 class="news-title">${item.title}</h3>
                            <div class="news-meta">
                                <span class="news-source">${item.source}</span>
                                <span class="news-date">${formattedDate}</span>
                            </div>
                        </a>
                    </article>
                `;
            });
        }

        newsHtml += `
                </div>
            </section>
        `;
        return newsHtml;
    }).join('');
}

searchBtn.addEventListener('click', async () => {
    searchBtn.disabled = true;
    searchBtn.textContent = '검색 중...';
    resultsDiv.innerHTML = '<div class="loading-state"><p>실시간 뉴스를 분석하고 있습니다...</p><div class="spinner"></div></div>';
    
    const searchDate = new Date();
    searchDateDiv.innerText = `마지막 업데이트: ${searchDate.toLocaleString('ko-KR')}`;

    const fetchPromises = keywords.map(keyword => fetchRSS(keyword));
    const allResults = await Promise.all(fetchPromises);

    renderResults(allResults);
    
    searchBtn.disabled = false;
    searchBtn.textContent = '데이터 새로고침';
});
