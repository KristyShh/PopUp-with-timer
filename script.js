document.addEventListener('DOMContentLoaded', () => {
    const tariffsContainer = document.getElementById('tariffs');
    const extraDiscountsContainer = document.getElementById('extra-discounts');
    const timerElement = document.getElementById('timer');
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const closeBtn = document.getElementById('close-btn');
   // const btnBuy = document.querySelectorById('.btn-buy');
    let timerInterval;

    fetch('https://t-pay.iqfit.app/subscribe/list-test')
        .then(response => response.json())
        .then(data => {
            const descriptions = {
                "1 неделя": "Чтобы просто начать &#128077",
                "1 месяц": "Привести тело впорядок &#128170",
                "3 месяца": "Изменить образ жизни &#128293",
                "навсегда": "Всегда быть в форме и поддерживать своё здоровье &#11088" ,
            };

            const discountRates = [30, 40, 50, 70];
            let discountIndex = 0;

            // Получаем старые цены из тарифов с isPopular: false
            const oldPricesMap = data
                .filter(tariff => tariff.isPopular===false && tariff.isDiscount===false)
                .reduce((map, tariff) => {
                    map[tariff.name] = tariff.price;
                    return map;
                }, {});

            const tariffs = data.map(tariff => ({
                ...tariff,
                description: descriptions[tariff.name] || "Описание не доступно",
                discountPercent: discountRates[discountIndex++ % discountRates.length],
                oldPrice: oldPricesMap[tariff.name] || tariff.price
            }));

            const popularTariffs = tariffs.filter(tariff => tariff.isPopular);
            const extraDiscounts = tariffs.filter(tariff => tariff.isDiscount);
            renderTariffs(popularTariffs, true);

            startTimer(120, timerElement);
            closeBtn.addEventListener('click', () => {
                popup.style.display = 'none';
                overlay.style.display = 'none';
                renderTariffs(popularTariffs, false);
            });

            function renderTariffs(tariffs, withDiscount) {
                tariffsContainer.innerHTML = '';
                tariffs.forEach(tariff => {
                    const priceToShow = withDiscount ? tariff.price : tariff.oldPrice;
                    const tariffElement = document.createElement('div');
                    tariffElement.classList.add('tariff');
                    tariffElement.innerHTML = `
                        <img class="star" src="img/Star.png" alt="star red">
                        <p class="discount"> -${tariff.discountPercent}% </p>
                        <h3>${tariff.name}</h3>
                        <p class="price">${priceToShow} RUB</p>
                        ${withDiscount ? `<p class="old-price">${tariff.oldPrice} RUB</p>` : ''}
                        <p class="description">${tariff.description}</p>`;

                    tariffElement.addEventListener('click', () => {
                        tariffElement.classList.toggle('selected');
                    
                    });
                    tariffsContainer.appendChild(tariffElement);
                });
            }

            function startTimer(duration, display) {
                let timer = duration, minutes, seconds;
                timerInterval = setInterval(() => {
                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);
                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;
                    display.textContent = minutes + ":" + seconds;

                    if (--timer < 0) {
                        clearInterval(timerInterval);
                        tariffsContainer.classList.add('hidden');
                        setTimeout(() => {
                            tariffsContainer.classList.remove('hidden');
                            renderTariffs(popularTariffs, false);
                            overlay.style.display = 'block';
                            popup.style.display = 'flex';
                            renderExtraDiscounts(extraDiscounts);
                        }, 500); // задержка для плавного перехода
                    } else if (timer <= 30) {
                        display.classList.add('blink-red');
                    }
                }, 1000);
            }

            function renderExtraDiscounts(extraDiscounts) {
                extraDiscountsContainer.innerHTML = '';
                extraDiscounts.forEach(discount => {
                    const discountElement = document.createElement('div');
                    discountElement.classList.add('extra-discount');
                    discountElement.innerHTML = `
                        <h3 class="name-extra">${discount.name}</h4>
                        <input type="radio" class="radio" name="tariff">
                        <p class="old-price2">${discount.oldPrice}RUB</p>
                        <p class="price-extra">${(discount.price).toFixed(2)} RUB </p>`
                        
                    extraDiscountsContainer.appendChild(discountElement);
                });
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});
