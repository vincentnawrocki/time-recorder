var api_url = "https://xxx.execute-api.eu-west-1.amazonaws.com/dev/overview";

function display_interval() {
    var x = document.getElementById("interval");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200) success(JSON.parse(xhr.responseText));
    };
    xhr.send();
    return xhr;
}

function offsetify(t) {
    return t < 10 ? '0' + t : t;
}

function interval(time1, time2) {
    var date1 = d3.timeParse("%H:%M")(time1)
    var date2 = d3.timeParse("%H:%M")(time2)

    if (date1 > date2) {
        var date1 = d3.timeParse("%m/%d/%Y:%H:%M")("01/01/2017:" + time1)
        var date2 = d3.timeParse("%m/%d/%Y:%H:%M")("01/02/2017:" + time2)
        var msec = date2 - date1
    } else {
        var msec = date2 - date1;
    }

    var mins = Math.floor(msec / 60000);
    var hrs = Math.floor(mins / 60);
    mins = mins - hrs * 60

    return offsetify(hrs) + ":" + offsetify(mins)
}

function average(times) {
    var date = 0;
    var result = '';
    for (var x = 0; x < times.length; x++) {
        var tarr = times[x].split(':');
        date += new Date(0, 0, 0, tarr[0], tarr[1], 0, 0).getTime();
    }
    var avg = new Date(date / times.length);
    result = (offsetify(avg.getHours()) + offsetify(avg.getMinutes()) * 10 / 6) / 100;
    if (result < 1) { result *= 10 }
    console.log(result)
    return result
}

getAjax(api_url, function (data) {

    var previous_hour = 0
    var dates = []
    var count_data = {
        labels: [],
        datasets: [{
            label: '# of Feed',
            data: [],
            borderWidth: 1,
            fill: true,
            backgroundColor: 'rgba(187, 147, 32,0.8)'
        }]
    }

    var interval_data = {
        labels: [],
        datasets: [{
            label: 'Time between feeds',
            data: [],
            borderWidth: 1,
            fill: true,
            backgroundColor: 'rgba(48, 54, 255, 0.8)'
        }]
    }

    for (var i = 0; i < data.length; i++) {
        dates.push(data[i].date)
    }

    sorted_dates = [...new Set(dates)].sort(function (a, b) {
        return a.localeCompare(b);
    }).reverse();

    for (var i = 0; i < sorted_dates.length; i++) {
        var times = []
        var intervals = []

        for (var j = 0; j < data.length; j++) {
            if (data[j].date == sorted_dates[i]) {
                times.push(data[j].time)
            }
        }

        sorted_times = [...new Set(times)].sort(function (a, b) {
            return a.localeCompare(b);
        }).reverse();

        count_data.datasets[0].data.push(sorted_times.length)
        count_data.labels.push(sorted_dates[i])

        var li = document.createElement("li")
        var lispan = document.createElement("span")
        lispan.innerText = sorted_dates[i] + " (Count: " + sorted_times.length + ")"
        li.appendChild(lispan)
        var ul = document.createElement("ul")

        for (var k = 0; k < sorted_times.length; k++) {
            if (previous_hour == 0) {
                var now = new Date()
                previous_hour = now.getHours() + ":" + now.getMinutes()
                ul.innerHTML += "<li>" + sorted_times[k] + " (Last feed: " + interval(sorted_times[k], previous_hour) + " hours ago)</li>"
            } else {
                ul.innerHTML += "<li>" + sorted_times[k] + " (interval: " + interval(sorted_times[k], previous_hour) + ")</li>"
            }

            intervals.push(interval(sorted_times[k], previous_hour))
            previous_hour = sorted_times[k]
        }

        interval_data.labels.push(sorted_dates[i])
        interval_data.datasets[0].data.push(average(intervals))

        li.appendChild(ul)
        document.getElementById("timeline").appendChild(li)
    }

    var count_chart_element = document.getElementById('count').getContext('2d');
    var count_chart = new Chart(count_chart_element, {
        type: 'line',
        data: count_data,
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    var interval_chart_element = document.getElementById('interval').getContext('2d');
    var interval_chart = new Chart(interval_chart_element, {
        type: 'line',
        data: interval_data,
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
});
