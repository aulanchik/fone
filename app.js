const FORMULA_API = `https://ergast.com/api/f1`;
const FLAGS_API = `https://flagcdn.com/w20`;

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

        return new Intl.DateTimeFormat('en-GB', options).format(date);
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
        const races = data.MRData.RaceTable.Races;
        return races;
    }

    async function fetchRaceDetails(season, round) {
        const data = await fetchData(`${FORMULA_API}/${season}/${round}.json`);
        const race = data.MRData.RaceTable.Races;
        return race;
    }

    window.addEventListener('popstate', function(event) {
        if (event.state && state.view) {
            switch(state.view) {
                case 'raceDetails': fetchRaceDetails(state.season, state.round); break;
                case 'seasonRaces': fetchRacesBySeason(state.season); break;
            }
        }
    });

    const createRaceListElement = (race) => `
        <li data-season="${race.season}" data-round="${race.round}">
            <div class="race">
                <div class="race race__header">
                    <span class="race__round">${race.round}</span>
                    <span class="race__date">${formatDate(race.date)}</span>
                </div>
                <div class="race__body">
                    <div class="flag-container">
                        <img src="${getFlag(race.Circuit.Location.country)}" alt="${race.Circuit.Location.country}"/>
                        <span class="country">${race.Circuit.Location.country}</span>
                    </div>
                    <p class="race__name">
                        ${race.raceName}
                    </p>
                </div>
            </div>    
        </li>
    `;

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

    await renderSeasonRaces(2022);
})();
