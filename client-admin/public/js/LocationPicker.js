let currentData = {};
let selectedLocation = null;

let deleteModeEnum = {
    PARTIAL: 'partial',
    WHOLE: 'whole'
}

let deleteMode = deleteModeEnum.PARTIAL

const inputElement = document.getElementById('location-input')
const inputButton = document.getElementById('location-input-button')
const searchResult = document.getElementById('drop-down-container');

inputElement.addEventListener('input', onInputChange);
inputElement.addEventListener('click', onInputChange);

inputElement.addEventListener('keydown', (event) => {
    if(event.key === 'Backspace' && deleteMode === deleteModeEnum.WHOLE){
        inputElement.value = '';
        deleteMode = deleteModeEnum.PARTIAL;
    }
})

inputButton.addEventListener('click', (event) => {
    event.preventDefault();
    if(!selectedLocation){
        alert('You need to have a location selected to submit this form');
        return;
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            locationData: selectedLocation
        })
    }

    const request = fetch('/admin/api/location', requestOptions);
    request.then((response) => {
        return response.json();
    }).then((data) => {
        if(data.success === 1){
            location.reload();
        }else{
            alert('Location save failed. Please try again')
        }
    });
})

function onInputChange(event) {
    if(!event.target.value) {
        searchResult.style.display = 'none';
        return;
    } //Don't make a request with an empty query.
    makeLocationRequest(event.target.value).then((data) => {
        updateSelectionBox(data);
    });
}

async function makeLocationRequest(searchString) {
    const request = await fetch(`https://api.postcodes.io/places?q=${searchString}`);
    return request.json();
}

function updateSelectionBox(data) {
    currentData = data.result;

    //Empty the search result box
    searchResult.innerHTML = '';
    if(data.result.length > 0){
        for(let i = 0; i < data.result.length; i++){
            searchResult.appendChild(generateLocationElement(data.result[i], i));
        }
        searchResult.style.display = 'block';
    }else{
        searchResult.style.display = 'none'
    }
}

function generateLocationElement(dataItem, itemPos) {
    const element = document.createElement('div')
    element.classList.add('location-item');

    const locationTitle = document.createElement('p');
    locationTitle.classList.add('location-item-title')
    locationTitle.innerHTML = dataItem.name_1;
    const locationSubTitle = document.createElement('p');
    locationSubTitle.classList.add('location-item-sub');
    locationSubTitle.innerHTML = dataItem.county_unitary;

    element.appendChild(locationTitle);
    if(dataItem.district_borough){
        const locationDistrict = document.createElement('p');
        locationDistrict.classList.add('location-item-sub');
        locationDistrict.innerHTML = dataItem.district_borough
        element.appendChild(locationDistrict);
    }
    element.appendChild(locationSubTitle);
    element.setAttribute('data-item', itemPos);

    element.addEventListener('click', onLocationItemClick);

    return element;
}

function onLocationItemClick() {
    const dataElement = currentData[this.dataset.item];

    selectedLocation = dataElement;

    inputElement.value =
        stringCheck(dataElement.name_1, true) +
        stringCheck(dataElement.district_borough, true) +
        stringCheck(dataElement.county_unitary)
    searchResult.style.display = 'none';
    deleteMode = deleteModeEnum.WHOLE;
}

function stringCheck(stringToCheck, addComma) {
    if(stringToCheck === null) return '';
    return addComma === true ? stringToCheck + ', ' : stringToCheck
}

//If the body is clicked outside the results box, hide it
document.body.addEventListener('click', (event) => {
        if(!event.target.closest('.drop-down-input-container')){
            searchResult.style.display = 'none';
            searchResult.innerHTML = '';
        }
})