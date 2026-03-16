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

// Google Apps Script 웹 앱 URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycby_R8v_v_3p_4Rz6h_C_B_l_y_L_R_j_g/exec'; // 여기에 본인의 웹 앱 URL을 입력하세요

searchBtn.addEventListener('click', () => {
    resultsDiv.innerHTML = '<p>뉴스 검색 중...</p>';
    const searchDate = new Date();
    searchDateDiv.innerText = `검색 시간: ${searchDate.toLocaleString('ko-KR')}`;

    const fetchPromises = keywords.map(keyword => {
        const url = `${GAS_URL}?keyword=${encodeURIComponent(keyword)}`;

        return fetch(url)
            .then(response => {
                console.log(`Response for ${keyword}:`, response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Data for ${keyword}:`, data);
                let newsHtml = `
                    <div class="category">
                        <h2>${keyword}</h2>
                `;
                if (data.items.length === 0) {
                    newsHtml += '<p>최신 뉴스가 없습니다.</p>';
                } else {
                    data.items.forEach(item => {
                        newsHtml += `
                            <div class="news-item">
                                <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                                <p>${item.pubDate}</p>
                            </div>
                        `;
                    });
                }
                newsHtml += '</div>';
                return newsHtml;
            })
            .catch(err => {
                console.error(`'${keyword}' 뉴스 검색 중 오류 발생:`, err);
                return `
                    <div class="category">
                        <h2>${keyword}</h2>
                        <p>뉴스 로딩 중 오류가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.</p>
                    </div>
                `;
            });
    });

    Promise.all(fetchPromises)
        .then(htmlContents => {
            resultsDiv.innerHTML = htmlContents.join('');
        });
});
