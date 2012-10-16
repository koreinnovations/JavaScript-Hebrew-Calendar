
/* KaluachJS - Kaluach Javascript Hebrew/civil calendar
 *   Version 1.00
 * Copyright (C) 5760,5761 (2000 CE), by Abu Mami and Yisrael Hersch.
 *   All Rights Reserved.
 *   All copyright notices in this script must be left intact.
 * Requires kdate.js - Kaluach Javascript Hebrew date routines
 * Acknowledgment given to scripts by:
 *	 - Tomer and Yehuda Shiran (docjs.com)
 *   - Gordon McComb
 *   - irt.org
 *   - javascripter.net
 * Terms of use:
 *   - Permission will be granted to use this script on personal
 *     web pages. All that's required is that you please ask.
 *     (Of course if you want to send a few dollars, that's OK too :-)
 *   - Use on commercial web sites requires a $50 payment.
 * website: http://www.kaluach.net
 * email: abumami@kaluach.net
 */

$(document).ready(function() {

  var otherHolidays = 0;
  var jewishHolidays = 1;
  var civilHolidays = 0;
  
  var calendarContainer = $('#calendar-container');
  var calendarForm = $('#calendar-form');
  
  var holidaysSelect = $('#holidays', calendarForm);
  var yearField = $('#year', calendarForm);
  var monthField = $('#month', calendarForm);
  var prevMonthButton = $('#prev-month', calendarForm);
  var nextMonthButton = $('#next-month', calendarForm);
  var prevYearButton = $('#prev-year', calendarForm);
  var nextYearButton = $('#next-year', calendarForm);
  var todayButton = $('#today', calendarForm);
  

  var initialize = function() {
    
    holidaysSelect.change(holidaysSelect_Change);
    todayButton.click(todayButton_Click);
    prevMonthButton.click(prevMonthButton_Click);
    nextMonthButton.click(nextMonthButton_Click);
    prevYearButton.click(prevYearButton_Click);
    nextYearButton.click(nextYearButton_Click);
    
    yearField.change(yearField_Change);
    monthField.change(monthField_Change);

    selectToday();
  };
  
  var yearField_Change = function() {
    setCalendarFromMonthYear();
  };
  
  var monthField_Change = function() {
    setCalendarFromMonthYear();
  };
  
  var prevYearButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    y -= 1;
    
    setCalendar(m, y);
  };
  
  var nextYearButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    y += 1;
    setCalendar(m, y);
  };
  
  var prevMonthButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();

    if(m > 0)
      m -= 1;
    else {
      m = 11;
      y -= 1;
    }

    setCalendar(m, y);
  };
  
  var nextMonthButton_Click = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();

    if(m < 11)
      m++;
    else {
      m = 0;
      y++;
    }

    setCalendar(m, y);
  };
  
  var todayButton_Click = function () {
    selectToday();
  };
  
  var holidaysSelect_Change = function() {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    var h = holidaysSelect.get(0).selectedIndex;
    if(h == 0) {
      jewishHolidays = 1;
      civilHolidays = 0;
    }
    else if(h == 1) {
      jewishHolidays = 0;
      civilHolidays = 1;
    }
    else if(h == 2) {
      jewishHolidays = 1;
      civilHolidays = 1;
    }
    else if(h == 3) {
      jewishHolidays = 0;
      civilHolidays = 0;
    }

    doCal(m, y);
  }

  function toggleOther(form) {
    otherHolidays = (otherHolidays == 1) ? 0 : 1;
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    doCal(m, y);
  }


  function doCal(month, year) {
    var ret = calendar(month, year);
    var calendarTable = BuildLuachHTML(ret);
    calendarContainer.empty().append(calendarTable);
  }

  function calendar(selM, selY) {
    var m = selM + 1;
    var y = selY;
    var d = civMonthLength(m, y);
    var firstOfMonth = new Date (y, selM, 1);
    var startPos = firstOfMonth.getDay() + 1;
    var retVal = new Object();
    retVal[1] = startPos;
    retVal[2] = d;
    retVal[3] = m;
    retVal[4] = y;
    return (retVal);
  }

  function BuildLuachHTML(parms)  {
    var cellWidth  = 80;			// width of columns in table
    var cellHeight = 55;			// height of day cells calendar
    var hebDate;
    var hebDay;
    var now = new Date();
    var tday = now.getDate();
    var tmonth = now.getMonth();
    var tyear = now.getYear();
    if(tyear < 1000)
      tyear += 1900;
    var cMonth = parms[3];
    var cYear = parms[4];
    var monthName = civMonth[cMonth];
    var lastDate = civMonthLength(cMonth, cYear);
    var hm;
    var hMonth;
    var hYear;

    // get starting Heb month in civil month
    hebDate = civ2heb(1, cMonth, cYear);
    hmS = hebDate.substring(hebDate.indexOf(' ')+1, hebDate.length);
    hMonth = eval(hmS.substring(0, hmS.indexOf(' ')));
    hYear = hmS.substring(hmS.indexOf(' ')+1, hmS.length);
    var start = hebMonth[hMonth+1] + ' ' + hYear;

    // get ending Heb month in civil month
    hebDate = civ2heb(lastDate, cMonth, cYear);
    hmE = hebDate.substring(hebDate.indexOf(' ')+1, hebDate.length);
    hMonth = eval(hmE.substring(0, hmE.indexOf(' ')));
    hYear = hmE.substring(hmE.indexOf(' ')+1, hmE.length);
    var end = hebMonth[hMonth+1] + ' ' + hYear;

    var hebSpan;
    // check if start and end Heb months are the same
    if(hmS == hmE)
      hebSpan = start;
    else
      hebSpan = start + ' / ' + end


    var table = $('<table class="calendar"></table>');
    
    var tHead = $('<thead></thead>');
    var tBody = $('<tbody></tbody>');
    
    var headerRow = $('<tr class="month-header"></tr>');
    var headerCell = $('<th colspan="7"></th>');
    
    var headerText = '<span class="english">' + monthName + ' ' + cYear + '</span>';
    headerText += '<span class="hebrew">' + hebSpan + '</span>';
    
    headerCell.html(headerText);
    headerRow.append(headerCell);
    tHead.append(headerRow);

    var daysRow = $('<tr class="days-header"></tr>');

    // create first row of table to set column width and specify week day
    for (var dayNum = 1; dayNum < 8; ++dayNum) {
      var dayCell = $('<td></td>');
      dayCell.text(weekDay[dayNum]);
      daysRow.append(dayCell);
    }
    
    tHead.append(daysRow);
    
    var cell = 1
    var cDay = 1
    var row;
    for (row = 1; row <= 6; row++) {
      
      var weekRow = $('<tr class="week-row row-' + row + '"></tr>');
      
      for (col = 1; col <= 7; col++)  {
        
        var weekCell = $('<td></td>');
        
        var cellClass = "";
        if((cDay == tday) && (parms[3] == (tmonth+1)) && (parms[4] == tyear))
          cellClass = "current-day";
        else if (moed != "")
          cellClass = "holiday";
        else if (holiday != "") {
          cellClass = "civil-holiday";
        }
          
        weekCell.addClass(cellClass);
        
        

        // convert civil date to hebrew
        hebDate = civ2heb(cDay, cMonth, cYear);
        hebDay = eval(hebDate.substring(0, hebDate.indexOf(' ')));

        var hm = hebDate.substring(hebDate.indexOf(' ')+1, hebDate.length);
        var hMonth = eval(hm.substring(0, hm.indexOf(' ')));

        if (cell < parms[1]) {
          
        }
        else {

          var moed = "";
          if(jewishHolidays)
            moed = moadim(cDay, cMonth, cYear, hebDay, hMonth, col);
          var holiday = "";
          if(civilHolidays)
            holiday = holidays(cDay, cMonth, cYear);


          var cellContents = '';
          // assemble the contents of our day cell
          cellContents +=   '<table class="cell-contents">';
          cellContents +=     '<tr>';
          cellContents +=       '<td class="english">';
          cellContents +=           cDay;
          cellContents +=       '</td>';
          cellContents +=       '<td class="hebrew">';
          cellContents +=           hebDay;
          cellContents +=       '</td>';
          cellContents +=     '</tr>';
          cellContents +=   '</table>';
          
          cellContents += '<div class="events">';
          if (moed != "")
            cellContents += moed;
          if (moed != "" && holiday != "")
            cellContents += '<br>';
          if (holiday != "")
            cellContents += holiday;
          cellContents += '</div>';
          
          weekCell.html(cellContents);

          cDay++;
        }
        
        weekRow.append(weekCell);

        if (cDay <= lastDate)
          cell++
        else
          break;
      }

      tBody.append(weekRow);

      if(cDay > parms[2])
        break;
    }
    
    table.append(tHead).append(tBody);
    
    return table;
  }
  
  var getSelectedYear = function() {
    return parseInt(yearField.val());
  };
  
  var getSelectedMonthIndex = function() {
    return monthField.get(0).selectedIndex;
  };
  
  
  var setCalendarFromMonthYear = function () {
    var y = getSelectedYear();
    var m = getSelectedMonthIndex();
    setCalendar(m, y);
  }
  
  var setCalendar = function(month, year) {
    monthField.get(0).selectedIndex = month;
    yearField.val(year);
    doCal(month, year);
  };
  
  var selectToday = function () {
    var now = new Date();
    var y = now.getYear();
    var m = now.getMonth();
    if(y < 1000)
      y += 1900;

    setCalendar(m, y);
  };
  
  initialize();

});