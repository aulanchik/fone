const FORMULA_API = `https://ergast.com/api/f1`;
const FLAGS_API = `https://flagcdn.com/w80`;

(async function() {

    const countries = {
        "Australia": "au",
        "Azerbaijan": "az",
        "Austria": "at",
        "Belgium": "be",
        "Brazil": "br",
        "Canada": "ca",
        "China": "cn",
        "France": "fr",
        "Germany": "de",
        "Great Britain": "gb",
        "Hungary": "hu",
        "Italy": "it",
        "Japan": "jp",
        "Mexico": "mx",
        "Monaco": "mc",
        "Netherlands": "nl",
        "Poland": "pl",
        "Portugal": "pt",
        "Russia": "ru",
        "Saudi Arabia": "sa",
        "Bahrain": "bh",
        "Singapore": "sg",
        "Spain": "es",
        "Sweden": "se",
        "Switzerland": "ch",
        "Thailand": "th",
        "Turkey": "tr",
        "UAE": "ae",
        "UK": "gb",
        "USA": "us"
    };

    function getFlag(country) {
        const isoCode = countries[country];
        return `${FLAGS_API}/${isoCode}.png`;
    }

    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const options = { day: 'numeric', month: 'short' };
        return new Intl.DateTimeFormat('en-GB', options).format(date).toUpperCase();
    }

    function toggleLoading(show) {
        const loadingOverlay = document.getElementById('loading__overlay');
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    async function fetchData(url) {
        let isRequestInProgress = false;
            if (isRequestInProgress) {
                return null; 
            }

            isRequestInProgress = true;
            toggleLoading(true);

            try {
                const response = await fetch(url);
                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Error fetching data from URL`, error);
                return null;
            } finally {
                setTimeout(() => {
                    toggleLoading(false);
                    isRequestInProgress = false;
                }, 500); 
            }
    }

    async function fetchRacesBySeason(season) {
        const data = await fetchData(`${FORMULA_API}/${season}.json`);
        return data?.MRData?.RaceTable.Races || [];
    }

    async function fetchRaceDetails(season, round) {
        const data = await fetchData(`${FORMULA_API}/${season}/${round}/results.json`);
        return data?.MRData?.RaceTable.Races[0] || [];
    }

    function getRaceWinner(race) {
        const winner = race.Results[0]?.Driver;
        const laps = race.Results[0].laps;
        return `<div class="winner"><span id="driver">${winner.givenName} ${winner.familyName}</span><span id="laps">${laps} Laps</span></div>`;
    }

    function getTopThreeDrivers(race) {
        const topDrivers = race.Results?.slice(0, 3);
        const topThreeList = topDrivers.map(driver => `<li class="podium podium__item"><span>${driver.Driver.givenName} ${driver.Driver.familyName}</span></li>`).join('');
        return `<ol class="podium">${topThreeList}</ol>`;
    }

    function getFastestLap(race) {
        const { Driver: { givenName, familyName }, FastestLap: { Time: { time } } } = race.Results[0];
        return `<div class="fastest__lap">
                    <div id="timer"></div>
                        <div id="time">${time}</div>
                     <span id="driver">${givenName} ${familyName}</span>
                </div>
            `;
    }

    window.addEventListener('popstate', (event) => {
        if (event.state) {
            const { view, season, round } = event.state;
            switch (view) {
                case 'seasonRaces':
                    renderSeasonRaces(season);
                    break;
                case 'raceDetails':
                    renderRaceDetails(season, round);
                    break;
                default:
                    console.warn(`Unknown view: ${view}`);
            }
        }
    });

    const createRaceListElement = (race) => `
        <li class="race" data-season="${race.season}" data-round="${race.round}" >
                <div class="race__header">
                    <div class="race__header-item race__round">
                        <span>Round ${race.round}<span/>
                    </div>
                    <div class="race__header-item race__date">
                        <span>${formatDate(race.date)}<span/>
                    </div>
                </div>
            <div class="race__body">
                <div class="flag-container">
                    <img src="${getFlag(race.Circuit.Location.country)}" alt="${race.Circuit.Location.country}"/>
                    <span id="dark">${race.Circuit.Location.country}</span>
                </div>
                <div class="race__name">
                    <h1>${race.raceName}<h1/>
                </div>
                <div class="race__icon">
                </div>
            </div>
        </li>
    `;

    const createDetailedRaceElement = (race) => `
        <div class="detailed__page">
            <div class="detailed__navigation">
                <div class="detailed__navigation-item">
                    <img src="assets/images/chevronLeft.svg" alt="Back" class="navigation-icon">
                    <span id="back">Back</span>
                </div>
                <div id="forward" class="detailed__navigation-item">
                    <span>Next round</span>
                    <img src="assets/images/chevronRight.svg" alt="Forward" class="navigation-icon">
                </div>
            </div>
            <div class="detailed">
                <div class="detailed__header">
                    <div id="detailed__round" class="detailed__round">
                        <span>Round ${race.round}</span>
                    </div>
                    <div id="detailed__date" class="detailed__date">
                        <span>${formatDate(race.date)}</span>
                    </div>
                </div>
                <div class="detailed__body">
                    <div class="flag-container">
                        <img src="${getFlag(race.Circuit.Location.country)}" alt="${race.Circuit.Location.country}"/>
                        <span id="light">${race.Circuit.Location.country}</span>
                    </div>
                    <div class="detailed__race__name">
                        <h1>${race.raceName}<h1/>
                    </div>
                </div>
            </div>
           <div class="detailed__stats">
            <div class="detailed__stats-item detailed__winner">
                <span class="detailed__stats-title">Winner</span>
                ${getRaceWinner(race)}
            </div>

            <div class="detailed__stats-item detailed__podium">
                <span class="detailed__stats-title">Top 3 Drivers</span>
                ${getTopThreeDrivers(race)}
            </div>

            <div class="detailed__stats-item detailed__fastest-lap">
                <span class="detailed__stats-title">Fastest Lap</span>
                ${getFastestLap(race)}
            </div>
        </div>
    `

    const app = document.getElementById('app');

    async function renderSeasonRaces(season) {
        try {
            currentView = 'seasonRaces';    
            const data = await fetchRacesBySeason(season);
            const races = data?.map((race) => createRaceListElement(race)).join('');
            app.innerHTML = `<ul class="races">${races}</ul>`
            history.pushState({ view: currentView, season } , null, null);

        } catch (error) {
            console.log('There was an error fetching the data', error);
        }
    }

    async function renderRaceDetails(season, round) {
        try {
            currentView = 'raceDetails';
            const data = await fetchRaceDetails(season, round);
            app.innerHTML = createDetailedRaceElement(data);
            history.pushState({ view: currentView, season, round }, null, null);

            app.addEventListener('click', async function (event) {
                const forwardButton = event.target.closest('#forward');
                const backButton = event.target.closest('#back');

                if (forwardButton) {
                    const nextRound = Number(round) + 1;
                    await renderRaceDetails(season, nextRound);
                    event.preventDefault(); 
                } else if (backButton && currentView === 'raceDetails') {
                    
                    await renderSeasonRaces(season);
                    event.preventDefault(); 
                }
            });
        } catch (error) {
            console.log('There was an error fetching the data', error);
        }
    }


    app.addEventListener('click', async function(event) {
        const selectedElement = event.target.closest('li');
        if(selectedElement && selectedElement.classList.contains('race')) {
            toggleLoading(true);
            const { season, round } = selectedElement.dataset;
            await renderRaceDetails(season, round);
        }
    });

    await renderSeasonRaces(2022);
})();
