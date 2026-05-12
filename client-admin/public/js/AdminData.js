const tableElement = document.getElementById('data-table');
const paginationDisplay = document.getElementById('page-number-display');
const paginationQuickChangeInput = document.getElementById('pagination-quick-change-input');
const showPerPageInput = document.getElementById('per-page-selector');
const searchInputElement = document.getElementById('filter-search-input');
const searchButtonElement = document.getElementById('filter-search-btn');
const clearSearchButton = document.getElementById('search-filter-clear-btn');

searchButtonElement.addEventListener('click', onSearch);
searchInputElement.addEventListener('search', onSearch);

const headerElements = tableElement.querySelectorAll('th');

for(let i = 0; i < headerElements.length; i++) {
    headerElements[i].addEventListener('click', onHeaderElementClick)
}

const sortDirectionEnum = {
    DESC: 'desc',
    ASC: 'asc',
}

let requestOptions = {
    pageNumber: 1, //Default page number is 1
    showPerPage: 10, //Show 10 per page by default
    orderBy: headerElements[0].dataset.sortname ,
    orderDirection: sortDirectionEnum.DESC,
    searchString: ''
}

let pageCount = 1; //The initial page count before the request is received

const entityType = tableElement.dataset.field;

/**
 * Makes a request to the server for the data using the data field determined in the template in the form data set
 * @returns {Promise<any>}
 */
async function makeDataRequest() {
    const request = await fetch(`/admin/api/admin-data/${entityType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestOptions)
    })
    return await request.json();
}

//Make initial request for the data
makeNewRequest();

function makeNewRequest() {
    makeDataRequest().then((data) => {
        if(data.data.length < 1){
            if(document.getElementById('warningMessage')){
                document.getElementById('warningMessage').remove();
            }
            const noDataWarning = document.createElement('h1');
            noDataWarning.setAttribute('id', 'warningMessage');
            noDataWarning.style.textAlign = 'center';
            noDataWarning.innerHTML = 'There is no data to be displayed';
            document.querySelector('.main-content').appendChild(noDataWarning);
        }else{
            if(document.getElementById('warningMessage')){
                document.getElementById('warningMessage').remove();
            }
        }

        if(data.fail){
            alert('Something went wrong when loading the data. Please try again later');
        }else{
            generateTableView(data.data);
            pageCount = data.pageCount;
            updatePagination(requestOptions.pageNumber);
            paginationQuickChangeInput.setAttribute('max', pageCount);
        }
    })
}

function generateTableView(data) {
    //Remove the tbody if it previously existed
    const previousTableBody = tableElement.querySelector('tbody');
    if(previousTableBody) previousTableBody.remove();

    const tableBody = document.createElement('tbody');

    //Loop through the data items returned
    for(let i = 0; i < data.length; i++){
        //Create the current row being rendered
        const currentRow = document.createElement('tr');

        for(let j = 0; j < headerElements.length; j++) {
            let dataName = headerElements[j].dataset.dataname;
            if(j === 0) {
                currentRow.appendChild(createTableDataElement(data[i][dataName], true, `${window.location.href}/view/${data[i].id}`))
            }else{
                currentRow.appendChild(createTableDataElement(data[i][dataName]));
            }
        }

        tableBody.appendChild(currentRow)
    }
    tableElement.appendChild(tableBody);
}

function createTableDataElement(innerText, isAnchor = false, hrefLocation = '') {
    const dataElement = document.createElement('td');
    const paragraphElement = document.createElement('p');
    if(isAnchor){
        const anchorElement = document.createElement('a');
        anchorElement.setAttribute('href', hrefLocation);
        anchorElement.innerHTML = innerText;
        paragraphElement.append(anchorElement);
    }else{
        paragraphElement.innerHTML = innerText;
    }
    dataElement.appendChild(paragraphElement);
    return dataElement;
}

/**
 * Updates the pagination with the data being parsed
 */
function updatePagination(currentPage) {
    if(pageCount === 0){
        paginationDisplay.innerHTML = `${currentPage} / 1`;
    }
    else{
        paginationDisplay.innerHTML = `${currentPage} / ${pageCount}`;
    }
}

function onPagination(direction) {
    if(direction === -1 && requestOptions.pageNumber !== 1) {
        requestOptions.pageNumber -= 1;
    }
    else if(direction === 1 && (requestOptions.pageNumber + 1) <= pageCount){
        requestOptions.pageNumber += 1;
    }
    console.log(requestOptions);
    makeNewRequest();
}

function paginationQuickChange() {
    requestOptions.pageNumber = paginationQuickChangeInput.value;
    makeNewRequest();
}

function changeShowPerPage() {
    requestOptions.showPerPage = showPerPageInput.value;
    makeNewRequest();
}

let selected = tableElement.querySelector('.selected-desc');
function onHeaderElementClick(event) {
    delete tableElement.querySelector('th[data-selected="1"]').dataset.selected;
    if(event.target === selected) {
        if(selected.classList.contains('selected-desc')){
            selected.classList.remove('selected-desc');
            selected.classList.add('selected-asc');
            requestOptions.orderDirection = sortDirectionEnum.ASC;
        }else{
            selected.classList.remove('selected-asc');
            selected.classList.add('selected-desc');
            requestOptions.orderDirection = sortDirectionEnum.DESC;
        }
    }else{
        selected.classList.remove('selected-desc');
        selected.classList.remove('selected-asc');

        selected = event.target;
        selected.classList.add('selected-desc');
        requestOptions.orderDirection = sortDirectionEnum.DESC;
    }
    selected.setAttribute('data-selected', '1');
    requestOptions.orderBy = selected.dataset.sortname;
    makeNewRequest();
}

function onSearch(event) {
    if(event.target === searchButtonElement && searchInputElement.value === ''){
        return;
    }
    updateClearSearchButtonState(searchInputElement.value);

    requestOptions.searchString = searchInputElement.value;
    makeNewRequest();
}

function updateClearSearchButtonState(currentValue) {
    if(currentValue === '') clearSearchButton.style.display = 'none';
    else{
        clearSearchButton.querySelector('.search-filter-text').innerHTML = currentValue;
        clearSearchButton.style.display = 'inline-flex';
    }
}

clearSearchButton.addEventListener('click', () => {
    searchInputElement.value = '';
    requestOptions.searchString = '';
    updateClearSearchButtonState(searchInputElement.value);
    makeNewRequest();
})