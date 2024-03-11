const FORMULA_API = `https://ergast.com/api/f1`;
const FLAGS_API = `https://flagcdn.com/w20/`;

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

    function getFlag(countryIso) {
        const isoCode = countries[country];
        return `${FLAGS_API}/${isoCode}.svg`;
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

})
