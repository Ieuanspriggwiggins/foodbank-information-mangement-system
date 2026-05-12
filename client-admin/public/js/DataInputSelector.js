const searchElements = document.getElementsByClassName('data-selection-input');
const formElement = document.querySelector('.dashboard-form');

const detailMap = new Map();
detailMap.set('food_package', {
    information_data: ['name', 'information', 'contents', 'dietary_requirements', 'stock_status'],
    information_title: ['Name', 'Information', 'Contents', 'Dietary Requirements', 'Stock Status']
});
detailMap.set('users', {
    information_data: ['first_name', 'last_name', 'email', 'postcode', 'address', 'phone_number'],
    information_title: ['First Name', 'Last Name', 'Email', 'Postcode', 'Address', 'Phone Number']
})

if(searchElements.length){
    for(let i = 0; i < searchElements.length; i++){
        const currentButton = searchElements[i].querySelector('.data-selection-search-button');
        currentButton.addEventListener('click', onInputSearchEventHandler);
        const currentSearchInput = searchElements[i].querySelector('input[type=search]');
        currentSearchInput.addEventListener('search', onInputSearchEventHandler);
    }
}

async function makeDataRequest(searchString, dataType) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            searchString: searchString, 
        })
    }

    const request = await fetch(`/admin/api/data/all/${dataType}`, requestOptions);
    return request.json();
}

function onInputSearchEventHandler(event) {
    event.preventDefault();
    //Get the parent node of the overall selector
    const parent = event.target.parentNode.parentNode;
    const dataType = parent.dataset.type;
    const searchString = parent.querySelector('input[type="search"]').value;
    const selectionBoxContainer = parent.querySelector('.results-container')
    if(searchString !== ''){
        makeDataRequest(searchString, dataType).then((data) => {
            populateSelectionBox(selectionBoxContainer, data, dataType);
        })
    }
}

function populateSelectionBox(targetElement, data, dataType) {
    //Remove previous table
    targetElement.innerHTML = '';

    const informationTypeObject = detailMap.get(dataType);
    const tableElement = document.createElement('table');

    //Create the header for the table
    const tableHeaderElement = document.createElement('thead');
    for(let i = 0; i < informationTypeObject.information_title.length; i++){
        const tableHeaderDataElement = document.createElement('th');
        tableHeaderDataElement.innerHTML = informationTypeObject.information_title[i];
        tableHeaderElement.appendChild(tableHeaderDataElement);
    }

    const tableBodyElement = document.createElement('tbody');
    for(let i = 0; i < data.length; i++){
        console.log('test');
        const tableRowElement = createTableElement(data[i], dataType);
        tableBodyElement.appendChild(tableRowElement);
    }

    tableElement.appendChild(tableHeaderElement);
    tableElement.appendChild(tableBodyElement);
    targetElement.appendChild(tableElement);
}

function createTableElement(elementData, dataType){
    const tableRowElement = document.createElement('tr');
    tableRowElement.dataset.id = elementData.id;

    const informationTypeObject = detailMap.get(dataType);

    for(let i = 0; i < informationTypeObject.information_data.length; i++){
        const tableDataElement = document.createElement('td');
        const tableDataElementInner = document.createElement('p');
        tableDataElementInner.innerHTML = elementData[informationTypeObject.information_data[i]];
        tableDataElement.appendChild(tableDataElementInner);
        tableRowElement.appendChild(tableDataElement);
    }

    tableRowElement.addEventListener('click', onTableRowSelect)
    return tableRowElement
}

function onTableRowSelect() {
    const clickedElement = this;

    //Get the previously selected object and if it exists, removes it's selected status
    const previousSelection = clickedElement.parentNode.querySelector('tr[data-selected="1"]');
    if(previousSelection){
        previousSelection.removeAttribute('data-selected');
    }

    //Add the value to the input field for the form
    const inputElement = clickedElement.closest('.data-selection-input').querySelector('input[type=hidden]');
    inputElement.value = clickedElement.dataset.id;

    clickedElement.dataset.selected='1';
}


//Disable the default behaviour of the form if the current input field active is one of the search input fields.
if(formElement){
    formElement.addEventListener('submit', (event) => {
        let doDefaultBehaviour = true;
        for(let i = 0; i < searchElements.length; i++){
            const inputElement = searchElements[i].querySelector('.data-selection-search-input');
            //If the active node is the same as one of the nodes in the array of nodes
            if(inputElement.isEqualNode(document.activeElement)){
                doDefaultBehaviour = false;
            }
        }
        if(!doDefaultBehaviour){
            event.preventDefault();
        }
    })
}