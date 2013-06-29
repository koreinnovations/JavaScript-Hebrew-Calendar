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

//pads left
String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length)
	str = padString + str;
	return str;
}
//pads right
String.prototype.rpad = function(padString, length) {
	var str = this;
	while (str.length < length)
	str = str + padString;
	return str;
}

$(document).ready(function() {

	var events = {};
	var hasData = {};

	/**
	 * Declare selectors
	 */

	var calendarContainer = $('#calendar-container');
	var calendarForm = $('#calendar-form');

	var yearField = $('#year', calendarForm);
	var monthField = $('#month', calendarForm);

	var hasDataForYear = function(year) {
		return (hasData[year] != null);
	}
	/**
	 * Event handlers
	 */

	var data_Retrieved = function(data) {
		if (!hasDataForYear(getSelectedYear())) {
			for (var x in data.items) {
				var item = data.items[x];
				if (events[item.date] == undefined) {
					events[item.date] = [];
				}

				events[item.date].push(item);
			}
			hasData[getSelectedYear()] = getSelectedYear();
		}
		renderEvents();
	};

	var data_Error = function(e) {

	};

	var prevMonthButton_Click = function() {
		var y = getSelectedYear();
		var m = getSelectedMonthIndex();

		if (m > 0)
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

		if (m < 11)
			m++;
		else {
			m = 0;
			y++;
		}

		setCalendar(m, y);

	};

	var dayCell_Click = function() {
		var rel = $(this).attr('rel');
		var relDetail = $('.event-wrapper[rel="' + rel + '"]');
		if (relDetail.length > 0) {
			relDetail.get(0).scrollIntoView();
		}
	};

	/**
	 * Utility methods
	 */

	function doCal(month, year) {
		var ret = calendar(month, year);
		var calendarTable = BuildLuachHTML(ret);
		calendarContainer.empty().append(calendarTable);

		$('td.day').click(dayCell_Click);
	}

	function calendar(selM, selY) {
		var m = selM + 1;
		var y = selY;
		var d = civMonthLength(m, y);
		var firstOfMonth = new Date(y, selM, 1);
		var startPos = firstOfMonth.getDay() + 1;
		var retVal = new Object();
		retVal[1] = startPos;
		retVal[2] = d;
		retVal[3] = m;
		retVal[4] = y;
		return (retVal);
	}

	function BuildLuachHTML(parms) {
		var hebDate;
		var hebDay;
		var now = new Date();
		var tday = now.getDate();
		var tmonth = now.getMonth();
		var tyear = now.getYear();
		if (tyear < 1000)
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
		hmS = hebDate.substring(hebDate.indexOf(' ') + 1, hebDate.length);
		hMonth = eval(hmS.substring(0, hmS.indexOf(' ')));
		hYear = hmS.substring(hmS.indexOf(' ') + 1, hmS.length);
		var start = hebMonth[hMonth + 1] + ' ' + hYear;

		// get ending Heb month in civil month
		hebDate = civ2heb(lastDate, cMonth, cYear);
		hmE = hebDate.substring(hebDate.indexOf(' ') + 1, hebDate.length);
		hMonth = eval(hmE.substring(0, hmE.indexOf(' ')));
		hYear = hmE.substring(hmE.indexOf(' ') + 1, hmE.length);
		var end = hebMonth[hMonth + 1] + ' ' + hYear;

		var hebSpan;
		// check if start and end Heb months are the same
		if (hmS == hmE)
			hebSpan = start;
		else
			hebSpan = start + ' / ' + end

		var container = $('<div id="calendar-wrapper"></div>');

		var table1 = $('<table class="calendar table-header"></table>');
		var table2 = $('<table class="calendar table-body"></table>');
		var eventsList = $('<div id="calendar-list"></div>');
		var eventsListContent = '';

		var tHead = $('<thead></thead>');
		var tBody = $('<tbody></tbody>');

		var headerRow = $('<tr class="month-header"></tr>');
		var headerCell = $('<th colspan="7"></th>');

		var headerText = '<span class="english">' + monthName + ' ' + cYear + '</span>';
		headerText += '<span class="hebrew">' + hebSpan + '</span>';

		var prevMonthLink = $('<a id="previous-month"></a>').html('&lt;');
		var nextMonthLink = $('<a id="next-month"></a>').html('&gt;');

		prevMonthLink.click(prevMonthButton_Click);
		nextMonthLink.click(nextMonthButton_Click);

		headerCell.html(headerText).append(prevMonthLink).append(nextMonthLink);
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

		var startOfMonth = new Date(cYear, cMonth-1, cDay);
		var startOfMonthWeekDay = startOfMonth.getDay();

		for ( row = 1; row <= 6; row++) {

			var weekRow = $('<tr class="week-row row-' + row + '" rel="' + cDay + '"></tr>');

			for (var col = 1; col <= 7; col++) {

				var weekCell = $('<td class="day"></td>')

				if (row == 1 && col < startOfMonthWeekDay + 1) {

				} else {
					
					weekCell.attr('rel', cDay);
					// convert civil date to hebrew
					hebDate = civ2heb(cDay, cMonth, cYear);
					hebDay = eval(hebDate.substring(0, hebDate.indexOf(' ')));

					var dateString = cYear + '-' + cMonth.toString().lpad('0', 2) + '-' + cDay.toString().lpad('0', 2);
					var eventsOnDate = events[dateString];

					hm = hebDate.substring(hebDate.indexOf(' ') + 1, hebDate.length);
					hMonth = eval(hm.substring(0, hm.indexOf(' ')));

					var cellClasses = ['day'];
					if ((cDay == tday) && (parms[3] == (tmonth + 1)) && (parms[4] == tyear))
						cellClasses.push("current-day");

					var cellContents = '';
					// assemble the contents of our day cell
					cellContents += '<div class="cell-contents">';
					cellContents += '<div class="english">';
					cellContents += cDay;
					cellContents += '</div>';
					cellContents += '<div class="hebrew">';
					cellContents += hebDay;
					cellContents += '</div>';

					if (eventsOnDate != null && eventsOnDate.length > 0) {
						cellClasses.push('with-data');

						var eventDetail = '';
						var titles = [];
						for (var d in eventsOnDate) {
							titles.push(eventsOnDate[d].title + ' (' + eventsOnDate[d].hebrew + ')');
							cellClasses.push(eventsOnDate[d].category);
						}

						cellClasses = cellClasses.join(' ');

						eventDetail = titles.join('<br />');

						if (!isMobile()) {
							cellContents += '<div class="events">';
							cellContents += eventDetail;
							cellContents += '</div>';
						} else {
							if (eventDetail.length > 0) {
								eventsListContent += '<div class="event-wrapper ' + cellClasses + '" rel="' + cDay + '">';
								eventsListContent += '<div class="date">';
								eventsListContent += civMonth[cMonth] + ' ' + cDay;
								eventsListContent += ' / ';
								eventsListContent += hebMonth[hMonth + 1] + ' ' + hebDay;
								eventsListContent += '</div>';
								eventsListContent += '<div class="event-detail">';
								eventsListContent += eventDetail;
								eventsListContent += '</div>';
								eventsListContent += '</div>';
							}
						}

						cellContents += '</div>';

					}

					cDay++;

				}

				weekCell.attr('class', cellClasses);
				weekCell.html(cellContents);

				weekRow.append(weekCell);

				if (cDay <= lastDate)
					cell++
				else
					break;
			}

			tBody.append(weekRow);

			if (cDay > parms[2])
				break;
		}

		table1.append(tHead);
		table2.append(tBody);

		eventsList.html(eventsListContent);

		container.append(table1);
		container.append(table2);
		container.append(eventsList);

		return container;
	}

	var getSelectedYear = function() {
		return parseInt(yearField.val());
	};

	var getSelectedMonthIndex = function() {
		return monthField.get(0).selectedIndex;
	};

	var setCalendarFromMonthYear = function() {
		var y = getSelectedYear();
		var m = getSelectedMonthIndex();
		setCalendar(m, y);
	}
	var setCalendar = function(month, year, silent) {
		monthField.get(0).selectedIndex = month;
		yearField.val(year);

		if (!hasDataForYear(year)) {
			fetchData();
		}

		if (!silent)
			doCal(month, year);
	};

	var isMobile = function() {
		return $('body').is('.mobile');
	};

	var initialize = function() {
		var now = new Date();
		var y = now.getYear();
		var m = now.getMonth();
		if (y < 1000)
			y += 1900;

		setCalendar(m, y, true);

		fetchData();
	};

	var renderEvents = function() {
		setCalendarFromMonthYear();
	};

	var fetchData = function() {
		var url = 'http://www.hebcal.com/hebcal/?v=1;cfg=json;nh=on;nx=on;year=' + getSelectedYear() + ';month=x;ss=on;mf=on;c=on;m=72;s=on';

		$.ajax({
			url : url,
			dataType : 'jsonp',
			success : data_Retrieved,
			error : data_Error
		});

	};

	initialize();

});
