/**
 * @Version: 1.0
 * @Author: Ieuan Sprigg-wiggins
 */

/**
 * Gets a date formatted into the string dd/mm/yyyy and returns it
 * @param date the date to be formatted
 */
export function getFormattedDate(date: Date) {
    const year = date.getFullYear(); //Get the year from the date object
    let month = date.getMonth() + 1; //Get the month number
    let day = date.getDate(); //Gets the day from the date object

    let dayString = '';
    let monthString = '';
    if(day < 10) dayString = '0' + day.toString();
    if(month < 10) monthString = '0' + month.toString();

    console.log('test');

    return dayString + '/' + monthString + '/' + year.toString();
}