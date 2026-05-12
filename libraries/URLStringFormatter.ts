/**
 * @author Ieuan Sprigg-Wiggins - ies8
 * Version 1.0
 * Holds various functions for string formatting. Is exported as an object/class
 */

/**
 * Converts an object of key value pairs representing URL queries into a string that can be inserted at the end of a
 * valid URL
 * @param urlQueries - The queries to be turned into a string that would be present at the end of a valid URL
 * @param removeQuery - Object representing queries to be removed from the URL query string
 */
function generateURLWithQueries(urlQueries: any, removeQuery: string[] | null = null) {
    if(removeQuery){
        for(let i = 0; i < removeQuery.length; i++) {
            delete urlQueries[removeQuery[i]];
        }
    }

    const urlQueriesArray = Object.keys(urlQueries).map((key) => [key, urlQueries[key]]);

    if(urlQueriesArray.length === 0) return ''; //Return an empty string if there are no parameters

    return '?' +  urlQueriesArray.map(function(item){
        return item.join('=')
    }).join('&')
}

export {
    generateURLWithQueries,
}