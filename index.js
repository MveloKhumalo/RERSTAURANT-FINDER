document.getElementById("find-restaurants").addEventListener('click', () => {
    const location = document.getElementById("search-input").value.trim();
    if (location) {
        fetchLocationCoordinates(location);
    }
    else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showRestaurantByPosition, showError);
    }
    else {
        alert('Geolocation is not supported by the browser!');
    }
});

const getRes = () => {
        const location = document.getElementById("search-input").value.trim();
    if (location) {
        fetchLocationCoordinates(location);
    }
    else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showRestaurantByPosition, showError);
    }
    else {
        alert('Geolocation is not supported by the browser!');
    }
};

const fetchLocationCoordinates = (location) => {
    const nominatimEndpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    fetch(nominatimEndpoint)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                fetchRestaurants(lat, lon);
            }
            else {
                alert('Location not found!');
            }
        })
        .catch(error => {
            console.log("Error fetching location from Nominatim:", error);
        });
};

const showRestaurantByPosition = (position) => {
    const { latitude, longitude } = position.coords;
    fetchRestaurants(latitude, longitude);
};

const fetchRestaurants = async (latitude, longitude) => {

    const query = `
        [out:json];
        node[amenity=restaurant](around:5000,${latitude},${longitude});
        out;
    `;

    const overpassEndpoint =
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    const restaurantsContainer = document.getElementById("restaurants");

    restaurantsContainer.innerHTML = "<p>Loading restaurants...</p>";

    try {

        const response = await fetch(overpassEndpoint);

        if (!response.ok) {
            throw new Error("Failed to fetch restaurant data");
        }

        const data = await response.json();

        const restaurants = data.elements;

        restaurantsContainer.innerHTML = "";

        if (!restaurants || restaurants.length === 0) {
            restaurantsContainer.innerHTML =
                "<p>No restaurants found nearby.</p>";
            return;
        }

        restaurants.forEach((restaurant) => {

            const card = document.createElement("div");
            card.className = "restaurant-card";

            const name =
                restaurant.tags?.name || "Unnamed Restaurant";

            const cuisine =
                restaurant.tags?.cuisine || "Cuisine not specified";

            card.innerHTML = `
                <a href="https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}"
                   target="_blank"
                   rel="noopener noreferrer">

                    <h2>${name}</h2>
                </a>

                <p><strong>Cuisine:</strong> ${cuisine}</p>

                <p>
                    <strong>Coordinates:</strong>
                    ${restaurant.lat}, ${restaurant.lon}
                </p>
            `;

            restaurantsContainer.appendChild(card);
        });

    } catch (error) {

        console.error("Error fetching restaurants:", error);

        restaurantsContainer.innerHTML = `
            <p>Failed to load nearby restaurants.</p>
        `;
    }
};

const showError = (error) => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation!");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable!");
            break;
        case error.TIMEOUT:
            alert("The request to get the user location timed out!");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred!");
            break;
    }
};
