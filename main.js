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
/**
 * Fetches RSS feed using a CORS proxy and parses the XML.
 * @param {string} keyword The keyword to search for.
 * @returns {Promise<Object>} Object containing keyword and items.
 */
async function fetchRSS(keyword) {
    const searchQuery = keyword; 
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=ko&gl=KR&ceid=KR:ko`;
    
    // Attempt 1: Using corsproxy.io (Direct XML)
    try {
        const primaryProxy = `https://corsproxy.io/?url=${encodeURIComponent(rssUrl)}&_=${Date.now()}`;
        const response = await fetch(primaryProxy);
        if (response.ok) {
            const xmlString = await response.text();
            return parseAndFilterRSS(xmlString, keyword);
        }
    } catch (err) {
        console.warn(`Primary proxy failed for ${keyword}, trying fallback...`, err);
    }

    // Attempt 2: Fallback to allorigins.win (JSON wrapped)
    try {
        const fallbackProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}&_=${Date.now()}`;
        const response = await fetch(fallbackProxy);
        if (response.ok) {
            const data = await response.json();
            // AllOrigins wraps the content in a 'contents' property
            return parseAndFilterRSS(data.contents, keyword);
        }
    } catch (err) {
        console.error(`All proxies failed for ${keyword}:`, err);
        return { keyword, items: [], error: true };
    }

    return { keyword, items: [], error: true };
}

/**
 * Parses XML string and applies date and keyword filters.
 * @param {string} xmlString The raw XML string from RSS feed.
 * @param {string} keyword The keyword used for filtering.
 * @returns {Object} Result object with filtered items.
 */
function parseAndFilterRSS(xmlString, keyword) {
    if (!xmlString) return { keyword, items: [] };

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        // Basic check for valid XML
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("XML Parsing Error");
        }

        // Filter threshold: 3.5 days (84 hours) to account for timezone differences
        const filterThreshold = new Date();
        filterThreshold.setHours(filterThreshold.getHours() - (24 * 3 + 12)); 

        // Fruit-related keywords to filter out from '멜론' results
        const fruitKeywords = ['과일', '수확', '재배', '농가', '산지', '당도', '품종', '꼭지', '농민', '출하', '재배지', '농업', '농촌'];

        const items = Array.from(xmlDoc.querySelectorAll("item"))
            .filter(item => {
                const title = item.querySelector("title")?.textContent || "";
                const pubDateStr = item.querySelector("pubDate")?.textContent;
                const pubDate = pubDateStr ? new Date(pubDateStr) : null;

                // 1. Date filtering
                if (pubDate && pubDate < filterThreshold) return false;

                // 2. Keyword-based filtering for '멜론'
                if (keyword === '멜론' && fruitKeywords.some(fk => title.includes(fk))) return false;

                return true;
            })
            .map(item => ({
                title: item.querySelector("title")?.textContent || "No Title",
                link: item.querySelector("link")?.textContent || "#",
                pubDate: item.querySelector("pubDate")?.textContent || "",
                source: item.querySelector("source")?.textContent || "Unknown Source"
            })).slice(0, 7);

        return { keyword, items };
    } catch (err) {
        console.error(`Parsing error for ${keyword}:`, err);
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
