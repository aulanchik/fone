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

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch(error) {
            console.log(`Error fetching data from URL`,error);
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
        return `${winner.givenName} ${winner.familyName}`;
    }

    function getTopThreeDrivers(race) {
        const topDrivers = race.Results?.slice(0, 3);
        const topThreeList = topDrivers.map(driver => `<li class="podium podium__item">${driver.Driver.givenName} ${driver.Driver.familyName}</li>`).join('');
        return `<ol class="podium">${topThreeList}</ol>`;
    }

    function getFastestLap(race) {
        const { Driver: { givenName, familyName }, FastestLap: { Time: { time } } } = race.Results[0];
        return `<span>${time} ${givenName} ${familyName}</span>`;
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
                    <div id="race__round">
                        <span>Round ${race.round}<span/>
                    </div>
                    <div id="race__date">
                        <span>${formatDate(race.date)}<span/>
                    </div>
                </div>
            <div class="race__body">
                <div class="flag-container">
                    <img src="${getFlag(race.Circuit.Location.country)}" alt="${race.Circuit.Location.country}"/>
                    <span>${race.Circuit.Location.country}</span>
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
        <div class="detailed">
            <div class="detailed__header">
                <div id="detailed__round">
                    <span>Round ${race.round}</span>
                </div>
                <div id="detailed__date">
                    <span>${formatDate(race.date)}</span>
                </div>
            </div>
            <div class="detailed__body">
                <div class="detailed__race-winner">
                    <h1>Winner</h1>
                    ${getRaceWinner(race)}
                </div>

                <div class="detailed__podium">
                    <h1>Top 3 Drivers</h1>
                    ${getTopThreeDrivers(race)}
                </div>

                <div class="detailed__fastest-lap">
                    <h1>Fastest Lap</h1>
                    ${getFastestLap(race)}
                </div>
            </div>
        </div>
    `

    const app = document.getElementById('app');

    async function renderSeasonRaces(season) {
        try {
            currentView = 'seasonRaces';
            const data = await fetchRacesBySeason(season);
            const races = data.map((race) => createRaceListElement(race)).join('');
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
            history.pushState({ view: currentView, season, round } , null, null);
        } catch (error) {
            console.log('There was an error fetching the data', error);
        }
    }

    app.addEventListener('click', async function(event) {
        const selectedElement = event.target.closest('li');
        if(selectedElement) {
            const { season, round } = selectedElement.dataset;
            await renderRaceDetails(season, round);
        }
    })

    await renderSeasonRaces(2022);
})();
